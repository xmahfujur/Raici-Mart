import React from 'react';
import { Container } from '@/components/Container';
import { useUserStore } from '@/store/useStore';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <Container className="py-12">
      <div className="flex flex-col mb-10">
        <h3 className="text-[#8d949e] text-[11px] font-black uppercase tracking-[0.2em] mb-2">My Account</h3>
        <h1 className="text-[32px] font-bold text-black">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white p-10 rounded-2xl border border-[#e4e6eb] shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#f0f2f5] flex items-center justify-center overflow-hidden mb-6 border-4 border-white shadow-lg">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-10 h-10 text-gray-300" />
            )}
          </div>
          <h2 className="text-[20px] font-bold text-black mb-1">{user.displayName}</h2>
          <p className="text-[14px] text-[#8d949e] font-medium mb-6 uppercase tracking-wider">{user.role}</p>
          
          <div className="w-full pt-6 border-t border-[#f0f2f5] space-y-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-[#f0f2f5] flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#8d949e] uppercase tracking-widest">Email Address</p>
                <p className="text-[13px] font-bold text-black">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-[#f0f2f5] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#8d949e] uppercase tracking-widest">Member Since</p>
                <p className="text-[13px] font-bold text-black">
                  {user.createdAt?.seconds ? format(new Date(user.createdAt.seconds * 1000), 'MMM dd, yyyy') : '...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Placeholder */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-[#e4e6eb] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <h3 className="text-[18px] font-bold text-black">Account Security</h3>
            </div>
            <p className="text-[#4b4f56] text-[15px] leading-relaxed mb-6">
              Your account is secured with Firebase Authentication. Profile updates and security settings are managed through your authorized login provider.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#e4e6eb] shadow-sm">
            <h3 className="text-[18px] font-bold text-black mb-6">Account History</h3>
            <p className="text-[#4b4f56] text-[15px]">
              You can view your order history and tracking details in the <Link to="/orders" className="text-black font-bold hover:underline">Orders</Link> section.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};
