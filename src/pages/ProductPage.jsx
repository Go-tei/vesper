import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { store, formatCLP, priceFor } from '../services/store';
import Feedback from '../components/Feedback';
import { PageTitle } from '../components/Layout';
export default function ProductPage() {
  const { id } = useParams();
  const { products } = useShop();
  const product = products.find((p) => String(p.id) === id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  if (!product)
    return (
      <div className="container">
        <PageTitle title="Producto no encontrado" />
        <Link to="/productos">Volver al catálogo</Link>
      </div>
    );
  return (
    <section className="container py-5">
      <nav aria-label="Ruta de navegación">
        <Link to="/productos">Catálogo</Link> / {product.categoria}
      </nav>
      <div className="row g-5 mt-2">
        <div className="col-md-6">
          <img className="product-detail-image" src={product.imagen} alt={product.nombre} />
        </div>
        <div className="col-md-6">
          <PageTitle eyebrow={product.categoria} title={product.nombre} />
          <p>{product.descripcion}</p>
          <p className="price">
            {product.descuento > 0 && (
              <>
                <del className="original-price">{formatCLP(product.precio)}</del>{' '}
                <span className="badge text-bg-danger">−{product.descuento}%</span>{' '}
              </>
            )}
            {formatCLP(priceFor(product))}
          </p>
          <p>{product.stock > 0 ? `${product.stock} unidades disponibles` : 'Producto agotado'}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                store.addToCart(product.id, Number(quantity));
                setMessage('Producto agregado al carrito.');
                setError('');
              } catch (err) {
                setError(err.message);
                setMessage('');
              }
            }}
          >
            <label htmlFor="cantidad" className="form-label">
              Cantidad
            </label>
            <input
              id="cantidad"
              className="form-control qty-control mb-3"
              type="number"
              min="1"
              max={Math.min(20, product.stock)}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <button className="btn btn-vesper mb-3" disabled={product.stock <= 0}>
              Agregar al carrito
            </button>
          </form>
          <Feedback message={error} />
          <Feedback
            type="success"
            message={
              message && (
                <>
                  {message} <Link to="/carrito">Ver carrito</Link>
                </>
              )
            }
          />
          <p className="small-note">
            Despacho a domicilio o retiro en Santiago. Compra de demostración.
          </p>
        </div>
      </div>
    </section>
  );
}
