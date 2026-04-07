import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d3435]"></div>
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

  return <>{children}</>;
};
