import { FirebaseError } from 'firebase/app';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  } | null;
}

export const handleFirestoreError = (
  error: any, 
  operationType: FirestoreErrorInfo['operationType'], 
  path: string | null = null
): string => {
  console.error(`[Firestore Error] ${operationType} on ${path}:`, error);

  if (error instanceof FirebaseError && error.code === 'permission-denied') {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: null // In a real app, you'd get this from your auth state if available
    };
    return JSON.stringify(errorInfo);
  }

  return error.message || 'An unknown error occurred with the database.';
};
