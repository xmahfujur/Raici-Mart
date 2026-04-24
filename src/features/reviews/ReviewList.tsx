import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Review, reviewService } from './reviewService';
import { auth } from '@/lib/firebase';
import { useUIStore } from '@/store/useStore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ReviewListProps {
  reviews: Review[];
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, productId }) => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const { showToast } = useUIStore();

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        // Try to get from users collection first
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data()?.role === 'admin') {
            setIsAdmin(true);
            return;
          }
        } catch (e) {
          console.error('Error checking user role:', e);
        }

        // Fallback for hardcoded admin email
        if (user.email === 'mr074770@gmail.com') {
          setIsAdmin(true);
          return;
        }

        // Keep existing admins check if needed
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          setIsAdmin(adminDoc.exists());
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    setConfirmId(null);
    try {
      await reviewService.deleteReview(reviewId);
      showToast('Review deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete review', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center text-[#8d949e]">
        <p className="text-[14px]">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review.id} className="pb-8 border-b border-[#f0f2f5] last:border-0 relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f0f2f5] flex items-center justify-center font-bold text-black uppercase">
                {review.userName.charAt(0)}
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-black">{review.userName}</h4>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < review.rating ? 'fill-[#ffc107] text-[#ffc107]' : 'fill-gray-200 text-gray-200'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-[#8d949e]">
                {review.createdAt?.seconds ? format(new Date(review.createdAt.seconds * 1000), 'MMM dd, yyyy') : 'Just now'}
              </span>
              {(isAdmin || (user && user.uid === review.userId)) && (
                <div className="flex items-center gap-2">
                  {deletingId === review.id ? (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Deleting...</span>
                  ) : confirmId === review.id ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDelete(review.id!)}
                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setConfirmId(null)}
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmId(review.id!)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-[#4b4f56] text-[14px] leading-relaxed">
            {review.message}
          </p>
        </div>
      ))}
    </div>
  );
};
