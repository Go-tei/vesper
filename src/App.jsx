import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import ContactPage from './pages/ContactPage';
import { AuthPage, ProfilePage } from './pages/AuthPages';
import { CartPage, CheckoutPage, PaymentErrorPage, SuccessPage } from './pages/CartPages';
import { AboutPage, ArticlePage, BlogPage, CategoriesPage, NotFoundPage } from './pages/InfoPages';
import AdminPages from './pages/AdminPages';
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CatalogPage showHero />} />
        <Route path="/productos" element={<CatalogPage />} />
        <Route path="/productos/:id" element={<ProductPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/categorias/:nombre" element={<CatalogPage />} />
        <Route path="/ofertas" element={<CatalogPage offersOnly />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/registro" element={<AuthPage register />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/compra/:id" element={<SuccessPage />} />
        <Route path="/pago-error" element={<PaymentErrorPage />} />
        <Route path="/admin/*" element={<AdminPages />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
