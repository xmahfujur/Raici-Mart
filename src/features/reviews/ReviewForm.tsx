import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/useStore';
import { reviewService } from './reviewService';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link } from 'react-router-dom';

interface ReviewFormProps {
  productId: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
  const [user] = useAuthState(auth);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to leave a review', 'error');
      return;
    }

    if (!message.trim()) {
      showToast('Please enter a review message', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.addReview({
        productId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        message,
      });
      showToast('Review submitted successfully!', 'success');
      setMessage('');
      setRating(5);
    } catch (error: any) {
      showToast(error.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#f9f9f9] p-6 rounded-2xl text-center">
        <p className="text-[#8d949e] font-bold mb-4">Please log in to share your review</p>
        <Link to="/login" className="inline-block px-6 py-2 bg-black text-white rounded-lg text-sm font-bold">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[#f0f0f0] space-y-6">
      <h3 className="text-[18px] font-bold text-black">Write a Review</h3>
      
      <div className="space-y-2">
        <label className="text-[12px] font-black uppercase tracking-widest text-[#8d949e]">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform active:scale-90"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              <Star 
                className={cn(
                  "w-6 h-6 transition-colors",
                  star <= (hover || rating) ? "fill-[#ffc107] text-[#ffc107]" : "text-gray-200"
                )} 
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[12px] font-black uppercase tracking-widest text-[#8d949e]">Your Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full h-32 px-4 py-3 rounded-xl border border-[#f0f2f5] focus:outline-none focus:ring-1 focus:ring-black resize-none text-[14px]"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-xl font-black text-[12px] uppercase tracking-[0.2em]"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};
