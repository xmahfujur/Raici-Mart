import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'notifications';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: any;
}

export const notificationService = {
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    return addDoc(collection(db, COLLECTION_NAME), {
      ...notification,
      createdAt: serverTimestamp()
    });
  },

  async markAsRead(id: string) {
    return updateDoc(doc(db, COLLECTION_NAME, id), { isRead: true });
  },

  async markAllAsRead(userId: string) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId), 
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
      batch.update(d.ref, { isRead: true });
    });
    return batch.commit();
  },

  subscribeToUserNotifications(userId: string, onUpdate: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      onUpdate(notifications);
    });
  }
};
