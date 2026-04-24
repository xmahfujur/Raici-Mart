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
import { notificationService } from '@/features/notifications/notificationService';
import { productService } from '@/features/products/productService';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
}

export interface Order {
  id?: string;
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryCharge: number;
  deliveryLocation: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'failed_delivery';
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
}

const COLLECTION_NAME = 'orders';

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
    console.log('[orderService] Creating order with data:', orderData);
    
    if (!orderData.userId) {
      throw new Error('User ID is required to create an order.');
    }
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Cannot create an empty order.');
    }

    try {
      // Clean undefined values from orderData to satisfy Firestore
      const cleanOrderData = JSON.parse(JSON.stringify(orderData));
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...cleanOrderData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`[orderService] Order created successfully with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('[orderService] Error creating order:', error);
      throw error;
    }
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    console.log(`[orderService] Updating order ${id} status to: ${status}`);
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const orderSnap = await getDoc(docRef);
      const orderData = orderSnap.data() as Order;

      await updateDoc(docRef, { 
        status,
        updatedAt: serverTimestamp()
      });

      // If status is delivered, increment soldCount for each item
      if (status === 'delivered') {
        for (const item of orderData.items) {
          try {
            const product = await productService.getProduct(item.productId);
            if (product) {
              const newSoldCount = (product.soldCount || 0) + item.quantity;
              const newTrendingScore = (newSoldCount * 0.7) + ((product.rating || 0) * 0.3);
              await productService.updateProduct(item.productId, {
                soldCount: newSoldCount,
                trendingScore: newTrendingScore
              });
            }
          } catch (err) {
            console.error(`Error updating soldCount for product ${item.productId}:`, err);
          }
        }
      }

      // Create notification
      await notificationService.createNotification({
        userId: orderData.userId,
        title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your order #${id.slice(0, 8).toUpperCase()} has been ${status}.`,
        type: 'order',
        isRead: false,
        link: '/orders'
      });

      console.log(`[orderService] Order ${id} status updated successfully`);
    } catch (error) {
      console.error(`[orderService] Error updating order ${id} status:`, error);
      throw error;
    }
  },

  async deleteOrder(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[orderService] Error deleting order ${id}:`, error);
      throw error;
    }
  },

  async getOrder(id: string): Promise<Order | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  },

  subscribeToAllOrders(callback: (orders: Order[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      callback(orders);
    });
  }
};
