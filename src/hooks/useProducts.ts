import { useState, useEffect } from 'react';
import { productService, Product } from '@/features/products/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (productData: any) => {
    console.log('[useProducts] addProduct started', { productData });
    try {
      console.log('[useProducts] Saving product to Firestore...');
      await productService.createProduct({
        ...productData,
      });
      console.log('[useProducts] Product saved to Firestore successfully');
      console.log('[useProducts] addProduct completed successfully');
    } catch (err: any) {
      console.error('[useProducts] addProduct failed:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    console.log('[useProducts] updateProduct started', { id, productData });
    try {
      console.log('[useProducts] Saving UPDATED product to Firestore...');
      await productService.updateProduct(id, {
        ...productData,
      });
      console.log('[useProducts] Product UPDATED in Firestore successfully');
      console.log('[useProducts] updateProduct completed successfully');
    } catch (err: any) {
      console.error('[useProducts] updateProduct failed:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (id: string, soft: boolean = true) => {
    try {
      if (soft) {
        await productService.softDeleteProduct(id);
      } else {
        await productService.deleteProduct(id);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
