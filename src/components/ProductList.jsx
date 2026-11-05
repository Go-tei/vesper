import { ProductCard } from './ProductCard';
export function ProductList({ products, onAdd }) {
  if (!products.length)
    return <div className="empty-state">No hay productos que coincidan con el filtro.</div>;
  return (
    <div className="row g-4">
      {products.map((product) => (
        <div className="col-12 col-md-6 col-lg-4" key={product.id}>
          <ProductCard product={product} onAdd={onAdd} />
        </div>
      ))}
    </div>
  );
}
