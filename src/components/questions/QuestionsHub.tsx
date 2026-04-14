import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSessionPersistence } from '../../hooks/useSessionPersistence';
import { type Course } from '../../types/question';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PreExamModal from './PreExamModal';

const goldPalette = { primary: '#d4aa37ff', dark: '#cf6b19ff', accent: '#b32839' };

const DEPARTMENT_MAP: Record<string, string[]> = {
  cs: ['computer science', 'cs', 'it'],
  cyb: ['cyber security', 'cybersecurity'],
  slt: ['science laboratory technology', 'slt'],
};

const QuestionsHub: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { saveSession, getSession } = useSessionPersistence();

  // 1. Initialize from Cache immediately for Zero Latency
  const [courses, setCourses] = useState<Course[]>(() => {
    const cached = localStorage.getItem('scholaris_courses_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  // 2. Only show loading if we have absolutely no data
  const [loading, setLoading] = useState(courses.length === 0);
  
  const [semester, setSemester] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'prep' | 'past'>('prep');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, 'course_metadata'), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        const courseData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const slug = doc.id;
          return {
            id: doc.id,
            slug: slug,
            code: data.code || slug.toUpperCase(),
            title: data.title || `Course: ${slug.toUpperCase()}`,
            semester: data.semester || 1, 
            level: data.level || '',
            faculty: data.faculty || 'General Studies',
            department: data.department || 'All',
            questionCount: data.totalQuestions || 0,
            lastUpdated: data.lastUpdated?.split('T')[0] || new Date().toISOString().split('T')[0]
          } as Course;
        });

        // Update state and persistent cache
        setCourses(courseData);
        localStorage.setItem('scholaris_courses_cache', JSON.stringify(courseData));
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [profile]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // 1. Semester Match
      const isSemMatch = Number(course.semester) === Number(semester);
      
      // 2. Level Match (Flexible matching)
      const userLevel = String(profile?.level || '').toLowerCase();
      const courseLevel = String(course.level || '').toLowerCase();
      
      // Allow match if:
      // - User has no level set
      // - Course has no level set (visible to all)
      // - Course level is 'all'
      // - Course level includes user level (e.g. '100,200' includes '100')
      // - User level includes course level (e.g. '100' includes '100')
      const isLevelMatch = !userLevel || 
                          !courseLevel || 
                          courseLevel === 'all' || 
                          courseLevel.includes(userLevel) || 
                          userLevel.includes(courseLevel);
      
      // 3. Department Match
      const userDept = profile?.department?.toLowerCase() || '';
      const courseDept = course.department?.toLowerCase() || 'all';
      const isDeptMatch = courseDept === 'all' || 
                         (DEPARTMENT_MAP[courseDept] ?? []).includes(userDept) ||
                         courseDept.includes(userDept) ||
                         userDept.includes(courseDept);

      // 4. Search Match
      const search = searchQuery.toLowerCase().trim();
      const isSearchMatch = !search || 
                           course.code.toLowerCase().includes(search) || 
                           course.title.toLowerCase().includes(search);

      const result = isSemMatch && isLevelMatch && isDeptMatch && isSearchMatch;
      
      if (!result) {
        console.log(`Course ${course.code} filtered out:`, { isSemMatch, isLevelMatch, isDeptMatch, isSearchMatch });
      }
      
      return result;
    });
  }, [semester, profile, searchQuery, courses]);

  const handleCourseClick = (course: Course) => {
    const existingSession = getSession(course.slug);
    setSelectedCourse(course);
    setIsResuming(!!existingSession);
    setIsModalOpen(true);
  };

  const handleStartExam = async () => {
    if (!selectedCourse) return;

    let sessionData;
    const existingSession = getSession(selectedCourse.slug);

    if (existingSession) {
      sessionData = existingSession;
    } else {
      const startTime = Date.now();
      sessionData = {
        courseSlug: selectedCourse.slug,
        sessionQuestions: [], // No longer using indices
        selectedAnswers: {},
        isRanked: true,
        startTime
      };
      saveSession(sessionData);
    }

    setIsModalOpen(false);
    navigate(`/exam/${selectedCourse.slug}`, {
      state: sessionData
    });
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
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
              className={`group cursor-pointer bg-white border border-[#adb3b4]/20 rounded-sm p-4 hover:border-[#d4aa37]/30 transition-all duration-300 flex ${view === 'grid' ? 'flex-col justify-between' : 'flex-row items-center justify-between'
                }`}
            >
              <div className={view === 'list' ? "flex items-center gap-6 flex-1" : ""}>
                <div className="flex justify-between items-center mb-4 lg:mb-0">
                  <div
                    className="px-2 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-wider whitespace-nowrap flex items-center gap-2 min-h-[20px]"
                    style={{ backgroundColor: mode === 'past' ? goldPalette.primary : goldPalette.accent }}
                  >
                    {course.code}
                  </div>
                  {(() => {
                    const cacheKey = `exam_cache_${course.slug.toLowerCase()}`;
                    const cachedData = localStorage.getItem(cacheKey);
                    if (!cachedData) return null;
                    const cache = JSON.parse(cachedData);
                    if (cache.isFullyCached) {
                      return (
                        <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-widest ml-3">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          Fully Cached
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-[#d4aa37] uppercase tracking-widest ml-3">
                        <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
                        {cache.questions?.length || 0}/200
                      </div>
                    );
                  })()}
                  {view === 'grid' && (
                    <span className="text-[9px] font-bold text-[#757c7d] tracking-wide">{course.questionCount} Questions</span>
                  )}
                </div>

                <div className={view === 'list' ? "flex-1" : ""}>
                  <h3 className={`font-bold text-[#2a2d2e] group-hover:text-[#d4aa37] transition-colors tracking-tight ${view === 'grid' ? 'text-xl mb-2' : 'text-base'
                    }`}>
                    {course.title}
                  </h3>
                  {view === 'list' && (
                    <div className="flex items-center gap-6 mt-2">
                      <span className="text-[11px] font-bold text-[#757c7d] tracking-wide">{course.questionCount} Questions</span>
                      <span className="text-[11px] text-[#adb3b4]">•</span>
                      <span className="text-[11px] font-bold text-[#757c7d] tracking-wide">Updated {course.lastUpdated}</span>
                    </div>
                  )}
                </div>
              </div>

              {view === 'grid' && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="material-symbols-outlined text-[13px] text-[#adb3b4]">history</span>
                  <span className="text-[9px] font-bold text-[#757c7d] tracking-wide">Updated {course.lastUpdated}</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <PreExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleStartExam}
        course={selectedCourse}
        isResuming={isResuming}
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
