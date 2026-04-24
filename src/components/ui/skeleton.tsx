import React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-[#f0f2f5]", className)}
      {...props}
    />
  )
}

const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
};

const OrderSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#e4e6eb] p-6 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="space-y-4 pt-6 border-t border-[#f0f2f5]">
        <div className="flex gap-4">
          <Skeleton className="w-12 h-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Skeleton, ProductSkeleton, OrderSkeleton }
