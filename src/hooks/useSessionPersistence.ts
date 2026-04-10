import { useCallback } from 'react';

export interface ExamSession {
  courseSlug: string;
  sessionQuestions: number[];
  selectedAnswers: Record<number, string | number>; // questionIndex -> selectedOption
  isRanked: boolean;
  startTime: number;
}

const STORAGE_KEY = 'v2scholaris_active_session';

export const useSessionPersistence = () => {
  const saveSession = useCallback((session: ExamSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  const getSession = useCallback((courseSlug?: string): ExamSession | null => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
      const session: ExamSession = JSON.parse(saved);
      // If courseSlug is provided, only return if it matches
      if (courseSlug && session.courseSlug !== courseSlug) {
        return null;
      }
      return session;
    } catch (e) {
      console.error('Error parsing saved session:', e);
    }
    return null;
  }, []);

  const updateAnswers = useCallback((answers: Record<number, string | number>) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const session: ExamSession = JSON.parse(saved);
      session.selectedAnswers = answers;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Error updating answers:', e);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { saveSession, getSession, clearSession, updateAnswers };
};
