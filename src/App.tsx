import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig, motion } from 'motion/react';
import { StoreProvider } from './context/StoreContext';
import { MotionNavProvider } from './context/MotionNavContext';
import { Header } from './components/Header';
import { SectionsDrawer } from './components/SectionsDrawer';
import { BagDrawer } from './components/BagDrawer';
import { MobilePillDock } from './components/MobilePillDock';
import { Footer } from './components/Footer';
import { ManagerPinModal } from './components/ManagerPinModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { SearchResultsPage } from './pages/SearchResultsPage';

const QuickListPage = lazy(() =>
  import('./pages/QuickListPage').then((m) => ({ default: m.QuickListPage }))
);
const TrackOrderPage = lazy(() =>
  import('./pages/TrackOrderPage').then((m) => ({ default: m.TrackOrderPage }))
);
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);
const ManagerPortalPage = lazy(() =>
  import('./pages/ManagerPortalPage').then((m) => ({ default: m.ManagerPortalPage }))
);
const AboutPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.ContactPage }))
);
const FaqPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.FaqPage }))
);
const TermsPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/InfoPages').then((m) => ({ default: m.PrivacyPage }))
);

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, search]);
  return null;
}

function RouteFallback() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16">
      <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse mb-4" />
      <div className="h-4 w-72 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}

function AnimatedRoutesShell() {
  const location = useLocation();
  const isSearchMorph = location.pathname === '/search';

  return (
    <motion.div
      key={`${location.pathname}${location.search}`}
      initial={isSearchMorph ? { opacity: 0 } : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/quick-list" element={<QuickListPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/manager" element={<ManagerPortalPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </motion.div>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const isManagerRoute = pathname === '/manager';

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {!isManagerRoute && <Header />}
      <SectionsDrawer />
      <BagDrawer />
      <ManagerPinModal />

      <main className="flex-1 overflow-x-clip">
        <AnimatedRoutesShell />
      </main>

      {!isManagerRoute && <Footer />}
      {!isManagerRoute && <MobilePillDock />}
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <MotionNavProvider>
          <StoreProvider>
            <ScrollToTop />
            <AppShell />
          </StoreProvider>
        </MotionNavProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
