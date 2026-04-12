import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export interface UserStats {
  totalPoints: number;
  totalQuestions: number;
  totalTime: number;   // milliseconds
  totalAttempts: number;
  streakCount?: number;
  lastActivityDate?: string; // YYYY-MM-DD
  activityLog?: Record<string, number>;
  courseActivity?: Record<string, number>;
  achievements?: string[];
}

export interface UserProfile {
  uid: string;
  name?: string;
  email: string;
  hasCompletedOnboarding?: boolean;
  onboardingStep?: number;
  level?: string;
  faculty?: string;
  department?: string;
  stats?: UserStats;
  [key: string]: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ uid: firebaseUser.uid, ...docSnap.data() } as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setProfile(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, profile, loading };
};
