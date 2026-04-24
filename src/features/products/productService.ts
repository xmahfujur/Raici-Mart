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
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ProductSize {
  name: string;
  stock: number;
}

export type SizeType = 'none' | 'standard' | 'custom';

export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  stock: number;
  category: string;
  collectionId?: string;
  tags: string[];
  images: string[];
  rating: number;
  totalReviews: number;
  soldCount: number;
  trendingScore: number;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: Timestamp | any;
  sizeType?: SizeType;
  sizes?: ProductSize[];
  deliveryType?: 'free' | 'paid';
  deliveryChargeInsideDhaka?: number;
  deliveryChargeOutsideDhaka?: number;
}

const COLLECTION_NAME = 'products';

export const productService = {
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'totalReviews' | 'soldCount'>): Promise<string> {
    console.log('[productService] Creating product with data:', productData);
    
    // Validation
    if (!productData.title || !productData.description) {
      throw new Error('Product title and description are required.');
    }
    if (typeof productData.price !== 'number' || productData.price < 0) {
      throw new Error('Valid price is required.');
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...productData,
        rating: 0,
        totalReviews: 0,
        soldCount: 0,
        trendingScore: 0,
        createdAt: serverTimestamp(),
      });
      console.log(`[productService] Product created successfully with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('[productService] Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    console.log(`[productService] Updating product ${id} with data:`, productData);
    
    // Clean data - remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(productData).filter(([_, v]) => v !== undefined)
    );

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, cleanData);
      console.log(`[productService] Product ${id} updated successfully`);
    } catch (error) {
      console.error(`[productService] Error updating product ${id}:`, error);
      throw error;
    }
  },

  async softDeleteProduct(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { isActive: false });
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  },

  subscribeToProducts(callback: (products: Product[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      callback(products);
    });
  }
};
