import { useState, useEffect } from 'react';
import { db } from '../lib/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { LeaderboardEntry, LeaderboardFilterType as LeaderboardFilter } from '../types/leaderboard';

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  userRank: number | null;
  userStats: { accuracy: number; examsTaken: number; last5Avg: number; questionsAttempted: number } | null;
  filter: LeaderboardFilter;
  setFilter: (filter: LeaderboardFilter) => void;
  refetch: () => void;
}

export const useLeaderboard = (currentUserId?: string, userFilters?: { faculty?: string; department?: string; level?: string }): LeaderboardData => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeaderboardFilter>('department');
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<{ accuracy: number; examsTaken: number; last5Avg: number; questionsAttempted: number } | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      // Read pre-computed stats directly from users collection — zero exam_attempts reads
      // Use two queries: users with last5Avg (new) and users with attempts but no last5Avg yet (legacy)
      const usersRef = collection(db, 'users');
      
      const [withLast5Snap, withoutLast5Snap] = await Promise.all([
        getDocs(query(
          usersRef,
          where('department', '==', userFilters?.department),
          where('hasCompletedOnboarding', '==', true),
          where('stats.last5Avg', '>', 0)
        )),
        // Legacy users: completed onboarding but last5Avg not computed yet
        getDocs(query(
          usersRef,
          where('department', '==', userFilters?.department),
          where('hasCompletedOnboarding', '==', true),
          where('stats.totalAttempts', '>', 0)
        )),
      ]);

      if (withLast5Snap.empty && withoutLast5Snap.empty) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const seenIds = new Set<string>();
      const processed: LeaderboardEntry[] = [];

      [...withLast5Snap.docs, ...withoutLast5Snap.docs].forEach(doc => {
        if (seenIds.has(doc.id)) return;
        seenIds.add(doc.id);

        const data = doc.data();
        const stats = data.stats || {};
        const accuracy = stats.totalAttempts > 0
          ? parseFloat(((stats.totalPoints / stats.totalQuestions) * 100).toFixed(1))
          : 0;

        processed.push({
          rank: 0,
          userId: doc.id,
          displayName: data.name || data.displayName || 'Scholar',
          photoURL: data.photoURL || null,
          score: 0,
          totalQuestions: 0,
          percentage: 0,
          accuracy,
          examsTaken: stats.totalAttempts || 0,
          last5Avg: stats.last5Avg || 0,
          questionsAttempted: stats.questionsAttempted || 0,
          faculty: data.faculty || 'General',
          department: data.department || 'Undecided',
          level: data.level || '1',
          timestamp: Date.now(),
        });
      });

      // Sort: last5Avg (desc), questionsAttempted (desc) tiebreaker
      processed.sort((a, b) => {
        if (b.last5Avg !== a.last5Avg) return b.last5Avg - a.last5Avg;
        return b.questionsAttempted - a.questionsAttempted;
      });

      const finalEntries = processed.map((entry, idx) => ({
        ...entry,
        rank: idx + 1
      }));

      let finalRank: number | null = null;
      if (currentUserId) {
        const idx = finalEntries.findIndex(e => e.userId === currentUserId);
        finalRank = idx >= 0 ? idx + 1 : null;
        if (idx >= 0) {
          const u = finalEntries[idx];
          setUserStats({ accuracy: u.accuracy, examsTaken: u.examsTaken, last5Avg: u.last5Avg, questionsAttempted: u.questionsAttempted });
        }
      }

      setEntries(finalEntries.slice(0, 50));
      setUserRank(finalRank);
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userFilters?.department) {
      fetchLeaderboard();
    }
  }, [currentUserId, userFilters?.department]);

  return { entries, loading, error, userRank, userStats, filter, setFilter, refetch: fetchLeaderboard };
};