import React from 'react';
import { Container } from '@/components/Container';

export const ContactPage: React.FC = () => {
  return (
    <Container className="py-20">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-[40px] font-black uppercase tracking-tight text-black">Contact Us</h1>
          <p className="text-[16px] text-[#8c8c8c] leading-relaxed">
            Have a question or need assistance? Our team is here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-[18px] font-black uppercase tracking-widest text-[#8d949e]">General Inquiries</h2>
            <div className="space-y-2">
              <p className="text-[14px] font-bold text-black underline">support@raicimart.com</p>
              <p className="text-[14px] text-[#4b4f56]">+880 1234 567 890</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-[18px] font-black uppercase tracking-widest text-[#8d949e]">Showroom</h2>
            <p className="text-[14px] text-[#4b4f56] leading-relaxed">
              123 Premium Avenue, Section 10<br />
              Dhaka, Bangladesh
            </p>
          </div>
        </div>

        <form className="space-y-6 pt-12 border-t border-[#f0f2f5]" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#8d949e]">Full Name</label>
              <input type="text" className="w-full h-12 px-4 bg-white border border-[#e4e6eb] rounded-xl focus:outline-none focus:border-black transition-colors" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#8d949e]">Email Address</label>
              <input type="email" className="w-full h-12 px-4 bg-white border border-[#e4e6eb] rounded-xl focus:outline-none focus:border-black transition-colors" placeholder="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#8d949e]">Message</label>
            <textarea className="w-full h-40 p-4 bg-white border border-[#e4e6eb] rounded-xl focus:outline-none focus:border-black transition-colors resize-none" placeholder="How can we help?"></textarea>
          </div>
          <button className="h-14 px-10 bg-black text-white hover:bg-[#222] rounded-xl font-black uppercase tracking-widest text-[12px] transition-all active:scale-[0.98]">
            Send Message
          </button>
        </form>
      </div>
    </Container>
  );
};
