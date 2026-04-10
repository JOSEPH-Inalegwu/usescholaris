// department slug (lowercase) → level → number of courses
export const DEPARTMENT_MAP: Record<string, Record<string, number>> = {
  'computer science': { '100': 8, '200': 8, '300': 9, '400': 7 },
  'cs':               { '100': 8, '200': 8, '300': 9, '400': 7 },
  'cyber security':   { '100': 7, '200': 8, '300': 8, '400': 7 },
  'cybersecurity':    { '100': 7, '200': 8, '300': 8, '400': 7 },
  'science laboratory technology': { '100': 8, '200': 7, '300': 7, '400': 6 },
  'slt':              { '100': 8, '200': 7, '300': 7, '400': 6 },
};
