import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Collection {
  id?: string;
  name: string;
  image?: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'collections';

export const collectionService = {
  async createCollection(data: Omit<Collection, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('[collectionService] Error creating collection:', error);
      throw error;
    }
  },

  async updateCollection(id: string, data: Partial<Collection>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`[collectionService] Error updating collection ${id}:`, error);
      throw error;
    }
  },

  async deleteCollection(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[collectionService] Error deleting collection ${id}:`, error);
      throw error;
    }
  },

  subscribeToCollections(callback: (collections: Collection[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const collections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Collection[];
      callback(collections);
    });
  }
};
