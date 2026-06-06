import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let db: ReturnType<typeof getFirestore> | undefined;
let storage: ReturnType<typeof getStorage> | undefined;

const PLACEHOLDER_VALUES = ["your_api_key", undefined, ""];
const isValidConfig = !PLACEHOLDER_VALUES.includes(firebaseConfig.apiKey as string);

try {
  if (isValidConfig) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Connect to local emulators in development
    if (
      process.env.NEXT_PUBLIC_USE_EMULATORS === "true" &&
      typeof window !== "undefined"
    ) {
      // Guard against double-connecting (Next.js hot reload)
      const win = window as typeof window & {
        __emulatorsConnected?: boolean;
      };
      if (!win.__emulatorsConnected) {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
        connectFirestoreEmulator(db, "localhost", 8080);
        connectStorageEmulator(storage, "localhost", 9199);
        win.__emulatorsConnected = true;
        console.info("🔧 Firebase connected to local emulators.");
      }
    }
  } else {
    console.warn("Firebase API Key missing. App running in MOCK MODE.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { app, auth, db, storage };
