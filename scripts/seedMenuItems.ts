/**
 * Seed script to populate Firestore with menu items.
 *
 * Run:
 * node --import tsx scripts/seedMenuItems.ts
 */

import dotenv from "dotenv";
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";
import { localMenuItemsByCategory } from "../data/menuItems";

dotenv.config({ path: ".env.local" });

const MENU_COLLECTION = "menuItems";

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
  return getFirestore(app);
}

function parsePrice(price: string): number {
  const parsed = parseInt(price.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function seedMenuItems() {
  console.log("🌱 Starting menu item seeding...\n");

  try {
    const db = createFirestoreDb();
    const menuCollection = collection(db, MENU_COLLECTION);

    const flattened = Object.entries(localMenuItemsByCategory).flatMap(([category, items]) =>
      items.map((item) => ({
        ...item,
        category,
      }))
    );

    const expectedIds = new Set(
      flattened.map((item) => slugify(`${item.category}-${item.subcategory || ""}-${item.name}`))
    );

    const existingSnapshot = await getDocs(menuCollection);
    for (const existingDoc of existingSnapshot.docs) {
      if (!expectedIds.has(existingDoc.id)) {
        await deleteDoc(existingDoc.ref);
        console.log(`🧹 Removed stale menu item: ${existingDoc.id}`);
      }
    }

    let successCount = 0;
    let errorCount = 0;

    for (const item of flattened) {
      try {
        const itemId = slugify(`${item.category}-${item.subcategory || ""}-${item.name}`);
        const itemRef = doc(menuCollection, itemId);

        await setDoc(itemRef, {
          name: item.name,
          category: item.category,
          subcategory: item.subcategory || null,
          price: item.price,
          priceNumeric: parsePrice(item.price),
          description: item.description,
          image: item.image,
          available: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`✅ Added/Updated: ${item.name} (${item.category})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add ${item.name}:`, error);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✨ Menu seeding completed!");
    console.log(`✅ Successfully added/updated: ${successCount} items`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} items`);
    }
    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("💥 Fatal error during menu seeding:", error);
    process.exit(1);
  }
}

seedMenuItems()
  .then(() => {
    console.log("\n✅ Menu seed script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Menu seed script failed:", error);
    process.exit(1);
  });
