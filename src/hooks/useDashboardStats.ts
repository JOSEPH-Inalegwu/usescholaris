import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { DEPARTMENT_MAP } from './departmentCourseMap';

export interface DashboardStats {
  accuracy: number;
  globalMastery: number;
  avgScore: number;
  studyTimeMins: number;
  semesterProgress: number;
  semesterTarget: number;
  questionsAnswered: number;
  totalAttempts: number;
  streakCount: number;
  activityLog: Record<string, number>;
  loading: boolean;
}

export const useDashboardStats = (): DashboardStats => {
  const { profile, loading } = useAuth();

  const stats = useMemo((): Omit<DashboardStats, 'loading'> => {
    const s = profile?.stats;

    const deptKey = profile?.department?.toLowerCase() ?? '';
    const levelKey = profile?.level?.replace(/\s+level/i, '').trim() ?? '';
    const courseCount = DEPARTMENT_MAP[deptKey]?.[levelKey] ?? 9;
    const semesterTarget = courseCount * 200;

    if (!s?.totalAttempts) {
      return {
        accuracy: 0,
        globalMastery: 0,
        avgScore: 0,
        studyTimeMins: 0,
        semesterProgress: 0,
        semesterTarget,
        questionsAnswered: 0,
        totalAttempts: 0,
        streakCount: 0,
        activityLog: {},
      };
    }

    const accuracy = s.totalAttempts > 0
      ? parseFloat(((s.totalPoints / s.totalQuestions) * 100).toFixed(1))
      : 0;
    
    // Global Mastery: total correctly answered vs total questions in all attempted courses
    const globalMastery = s.totalQuestions > 0
      ? parseFloat(((s.totalPoints / semesterTarget) * 100).toFixed(1))
      : 0;

    const avgScore = parseFloat((s.totalPoints / s.totalAttempts).toFixed(1));
    const studyTimeMins = Math.round(s.totalTime / 1000 / 60);

    return {
      accuracy,
      globalMastery,
      avgScore,
      studyTimeMins,
      semesterProgress: globalMastery,
      semesterTarget,
      questionsAnswered: s.totalQuestions,
      totalAttempts: s.totalAttempts,
      streakCount: s.streakCount || 0,
      activityLog: s.activityLog || {},
    };
  }, [profile?.stats, profile?.department, profile?.level]);

  return { ...stats, loading };
};
