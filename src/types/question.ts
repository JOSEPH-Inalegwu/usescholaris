export interface Course {
  id: string;
  slug: string; // e.g., 'csc201'
  code: string;
  title: string;
  semester: 1 | 2;
  level: string;
  faculty: string;
  department: string;
  questionCount: number;
  lastUpdated?: string;
}

export interface Question {
  id: string;
  courseId: string;
  year: number;
  type: 'MCQ' | 'Theory';
  content: string;
  options?: string[];
  answer: string;
}
