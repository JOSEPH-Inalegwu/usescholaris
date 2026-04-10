import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { DEPARTMENT_MAP } from './departmentCourseMap';

export interface DashboardStats {
  accuracy: number;
  avgScore: number;
  studyTimeMins: number;
  semesterProgress: number;
  semesterTarget: number;       // dynamic target (courseCount * 100)
  questionsAnswered: number;
  totalAttempts: number;
  loading: boolean;
}

/**
 * Derives all stats from profile.stats — ZERO extra Firestore reads.
 * Stats are written atomically with increment() on every exam submit.
 */
export const useDashboardStats = (): DashboardStats => {
  const { profile, loading } = useAuth();

  const stats = useMemo(() => {
    const s = profile?.stats;

    // Dynamic target: look up how many courses this user's level/dept has
    const deptKey = profile?.department?.toLowerCase() ?? '';
    const levelKey = profile?.level?.replace(/\s+level/i, '').trim() ?? '';
    const courseCount = DEPARTMENT_MAP[deptKey]?.[levelKey] ?? 9; // fallback 9
    const semesterTarget = courseCount * 100;

    if (!s?.totalAttempts) {
      return {
        accuracy: 0,
        avgScore: 0,
        studyTimeMins: 0,
        semesterProgress: 0,
        semesterTarget,
        questionsAnswered: 0,
        totalAttempts: 0,
      };
    }

    const accuracy = s.totalQuestions > 0
      ? parseFloat(((s.totalPoints / s.totalQuestions) * 100).toFixed(1))
      : 0;

    const avgScore = parseFloat((s.totalPoints / s.totalAttempts).toFixed(1));

    const studyTimeMins = Math.round(s.totalTime / 1000 / 60);

    const semesterProgress = s.totalQuestions > 0
      ? parseFloat(((s.totalQuestions / semesterTarget) * 100).toFixed(1))
      : 0;

    return {
      accuracy,
      avgScore,
      studyTimeMins,
      semesterProgress,
      semesterTarget,
      questionsAnswered: s.totalQuestions,
      totalAttempts: s.totalAttempts,
    };
  }, [profile?.stats, profile?.department, profile?.level]);

  return { ...stats, loading };
};
