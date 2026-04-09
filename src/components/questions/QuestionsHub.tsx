import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { type Course } from '../../types/question';
import { motion, AnimatePresence } from 'framer-motion';
import PreExamModal from './PreExamModal';

// Mock data for initial implementation
const MOCK_COURSES: Course[] = [
  { id: '1', slug: 'csc201', code: 'CSC 201', title: 'Computer Programming I', semester: 1, level: '200', faculty: 'Science', department: 'Computer Science', questionCount: 120, lastUpdated: '2024-03-20' },
  { id: '2', slug: 'csc205', code: 'CSC 205', title: 'Operating Systems I', semester: 1, level: '200', faculty: 'Science', department: 'Computer Science', questionCount: 85, lastUpdated: '2024-03-15' },
  { id: '3', slug: 'csc202', code: 'CSC 202', title: 'Computer Programming II', semester: 2, level: '200', faculty: 'Science', department: 'Computer Science', questionCount: 150, lastUpdated: '2024-03-25' },
  { id: '4', slug: 'mat201', code: 'MAT 201', title: 'Linear Algebra I', semester: 1, level: '200', faculty: 'Science', department: 'Computer Science', questionCount: 95, lastUpdated: '2024-03-10' },
  { id: '5', slug: 'gss101', code: 'GSS 101', title: 'Use of English I', semester: 1, level: '100', faculty: 'General Studies', department: 'All', questionCount: 200, lastUpdated: '2024-03-22' },
];

const goldPalette = { primary: '#d4aa37ff', dark: '#cf6b19ff', accent: '#b32839' };

const QuestionsHub: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [semester, setSemester] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'prep' | 'past'>('prep');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter(course => {
      if (course.semester !== semester) return false;
      if (profile?.level && course.level !== profile.level && course.department !== 'All') return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return course.code.toLowerCase().includes(query) || course.title.toLowerCase().includes(query);
      }
      return true;
    });
  }, [semester, profile, searchQuery]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const prepareExamSession = (poolSize: number) => {
    const EXAM_LIMIT = 40;
    const indices = Array.from({ length: poolSize }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, Math.min(poolSize, EXAM_LIMIT));
  };

  const handleStartExam = async () => {
    if (!selectedCourse) return;
    const selectedQuestionIndices = prepareExamSession(selectedCourse.questionCount);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error('Error attempting to enable full-screen mode:', err);
    } finally {
      setIsModalOpen(false);
      navigate(`/exam/${selectedCourse.slug}`, {
        state: {
          sessionQuestions: selectedQuestionIndices,
          isRanked: true,
          startTime: Date.now()
        }
      });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 font-['Lora']">
      {/* Header & Mode/Semester Toggles */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2a2d2e]">
            {mode === 'prep' ? 'Active Exam Prep' : 'Past Questions Archive'}
          </h1>
          <p className="text-[#757c7d] text-sm mt-1">
            {mode === 'prep'
              ? `Current 2025/2026 session materials for ${profile?.level || 'your'} Level`
              : `Explore archived questions for ${profile?.department || 'your department'}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-[#f2f4f4] p-1 rounded-sm w-fit">
            <button
              onClick={() => setMode('prep')}
              className={`px-4 py-1.5 rounded-sm text-[10px] font-bold transition-all duration-300 ${mode === 'prep' ? 'bg-white text-[#2a2d2e] shadow-sm' : 'text-[#757c7d] hover:text-[#2a2d2e]'
                }`}
            >
              EXAM PREP
            </button>
            <button
              onClick={() => setMode('past')}
              className={`px-4 py-1.5 rounded-sm text-[10px] font-bold transition-all duration-300 ${mode === 'past' ? 'bg-white text-[#2a2d2e] shadow-sm' : 'text-[#757c7d] hover:text-[#2a2d2e]'
                }`}
            >
              PAST QUESTIONS
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#f2f4f4] p-1 rounded-sm w-fit">
            <button
              onClick={() => setSemester(1)}
              className={`px-4 py-1.5 rounded-sm text-[10px] font-bold transition-all duration-300 ${semester === 1 ? 'bg-white text-[#2a2d2e] shadow-sm' : 'text-[#757c7d] hover:text-[#2a2d2e]'
                }`}
            >
              1ST SEM
            </button>
            <button
              onClick={() => setSemester(2)}
              className={`px-4 py-1.5 rounded-sm text-[10px] font-bold transition-all duration-300 ${semester === 2 ? 'bg-white text-[#2a2d2e] shadow-sm' : 'text-[#757c7d] hover:text-[#2a2d2e]'
                }`}
            >
              2ND SEM
            </button>
          </div>
        </div>
      </div>

      {/* Search and View Switcher Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by course code or title..."
            className="w-full bg-[#f2f4f4] border border-[#adb3b4]/10 rounded-full px-12 py-3 text-sm focus:ring-1 focus:ring-[#d4aa37]/30 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-4 top-3 text-[#757c7d]">search</span>
        </div>

        <div className="flex gap-2 bg-[#f2f4f4] p-1 rounded-sm self-end md:self-auto">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-sm transition-all duration-300 ${view === 'grid' ? 'bg-white text-[#2a2d2e] shadow-sm' : 'text-[#757c7d] hover:text-[#2a2d2e]'
              }`}
          >
            <span className="material-symbols-outlined text-xl block">grid_view</span>
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-sm transition-all duration-300 ${view === 'list' ? 'bg-white text-[#2a2d2e] shadow-sm' : 'text-[#757c7d] hover:text-[#2a2d2e]'
              }`}
          >
            <span className="material-symbols-outlined text-xl block">list</span>
          </button>
        </div>
      </div>

      {/* Course Grid/List */}
      <div className={view === 'grid'
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "flex flex-col gap-4"
      }>
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleCourseClick(course)}
              className={`group cursor-pointer bg-white border border-[#adb3b4]/20 rounded-sm p-6 hover:border-[#d4aa37]/30 transition-all duration-300 flex ${view === 'grid' ? 'flex-col justify-between' : 'flex-row items-center justify-between'
                }`}
            >
              <div className={view === 'list' ? "flex items-center gap-6 flex-1" : ""}>
                <div className="flex justify-between items-start mb-4 lg:mb-0">
                  <div
                    className="px-1 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-wider whitespace-nowrap flex items-center gap-2 min-h-[20px]"
                    style={{ backgroundColor: mode === 'past' ? goldPalette.primary : goldPalette.accent }}
                  >
                    {mode === 'prep' ? (
                      <span className="relative flex h-2 w-2 mx-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    ) : (
                      course.code
                    )}
                  </div>
                  {view === 'grid' && (
                    <span className="text-[9px] font-bold text-[#757c7d] uppercase tracking-wider">{course.questionCount} Qs</span>
                  )}
                </div>

                <div className={view === 'list' ? "flex-1" : ""}>
                  <h3 className={`font-bold text-[#2a2d2e] group-hover:text-[#d4aa37] transition-colors tracking-tight ${view === 'grid' ? 'text-base mb-1' : 'text-sm'
                    }`}>
                    {course.title} {mode === 'prep' && <span className="text-[9px] text-[#b32839] font-bold ml-1">({course.code})</span>}
                  </h3>
                  {view === 'list' && (
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[9px] font-bold text-[#757c7d] uppercase">{course.questionCount} Questions</span>
                      <span className="text-[9px] text-[#adb3b4]">•</span>
                      <span className="text-[9px] font-bold text-[#757c7d] uppercase tracking-wider">Updated {course.lastUpdated}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${view === 'grid' ? 'mt-6' : ''} flex items-center justify-between ${view === 'list' ? 'gap-6' : ''}`}>
                {view === 'grid' && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-sm bg-[#f2f4f4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-[#757c7d]">history</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-[#757c7d] uppercase tracking-widest leading-none">Updated</span>
                      <span className="text-[9px] font-bold text-[#2a2d2e] mt-0.5">{course.lastUpdated}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {view === 'list' && (
                    <span className="text-[9px] font-bold text-[#757c7d] group-hover:text-[#2a2d2e] transition-colors uppercase tracking-widest">
                      {mode === 'past' ? 'View Archive' : 'Start Prep'}
                    </span>
                  )}
                  <div className="w-8 h-8 rounded-sm bg-[#f2f4f4] group-hover:bg-[#b32839] transition-all flex items-center justify-center shrink-0 border border-[#adb3b4]/10">
                    <span className="material-symbols-outlined text-base text-[#5a6061] group-hover:text-white transition-colors">
                      {mode === 'past' ? 'arrow_forward' : 'play_arrow'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <PreExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleStartExam}
        course={selectedCourse}
      />

      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#f2f4f4] rounded-sm flex items-center justify-center mb-4 border border-[#adb3b4]/10">
            <span className="material-symbols-outlined text-3xl text-[#adb3b4]">search_off</span>
          </div>
          <h3 className="text-lg font-bold text-[#2a2d2e] uppercase tracking-wider">No courses found</h3>
          <p className="text-[#757c7d] text-xs max-w-xs mt-2 italic">
            Try adjusting your search or switching semesters.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionsHub;
