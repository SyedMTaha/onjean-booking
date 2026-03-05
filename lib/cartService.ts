import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export interface CartDbItem {
  id: string;
  itemId: string;
  userId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
  createdAt: any;
  updatedAt: any;
}

type UpsertCartItemInput = {
  userId: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
};

export async function getUserCartItems(userId: string): Promise<CartDbItem[]> {
  const q = query(collection(db, "cartItems"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<CartDbItem, "id">),
  }));
}

export async function upsertCartItem(data: UpsertCartItemInput) {
  const q = query(
    collection(db, "cartItems"),
    where("userId", "==", data.userId),
    where("itemId", "==", data.itemId)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const existing = snapshot.docs[0];
    await updateDoc(doc(db, "cartItems", existing.id), {
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      image: data.image,
      description: data.description,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await addDoc(collection(db, "cartItems"), {
    userId: data.userId,
    itemId: data.itemId,
    name: data.name,
    price: data.price,
    quantity: data.quantity,
    image: data.image,
    description: data.description,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function removeCartItemByItemId(userId: string, itemId: string) {
  const q = query(
    collection(db, "cartItems"),
    where("userId", "==", userId),
    where("itemId", "==", itemId)
  );
  const snapshot = await getDocs(q);

  await Promise.all(snapshot.docs.map((item) => deleteDoc(doc(db, "cartItems", item.id))));
}

export async function clearUserCart(userId: string) {
  const q = query(collection(db, "cartItems"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  await Promise.all(snapshot.docs.map((item) => deleteDoc(doc(db, "cartItems", item.id))));
}
