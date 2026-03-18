<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\Roadmap;
use App\Models\UserStats;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    /**
     * POST /api/progress/start
     */
    public function start(Request $request)
    {
        try {
            $validated = $request->validate([
                'roadmap_id' => 'required|string',
            ]);

            $userId     = (string) $request->user()->_id;
            $roadmapId  = $validated['roadmap_id'];

            // Prevent duplicate
            $existing = Progress::where('user_id', $userId)
                ->where('roadmap_id', $roadmapId)
                ->first();

            if ($existing) {
                return response()->json(['success' => true, 'data' => $existing]);
            }

            $progress = Progress::create([
                'user_id'         => $userId,
                'roadmap_id'      => $roadmapId,
                'completed_nodes' => [],
                'videos_watched'  => [],
                'status'          => 'in_progress',
                'started_at'      => now(),
            ]);

            return response()->json(['success' => true, 'data' => $progress], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to start progress', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/progress/{id}/complete  – mark a node complete
     */
    public function complete(Request $request, $id)
    {
        try {
            // Log for debugging
            \Illuminate\Support\Facades\Log::info('Progress complete request', [
                'id' => $id,
                'request' => $request->all()
            ]);

            $request->validate(['node_id' => 'required']);

            $progress = Progress::where('_id', $id)
                ->where('user_id', (string) $request->user()->_id)
                ->first();

            if (!$progress) {
                return response()->json(['message' => 'Progress record not found'], 404);
            }

            $nodeId          = (string) $request->input('node_id');
            $completedNodes  = $progress->completed_nodes ?? [];

            if (!in_array($nodeId, $completedNodes)) {
                $completedNodes[] = $nodeId;
                $progress->completed_nodes = $completedNodes;

                // Check if roadmap is fully complete
                $roadmap = Roadmap::find($progress->roadmap_id);
                if ($roadmap && count($completedNodes) >= count($roadmap->nodes ?? [])) {
                    $progress->status       = 'completed';
                    $progress->completed_at = now();

                    // Award XP for completing roadmap
                    $stats = UserStats::forUser((string) $request->user()->_id);
                    $stats->addXp(200);
                } else {
                    // Award XP per node
                    $stats = UserStats::forUser((string) $request->user()->_id);
                    $stats->addXp(10);
                }

                $progress->save();
            }

            return response()->json(['success' => true, 'data' => $progress]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Progress update error: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id,
                'request' => $request->all()
            ]);
            return response()->json(['message' => 'Failed to update progress', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/progress/{id}/track-video
     */
    public function trackVideo(Request $request, $id)
    {
        try {
            $request->validate(['video_id' => 'required|string']);

            $progress = Progress::where('_id', $id)
                ->where('user_id', (string) $request->user()->_id)
                ->first();

            if (!$progress) {
                return response()->json(['message' => 'Progress record not found'], 404);
            }

            $videoId         = $request->input('video_id');
            $videosWatched   = $progress->videos_watched ?? [];

            if (!in_array($videoId, $videosWatched)) {
                $videosWatched[] = $videoId;
                $progress->videos_watched = $videosWatched;
                $progress->save();
            }

            return response()->json(['success' => true, 'data' => $progress]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to track video', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/progress/roadmap/{roadmapId}
     */
    public function getRoadmapProgress(Request $request, $roadmapId)
    {
        $progress = Progress::where('user_id', (string) $request->user()->_id)
            ->where('roadmap_id', $roadmapId)
            ->first();

        if (!$progress) {
             return response()->json([]);
        }

        $roadmap = Roadmap::find($roadmapId);
        if (!$roadmap) {
             return response()->json([]);
        }

        $completedNodes = $progress->completed_nodes ?? [];
        $nodeProgress   = [];

        foreach ($roadmap->nodes ?? [] as $node) {
            $nodeId = (string) $node['id'];
            $isCompleted = in_array($nodeId, $completedNodes);
            
            $nodeProgress[] = [
                'id'          => $progress->_id,
                'node_id'     => (int) $nodeId,
                'status'      => $isCompleted ? 'completed' : 'in_progress',
                'progress_id' => (string) $progress->_id,
            ];
        }

        return response()->json([
            'node_progress' => $nodeProgress,
            'passed_quizzes' => $progress->passed_quizzes ?? []
        ]);
    }
}
