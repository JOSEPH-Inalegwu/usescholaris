import { createBrowserRouter, Navigate, useParams, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import LevelPage from '../pages/onboarding/Level';
import DepartmentPage from '../pages/onboarding/Department';
import CompletePage from '../pages/onboarding/Complete';
import DashboardPage from '../pages/dashboard/Dashboard';
import QuestionsPage from '../pages/questions';
import { ExamPortal } from '../components/questions';
import { useSessionPersistence, type ExamSession } from '../hooks/useSessionPersistence';

// Placeholder components
const Leaderboard = () => <div className="p-4 font-['Lora']">Leaderboard Page</div>;
const CourseQuestions = () => <div className="p-4 font-['Lora']">Questions: Specific Course Page</div>;

const ResultsPage = () => {
  const location = useLocation();
  const { score, total, courseSlug } = location.state || { score: 0, total: 40, courseSlug: 'Unknown' };
  
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-6 font-['Lora'] text-center">
      <div className="bg-white border border-[#adb3b4]/20 p-12 rounded-sm shadow-sm max-w-md w-full">
        <div className="w-20 h-20 bg-[#d4aa37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-[#d4aa37]">workspace_premium</span>
        </div>
        <h1 className="text-3xl font-bold text-[#2a2d2e] mb-2">Exam Results</h1>
        <p className="text-[#757c7d] text-sm uppercase tracking-widest font-bold mb-8">{courseSlug}</p>
        
        <div className="flex flex-col items-center mb-10">
          <span className="text-6xl font-bold text-[#2a2d2e]">{score}</span>
          <span className="text-sm text-[#adb3b4] font-bold uppercase tracking-widest mt-2">Points Scored / {total}</span>
        </div>

        <button 
          onClick={() => window.location.href = '/questions'}
          className="w-full py-4 bg-[#2a2d2e] text-white text-[11px] font-bold rounded-sm uppercase tracking-widest hover:bg-[#b32839] transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

const ExamPage = () => {
  const { courseSlug } = useParams();
  const { getSession } = useSessionPersistence();
  
  const session: ExamSession = courseSlug 
    ? getSession(courseSlug) || { courseSlug, startTime: Date.now(), isRanked: false }
    : { courseSlug: 'unknown', startTime: Date.now(), isRanked: false };

  return <ExamPortal session={session} />;
};

const Profile = () => <div className="p-4 font-['Lora']">Profile Page</div>;
const NotFound = () => <div className="p-4 font-['Lora']">404 Not Found</div>;

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/onboarding/level', element: <ProtectedRoute><LevelPage /></ProtectedRoute> },
  { path: '/onboarding/department', element: <ProtectedRoute><DepartmentPage /></ProtectedRoute> },
  { path: '/onboarding/complete', element: <ProtectedRoute><CompletePage /></ProtectedRoute> },
  { path: '/dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
  { path: '/leaderboard', element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },
  { path: '/questions', element: <ProtectedRoute><QuestionsPage /></ProtectedRoute> },
  { path: '/questions/:courseId', element: <ProtectedRoute><CourseQuestions /></ProtectedRoute> },
  { path: '/exam/:courseSlug', element: <ProtectedRoute><ExamPage /></ProtectedRoute> },
  { path: '/results', element: <ProtectedRoute><ResultsPage /></ProtectedRoute> },
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '*', element: <NotFound /> },
]);
