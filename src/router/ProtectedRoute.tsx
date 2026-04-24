import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { PostHogProvider } from 'posthog-js/react';
import { usePostHog } from 'posthog-js/react';

const PostHogInit = ({ children }: { children: ReactNode }) => {
  const postHog = usePostHog();
  useEffect(() => {
    if (postHog) {
      postHog.capture('page_view');
    }
  }, [postHog]);
  return <>{children}</>;
};

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data();
              // Check both naming conventions for robustness
              const isComplete = data.hasCompletedOnboarding || data.onboardingComplete;
              setOnboardingComplete(!!isComplete);
            } else {
              setOnboardingComplete(false);
            }
            setLoading(false);
          }, (error) => {
            console.error("Error in snapshot listener:", error);
            setOnboardingComplete(false);
            setLoading(false);
          });
        } catch (error) {
          console.error("Error setting up snapshot:", error);
          setOnboardingComplete(false);
          setLoading(false);
        }
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setIsAuthenticated(false);
        setOnboardingComplete(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f9f9f9]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 border-2 border-[#f27438] border-t-transparent rounded-full animate-spin"></div>
          <img
            src="/favicon.png"
            alt="Loading..."
            className="w-8 h-8 opacity-90"
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');

  // If onboarding is not complete and user is NOT on an onboarding route, redirect to onboarding
  if (onboardingComplete === false && !isOnboardingRoute) {
    return <Navigate to="/onboarding/level" replace />;
  }

  // If onboarding is complete and user IS on an onboarding route, redirect to dashboard
  if (onboardingComplete === true && isOnboardingRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2026-01-30',
      } as const}
    >
      <PostHogInit>{children}</PostHogInit>
    </PostHogProvider>
  );
};
