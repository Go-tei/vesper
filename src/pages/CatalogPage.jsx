import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { store } from '../services/store';
import { PageTitle } from '../components/Layout';
import { ProductList } from '../components/ProductList';
import Feedback from '../components/Feedback';
export default function CatalogPage({ offersOnly = false, showHero = false }) {
  const { products, categories } = useShop();
  const { nombre } = useParams();
  const [params, setParams] = useSearchParams();
  const text = params.get('buscar') || '';
  const category = nombre || params.get('categoria') || '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const visible = products.filter(
    (p) =>
      (!offersOnly || p.descuento > 0) &&
      (!category || p.categoria === category) &&
      `${p.nombre} ${p.descripcion}`
        .toLocaleLowerCase('es')
        .includes(text.trim().toLocaleLowerCase('es')),
  );
  function add(id) {
    try {
      store.addToCart(id);
      setMessage('Producto agregado al carrito.');
      setError('');
    } catch (e) {
      setError(e.message);
      setMessage('');
    }
  }
  function search(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  }
  return (
    <>
      {showHero && (
        <section className="vesper-hero" aria-label="Nueva colección">
          <img src="assets/img/sopranos-hoodie-real.png" alt="Polerón The Sopranos Noir" />
          <div className="container hero-copy">
            <p className="eyebrow text-light">DROP 002 / EDICIÓN CULTURA</p>
            <h1>
              Cultura pop.
              <br />
              Fuera del guion.
            </h1>
            <p>Series, cine, música, anime y gaming. Tu próxima prenda tiene una historia.</p>
            <button
              className="btn btn-light"
              onClick={() =>
                document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Explorar el drop ↘
            </button>
          </div>
          <span className="hero-stamp">VESPER / EST. SANTIAGO</span>
        </section>
      )}
      <section className="container pb-5" id="coleccion">
        <PageTitle
          eyebrow={offersOnly ? 'ÚLTIMAS OPORTUNIDADES' : 'DROP 002'}
          title={offersOnly ? 'Ofertas' : category || 'El catálogo'}
        >
          {offersOnly
            ? 'Una nueva oportunidad para tus favoritos.'
            : 'Piezas para quienes encuentran referencias en todas partes.'}
        </PageTitle>
        <div className="row g-3 align-items-end mb-4">
          <div className="col-md-6">
            <label htmlFor="buscar" className="form-label">
              Buscar
            </label>
            <input
              id="buscar"
              className="form-control"
              type="search"
              placeholder="Nombre o descripción"
              value={text}
              onChange={(e) => search('buscar', e.target.value)}
            />
          </div>
          {!nombre && (
            <div className="col-md-4">
              <label htmlFor="categoria" className="form-label">
                Categoría
              </label>
              <select
                id="categoria"
                className="form-select"
                value={category}
                onChange={(e) => search('categoria', e.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <div className="col-md-2">
            <p className="small mb-2" aria-live="polite">
              {visible.length} productos
            </p>
          </div>
        </div>
        <Feedback message={error} />
        <Feedback
          message={
            message && (
              <>
                {message} <Link to="/carrito">Ver carrito</Link>
              </>
            )
          }
          type="success"
        />
        <ProductList products={visible} onAdd={add} />
      </section>
    </>
  );
}
