import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive, icon: Icon }) => {
  return (
    <Card className="bg-white border-none shadow-sm p-6 flex items-start justify-between">
      <div>
        <p className="text-[13px] font-bold text-[#8d949e] uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-[28px] font-bold text-black mb-2">{value}</h3>
        {change && (
          <div className="flex items-center gap-1">
            <span className={cn(
              "text-[12px] font-bold",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? '+' : ''}{change}
            </span>
            <span className="text-[12px] text-[#8d949e]">vs last month</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#f0f2f5] flex items-center justify-center">
        <Icon className="w-6 h-6 text-black" />
      </div>
    </Card>
  );
};

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export const AdminTable: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl border border-[#e4e6eb] shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#e4e6eb] bg-[#f9fafb]">
            {headers.map((header, i) => (
              <th key={i} className="px-6 py-4 text-[12px] font-bold text-[#8d949e] uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4e6eb]">
          {children}
        </tbody>
      </table>
    </div>
  );
};
