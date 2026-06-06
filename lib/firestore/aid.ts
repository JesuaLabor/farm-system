import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AidProgram, AidApplication, ApplicationStatus } from "@/types";
import { generateRef } from "@/lib/utils";

const PROG_COL = "aid_programs";
const APP_COL = "aid_applications";

// ─── Aid Programs ─────────────────────────────────────────────────────────────

/** Create a new aid program (LGU) */
export async function createAidProgram(
  data: Omit<AidProgram, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, PROG_COL), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/** Get all published aid programs (farmer-facing) */
export async function getPublishedAidPrograms(): Promise<AidProgram[]> {
  const q = query(
    collection(db, PROG_COL),
    where("isPublished", "==", true),
    orderBy("deadline", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AidProgram));
}

/** Get all aid programs managed by an LGU officer */
export async function getLguAidPrograms(lguUid: string): Promise<AidProgram[]> {
  const q = query(
    collection(db, PROG_COL),
    where("managedBy", "==", lguUid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AidProgram));
}

/** Get a single aid program */
export async function getAidProgram(id: string): Promise<AidProgram | null> {
  const snap = await getDoc(doc(db, PROG_COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as AidProgram;
}

/** Publish or unpublish an aid program */
export async function setAidProgramPublished(
  id: string,
  isPublished: boolean
): Promise<void> {
  await updateDoc(doc(db, PROG_COL, id), { isPublished });
}

/** Update an aid program */
export async function updateAidProgram(
  id: string,
  data: Partial<Omit<AidProgram, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, PROG_COL, id), data);
}

// ─── Aid Applications ─────────────────────────────────────────────────────────

/** Submit a new aid application */
export async function submitAidApplication(
  data: Omit<AidApplication, "id" | "createdAt" | "referenceNumber" | "status">
): Promise<string> {
  const ref = await addDoc(collection(db, APP_COL), {
    ...data,
    status: "submitted" as ApplicationStatus,
    referenceNumber: generateRef(),
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/** Get all applications submitted by a farmer */
export async function getFarmerApplications(
  farmerId: string
): Promise<AidApplication[]> {
  const q = query(
    collection(db, APP_COL),
    where("farmerId", "==", farmerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AidApplication));
}

/** Get all applications for a specific program (LGU view) */
export async function getProgramApplications(
  programId: string
): Promise<AidApplication[]> {
  const q = query(
    collection(db, APP_COL),
    where("programId", "==", programId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AidApplication));
}

/** Update application status (LGU review) */
export async function reviewApplication(
  id: string,
  status: ApplicationStatus,
  notes?: string,
  reviewedBy?: string
): Promise<void> {
  await updateDoc(doc(db, APP_COL, id), {
    status,
    reviewerNotes: notes ?? "",
    reviewedBy: reviewedBy ?? "",
    updatedAt: new Date().toISOString(),
  });
}
