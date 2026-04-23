import { doc, getDoc, setDoc, updateDoc, serverTimestamp, FirestoreError } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface UserData {
  apiKey?: string;
  email: string;
  displayName: string;
  updatedAt: any;
}

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  }
}

const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null) => {
  if (error instanceof FirestoreError && error.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || true,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName,
          email: p.email
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  const userRef = doc(db, 'users', userId);
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
  } catch (error) {
    handleFirestoreError(error, 'get', `users/${userId}`);
  }
  return null;
};

export const saveUserApiKey = async (userId: string, apiKey: string, email: string, displayName: string) => {
  const userRef = doc(db, 'users', userId);
  try {
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        apiKey,
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        apiKey,
        email,
        displayName,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, 'write', `users/${userId}`);
  }
};

export const ensureUserExists = async (userId: string, email: string, displayName: string) => {
  const userRef = doc(db, 'users', userId);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email,
        displayName,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, 'write', `users/${userId}`);
  }
};
