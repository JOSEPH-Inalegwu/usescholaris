import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../lib/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const useStreakValidation = () => {
  const { profile, user } = useAuth();

  useEffect(() => {
    if (profile && user && profile.stats?.streakCount && profile.stats?.lastExamCompleted) {
      const lastExamDate = new Date(profile.stats.lastExamCompleted);
      const today = new Date();
      
      // Reset hours to compare only dates
      const lastDate = new Date(lastExamDate.getFullYear(), lastExamDate.getMonth(), lastExamDate.getDate());
      const currDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        console.log(`Streak Validation: Resetting streak. Last exam was ${diffDays} days ago.`);
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, {
          'stats.streakCount': 0
        }).catch(err => console.error("Error resetting streak:", err));
      }
    } else if (profile && user && profile.stats?.streakCount && !profile.stats?.lastExamCompleted && profile.stats?.lastActivityDate) {
        // Fallback to lastActivityDate if lastExamCompleted is missing but streak exists
        const lastActivity = new Date(profile.stats.lastActivityDate);
        const today = new Date();
        const lastDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
        const currDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            console.log("Streak Validation (Fallback): Resetting streak.");
            const userDocRef = doc(db, 'users', user.uid);
            updateDoc(userDocRef, {
              'stats.streakCount': 0
            }).catch(err => console.error("Error resetting streak:", err));
        }
    }
  }, [profile?.uid, profile?.stats?.lastExamCompleted, profile?.stats?.streakCount]);
};
