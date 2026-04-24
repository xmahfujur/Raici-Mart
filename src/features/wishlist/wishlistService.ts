import { 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'wishlist';

export interface WishlistItem {
  id?: string;
  userId: string;
  productId: string;
  createdAt: any;
}

export const wishlistService = {
  async addToWishlist(userId: string, productId: string) {
    // Check if already in wishlist to prevent duplicates
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId), 
      where('productId', '==', productId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) return;

    return addDoc(collection(db, COLLECTION_NAME), {
      userId,
      productId,
      createdAt: serverTimestamp()
    });
  },

  async removeFromWishlist(userId: string, productId: string) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId), 
      where('productId', '==', productId)
    );
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    return Promise.all(deletePromises);
  },

  async toggleWishlist(userId: string, productId: string) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId), 
      where('productId', '==', productId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return this.addToWishlist(userId, productId);
    } else {
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      return Promise.all(deletePromises);
    }
  },

  subscribeToUserWishlist(userId: string, onUpdate: (items: WishlistItem[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WishlistItem[];
      onUpdate(items);
    });
  }
};
