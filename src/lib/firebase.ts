import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate connection
export async function validateFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'ping'));
  } catch (error: any) {
    if (error?.message && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or database initializing.');
    }
  }
}
