import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const DEFAULT_ADMIN_EMAIL = "admin@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export async function ensureDefaultAdminCredentials() {
  const q = query(collection(db, "adminCredentials"), where("email", "==", DEFAULT_ADMIN_EMAIL));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    // Intentionally stored as requested by the current project requirement.
    await addDoc(collection(db, "adminCredentials"), {
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }
}

export async function verifyAdminCredentials(email: string, password: string) {
  const q = query(
    collection(db, "adminCredentials"),
    where("email", "==", email),
    where("password", "==", password)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export function getDefaultAdminCredentials() {
  return {
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  };
}
