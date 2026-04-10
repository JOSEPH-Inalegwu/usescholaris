/**
 * [DEPARTMENT_MAP]
 * Maps department (lowercase) → level → number of courses for that semester.
 *
 * Used by useDashboardStats to compute the dynamic semesterTarget:
 *   semesterTarget = courseCount * 100 questions
 *
 * Update this map when you add new course banks to Firestore.
 * Key format:
 *   department: must match profile.department.toLowerCase()
 *   level:      numeric string extracted from profile.level (e.g. '300 Level' → '300')
 */
export const DEPARTMENT_MAP: Record<string, Record<string, number>> = {
  'computer science': {
    '100': 8,
    '200': 8,
    '300': 9,
    '400': 7,
  },
  'cs': {
    '100': 8,
    '200': 8,
    '300': 9,
    '400': 7,
  },
  'cyber security': {
    '100': 7,
    '200': 8,
    '300': 8,
    '400': 7,
  },
  'cybersecurity': {
    '100': 7,
    '200': 8,
    '300': 8,
    '400': 7,
  },
  'science laboratory technology': {
    '100': 8,
    '200': 7,
    '300': 7,
    '400': 6,
  },
  'slt': {
    '100': 8,
    '200': 7,
    '300': 7,
    '400': 6,
  },
};
