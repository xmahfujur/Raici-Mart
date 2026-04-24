import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('max-w-[1440px] mx-auto px-6 md:px-12', className)}>
      {children}
    </div>
  );
};
