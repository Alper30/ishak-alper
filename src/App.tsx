/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import { AdminUser, getAdminMe } from './lib/adminAuth';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Book = lazy(() => import('./pages/Book'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const About = lazy(() => import('./pages/About'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ReadPreview = lazy(() => import('./pages/ReadPreview'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageSpinner = () => (
  <div className="w-full flex justify-center py-32">
    <div className="w-8 h-8 border-2 border-zinc-800 border-t-brand-500 rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    getAdminMe().then(user => {
      setAdminUser(user);
      setIsAuthReady(true);
    });
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Router>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="kitap" element={<Book />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogPost />} />
              <Route path="iletisim" element={<Contact />} />
              <Route path="hakkimda" element={<About />} />
              <Route
                path="admin"
                element={
                  <Admin
                    user={adminUser}
                    onLogin={setAdminUser}
                    onLogout={() => setAdminUser(null)}
                  />
                }
              />
            </Route>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/kitap/oku" element={<ReadPreview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}
