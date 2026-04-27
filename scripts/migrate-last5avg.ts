import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface MigrationResult {
  usersScanned: number;
  usersWithAttempts: number;
  updated: number;
  skipped: number;
  errors: { uid: string; reason: string }[];
}

async function migrateLast5Avg(): Promise<MigrationResult> {
  const result: MigrationResult = {
    usersScanned: 0,
    usersWithAttempts: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const credsPath = process.argv[2] || './firebase-creds.json';
  const resolvedPath = resolve(credsPath);
  if (!existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}\nPlace your Firebase service account JSON and run:\n  npm run migrate:last5avg`);
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(readFileSync(resolvedPath, 'utf-8'))) });
  }

  const adminDb = getFirestore();

  // Read all user documents that have attempted at least one exam
  const usersRef = adminDb.collection('users');
  const usersSnap = await usersRef.get();

  result.usersScanned = usersSnap.size;
  console.log(`Scanning ${usersSnap.size} user documents...`);

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data();

    try {
      // Check if user has completed onboarding — if not, this is a ghost/incomplete account
      if (userData.hasCompletedOnboarding !== true) {
        result.skipped++;
        continue;
      }

      // Read all exam attempts for this user, sorted by timestamp desc, take last 5
      const attemptsSnap = await adminDb.collection('exam_attempts')
        .where('userId', '==', uid)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

      if (attemptsSnap.empty) {
        result.skipped++;
        continue;
      }

      result.usersWithAttempts++;

      const last5Pcts = attemptsSnap.docs.map(d => {
        const a = d.data();
        return Math.round(((a.score || 0) / (a.totalQuestions || 40)) * 100);
      });
      const last5Avg = Math.round(
        last5Pcts.reduce((s, p) => s + p, 0) / last5Pcts.length
      );

      // Sum ALL questions they've ever attempted (for tiebreaker)
      const allAttemptsSnap = await adminDb.collection('exam_attempts')
        .where('userId', '==', uid)
        .get();
      const questionsAttempted = allAttemptsSnap.docs.reduce(
        (sum, d) => sum + ((d.data().totalQuestions) || 40), 0
      );

      await userDoc.ref.update({
        'stats.last5Avg': last5Avg,
        'stats.questionsAttempted': questionsAttempted,
        'stats.migratedLast5Avg': true,
      });

      result.updated++;
      if (result.updated % 20 === 0) {
        console.log(`Updated ${result.updated} users...`);
      }
    } catch (e) {
      const err = e as Error;
      result.errors.push({ uid, reason: err.message });
    }
  }

  return result;
}

migrateLast5Avg()
  .then((result) => {
    console.log('\n========== Migration Complete ==========');
    console.log(`User documents scanned:  ${result.usersScanned}`);
    console.log(`Users with attempts:     ${result.usersWithAttempts}`);
    console.log(`last5Avg updated:     ${result.updated}`);
    console.log(`Skipped (no attempts): ${result.skipped}`);
    console.log(`Errors:               ${result.errors.length}`);
    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach(e => console.log(`  ${e.uid}: ${e.reason}`));
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });