import { auth, db } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy 
} from "firebase/firestore";

export interface Room {
  id: string;
  name: string;
  slug: string;
  price: string;
  priceNumeric: number; // For sorting/filtering
  image: string;
  images?: string[];
  maxGuests: number;
  bedType: string;
  size: string;
  description: string;
  longDescription?: string;
  amenities: string[];
  features?: string[];
  view?: string;
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ROOMS_COLLECTION = "rooms";

async function ensureRoomServiceAuth(): Promise<void> {
  // Only needed in browser. Server-side scripts use a different path.
  if (typeof window === "undefined") {
    return;
  }

  if (!auth) {
    throw new Error("Firebase auth is not initialized in browser.");
  }

  if (auth.currentUser) {
    return;
  }

  await signInAnonymously(auth);
}

/**
 * Get all rooms from Firestore
 */
export async function getAllRooms(): Promise<Room[]> {
  try {
    await ensureRoomServiceAuth();
    const roomsCollection = collection(db, ROOMS_COLLECTION);
    const roomsQuery = query(roomsCollection, orderBy("priceNumeric", "asc"));
    const snapshot = await getDocs(roomsQuery);
    
    const rooms: Room[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      rooms.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Room);
    });
    
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    const firebaseCode = (error as { code?: string } | null)?.code;
    if (firebaseCode === "permission-denied") {
      throw new Error("Missing Firestore read permission for rooms collection.");
    }
    throw new Error("Failed to fetch rooms from database");
  }
}

/**
 * Get a single room by slug
 */
export async function getRoomBySlug(slug: string): Promise<Room | null> {
  try {
    await ensureRoomServiceAuth();
    const roomsCollection = collection(db, ROOMS_COLLECTION);
    const q = query(roomsCollection, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Room;
  } catch (error) {
    console.error("Error fetching room by slug:", error);
    throw new Error("Failed to fetch room from database");
  }
}

/**
 * Get a single room by ID
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  try {
    await ensureRoomServiceAuth();
    const roomDoc = doc(db, ROOMS_COLLECTION, roomId);
    const snapshot = await getDoc(roomDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Room;
  } catch (error) {
    console.error("Error fetching room by ID:", error);
    throw new Error("Failed to fetch room from database");
  }
}

/**
 * Add a new room to Firestore
 */
export async function addRoom(room: Omit<Room, "id" | "createdAt" | "updatedAt">): Promise<{ success: boolean; roomId?: string; error?: string }> {
  try {
    await ensureRoomServiceAuth();
    // Generate a unique document ID
    const roomsCollection = collection(db, ROOMS_COLLECTION);
    const newRoomRef = doc(roomsCollection);
    
    const roomData = {
      ...room,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(newRoomRef, roomData);
    
    return { success: true, roomId: newRoomRef.id };
  } catch (error) {
    console.error("Error adding room:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add room" 
    };
  }
}

/**
 * Update an existing room
 */
export async function updateRoom(
  roomId: string, 
  updates: Partial<Omit<Room, "id" | "createdAt" | "updatedAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureRoomServiceAuth();
    const roomDoc = doc(db, ROOMS_COLLECTION, roomId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await updateDoc(roomDoc, updateData);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating room:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update room" 
    };
  }
}

/**
 * Delete a room from Firestore
 */
export async function deleteRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureRoomServiceAuth();
    const roomDoc = doc(db, ROOMS_COLLECTION, roomId);
    await deleteDoc(roomDoc);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting room:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete room" 
    };
  }
}

/**
 * Toggle room availability
 */
export async function toggleRoomAvailability(
  roomId: string, 
  available: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateRoom(roomId, { available });
}

/**
 * Get all available rooms
 */
export async function getAvailableRooms(): Promise<Room[]> {
  try {
    await ensureRoomServiceAuth();
    const roomsCollection = collection(db, ROOMS_COLLECTION);
    const q = query(
      roomsCollection, 
      where("available", "==", true),
      orderBy("priceNumeric", "asc")
    );
    const snapshot = await getDocs(q);
    
    const rooms: Room[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      rooms.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Room);
    });
    
    return rooms;
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    throw new Error("Failed to fetch available rooms");
  }
}

/**
 * Get all room slugs (useful for generating static paths)
 */
export async function getAllRoomSlugs(): Promise<string[]> {
  try {
    const rooms = await getAllRooms();
    return rooms.map(room => room.slug);
  } catch (error) {
    console.error("Error fetching room slugs:", error);
    return [];
  }
}
