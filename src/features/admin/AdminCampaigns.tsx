import React, { useState } from 'react';
import { Plus, Megaphone, Calendar, Tag, ArrowRight, Trash2, Edit2, X, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCollections } from '@/hooks/useCollections';
import { campaignService, Campaign } from '@/features/campaigns/campaignService';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useUIStore } from '@/store/useStore';

export const AdminCampaigns: React.FC = () => {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { collections } = useCollections();
  const { showToast } = useUIStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    discountPercentage: 0,
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    productIds: [] as string[],
    categoryIds: [] as string[],
    collectionIds: [] as string[],
    isActive: true
  });

  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleOpenModal = (campaign?: Campaign) => {
    if (campaign) {
      setCurrentCampaign(campaign);
      setFormData({
        title: campaign.title,
        discountPercentage: campaign.discountPercentage,
        startDate: format(campaign.startDate.toDate(), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(campaign.endDate.toDate(), "yyyy-MM-dd'T'HH:mm"),
        productIds: campaign.productIds || [],
        categoryIds: campaign.categoryIds || [],
        collectionIds: campaign.collectionIds || [],
        isActive: campaign.isActive
      });
    } else {
      setCurrentCampaign(null);
      setFormData({
        title: '',
        discountPercentage: 0,
        startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        productIds: [],
        categoryIds: [],
        collectionIds: [],
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
      };

      if (currentCampaign?.id) {
        await campaignService.updateCampaign(currentCampaign.id, payload);
        showToast('Campaign updated successfully', 'success');
      } else {
        await campaignService.createCampaign(payload);
        showToast('Campaign created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast('Failed to save campaign', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await campaignService.deleteCampaign(id);
      showToast('Campaign deleted successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete campaign', 'error');
    }
  };

  const toggleSelection = (id: string, type: 'productIds' | 'categoryIds' | 'collectionIds') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  if (campaignsLoading) {
    return <div className="h-40 flex items-center justify-center">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-black mb-1">Campaigns</h1>
          <p className="text-[#8d949e] text-[14px]">Create and manage marketing campaigns and discounts.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="h-11 px-6 bg-black text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const isExpired = campaign.endDate.toDate() < new Date();
          const isScheduled = campaign.startDate.toDate() > new Date();
          const status = !campaign.isActive ? 'Inactive' : isExpired ? 'Expired' : isScheduled ? 'Scheduled' : 'Active';

          return (
            <Card key={campaign.id} className="bg-white border border-[#e4e6eb] shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-3xl">
              <div className={cn(
                "h-32 p-6 flex flex-col justify-between text-white relative overflow-hidden",
                status === 'Active' ? "bg-[#0b0b0b]" : 
                status === 'Scheduled' ? "bg-blue-600" : 
                "bg-[#8d949e]"
              )}>
                {/* Visual decoration */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                    status === 'Active' ? "bg-[#34c759] text-white" :
                    status === 'Scheduled' ? "bg-white/20 text-white" :
                    "bg-white/20 text-white"
                  )}>
                    {status}
                  </span>
                </div>
                <h3 className="text-[28px] font-black tracking-tight relative z-10 text-white !text-white">{campaign.discountPercentage}% OFF</h3>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-[17px] font-bold text-black mb-2 line-clamp-1">{campaign.title}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[13px] text-[#4b4f56]">
                      <Calendar className="w-4 h-4 text-[#8d949e]" />
                      <span className="font-medium">
                        {format(campaign.startDate.toDate(), 'MMM dd')} - {format(campaign.endDate.toDate(), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {campaign.productIds?.length > 0 && (
                        <span className="px-2 py-0.5 bg-[#f0f2f5] text-[#4b4f56] text-[11px] font-bold rounded-md">
                          {campaign.productIds.length} Products
                        </span>
                      )}
                      {campaign.categoryIds && campaign.categoryIds.length > 0 && (
                        <span className="px-2 py-0.5 bg-[#0b0b0b] text-white text-[11px] font-bold rounded-md">
                          {campaign.categoryIds.length} Categories
                        </span>
                      )}
                      {campaign.collectionIds && campaign.collectionIds.length > 0 && (
                        <span className="px-2 py-0.5 bg-[#f0f2f5] text-[#0b0b0b] text-[11px] font-bold border border-[#e4e6eb] rounded-md">
                          {campaign.collectionIds.length} Collections
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#f0f2f5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(campaign)}
                      className="p-2.5 rounded-xl hover:bg-[#f0f2f5] transition-all text-black border border-transparent hover:border-[#e4e6eb]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        console.log('Delete clicked for campaign:', campaign.id);
                        if (campaign.id) {
                          handleDelete(campaign.id);
                        } else {
                          console.error('No campaign ID found for deletion');
                          showToast('Error: Campaign ID missing', 'error');
                        }
                      }}
                      className="p-3 rounded-xl hover:bg-rose-50 transition-all text-rose-600 border border-transparent hover:border-rose-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <Tag className="w-4 h-4 text-[#8d949e]" />
                </div>
              </div>
            </Card>
          );
        })}
        {campaigns.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#e4e6eb] rounded-[32px] bg-white/50">
            <div className="w-16 h-16 bg-[#f0f2f5] rounded-3xl flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-[#8d949e]" />
            </div>
            <p className="text-black font-bold text-[18px] mb-1">No Active Campaigns</p>
            <p className="text-[#8d949e] text-sm">Launch your first marketing campaign to boost sales.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-[32px] shadow-2xl border-none">
            <div className="p-8 border-b border-[#f0f2f5] flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-black">{currentCampaign ? 'Edit' : 'Create'} Campaign</h2>
                <p className="text-[14px] text-[#8d949e]">Configure your marketing offer and targets.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-[#f0f2f5] rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[13px] font-bold text-black uppercase mb-2 block tracking-wider">Campaign Title</label>
                  <Input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Summer Sale 2024"
                    className="h-12 rounded-xl focus:ring-black border-[#e4e6eb]"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[13px] font-bold text-black uppercase mb-2 block tracking-wider">Discount (%)</label>
                    <Input 
                      required
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={e => setFormData({...formData, discountPercentage: parseInt(e.target.value) || 0})}
                      className="h-12 rounded-xl focus:ring-black border-[#e4e6eb]"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2 sm:pt-8">
                    <input 
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-6 h-6 rounded-lg border-[#e4e6eb] text-black focus:ring-black"
                    />
                    <label htmlFor="isActive" className="text-[15px] font-bold text-black">Enable Campaign</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[13px] font-bold text-black uppercase mb-2 block tracking-wider">Start Date</label>
                    <Input 
                      required
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="h-12 rounded-xl focus:ring-black border-[#e4e6eb]"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-black uppercase mb-2 block tracking-wider">End Date</label>
                    <Input 
                      required
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="h-12 rounded-xl focus:ring-black border-[#e4e6eb]"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Category Target */}
                  <div>
                    <label className="text-[13px] font-bold text-black uppercase mb-2 block tracking-wider">
                      Target Categories ({formData.categoryIds.length})
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 border border-[#e4e6eb] rounded-2xl bg-[#f9fafb]">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleSelection(cat.name, 'categoryIds')}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[13px] font-bold transition-all border",
                            formData.categoryIds.includes(cat.name) 
                              ? "bg-black text-white border-black" 
                              : "bg-white text-black border-[#e4e6eb] hover:border-black"
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#8d949e] mt-2 italic">Discount will apply to all products in these categories.</p>
                  </div>

                  {/* Collection Target */}
                  <div>
                    <label className="text-[13px] font-bold text-black uppercase mb-2 block tracking-wider">
                      Target Collections ({formData.collectionIds.length})
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 border border-[#e4e6eb] rounded-2xl bg-[#f9fafb]">
                      {collections.map(col => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => col.id && toggleSelection(col.id, 'collectionIds')}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[13px] font-bold transition-all border",
                            formData.collectionIds.includes(col.id!) 
                              ? "bg-black text-white border-black" 
                              : "bg-white text-black border-[#e4e6eb] hover:border-black"
                          )}
                        >
                          {col.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Individual Products */}
                  <div>
                    <label className="text-[13px] font-bold text-black uppercase mb-2 block tracking-wider">
                      Manual Product Selection ({formData.productIds.length})
                    </label>
                    <div className="relative mb-3">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d949e]" />
                      <Input 
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        placeholder="Search specific products..."
                        className="h-11 pl-11 rounded-xl border-[#e4e6eb]"
                      />
                    </div>
                    <div className="border border-[#e4e6eb] rounded-2xl h-56 overflow-y-auto p-2 space-y-1 bg-[#f9fafb]">
                      {filteredProducts.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => p.id && toggleSelection(p.id, 'productIds')}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                            formData.productIds.includes(p.id!) ? "bg-white shadow-sm ring-1 ring-black/5" : "hover:bg-white/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg shadow-sm" />
                            <div>
                              <p className="text-[14px] font-bold text-black">{p.title}</p>
                              <p className="text-[11px] text-[#8d949e]">{p.category} • {p.collection}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                            formData.productIds.includes(p.id!) ? "bg-black border-black text-white" : "border-[#e4e6eb] bg-white"
                          )}>
                            {formData.productIds.includes(p.id!) && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-8 border-t border-[#f0f2f5] bg-[#f9fafb] flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="h-12 px-8 rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                className="h-12 px-10 bg-black text-white rounded-xl font-bold shadow-lg shadow-black/10 transition-transform active:scale-95"
              >
                {submitting ? 'Processing...' : currentCampaign ? 'Update Campaign' : 'Launch Campaign'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
