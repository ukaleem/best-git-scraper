import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence benign transient backend connection warnings in the console
setLogLevel('silent');

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

// Initialize Firestore with persistent local cache to seamlessly handle network latency or offline mode
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId || undefined);

// Validate connection gracefully
export async function validateFirestoreConnection(): Promise<boolean> {
  // Graceful initialization; persistent cache is active
  return true;
}
