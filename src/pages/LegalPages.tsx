import React from 'react';
import { Container } from '@/components/Container';

export const PrivacyPage: React.FC = () => {
  return (
    <Container className="py-20">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-[40px] font-black uppercase tracking-tight text-black">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none text-[#4b4f56] leading-relaxed space-y-6">
          <p>This Privacy Policy describes how Raici Mart collects, uses, and discloses your Personal Information when you visit or make a purchase from the site.</p>
          <section className="space-y-4">
            <h2 className="text-[18px] font-bold text-black uppercase tracking-tight">Collecting Personal Information</h2>
            <p>When you visit the site, we collect certain information about your device, your interaction with the site, and information necessary to process your purchases.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-[18px] font-bold text-black uppercase tracking-tight">How We Use Your Information</h2>
            <p>We use your personal information to provide our services to you, which includes: offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers.</p>
          </section>
        </div>
      </div>
    </Container>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <Container className="py-20">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-[40px] font-black uppercase tracking-tight text-black">Terms of Service</h1>
        <div className="prose prose-sm max-w-none text-[#4b4f56] leading-relaxed space-y-6">
          <p>Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service.</p>
          <section className="space-y-4">
            <h2 className="text-[18px] font-bold text-black uppercase tracking-tight">Online Store Terms</h2>
            <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence.</p>
          </section>
          <section className="space-y-4">
            <h2 className="text-[18px] font-bold text-black uppercase tracking-tight">General Conditions</h2>
            <p>We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted.</p>
          </section>
        </div>
      </div>
    </Container>
  );
};
