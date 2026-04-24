import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError } from '@/lib/errorHandlers';

const COLLECTION_NAME = 'campaigns';

export interface Campaign {
  id?: string;
  title: string;
  discountPercentage: number;
  startDate: Timestamp;
  endDate: Timestamp;
  productIds: string[];
  categoryIds?: string[];
  collectionIds?: string[];
  isActive: boolean;
  createdAt?: Timestamp;
}

export const campaignService = {
  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...campaign,
        createdAt: serverTimestamp()
      });
      return docRef;
    } catch (error) {
      throw handleFirestoreError(error, 'create', COLLECTION_NAME);
    }
  },

  async updateCampaign(id: string, campaign: Partial<Campaign>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, campaign);
    } catch (error) {
      throw handleFirestoreError(error, 'update', `${COLLECTION_NAME}/${id}`);
    }
  },

  async deleteCampaign(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw handleFirestoreError(error, 'delete', `${COLLECTION_NAME}/${id}`);
    }
  },

  subscribeToCampaigns(onUpdate: (campaigns: Campaign[]) => void) {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(q, (snapshot) => {
      const campaigns = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Campaign[];
      onUpdate(campaigns);
    }, (error) => {
      console.error('[campaignService] Subscription error:', error);
      onUpdate([]);
    });
  }
};
