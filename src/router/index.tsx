import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import LevelPage from '../pages/onboarding/Level';
import DepartmentPage from '../pages/onboarding/Department';
import CompletePage from '../pages/onboarding/Complete';

// Simple placeholder components for other pages
const Dashboard = () => <div className="p-4 font-['Lora']">Dashboard Page</div>;
const Leaderboard = () => <div className="p-4 font-['Lora']">Leaderboard Page</div>;
const CourseSelection = () => <div className="p-4 font-['Lora']">Questions: Course Selection Page</div>;
const CourseQuestions = () => <div className="p-4 font-['Lora']">Questions: Specific Course Page</div>;
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
        <Dashboard />
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
        <CourseSelection />
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
