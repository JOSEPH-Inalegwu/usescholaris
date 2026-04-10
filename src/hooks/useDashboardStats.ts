import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { DEPARTMENT_MAP } from './departmentCourseMap';

export interface DashboardStats {
  accuracy: number;
  avgScore: number;
  studyTimeMins: number;
  semesterProgress: number;
  semesterTarget: number;
  questionsAnswered: number;
  totalAttempts: number;
  loading: boolean;
}

export const useDashboardStats = (): DashboardStats => {
  const { profile, loading } = useAuth();

  const stats = useMemo(() => {
    const s = profile?.stats;

    const deptKey = profile?.department?.toLowerCase() ?? '';
    const levelKey = profile?.level?.replace(/\s+level/i, '').trim() ?? '';
    const courseCount = DEPARTMENT_MAP[deptKey]?.[levelKey] ?? 9;
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
