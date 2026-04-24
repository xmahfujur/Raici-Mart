import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '@/store/useStore';
import { Loader } from '@/components/Loader';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useUserStore();

  if (loading) return <div className="h-screen"><Loader /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export const AdminRoute: React.FC = () => {
  const { user, loading } = useUserStore();

  if (loading) return <div className="h-screen"><Loader /></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
};
