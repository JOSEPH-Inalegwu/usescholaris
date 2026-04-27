export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  totalQuestions: number;
  percentage: number;
  accuracy: number;
  examsTaken: number;
  last5Avg: number;
  questionsAttempted: number;
  faculty: string;
  department: string;
  level: string;
  timestamp: number;
}

export type LeaderboardFilterType = 'all' | 'faculty' | 'department' | 'level';
