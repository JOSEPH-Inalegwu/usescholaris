/**
 * Utility functions for generating dynamic greetings and subtexts.
 */

/**
 * Returns a greeting based on the current hour of the day.
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Returns a randomized subtext message to keep the dashboard feeling fresh.
 */
export const getPersonalizedSubtext = (): string => {
  const messages = [
    "It's time to excel. Review your previous performance and prepare for your upcoming exams.",
    "Ready for another breakthrough? Dive into your study sessions and conquer today's academic challenges.",
    "Consistency is key. Your streak is a testament to your dedication to academic excellence.",
    "The archive is waiting. Discover new insights to strengthen your course knowledge.",
    "Every session counts. Focus on your departmental standing and rise through the ranks.",
    "Knowledge is power. Tackle those complex questions and sharpen your scholarly mind.",
    "Stay ahead of the curve. Your upcoming seminars and symposia are just around the corner.",
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Extracts the first name from a full name string.
 */
export const getFirstName = (fullName?: string): string => {
  if (!fullName) return 'Scholar';
  return fullName.split(' ')[0];
};
