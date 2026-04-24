import React, { useState, useEffect } from 'react';
import { Save, Upload, Store, Globe, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import { useUIStore } from '@/store/useStore';

export const AdminSettings: React.FC = () => {
  const { settings, updateGlobalSettings, loading } = useSettings();
  const { showToast } = useUIStore();
  const [formData, setFormData] = useState({
    storeName: '',
    logo: '',
    currency: 'BDT' as 'BDT' | 'USD' | 'EUR',
    timezone: 'Asia/Dhaka',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || 'Raici Mart',
        logo: settings.logo || '',
        currency: settings.currency || 'BDT',
        timezone: settings.timezone || 'Asia/Dhaka',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGlobalSettings(formData);
      showToast('Settings updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-[800px]">
      <div>
        <h1 className="text-[28px] font-bold text-black mb-1">Settings</h1>
        <p className="text-[#8d949e] text-[14px]">Configure your store's general information and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card className="bg-white border border-[#e4e6eb] shadow-sm p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-[#f0f2f5] pb-4">
            <Store className="w-5 h-5 text-black" />
            <h3 className="text-[16px] font-bold text-black">Store Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#8d949e]">Store Name</label>
              <Input 
                value={formData.storeName}
                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                className="h-11 bg-[#f0f2f5] border-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#8d949e]">Logo URL</label>
              <Input 
                value={formData.logo}
                onChange={e => setFormData({ ...formData, logo: e.target.value })}
                className="h-11 bg-[#f0f2f5] border-none" 
              />
            </div>
          </div>
        </Card>

        {/* Localization */}
        <Card className="bg-white border border-[#e4e6eb] shadow-sm p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-[#f0f2f5] pb-4">
            <Globe className="w-5 h-5 text-black" />
            <h3 className="text-[16px] font-bold text-black">Localization</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#8d949e]">Default Currency</label>
              <select 
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value as any })}
                className="w-full h-11 px-4 bg-[#f0f2f5] border-none rounded-lg text-[14px] font-medium outline-none"
              >
                <option value="BDT">BDT (৳)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#8d949e]">Timezone</label>
              <select 
                value={formData.timezone}
                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full h-11 px-4 bg-[#f0f2f5] border-none rounded-lg text-[14px] font-medium outline-none"
              >
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="Europe/London">London (GMT)</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-11 px-8 bg-black text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
