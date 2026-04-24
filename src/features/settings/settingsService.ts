import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AppSettings {
  storeName: string;
  logo: string;
  currency: 'BDT' | 'USD' | 'EUR';
  timezone: string;
  updatedAt?: any;
}

const COLLECTION_NAME = 'settings';
const DOC_ID = 'global';

export const settingsService = {
  async getSettings(): Promise<AppSettings | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
      }
      return null;
    } catch (error) {
      console.error('[settingsService] Error getting settings:', error);
      throw error;
    }
  },

  async updateSettings(data: Partial<AppSettings>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('[settingsService] Error updating settings:', error);
      throw error;
    }
  },

  subscribeToSettings(callback: (settings: AppSettings | null) => void) {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as AppSettings);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('[settingsService] Subscription error:', error);
      callback(null);
    });
  }
};
