import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile, UserRole } from "@/types";

const COL = "users";

/** Get a single user profile by UID */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/** Create or overwrite a user profile */
export async function setUserProfile(
  uid: string,
  data: Omit<UserProfile, "uid">
): Promise<void> {
  await setDoc(doc(db, COL, uid), { uid, ...data }, { merge: true });
}

/** Update partial user profile fields */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, COL, uid), data);
}

/** Get all users by role */
export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  const q = query(
    collection(db, COL),
    where("role", "==", role),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

/** Get all users (admin use) */
export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

/** Get all farmers in a municipality */
export async function getFarmersByMunicipality(
  municipality: string
): Promise<UserProfile[]> {
  const q = query(
    collection(db, COL),
    where("role", "==", "farmer"),
    where("municipality", "==", municipality)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

/** Approve or suspend a user */
export async function setUserApproval(
  uid: string,
  isApproved: boolean
): Promise<void> {
  await updateDoc(doc(db, COL, uid), { isApproved });
}
