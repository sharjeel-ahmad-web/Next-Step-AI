<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use DateInterval;

class GeminiService
{
    protected string $apiKey;
    protected string $endpoint;
    protected ?string $youtubeApiKey;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', env('GEMINI_API_KEY'));
        $this->youtubeApiKey = config('services.youtube.key', env('YOUTUBE_API_KEY'));
        // Using v1beta and flash-latest as found in model list
        $this->endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
    }

    /**
     * Analyze resume text against target role and description to find skill gaps
     */
    public function analyzeSkillGap(string $resumeText, string $targetRole, string $description, string $language = 'English'): array
    {
        try {
            $prompt = "You are an expert career advisor and technical recruiter. 
            Analyze the following resume text against the target role and the user's personal goal.
            
            Target Role: {$targetRole}
            User's Goal/Description: {$description}
            Preferred Learning Language: {$language}
            
            Resume Text:
            {$resumeText}
            
            Identify:
            1. Current Skills (found in resume that are relevant to the role)
            2. Required Skills (standard industry requirements for this role)
            3. Skill Gaps (required skills missing or weak in the resume)
            
            Return ONLY a valid JSON object with these keys: 'current_skills' (array), 'required_skills' (array), 'skill_gaps' (array).";

            $response = $this->callGemini($prompt);
            return json_decode($response, true) ?? [];

        } catch (\Exception $e) {
            Log::error('Gemini Skill Gap Analysis error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate a professional, job-ready roadmap based on gaps
     */
    public function generateRoadmap(string $targetRole, array $skillGaps, string $description, string $language = 'English'): array
    {
        try {
            $prompt = "Create a professional, job-ready learning roadmap for the role of '{$targetRole}'.
            User Goal: {$description}
            Preferred Learning Language: {$language}
            The user needs to focus on these specific gaps: " . implode(', ', $skillGaps) . "
            
            The roadmap should be highly structured and cover everything needed to be JOB-READY.
            Write node titles and descriptions in {$language} when possible, while keeping skill_name in widely searchable technical terms.
            
            Return a JSON array of 'nodes'. Each node must have:
            - title: Clear learning objective
            - description: Detailed what to learn
            - skill_name: The core technology/skill (used for video fetching)
            - estimated_time: (e.g., '1 week')
            - level: (Beginner, Intermediate, or Advanced)
            - order: (Integer)
            
            Return ONLY the valid JSON array of nodes.";

            $response = $this->callGemini($prompt);
            return json_decode($response, true) ?? [];

        } catch (\Exception $e) {
            Log::error('Gemini Roadmap Generation error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Internal helper to call Gemini API
     */
    protected function callGemini(string $prompt): string
    {
        Log::info('Gemini API Request', ['prompt_snippet' => substr($prompt, 0, 100) . '...']);

        $response = Http::post("{$this->endpoint}?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API request failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            throw new \Exception('Gemini API call failed: ' . $response->body());
        }

        $content = $response->json();
        $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
        
        Log::info('Gemini API Raw Response Text', ['text_snippet' => substr($text, 0, 200) . '...']);

        // Clean up markdown markers more aggressively
        $cleanText = preg_replace('/^```(?:json)?\s*|```$/m', '', trim($text));
        
        return $cleanText;
    }

    /**
     * Get YouTube resources for a specific skill via Gemini
     */
    public function getYouTubeResources(string $skill, string $language = 'English'): array
    {
        try {
            $youtubeResults = $this->getYoutubeApiResources($skill, $language);

            if (!empty($youtubeResults)) {
                return $youtubeResults;
            }

            $prompt = "Provide a JSON array of 5 popular and high-quality YouTube video tutorials for learning '{$skill}' in {$language}. 
            Prioritize videos that teach in {$language} or clearly support {$language}-speaking learners.
            Each object should have:
            - title: The video title
            - video_id: The YouTube 11-character video ID
            - duration: Approximate duration (e.g., '15 min')
            - thumbnail: The standard YouTube thumbnail URL (https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg)
            
            Return ONLY the valid JSON array.";

            $text = $this->callGemini($prompt);
            $videos = json_decode($text, true);

            if (!is_array($videos)) {
                return $this->getFallbackVideos($skill, $language);
            }

            return array_map(function ($video, $index) {
                return [
                    'id'        => (string) ($index + 1),
                    'video_id'  => $video['video_id'] ?? '',
                    'title'     => $video['title'] ?? 'Tutorial',
                    'url'       => 'https://www.youtube.com/watch?v=' . ($video['video_id'] ?? ''),
                    'thumbnail' => $video['thumbnail'] ?? "https://img.youtube.com/vi/" . ($video['video_id'] ?? '') . "/hqdefault.jpg",
                    'duration'  => $video['duration'] ?? 'varies',
                ];
            }, $videos, array_keys($videos));

        } catch (\Exception $e) {
            Log::error('Gemini Video Service error: ' . $e->getMessage());
            return $this->getFallbackVideos($skill, $language);
        }
    }

    protected function getYoutubeApiResources(string $skill, string $language = 'English'): array
    {
        if (empty($this->youtubeApiKey)) {
            return [];
        }

        $query = trim($skill . ' tutorial ' . $language);

        $searchResponse = Http::get('https://www.googleapis.com/youtube/v3/search', [
            'key' => $this->youtubeApiKey,
            'part' => 'snippet',
            'q' => $query,
            'type' => 'video',
            'videoEmbeddable' => 'true',
            'maxResults' => 5,
            'safeSearch' => 'strict',
            'relevanceLanguage' => $this->mapLanguageToYoutubeCode($language),
            'order' => 'relevance',
        ]);

        if ($searchResponse->failed()) {
            Log::warning('YouTube API search failed', ['body' => $searchResponse->body()]);
            return [];
        }

        $searchItems = $searchResponse->json('items', []);
        $videoIds = collect($searchItems)
            ->map(fn ($item) => data_get($item, 'id.videoId'))
            ->filter()
            ->values()
            ->all();

        if (empty($videoIds)) {
            return [];
        }

        $detailsResponse = Http::get('https://www.googleapis.com/youtube/v3/videos', [
            'key' => $this->youtubeApiKey,
            'part' => 'contentDetails,snippet',
            'id' => implode(',', $videoIds),
        ]);

        if ($detailsResponse->failed()) {
            Log::warning('YouTube API details failed', ['body' => $detailsResponse->body()]);
            return [];
        }

        $detailsMap = collect($detailsResponse->json('items', []))->keyBy('id');

        return collect($videoIds)->map(function ($videoId, $index) use ($detailsMap) {
            $video = $detailsMap->get($videoId);

            if (!$video) {
                return null;
            }

            return [
                'id' => (string) ($index + 1),
                'video_id' => $videoId,
                'title' => data_get($video, 'snippet.title', 'Tutorial'),
                'url' => 'https://www.youtube.com/watch?v=' . $videoId,
                'thumbnail' => data_get($video, 'snippet.thumbnails.high.url')
                    ?: data_get($video, 'snippet.thumbnails.medium.url')
                    ?: "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg",
                'duration' => $this->formatYoutubeDuration(data_get($video, 'contentDetails.duration', 'PT0M')),
            ];
        })->filter()->values()->all();
    }

    /**
     * Generate 10 MCQs for a given video title and skill
     */
    public function generateQuiz(string $videoTitle, string $skillName): array
    {
        try {
            $prompt = "Generate a professional technical quiz for the video tutorial: '{$videoTitle}'.
            The skill focus is: '{$skillName}'.
            
            Return exactly 10 multiple-choice questions (MCQs) in a valid JSON array.
            Each question object must have:
            1. 'question': The question text.
            2. 'options': An array of 4 possible answers.
            3. 'correct_answer': The exact string from the options that is correct.
            4. 'explanation': A short explanation of why this answer is correct.

            Make sure the questions range from beginner to intermediate.
            Return ONLY the valid JSON array of 10 questions.";

            $response = $this->callGemini($prompt);
            $questions = json_decode($response, true);

            if (!is_array($questions) || count($questions) < 5) {
                throw new \Exception("AI failed to generate a valid quiz structure.");
            }

            return $questions;

        } catch (\Exception $e) {
            Log::error('Gemini Quiz Generation error: ' . $e->getMessage());
            return [];
        }
    }

    protected function getFallbackVideos(string $skill, string $language = 'English'): array
    {
        return [
            [
                'id'        => '1',
                'video_id'  => 'Y6shV7S6WpU',
                'title'     => "$skill Full Course for Beginners ($language)",
                'url'       => "https://www.youtube.com/watch?v=Y6shV7S6WpU",
                'thumbnail' => "https://img.youtube.com/vi/Y6shV7S6WpU/hqdefault.jpg",
                'duration'  => 'varies',
            ],
            [
                'id'        => '2',
                'video_id'  => 'fBNz5xF-Kx4',
                'title'     => "$skill Advanced Tutorial ($language)",
                'url'       => "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
                'thumbnail' => "https://img.youtube.com/vi/fBNz5xF-Kx4/hqdefault.jpg",
                'duration'  => 'varies',
            ],
        ];
    }

    protected function mapLanguageToYoutubeCode(string $language): string
    {
        return match (strtolower($language)) {
            'urdu' => 'ur',
            'hindi' => 'hi',
            'arabic' => 'ar',
            'turkish' => 'tr',
            default => 'en',
        };
    }

    protected function formatYoutubeDuration(string $duration): string
    {
        try {
            $interval = new DateInterval($duration);
        } catch (\Exception $e) {
            return 'varies';
        }

        $hours = ($interval->d * 24) + $interval->h;
        $minutes = $interval->i;

        if ($hours > 0) {
            return trim($hours . ' hr ' . ($minutes > 0 ? $minutes . ' min' : ''));
        }

        if ($minutes > 0) {
            return $minutes . ' min';
        }

        return max(1, $interval->s) . ' sec';
    }
}
