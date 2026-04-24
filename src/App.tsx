import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { MobileMenu } from '@/components/MobileMenu';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute, AdminRoute } from '@/components/RouteGuards';
import { Loader } from '@/components/Loader';
import { AdminLayout } from '@/features/admin/AdminLayout';
import { Container } from '@/components/Container';
import { CartDrawer } from '@/components/CartDrawer';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Toast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QuickViewModal } from '@/components/QuickViewModal';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useCollections } from '@/hooks/useCollections';
import { useCategories } from '@/hooks/useCategories';

import { useSettings } from '@/hooks/useSettings';

const DataInitializer = () => {
  useCollections();
  useCategories();
  useSettings();
  return null;
};

// Lazy loaded pages
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/features/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const WishlistPage = lazy(() => import('@/features/wishlist/WishlistPage').then(m => ({ default: m.WishlistPage })));
const CartPage = lazy(() => import('@/features/cart/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('@/features/checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('@/features/checkout/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage })));
const ProductDetailsPage = lazy(() => import('@/features/products/ProductDetailsPage').then(m => ({ default: m.ProductDetailsPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('@/pages/LegalPages').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/LegalPages').then(m => ({ default: m.TermsPage })));

// Admin Pages
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('@/features/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('@/features/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminAnalytics = lazy(() => import('@/features/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminCampaigns = lazy(() => import('@/features/admin/AdminCampaigns').then(m => ({ default: m.AdminCampaigns })));
const AdminCollections = lazy(() => import('@/features/admin/AdminCollections').then(m => ({ default: m.AdminCollections })));
const AdminCategories = lazy(() => import('@/features/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminSettings = lazy(() => import('@/features/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

export default function App() {
  const { loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader /></div>;

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-[#f5f6f7] flex flex-col font-sans selection:bg-black selection:text-white">
        <Helmet>
          <title>Raici Mart | Premium Lifestyle Collections</title>
          <meta name="description" content="Discover curated premium products at Raici Mart. From fashion to electronics, we bring the best quality right to your doorstep." />
        </Helmet>

        {!isAdminRoute && <Navbar />}
        <MobileMenu />
        <ScrollToTop />
        <CartDrawer />
        <QuickViewModal />
        <SearchOverlay />
        <Toast />
        <DataInitializer />
        
        <ErrorBoundary>
          <Suspense fallback={<div className="h-[60vh] flex items-center justify-center"><Loader /></div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                  <Route path="/admin/collections" element={<AdminCollections />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>

        {!isAdminRoute && (
          <footer className="bg-white border-t border-[#e4e6eb] py-16 mt-auto">
            <Container>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-1">
                  <div className="text-[20px] font-black uppercase tracking-tighter mb-6">Raici Mart</div>
                  <p className="text-[14px] text-[#4b4f56] leading-relaxed">
                    Elevating your lifestyle through curated quality and timeless design.
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8d949e] mb-6">Shop</h4>
                  <ul className="space-y-4 text-[13px] font-bold text-black text-left">
                    <li><Link to="/?search=New Arrival" className="hover:opacity-70 transition-opacity">New Arrivals</Link></li>
                    <li><Link to="/?search=Best Seller" className="hover:opacity-70 transition-opacity">Best Sellers</Link></li>
                    <li><Link to="/?search=Featured" className="hover:opacity-70 transition-opacity">Featured</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8d949e] mb-6">Support</h4>
                  <ul className="space-y-4 text-[13px] font-bold text-black text-left">
                    <li><Link to="/profile" className="hover:opacity-70 transition-opacity">Order Tracking</Link></li>
                    <li><Link to="/contact" className="hover:opacity-70 transition-opacity">Returns & Support</Link></li>
                    <li><Link to="/contact" className="hover:opacity-70 transition-opacity">Contact Us</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8d949e] mb-6">Legal</h4>
                  <ul className="space-y-4 text-[13px] font-bold text-black text-left">
                    <li><Link to="/privacy" className="hover:opacity-70 transition-opacity">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:opacity-70 transition-opacity">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>
              <div className="pt-8 border-t border-[#f0f2f5] flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-[12px] text-[#8d949e] font-medium">
                  © 2024 Raici Mart. All rights reserved.
                </div>
                <div className="flex gap-6 text-[12px] text-[#8d949e] font-bold uppercase tracking-widest">
                  <span>Sustainable</span>
                  <span>Premium</span>
                  <span>Global</span>
                </div>
              </div>
            </Container>
          </footer>
        )}
      </div>
    </HelmetProvider>
  );
}

