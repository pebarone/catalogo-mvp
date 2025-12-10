import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';

// Lazy loading das páginas para reduzir bundle inicial
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '1.2rem',
    color: '#666',
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #f0f0f0',
        borderTopColor: '#FF595E',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <span>Carregando...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="produtos" element={<Products />} />
                <Route path="produto/:id" element={<ProductDetails />} />
                <Route path="favoritos" element={<Favorites />} />
                <Route path="sobre" element={<About />} />
                <Route path="contato" element={<Contact />} />
                <Route path="admin" element={<Admin />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;