/**
 * Seed script to populate Firestore with initial room data
 * 
 * Run this script ONCE to populate your database:
 * node --import tsx scripts/seedRooms.ts
 * 
 * Make sure you have firebase initialized and proper permissions
 */

import dotenv from "dotenv";
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";

// Load Next.js environment variables when running this standalone script.
dotenv.config({ path: ".env.local" });

// Import existing room data
import { rooms as existingRooms } from "../data/rooms";

const ROOMS_COLLECTION = "rooms";

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
  return getFirestore(app);
}

// Helper function to extract numeric price from string (e.g., "R1,200" -> 1200)
function extractNumericPrice(priceString: string): number {
  return parseInt(priceString.replace(/[R,]/g, ''), 10);
}

async function seedRooms() {
  console.log("🌱 Starting room data seeding...\n");
  
  try {
    const db = createFirestoreDb();
    const roomsCollection = collection(db, ROOMS_COLLECTION);
    let successCount = 0;
    let errorCount = 0;

    // Remove stale rooms that are no longer in the source list.
    const expectedIds = new Set(existingRooms.map((room) => room.id.toString()));
    const existingSnapshot = await getDocs(roomsCollection);
    for (const existingDoc of existingSnapshot.docs) {
      if (!expectedIds.has(existingDoc.id)) {
        await deleteDoc(existingDoc.ref);
        console.log(`🧹 Removed stale room doc ID: ${existingDoc.id}`);
      }
    }

    for (const room of existingRooms) {
      try {
        // Use the room's ID as the document ID for consistency
        const roomDocRef = doc(roomsCollection, room.id.toString());
        
        const roomData = {
          name: room.name,
          slug: room.slug,
          price: room.price,
          priceNumeric: extractNumericPrice(room.price),
          image: room.image,
          images: room.images || [room.image],
          maxGuests: room.maxGuests,
          bedType: room.bedType,
          size: room.size,
          description: room.description,
          longDescription: room.longDescription || room.description,
          amenities: room.amenities,
          features: room.features || room.amenities,
          view: room.view || "City View",
          available: true, // All rooms start as available
          totalUnits: ROOM_INVENTORY_BY_SLUG[room.slug] || 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(roomDocRef, roomData);
        console.log(`✅ Added: ${room.name} (ID: ${room.id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add ${room.name}:`, error);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✨ Seeding completed!`);
    console.log(`✅ Successfully added: ${successCount} rooms`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} rooms`);
    }
    console.log("=".repeat(50) + "\n");
    
    if (errorCount === 0) {
      console.log("🎉 All rooms have been successfully seeded to Firestore!");
      console.log("📝 You can now update your pages to fetch from the database.");
    }
    
  } catch (error) {
    console.error("💥 Fatal error during seeding:", error);
    process.exit(1);
  }
}

// Run the seed function
seedRooms()
  .then(() => {
    console.log("\n✅ Seed script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });
