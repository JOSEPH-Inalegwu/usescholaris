import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface MigrationResult {
  total: number;
  updated: number;
  skipped: number;
  errors: { uid: string; reason: string }[];
  googleUsers: { uid: string; email: string; photoURL: string | null }[];
}

async function migratePhotoURLs(credsPath: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    googleUsers: [],
  };

  const resolvedPath = resolve(credsPath);
  if (!existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}\nRename your Firebase service account JSON to "firebase-creds.json" and put it in the project root, or pass the path as an argument:\n  npm run migrate:photourl -- ./path/to/your-creds.json`);
  }

  const firebaseConfig = JSON.parse(readFileSync(resolvedPath, 'utf-8'));

  if (!getApps().length) {
    initializeApp({
      credential: cert(firebaseConfig),
    });
  }

  const adminAuth = getAuth();
  const adminDb = getFirestore();

  // 1. List all users in Firebase Auth (batched)
  let nextPageToken: string | undefined;
  do {
    const listUsersResult = await adminAuth.listUsers(1000, nextPageToken);
    result.total = listUsersResult.users.length;
    nextPageToken = listUsersResult.pageToken;

    // 2. Process each user in batches to Firestore
    const userBatches: { uid: string; email: string; photoURL: string | null }[] = [];

    for (const user of listUsersResult.users) {
      try {
        if (user.providerData && user.providerData.length > 0) {
          const googleProvider = user.providerData.find(
            (p) => p.providerId === 'google.com' && p.uid
          );

          if (googleProvider?.photoURL) {
            userBatches.push({
              uid: user.uid,
              email: user.email || 'unknown',
              photoURL: googleProvider.photoURL,
            });
          } else {
            result.skipped++;
          }
        } else {
          result.skipped++;
        }
      } catch (e) {
        const err = e as Error;
        result.errors.push({ uid: user.uid, reason: err.message });
      }
    }

    // 3. Batch update Firestore (500 doc limit per batch)
    const BATCH_SIZE = 500;
    for (let i = 0; i < userBatches.length; i += BATCH_SIZE) {
      const batch = adminDb.batch();
      const batchUsers = userBatches.slice(i, i + BATCH_SIZE);

      for (const user of batchUsers) {
        const userRef = adminDb.doc(`users/${user.uid}`);

        batch.set(userRef, {
          photoURL: user.photoURL,
          migratedAt: new Date().toISOString(),
        }, { merge: true });

        result.googleUsers.push({
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
        });
        result.updated++;
      }

      await batch.commit();
      console.log(`Committed batch ${i / BATCH_SIZE + 1}: ${batchUsers.length} users updated`);
    }
  } while (nextPageToken);

  return result;
}

const credsPath = process.argv[2] || './firebase-creds.json';

migratePhotoURLs(credsPath)
  .then((result) => {
    console.log('\n========== Migration Complete ==========');
    console.log(`Total users found:    ${result.total}`);
    console.log(`PhotoURLs updated:   ${result.updated}`);
    console.log(`Skipped (no Google): ${result.skipped}`);
    console.log(`Errors:            ${result.errors.length}`);
    console.log('\nGoogle users updated:');
    result.googleUsers.forEach((u) => {
      console.log(`  ${u.uid} | ${u.email} | ${u.photoURL}`);
    });
    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach((e) => {
        console.log(`  ${e.uid}: ${e.reason}`);
      });
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });