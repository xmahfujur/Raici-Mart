import React from 'react';
import { Container } from '@/components/Container';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-black tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="bg-[#f0f2f5] p-8 rounded-xl shadow-sm border border-gray-100">
          {children}
        </div>
      </Container>
    </div>
  );
};
