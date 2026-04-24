import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product, SizeType, ProductSize } from '@/features/products/productService';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { useCollectionsStore, useCategoriesStore } from '@/store/useStore';
import { cn, formatPrice } from '@/lib/utils';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const { collections } = useCollectionsStore();
  const { categories } = useCategoriesStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    discountedPrice: 0,
    stock: 0,
    category: '',
    collectionId: '',
    tags: [] as string[],
    isActive: true,
    isFeatured: false,
    images: [] as string[],
    sizeType: 'none' as SizeType,
    sizes: [] as ProductSize[],
    deliveryType: 'free' as 'free' | 'paid',
    deliveryChargeInsideDhaka: 0,
    deliveryChargeOutsideDhaka: 0,
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        discountedPrice: initialData.discountedPrice || 0,
        stock: initialData.stock,
        category: initialData.category,
        collectionId: initialData.collectionId || '',
        tags: initialData.tags || [],
        isActive: initialData.isActive,
        isFeatured: initialData.isFeatured || false,
        images: initialData.images || [],
        sizeType: initialData.sizeType || 'none',
        sizes: initialData.sizes || [],
        deliveryType: initialData.deliveryType || 'free',
        deliveryChargeInsideDhaka: initialData.deliveryChargeInsideDhaka || 0,
        deliveryChargeOutsideDhaka: initialData.deliveryChargeOutsideDhaka || 0,
      });
    } else if (categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [initialData, categories]);

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (!formData.images.includes(url)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      setImageUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const toggleStandardSize = (size: string) => {
    const exists = formData.sizes.find(s => s.name === size);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.filter(s => s.name !== size)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, { name: size, stock: 0 }]
      }));
    }
  };

  const addCustomSize = () => {
    const size = customSizeInput.trim();
    if (!size) return;
    if (formData.sizes.find(s => s.name === size)) {
      alert('Size already exists');
      return;
    }
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: size, stock: 0 }]
    }));
    setCustomSizeInput('');
  };

  const removeSize = (name: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s.name !== name)
    }));
  };

  const updateSizeStock = (name: string, stock: number | string) => {
    const val = typeof stock === 'string' ? (stock === '' ? 0 : parseInt(stock)) : stock;
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => s.name === name ? { ...s, stock: val } : s)
    }));
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert('Please add at least one product image URL.');
      return;
    }

    if (formData.sizeType !== 'none' && formData.sizes.length === 0) {
      alert('Please add at least one size.');
      return;
    }

    // Prepare final data with calculated stock if needed
    const finalStock = formData.sizeType !== 'none' 
      ? formData.sizes.reduce((acc, s) => acc + (s.stock || 0), 0)
      : formData.stock;

    await onSubmit({
      ...formData,
      stock: finalStock
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Product Title</label>
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
              placeholder="e.g. Premium Leather Case"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
            <textarea 
              className="w-full min-h-[120px] p-3 bg-[#f0f2f5] border-none rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-black/5"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
              placeholder="Describe the product features..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Price (৳)</label>
              <Input 
                type="number" 
                value={isNaN(formData.price) ? '' : formData.price} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData({...formData, price: val === '' ? 0 : parseFloat(val)});
                }} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Discount Price (৳)</label>
              <Input 
                type="number" 
                value={isNaN(formData.discountedPrice) ? '' : formData.discountedPrice} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData({...formData, discountedPrice: val === '' ? 0 : parseFloat(val)});
                }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Stock Quantity</label>
              <Input 
                type="number" 
                value={formData.sizeType !== 'none' ? formData.sizes.reduce((acc, s) => acc + (s.stock || 0), 0) : (isNaN(formData.stock) ? '' : formData.stock)} 
                onChange={e => {
                  if (formData.sizeType !== 'none') return;
                  const val = e.target.value;
                  setFormData({...formData, stock: val === '' ? 0 : parseInt(val)});
                }} 
                required 
                disabled={formData.sizeType !== 'none'}
              />
              {formData.sizeType !== 'none' && (
                <p className="text-[10px] text-[#8d949e] font-medium">Calculated from sizes</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Category</label>
              <select 
                className="w-full h-10 px-3 bg-[#f0f2f5] border-none rounded-lg text-[14px] outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Collection (Optional)</label>
            <select 
              className="w-full h-10 px-3 bg-[#f0f2f5] border-none rounded-lg text-[14px] outline-none"
              value={formData.collectionId}
              onChange={e => setFormData({...formData, collectionId: e.target.value})}
            >
              <option value="">None</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-[#f0f2f5] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black">Product Sizes</h3>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-[#8d949e]">Size Mode</label>
              <div className="flex bg-[#f0f2f5] p-1 rounded-lg gap-1">
                {(['none', 'standard', 'custom'] as SizeType[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, sizeType: mode, sizes: mode === 'none' ? [] : formData.sizes })}
                    className={cn(
                      "flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-all",
                      formData.sizeType === mode ? "bg-black text-white" : "text-[#8d949e] hover:text-black"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {formData.sizeType === 'standard' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map(size => {
                    const isSelected = formData.sizes.some(s => s.name === size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleStandardSize(size)}
                        className={cn(
                          "px-3 py-1.5 border rounded-lg text-[12px] font-black transition-all",
                          isSelected 
                            ? "bg-black border-black text-white" 
                            : "bg-white border-[#e4e6eb] text-[#8d949e] hover:border-black hover:text-black"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.sizeType === 'custom' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={customSizeInput} 
                    onChange={e => setCustomSizeInput(e.target.value)} 
                    placeholder="e.g. 500ml, 1kg, XL Tall" 
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                  />
                  <Button type="button" onClick={addCustomSize} variant="outline" className="h-10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {formData.sizeType !== 'none' && formData.sizes.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold uppercase text-[#8d949e]">Inventory per size</label>
                <div className="space-y-2 bg-white border border-[#e4e6eb] rounded-xl p-4">
                  {formData.sizes.map((size) => (
                    <div key={size.name} className="flex items-center justify-between gap-4">
                      <span className="text-[13px] font-bold text-black min-w-[60px] uppercase">Size {size.name}</span>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="number"
                          placeholder="Stock"
                          className="h-8 w-24 text-[13px]"
                          value={size.stock}
                          onChange={(e) => updateSizeStock(size.name, e.target.value)}
                        />
                        <button 
                          type="button" 
                          onClick={() => removeSize(size.name)}
                          className="p-1.5 text-[#8d949e] hover:text-rose-500 rounded-md hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[#f0f2f5] flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase text-[#8d949e]">Total Stock</span>
                    <span className="text-[14px] font-black text-black">
                      {formData.sizes.reduce((acc, s) => acc + (s.stock || 0), 0)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8d949e] italic">Total stock will be calculated based on individual size stock.</p>
              </div>
            )}
          </div>
          <div className="pt-6 border-t border-[#f0f2f5] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-black">Delivery Configuration</h3>
            </div>

            <div className="space-y-3">
              <label className="text-[12px] font-bold uppercase text-[#8d949e]">Delivery Charge Type</label>
              <div className="flex bg-[#f0f2f5] p-1 rounded-lg gap-1 max-w-[300px]">
                {(['free', 'paid'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryType: type })}
                    className={cn(
                      "flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-md transition-all",
                      formData.deliveryType === type ? "bg-black text-white shadow-sm" : "text-[#8d949e] hover:text-black"
                    )}
                  >
                    {type} delivery
                  </button>
                ))}
              </div>
            </div>

            {formData.deliveryType === 'paid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase text-[#8d949e]">Inside Dhaka (৳)</label>
                  <Input 
                    type="number"
                    value={formData.deliveryChargeInsideDhaka}
                    onChange={e => setFormData({...formData, deliveryChargeInsideDhaka: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                    placeholder="e.g. 60"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase text-[#8d949e]">Outside Dhaka (৳)</label>
                  <Input 
                    type="number"
                    value={formData.deliveryChargeOutsideDhaka}
                    onChange={e => setFormData({...formData, deliveryChargeOutsideDhaka: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                    placeholder="e.g. 120"
                    className="h-11"
                  />
                </div>
              </div>
            )}
            
            <p className="text-[11px] text-[#8d949e] italic leading-relaxed">
              Note: Delivery charge applies once per order. If multiple products have different charges, the highest applicable charge will be used at checkout.
            </p>
          </div>
        </div>

        <div className="space-y-8 lg:pl-4">
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Product Images (URLs)</label>
            
            <div className="flex gap-2">
              <Input 
                value={imageUrlInput} 
                onChange={e => setImageUrlInput(e.target.value)} 
                placeholder="Paste image URL here..." 
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
              />
              <Button type="button" onClick={handleAddImageUrl} variant="outline" className="h-10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {formData.images.map((url, i) => (
                <div key={i} className="relative aspect-square bg-[#f0f2f5] rounded-lg overflow-hidden border border-[#e4e6eb] group">
                  <img 
                    src={url} 
                    className="w-full h-full object-cover" 
                    alt="Product preview" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/broken/400/500';
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {formData.images.length === 0 && (
                <div className="col-span-3 py-8 bg-[#f0f2f5] border-2 border-dashed border-[#e4e6eb] rounded-xl flex flex-col items-center justify-center text-center">
                  <Upload className="w-6 h-6 text-[#8d949e] mb-2" />
                  <p className="text-[12px] text-[#8d949e] font-medium px-4">No images added yet. Paste a URL and click the plus button.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tags</label>
            <div className="flex gap-2">
              <Input 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)} 
                placeholder="Add tag..." 
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline" className="h-10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-black text-white text-[11px] font-bold rounded flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive} 
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 accent-black rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Product is active and visible</label>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isFeatured" 
                checked={formData.isFeatured} 
                onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                className="w-4 h-4 accent-black rounded"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-900 border-b border-black">Show in "Featured Products" section</label>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#f0f2f5] flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-black text-white px-8" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};
