import { Link } from 'react-router-dom';
import { formatCLP, priceFor } from '../services/store';
export function ProductCard({ product, onAdd }) {
  return (
    <article className="card product-card">
      <Link to={`/productos/${product.id}`} className="product-image-link">
        <img src={product.imagen} className="card-img-top" alt={product.nombre} loading="lazy" />
        {product.descuento > 0 && <span className="badge sale-badge">−{product.descuento}%</span>}
      </Link>
      <div className="card-body d-flex flex-column">
        <p className="eyebrow">{product.categoria}</p>
        <h2 className="card-title h5">
          <Link to={`/productos/${product.id}`}>{product.nombre}</Link>
        </h2>
        <p className="card-text flex-grow-1">{product.descripcion}</p>
        <p className="price">
          {product.descuento > 0 && (
            <del className="original-price">{formatCLP(product.precio)}</del>
          )}{' '}
          {formatCLP(priceFor(product))}
        </p>
        <p className="small">{product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</p>
        <button
          className="btn btn-vesper w-100"
          disabled={product.stock <= 0}
          onClick={() => onAdd(product.id)}
        >
          {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      </div>
    </article>
  );
}
