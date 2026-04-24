import React, { useState } from 'react';
import { Plus, Search, Layers, Edit2, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { AdminTable } from './AdminComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollections } from '@/hooks/useCollections';
import { collectionService, Collection } from '@/features/collections/collectionService';
import { useUIStore } from '@/store/useStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'motion/react';

export const AdminCollections: React.FC = () => {
  const { collections, loading } = useCollections();
  const { showToast } = useUIStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
  });

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCollection(null);
    setFormData({ name: '', image: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      image: collection.image || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCollection) {
        await collectionService.updateCollection(editingCollection.id!, formData);
        showToast('Collection updated successfully', 'success');
      } else {
        await collectionService.createCollection(formData);
        showToast('Collection created successfully', 'success');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save collection', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeletingId) return;
    try {
      await collectionService.deleteCollection(isDeletingId);
      showToast('Collection deleted successfully', 'success');
      setIsDeletingId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete collection', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-black mb-1">Collections</h1>
          <p className="text-[#8d949e] text-[14px]">Organize your products into custom collections.</p>
        </div>
        <Button onClick={handleOpenAdd} className="h-11 px-6 bg-black text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Collection
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e4e6eb] shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search collections..." 
            className="pl-10 h-10 border-none bg-[#f0f2f5] rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center text-gray-400">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin mr-3" />
          Loading...
        </div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="bg-white p-4 rounded-xl border border-[#e4e6eb] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center overflow-hidden border border-[#f0f2f5]">
                    {collection.image ? (
                      <img src={collection.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Layers className="w-5 h-5 text-black/40" />
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-black">{collection.name}</p>
                    <p className="text-[11px] text-[#8d949e]">
                      {collection.createdAt?.seconds ? new Date(collection.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenEdit(collection)} className="p-2.5 bg-[#f0f2f5] rounded-xl">
                    <Edit2 className="w-4 h-4 text-black" />
                  </button>
                  <button onClick={() => setIsDeletingId(collection.id!)} className="p-2.5 bg-red-50 rounded-xl">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden lg:block bg-white rounded-xl border border-[#e4e6eb] overflow-hidden shadow-sm">
            <AdminTable headers={['Collection Name', 'Banner Image', 'Created At', 'Actions']}>
              {filteredCollections.map((collection) => (
                <tr key={collection.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center">
                        <Layers className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-[14px] font-bold text-black">{collection.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#8d949e]">
                    {collection.image ? (
                      <img src={collection.image} alt="" className="w-10 h-10 object-cover rounded" referrerPolicy="no-referrer" />
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#8d949e]">
                    {collection.createdAt?.seconds ? new Date(collection.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(collection)} className="p-2 hover:bg-[#f0f2f5] rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => setIsDeletingId(collection.id!)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>
        </>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{editingCollection ? 'Edit Collection' : 'New Collection'}</DialogTitle>
            <DialogDescription>Define a new collection for your products.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-black text-[#8d949e] uppercase">Collection Name</label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-black text-[#8d949e] uppercase">Image URL (Optional)</label>
              <Input 
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading} className="bg-black text-white">
                {formLoading ? 'Saving...' : 'Save Collection'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!isDeletingId} onOpenChange={open => !open && setIsDeletingId(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
               <AlertCircle className="w-5 h-5" /> Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-600">Are you sure you want to delete this collection? Products in this collection will not be deleted.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeletingId(null)}>Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
