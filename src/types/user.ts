export interface UserStats {
  totalPoints: number;
  totalQuestions: number;
  totalTime: number;
  totalAttempts: number;
  streakCount: number;
  lastActivityDate: string;
  activityLog: Record<string, number>;
  courseActivity: Record<string, number>;
  achievements: string[];
}
