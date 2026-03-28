<?php

namespace App\Services;

class JobMatchingService
{
    /**
     * Compute a simple match score (0-100) between user skills/domain and a job posting.
     */
    public function score(array $userSkills, ?string $userDomain, array $jobSkills, ?string $jobTitle): int
    {
        $userSkills = $this->normalize($userSkills);
        $jobSkills  = $this->normalize($jobSkills);

        $overlap = count(array_intersect($userSkills, $jobSkills));
        $skillScore = $this->percent($overlap, max(1, count($jobSkills)));

        $domainScore = 0;
        if ($userDomain && $jobTitle) {
            $domainScore = str_contains(strtolower($jobTitle), strtolower($userDomain)) ? 25 : 0;
        }

        return (int) min(100, $skillScore + $domainScore);
    }

    protected function normalize(array $skills): array
    {
        return array_values(array_filter(array_map(function ($skill) {
            return strtolower(trim($skill));
        }, $skills)));
    }

    protected function percent(int $num, int $den): int
    {
        return (int) round(($num / $den) * 75); // leave room for domain bonus
    }
}
