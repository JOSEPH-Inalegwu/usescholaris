import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import LevelPage from '../pages/onboarding/Level';
import DepartmentPage from '../pages/onboarding/Department';
import CompletePage from '../pages/onboarding/Complete';
import DashboardPage from '../pages/dashboard/Dashboard';
import QuestionsPage from '../pages/questions';

import { useParams } from 'react-router-dom';

// Simple placeholder components for other pages
const Leaderboard = () => <div className="p-4 font-['Lora']">Leaderboard Page</div>;
const CourseQuestions = () => <div className="p-4 font-['Lora']">Questions: Specific Course Page</div>;
const ExamPage = () => {
  const { courseSlug } = useParams();
  return (
    <div className="min-h-screen bg-[#f9f9f9] p-8 font-['Lora'] flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white border border-[#adb3b4]/20 rounded-sm p-12 shadow-sm text-center">
        <div className="inline-block px-3 py-1 bg-[#b32839] text-white text-[10px] font-bold rounded-sm mb-6 uppercase tracking-widest">
          Ranked Session Live
        </div>
        <h1 className="text-4xl font-bold text-[#2a2d2e] uppercase mb-4 tracking-tight">
          Exam Session: {courseSlug}
        </h1>
        <p className="text-[#757c7d] text-lg max-w-lg mx-auto leading-relaxed">
          The evaluation environment is being initialized. Please maintain focus and avoid switching tabs.
        </p>
        <div className="mt-12 flex justify-center gap-4">
          <div className="h-1.5 w-24 bg-[#f2f4f4] rounded-sm overflow-hidden">
            <motion.div 
              className="h-full bg-[#d4aa37]"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
const Profile = () => <div className="p-4 font-['Lora']">Profile Page</div>;
const NotFound = () => <div className="p-4 font-['Lora']">404 Not Found</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/onboarding/level',
    element: (
      <ProtectedRoute>
        <LevelPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/department',
    element: (
      <ProtectedRoute>
        <DepartmentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/complete',
    element: (
      <ProtectedRoute>
        <CompletePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/leaderboard',
    element: (
      <ProtectedRoute>
        <Leaderboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/questions',
    element: (
      <ProtectedRoute>
        <QuestionsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/questions/:courseId',
    element: (
      <ProtectedRoute>
        <CourseQuestions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/exam/:courseSlug',
    element: (
      <ProtectedRoute>
        <ExamPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
