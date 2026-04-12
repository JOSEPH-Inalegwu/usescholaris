export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const ACHIEVEMENTS_LIBRARY: Record<string, Achievement> = {
  'topic_master': {
    id: 'topic_master',
    name: 'Topic Master',
    description: 'Achieved 80% mastery in a subject category.',
    icon: 'psychology',
    color: 'text-blue-500'
  },
  'centurion': {
    id: 'centurion',
    name: 'Centurion',
    description: 'Scored 100% in a single exam session.',
    icon: 'workspace_premium',
    color: 'text-amber-500'
  },
  'the_unbroken': {
    id: 'the_unbroken',
    name: 'The Unbroken',
    description: 'Completed 5 exams with zero skipped questions.',
    icon: 'bolt',
    color: 'text-rose-500'
  }
};

export const checkAchievements = (stats: any, currentSession: any, categoryBreakdown: Record<string, { correct: number; total: number }>): string[] => {
  const earned: string[] = stats.achievements || [];

  // Helper to add if not exists
  const grant = (id: string) => {
    if (!earned.includes(id)) earned.push(id);
  };

  // 1. Centurion: 100% score (all questions correct)
  if (currentSession.score === currentSession.total && currentSession.total > 0) {
    grant('centurion');
  }

  // 2. The Unbroken: Zero skips AND score > 80%
  if (currentSession.skipped === 0 && (currentSession.score / currentSession.total) > 0.8) {
    grant('the_unbroken');
  }

  // 3. Early Bird: Submitted between 4:00 AM - 7:00 AM
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 7) {
    grant('early-bird');
  }

  // 4. Topic Master: 80% mastery in any category
  Object.entries(categoryBreakdown).forEach(([cat, data]) => {
    if ((data.correct / data.total) >= 0.8 && data.total >= 5) {
      grant(`topic-master-${cat.toLowerCase().replace(/\s+/g, '_')}`);
    }
  });

  // 5. Consistent Scholar: Streak hits 7
  if (stats.streakCount >= 7) {
    grant('consistent-scholar');
  }

  // 6. Pioneer: Awarded to early users (e.g., totalAttempts < 5)
  if (stats.totalAttempts < 5) {
    grant('pioneer');
  }

  return earned;
};
