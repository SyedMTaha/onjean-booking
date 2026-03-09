import { auth, db } from "@/lib/firebase";
import type { FirebaseError } from "firebase/app";
import { signInAnonymously } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAllRooms } from "@/lib/roomService";

export interface BookingData {
  // Dates & Room
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  roomId: string;
  roomPrice: number;
  nights: number;
  guests: string;

  // Guest Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;

  // Payment Info
  transactionId?: string;
  paymentMethod?: "yoco" | "card" | "pending";
  paymentStatus?: "completed" | "pending" | "failed";
  cardLast4?: string;
  cardholderName?: string;

  // Booking Info
  bookingStatus: "pending" | "approved" | "rejected" | "cancelled"; // Default: "pending"
  totalPrice: number;
  taxesAndFees: number;
  bookingReference?: string;

  // Metadata
  userId: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

type NewBookingData = Omit<
  BookingData,
  "userId" | "createdAt" | "updatedAt" | "bookingStatus"
>;

export interface RoomAvailability {
  roomId: string;
  roomName: string;
  slug: string;
  totalUnits: number;
  bookedUnits: number;
  availableUnits: number;
  isSoldOut: boolean;
}

const ACTIVE_BOOKING_STATUSES: Array<BookingData["bookingStatus"]> = ["pending", "approved"];

async function ensureBookingAvailabilityAuth(): Promise<void> {
  // Browser-only auth bootstrap for availability checks.
  if (typeof window === "undefined") {
    return;
  }

  if (!auth) {
    throw new Error("Firebase auth is not initialized in browser.");
  }

  if (auth.currentUser) {
    return;
  }

  try {
    await signInAnonymously(auth);
  } catch (error) {
    const errorCode = (error as { code?: string })?.code;
    if (errorCode === "auth/admin-restricted-operation") {
      throw new Error("Anonymous sign-in is disabled in Firebase Authentication.");
    }
    throw new Error("Unable to authenticate for room availability checks.");
  }
}

function toDateValue(input: unknown): Date | null {
  if (!input) return null;
  if (input instanceof Date) return input;

  if (typeof input === "object" && input !== null && "toDate" in input) {
    const converted = (input as { toDate?: () => Date }).toDate?.();
    return converted instanceof Date && !Number.isNaN(converted.getTime()) ? converted : null;
  }

  const parsed = new Date(input as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  // [start, end) overlap check for booking intervals.
  return startA < endB && startB < endA;
}

/**
 * Save a booking to Firestore
 * @param userId - The user's UID
 * @param bookingData - Complete booking information
 * @returns Booking reference and ID
 */
export async function saveBooking(userId: string, bookingData: NewBookingData) {
  try {
    const bookingRef = await addDoc(collection(db, "roomBookings"), {
      ...bookingData,
      userId,
      bookingStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      bookingId: bookingRef.id,
      message: "Booking saved successfully",
    };
  } catch (error) {
    console.error("Error saving booking:", error);
    const firebaseError = error as FirebaseError;
    if (firebaseError?.code === "permission-denied") {
      throw new Error("Database permission denied. Update Firestore rules to allow authenticated users to create bookings.");
    }
    if (firebaseError?.code === "unauthenticated") {
      throw new Error("You must be signed in to save a booking.");
    }
    throw new Error(firebaseError?.message || "Failed to save booking. Please try again.");
  }
}

export async function getRoomAvailabilityForRange(
  checkInDate: Date,
  checkOutDate: Date
): Promise<Record<string, RoomAvailability>> {
  try {
    await ensureBookingAvailabilityAuth();
    const rooms = await getAllRooms();

    const activeBookingsQuery = query(
      collection(db, "roomBookings"),
      where("bookingStatus", "in", ACTIVE_BOOKING_STATUSES)
    );
    const activeBookingsSnapshot = await getDocs(activeBookingsQuery);

    const activeBookings = activeBookingsSnapshot.docs.map((bookingDoc) => bookingDoc.data() as Partial<BookingData>);

    const availabilityMap: Record<string, RoomAvailability> = {};

    for (const room of rooms) {
      const roomTotalUnits = room.totalUnits && room.totalUnits > 0 ? room.totalUnits : 1;

      const overlappingBookings = activeBookings.filter((booking) => {
        const bookingRoomId = String(booking.roomId || "");
        const bookingRoomType = String(booking.roomType || "").trim().toLowerCase();
        const matchesRoom = bookingRoomId === room.id || bookingRoomType === room.name.trim().toLowerCase();

        if (!matchesRoom) {
          return false;
        }

        const existingCheckIn = toDateValue(booking.checkInDate);
        const existingCheckOut = toDateValue(booking.checkOutDate);
        if (!existingCheckIn || !existingCheckOut) {
          return false;
        }

        return rangesOverlap(checkInDate, checkOutDate, existingCheckIn, existingCheckOut);
      });

      const bookedUnits = overlappingBookings.length;
      const availableUnits = Math.max(roomTotalUnits - bookedUnits, 0);

      availabilityMap[room.id] = {
        roomId: room.id,
        roomName: room.name,
        slug: room.slug,
        totalUnits: roomTotalUnits,
        bookedUnits,
        availableUnits,
        isSoldOut: availableUnits === 0,
      };
    }

    return availabilityMap;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    if (firebaseError?.code === "permission-denied") {
      throw new Error("Firestore rules are blocking availability checks. Allow authenticated read access to roomBookings for bookingStatus/check-in/check-out fields.");
    }
    throw error;
  }
}

export async function validateRoomAvailability(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<{ isAvailable: boolean; availableUnits: number; message?: string }> {
  const map = await getRoomAvailabilityForRange(checkInDate, checkOutDate);
  const roomAvailability = map[roomId];

  if (!roomAvailability) {
    return {
      isAvailable: false,
      availableUnits: 0,
      message: "Selected room type no longer exists.",
    };
  }

  if (roomAvailability.availableUnits <= 0) {
    return {
      isAvailable: false,
      availableUnits: 0,
      message: "Selected room type is fully booked for these dates.",
    };
  }

  return {
    isAvailable: true,
    availableUnits: roomAvailability.availableUnits,
  };
}

/**
 * Get all bookings for a specific user
 * @param userId - The user's UID
 * @returns Array of booking data
 */
export async function getUserBookings(userId: string) {
  try {
    const q = query(collection(db, "roomBookings"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const bookings: any[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw new Error("Failed to fetch bookings. Please try again.");
  }
}

/**
 * Get all bookings (admin only)
 * @returns Array of all booking data
 */
export async function getAllBookings() {
  try {
    const querySnapshot = await getDocs(collection(db, "roomBookings"));

    const bookings: any[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    throw new Error("Failed to fetch bookings. Please try again.");
  }
}

/**
 * Update booking status (admin only)
 * @param bookingId - The booking document ID
 * @param status - New status: "approved" | "rejected" | "cancelled"
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "approved" | "rejected" | "cancelled"
) {
  try {
    const bookingRef = doc(db, "roomBookings", bookingId);
    await updateDoc(bookingRef, {
      bookingStatus: status,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Booking status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status. Please try again.");
  }
}

/**
 * Cancel a booking (user can only cancel their own)
 * @param bookingId - The booking document ID
 * @param userId - The user's UID (for verification)
 */
export async function cancelBooking(bookingId: string, userId: string) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    // In a real app, use security rules to verify userId matches
    await updateDoc(bookingRef, {
      bookingStatus: "cancelled",
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Booking cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw new Error("Failed to cancel booking. Please try again.");
  }
}
