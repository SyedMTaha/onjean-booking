/**
 * Migration script to add/update totalUnits on existing room docs.
 *
 * Run:
 * node --import tsx scripts/updateRoomInventory.ts
 */

import dotenv from "dotenv";
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { collection, getDocs, getFirestore, updateDoc } from "firebase/firestore";

dotenv.config({ path: ".env.local" });

const ROOM_INVENTORY_BY_SLUG: Record<string, number> = {
  "deluxe-double-room": 4,
  "deluxe-double-room-with-bath": 1,
  "family-double-room": 2,
};

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || !value.trim()) {
    throw new Error(`Missing required env var: ${key} in .env.local`);
  }
  return value.trim();
}

function createFirestoreDb() {
  const firebaseConfig: FirebaseOptions = {
    apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: requireEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: requireEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return {
    app,
    db: getFirestore(app),
  };
}

async function updateRoomInventory() {
  const { app, db } = createFirestoreDb();

  // Authenticate so rules that require request.auth can permit writes.
  try {
    const auth = getAuth(app);
    await signInAnonymously(auth);
  } catch (error) {
    console.warn("Anonymous sign-in failed. Ensure Firebase Authentication > Anonymous is enabled.");
    throw error;
  }

  const roomsSnapshot = await getDocs(collection(db, "rooms"));

  let updated = 0;
  let skipped = 0;

  for (const roomDoc of roomsSnapshot.docs) {
    const data = roomDoc.data();
    const slug = String(data.slug || "");
    const totalUnits = ROOM_INVENTORY_BY_SLUG[slug];

    if (!totalUnits) {
      skipped += 1;
      continue;
    }

    await updateDoc(roomDoc.ref, {
      totalUnits,
      updatedAt: new Date(),
    });

    updated += 1;
    console.log(`Updated ${slug} -> totalUnits=${totalUnits}`);
  }

  console.log("\nInventory migration complete");
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}

updateRoomInventory().catch((error) => {
  console.error("Failed to update room inventory:", error);
  process.exit(1);
});
