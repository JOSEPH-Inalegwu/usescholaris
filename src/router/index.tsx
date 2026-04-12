import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import LevelPage from '../pages/onboarding/Level';
import DepartmentPage from '../pages/onboarding/Department';
import CompletePage from '../pages/onboarding/Complete';
import DashboardPage from '../pages/dashboard/Dashboard';
import QuestionsPage from '../pages/questions';
import ResultAnalysis from '../pages/questions/ResultAnalysis';
import ReviewPage from '../pages/questions/ReviewPage';
import AdminUpload from '../pages/admin/AdminUpload';
import { AdminGuard } from '../components/auth/AdminGuard';
import { ExamPortal } from '../components/questions';
import { useSessionPersistence, type ExamSession } from '../hooks/useSessionPersistence';

// Placeholder components
const Leaderboard = () => <div className="p-4 font-['Lora']">Leaderboard Page</div>;
const CourseQuestions = () => <div className="p-4 font-['Lora']">Questions: Specific Course Page</div>;

const ExamPage = () => {
  const { courseSlug } = useParams();
  const { getSession } = useSessionPersistence();
  
  const session: ExamSession = courseSlug 
    ? getSession(courseSlug) || { courseSlug, startTime: Date.now(), isRanked: false, sessionQuestions: [], selectedAnswers: {} }
    : { courseSlug: 'unknown', startTime: Date.now(), isRanked: false, sessionQuestions: [], selectedAnswers: {} };

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
  { path: '/results', element: <ProtectedRoute><ResultAnalysis /></ProtectedRoute> },
  { path: '/results/review', element: <ProtectedRoute><ReviewPage /></ProtectedRoute> },
  { path: '/admin/upload', element: <ProtectedRoute><AdminGuard><AdminUpload /></AdminGuard></ProtectedRoute> },
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '*', element: <NotFound /> },
]);
