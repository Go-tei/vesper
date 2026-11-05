import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { store } from '../services/store';
export default function Layout({ children }) {
  const { session, cart } = useShop();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a
        className="skip-link"
        href="#contenido"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('contenido')?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="announcement">SANTIAGO, CHILE · STREETWEAR / CULTURA POP · DROP 002</div>
        <nav className="navbar navbar-expand-xl container" aria-label="Navegación principal">
          <Link className="navbar-brand" to="/">
            VESPER<span>夜</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="main-menu"
            aria-label="Abrir menú"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div id="main-menu" className={`collapse navbar-collapse${open ? ' show' : ''}`}>
            <div className="navbar-nav ms-auto align-items-xl-center gap-xl-1">
              <NavLink className="nav-link" to="/productos">
                Catálogo
              </NavLink>
              <NavLink className="nav-link" to="/categorias">
                Categorías
              </NavLink>
              <NavLink className="nav-link" to="/ofertas">
                Ofertas
              </NavLink>
              <NavLink className="nav-link" to="/nosotros">
                Nosotros
              </NavLink>
              <NavLink className="nav-link" to="/blog">
                Blog
              </NavLink>
              <NavLink className="nav-link" to="/contacto">
                Contacto
              </NavLink>
              <NavLink className="nav-link" to="/carrito">
                Carrito{' '}
                <span className="badge text-bg-danger">
                  {cart.reduce((sum, item) => sum + item.cantidad, 0)}
                </span>
              </NavLink>
              {session ? (
                <>
                  <NavLink
                    className="nav-link"
                    to={session.role === 'admin' ? '/admin' : '/perfil'}
                  >
                    {session.role === 'admin' ? 'Administración' : session.nombre}
                  </NavLink>
                  <button className="btn btn-sm btn-outline-light" onClick={() => store.logout()}>
                    Salir
                  </button>
                </>
              ) : (
                <NavLink className="nav-link" to="/login">
                  Ingresar
                </NavLink>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main id="contenido" tabIndex="-1">
        {children}
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <strong>VESPER夜</strong>
            <p className="small mb-0">Streetwear inspirado en cultura pop.</p>
          </div>
          <div className="d-flex gap-3">
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
          <small>© {new Date().getFullYear()} VESPER · Proyecto académico DSY1104</small>
        </div>
      </footer>
    </>
  );
}
export function PageTitle({ eyebrow = 'VESPER', title, children }) {
  return (
    <header className="page-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}
