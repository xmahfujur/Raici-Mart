import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { productService } from '@/features/products/productService';

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  message: string;
  createdAt: Timestamp | any;
}

const COLLECTION_NAME = 'reviews';

export const reviewService = {
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
    console.log('[reviewService] Adding review:', reviewData);
    
    try {
      // Check if user already reviewed this product
      const existingQuery = query(
        collection(db, COLLECTION_NAME),
        where('productId', '==', reviewData.productId),
        where('userId', '==', reviewData.userId)
      );
      const existingSnap = await getDocs(existingQuery);
      
      if (!existingSnap.empty) {
        throw new Error('You have already reviewed this product.');
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...reviewData,
        createdAt: serverTimestamp(),
      });
      
      // Update product rating after adding review
      await this.updateProductStats(reviewData.productId);
      
      return docRef.id;
    } catch (error) {
      console.error('[reviewService] Error adding review:', error);
      throw error;
    }
  },

  async updateReview(id: string, reviewData: Partial<Review>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Review not found');
      
      const oldReview = docSnap.data() as Review;
      await updateDoc(docRef, {
        ...reviewData,
        updatedAt: serverTimestamp() // Optional: add updatedAt if needed
      });

      if (reviewData.rating !== undefined && reviewData.rating !== oldReview.rating) {
        await this.updateProductStats(oldReview.productId);
      }
    } catch (error) {
      console.error('[reviewService] Error updating review:', error);
      throw error;
    }
  },

  async deleteReview(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;
      
      const reviewData = docSnap.data() as Review;
      await deleteDoc(docRef);
      
      // Update product rating after deleting review
      await this.updateProductStats(reviewData.productId);
    } catch (error) {
      console.error('[reviewService] Error deleting review:', error);
      throw error;
    }
  },

  async updateProductStats(productId: string): Promise<void> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('productId', '==', productId)
    );
    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => doc.data() as Review);
    
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    // Get current product to update soldCount correctly (or keep it as is)
    const product = await productService.getProduct(productId);
    if (!product) return;

    // Trending score = (soldCount * 0.7) + (rating * 0.3)
    const trendingScore = (product.soldCount * 0.7) + (averageRating * 0.3);

    await productService.updateProduct(productId, {
      rating: averageRating,
      totalReviews,
      trendingScore
    });
  },

  subscribeToProductReviews(productId: string, callback: (reviews: Review[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      callback(reviews);
    });
  }
};
