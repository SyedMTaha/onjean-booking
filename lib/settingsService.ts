import { db } from "@/lib/firebase";
import type { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export interface AdminProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface HotelInfoSettings {
  hotelName: string;
  address: string;
  contactEmail: string;
  phone: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  desktopNotifications: boolean;
}

export interface DashboardSettings {
  adminProfile: AdminProfileSettings;
  hotelInfo: HotelInfoSettings;
  notifications: NotificationSettings;
}

const SETTINGS_COLLECTION = "dashboardSettings";
const SETTINGS_DOC_ID = "main";

export function isPermissionDeniedError(error: unknown): boolean {
  const firebaseError = error as FirebaseError;
  return firebaseError?.code === "permission-denied";
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  adminProfile: {
    firstName: "Hotel",
    lastName: "Admin",
    email: "admin@gmail.com",
    phone: "+1 (555) 987-6543",
  },
  hotelInfo: {
    hotelName: "Onjean Hotel",
    address: "123 Main Street, New York, NY 10001",
    contactEmail: "contact@onjeahotel.com",
    phone: "+1 (555) 123-4567",
  },
  notifications: {
    emailNotifications: true,
    desktopNotifications: true,
  },
};

function withDefaults(data: any): DashboardSettings {
  return {
    adminProfile: {
      ...DEFAULT_SETTINGS.adminProfile,
      ...(data?.adminProfile || {}),
    },
    hotelInfo: {
      ...DEFAULT_SETTINGS.hotelInfo,
      ...(data?.hotelInfo || {}),
    },
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(data?.notifications || {}),
    },
  };
}

export async function getDashboardSettings(): Promise<DashboardSettings> {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const initial = {
        ...DEFAULT_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, initial, { merge: true });
      return DEFAULT_SETTINGS;
    }

    return withDefaults(snap.data());
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      // Return safe defaults when rules block this collection so UI remains usable.
      return DEFAULT_SETTINGS;
    }
    throw error;
  }
}

export async function updateAdminProfileSettings(adminProfile: AdminProfileSettings) {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(
    ref,
    {
      adminProfile,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateHotelInfoSettings(hotelInfo: HotelInfoSettings) {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(
    ref,
    {
      hotelInfo,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateNotificationSettings(notifications: NotificationSettings) {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(
    ref,
    {
      notifications,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateAdminCredentialPassword(adminEmail: string, currentPassword: string, newPassword: string) {
  const q = query(
    collection(db, "adminCredentials"),
    where("email", "==", adminEmail.trim().toLowerCase()),
    where("password", "==", currentPassword)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Current password is incorrect.");
  }

  await Promise.all(
    snapshot.docs.map((d) =>
      updateDoc(doc(db, "adminCredentials", d.id), {
        password: newPassword,
        updatedAt: new Date().toISOString(),
      })
    )
  );
}
