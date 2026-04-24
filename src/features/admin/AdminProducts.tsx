import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ExternalLink,
  AlertCircle,
  Star
} from 'lucide-react';
import { AdminTable } from './AdminComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { useUIStore, useCategoriesStore } from '@/store/useStore';
import { Product } from '@/features/products/productService';
import { ProductForm } from './ProductForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const AdminProducts: React.FC = () => {
  const { products, loading: productsLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { showToast } = useUIStore();
  const { categories } = useCategoriesStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Status' || 
                         (statusFilter === 'Active' && p.isActive) || 
                         (statusFilter === 'Inactive' && !p.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id!, data);
        showToast('Product updated successfully', 'success');
      } else {
        await addProduct(data);
        showToast('Product created successfully', 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error('[AdminProducts] Save failed:', err);
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!isDeletingId) return;
    try {
      await deleteProduct(isDeletingId, true); // Soft delete
      setIsDeletingId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-black mb-1">Products</h1>
          <p className="text-[#8d949e] text-[14px]">Manage your product catalog, stock, and pricing in BDT (৳).</p>
        </div>
        <Button onClick={handleOpenAdd} className="h-11 px-6 bg-black text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-[#e4e6eb] shadow-sm">
        <div className="relative w-full sm:max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search products..." 
            className="pl-10 h-10 bg-[#f0f2f5] border-none rounded-lg text-[14px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="h-10 px-4 border-[#e4e6eb] text-[14px] flex items-center gap-2 flex-1 sm:flex-none">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <select 
            className="h-10 px-4 bg-white border border-[#e4e6eb] rounded-lg text-[14px] font-medium outline-none flex-1 sm:flex-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select 
            className="h-10 px-4 bg-white border border-[#e4e6eb] rounded-lg text-[14px] font-medium outline-none flex-1 sm:flex-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Products List/Table */}
      {productsLoading ? (
        <div className="bg-white p-12 rounded-xl border border-[#e4e6eb] flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-[#e4e6eb] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black">No products found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-xl border border-[#e4e6eb] shadow-sm space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-24 rounded-lg bg-[#f0f2f5] overflow-hidden flex-shrink-0 border border-gray-100">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      )}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <p className="text-[10px] text-[#8d949e]">ID: {product.id?.slice(0, 8)}</p>
                    </div>
                    <h3 className="text-[15px] font-bold text-black line-clamp-1 mb-1 flex items-center gap-2">
                      {product.title}
                      {product.isFeatured && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                    </h3>
                    <p className="text-[12px] text-[#8d949e] mb-2">{product.category}</p>
                    <div className="flex items-end gap-2">
                      <span className={cn("text-[16px] font-black", product.discountedPrice ? "text-red-500" : "text-black")}>
                        {formatPrice(product.discountedPrice || product.price)}
                      </span>
                      {product.discountedPrice && (
                        <span className="text-[12px] text-gray-400 line-through mb-0.5">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[#f0f2f5]">
                  <div className="flex flex-col">
                    <span className={cn("text-[13px] font-bold", product.stock <= 5 ? "text-orange-500" : "text-black")}>
                      {product.stock} units in stock
                    </span>
                    {product.stock === 0 && (
                      <span className="text-[10px] font-bold text-red-500 uppercase">Out of Stock</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenEdit(product)} className="p-2.5 bg-[#f0f2f5] rounded-xl hover:bg-[#e4e6eb] transition-colors">
                      <Edit2 className="w-4 h-4 text-black" />
                    </button>
                    <button onClick={() => setIsDeletingId(product.id!)} className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden lg:block bg-white rounded-xl border border-[#e4e6eb] overflow-hidden">
            <AdminTable headers={['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#f0f2f5] overflow-hidden flex-shrink-0 border border-gray-100">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-black flex items-center gap-2">
                          {product.title}
                          {product.isFeatured && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                        </p>
                        <p className="text-[12px] text-[#8d949e]">ID: {product.id?.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#4b4f56]">{product.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={cn("text-[14px] font-bold", product.discountedPrice ? "text-red-500" : "text-black")}>
                        {formatPrice(product.discountedPrice || product.price)}
                      </span>
                      {product.discountedPrice && (
                        <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={cn("text-[14px] font-bold", product.stock <= 5 ? "text-orange-500" : "text-black")}>
                        {product.stock} units
                      </span>
                      {product.stock === 0 && (
                        <span className="text-[10px] font-bold text-red-500 uppercase">Out of Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                      product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(product)} className="p-2 hover:bg-[#f0f2f5] rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={() => setIsDeletingId(product.id!)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                      <button className="p-2 hover:bg-[#f0f2f5] rounded-lg transition-colors" title="View Store">
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>
        </>
      )}

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-5xl bg-white h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-[#f0f2f5]">
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the details of your existing product.' : 'Fill in the details to add a new product to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <ProductForm 
              initialData={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              loading={formLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!isDeletingId} onOpenChange={(open) => !open && setIsDeletingId(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this product? This will mark it as <strong>Inactive</strong> and hide it from the storefront.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeletingId(null)}>
              Cancel
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

