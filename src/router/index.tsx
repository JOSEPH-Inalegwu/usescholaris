import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Simple placeholder components for pages
const Login = () => <div className="p-4">Login Page</div>;
const Register = () => <div className="p-4">Register Page</div>;
const OnboardingLevel = () => <div className="p-4">Onboarding Level Page</div>;
const OnboardingDepartment = () => <div className="p-4">Onboarding Department Page</div>;
const OnboardingComplete = () => <div className="p-4">Onboarding Complete Page</div>;
const Dashboard = () => <div className="p-4">Dashboard Page</div>;
const Leaderboard = () => <div className="p-4">Leaderboard Page</div>;
const CourseSelection = () => <div className="p-4">Questions: Course Selection Page</div>;
const CourseQuestions = () => <div className="p-4">Questions: Specific Course Page</div>;
const Profile = () => <div className="p-4">Profile Page</div>;
const NotFound = () => <div className="p-4">404 Not Found</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/onboarding/level',
    element: (
      <ProtectedRoute>
        <OnboardingLevel />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/department',
    element: (
      <ProtectedRoute>
        <OnboardingDepartment />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/complete',
    element: (
      <ProtectedRoute>
        <OnboardingComplete />
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
