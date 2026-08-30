import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  Auth,
} from 'firebase/auth';
import { initializeFirestore, setLogLevel, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import rawFirebaseConfig from '../../firebase-applet-config.json';

// Normalize standard options for FirebaseApp initialization
const firebaseOptions: FirebaseOptions = {
  apiKey: rawFirebaseConfig.apiKey,
  authDomain: rawFirebaseConfig.authDomain,
  projectId: rawFirebaseConfig.projectId,
  storageBucket: rawFirebaseConfig.storageBucket,
  messagingSenderId: rawFirebaseConfig.messagingSenderId,
  appId: rawFirebaseConfig.appId,
  measurementId: rawFirebaseConfig.measurementId,
};

export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseOptions);

// Initialize Firebase Auth with safe fallback
let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (err) {
  console.warn('[Firebase Auth fallback initialization]:', err);
  authInstance = getAuth(app);
}
export const auth: Auth = authInstance;

// Suppress transient Firestore internal connection probe logs
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

// Configure safe local persistence
try {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Ignore in restrictive iframe environments
  });
} catch {
  // Safe fallback
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');

export const oAuthClientId = (rawFirebaseConfig as { oAuthClientId?: string }).oAuthClientId || '';

// Initialize Firestore with robust auto-detect long-polling for iframe & web sandbox compatibility
export const db: Firestore = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  },
  (rawFirebaseConfig as any).firestoreDatabaseId || '(default)'
);

// Validate Connection to Firestore on startup per skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore Offline Notice]: Client is currently operating with offline cache or network restricted.');
    }
  }
}
testConnection().catch(() => {});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };

  // Only log actionable non-offline errors
  if (
    !errMsg.includes('offline') &&
    !errMsg.includes('unavailable') &&
    !errMsg.includes('could not be completed') &&
    !errMsg.includes('backend')
  ) {
    console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  }
  return errInfo;
}

// Initialize Firebase Analytics safely (supported in browser environments)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  try {
    isSupported()
      .then((supported) => {
        if (supported && firebaseOptions.measurementId) {
          try {
            analytics = getAnalytics(app);
          } catch (analyticsErr) {
            console.warn('[Analytics initialization bypassed]:', analyticsErr);
          }
        }
      })
      .catch(() => {
        // Analytics not supported in this environment
      });
  } catch {
    // Safe fallback
  }
}

export const isFirebaseConfigured = Boolean(
  rawFirebaseConfig &&
  rawFirebaseConfig.projectId &&
  rawFirebaseConfig.apiKey
);


