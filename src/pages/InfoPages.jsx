import { Link, useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { PageTitle } from '../components/Layout';
import { articles } from '../data/articles';
export function CategoriesPage() {
  const { categories, products } = useShop();
  return (
    <section className="container">
      <PageTitle eyebrow="ENCUENTRA TU SILUETA" title="Categorías" />
      <div className="row g-4">
        {categories.map((category) => {
          const items = products.filter((p) => p.categoria === category.nombre);
          return (
            <div className="col-md-4" key={category.id}>
              <Link
                className="category-tile"
                to={`/categorias/${encodeURIComponent(category.nombre)}`}
              >
                {items[0] && <img src={items[0].imagen} alt="" />}
                <div>
                  <h2 className="h3">{category.nombre} ↗</h2>
                  <span>{items.length} productos</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      {!categories.length && <p>No hay categorías disponibles.</p>}
    </section>
  );
}
export function AboutPage() {
  return (
    <section className="container">
      <PageTitle eyebrow="DESDE SANTIAGO" title="Historias que se visten" />
      <div className="row g-5">
        <div className="col-md-6">
          <img
            className="product-detail-image"
            src="assets/img/bowie-hoodie-real.png"
            alt="Polerón Bowie Lightning del catálogo Vesper"
          />
        </div>
        <div className="col-md-6">
          <p className="lead">VESPER nace donde se cruzan la calle y la cultura pop.</p>
          <p>
            Una escena de cine, una canción, un personaje o un juego. Diseñamos esta tienda
            alrededor de las referencias que nos acompañan, con una identidad oscura y una mirada
            desde Santiago de Chile.
          </p>
          <h2 className="h4 mt-4">El proyecto</h2>
          <p>
            Esta es una tienda de demostración desarrollada para Desarrollo Fullstack II (DSY1104).
            Permite explorar productos, simular compras y administrar un catálogo.
          </p>
          <p>
            Los pedidos y cuentas se guardan en el navegador. No se realizan ventas ni cobros
            reales. Las referencias culturales del catálogo se utilizan con fines académicos.
          </p>
          <Link className="btn btn-vesper" to="/productos">
            Conocer el catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
export function BlogPage() {
  return (
    <section className="container">
      <PageTitle eyebrow="EL JOURNAL" title="Fuera de catálogo" />
      <div className="row g-4">
        {articles.map((a) => (
          <article className="col-md-6" key={a.slug}>
            <div className="card product-card">
              <Link to={`/blog/${a.slug}`}>
                <img className="journal-image" src={a.image} alt="" />
              </Link>
              <div className="card-body">
                <p className="eyebrow">{a.tag}</p>
                <h2 className="h3">{a.title}</h2>
                <p>{a.excerpt}</p>
                <Link to={`/blog/${a.slug}`}>Leer historia ↗</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);
  if (!article) return <NotFoundPage />;
  return (
    <article className="container reading-width">
      <PageTitle eyebrow={article.tag} title={article.title} />
      <img className="journal-cover mb-4" src={article.image} alt="" />
      {article.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <Link to="/blog">← Volver al journal</Link>
    </article>
  );
}
export function NotFoundPage() {
  return (
    <section className="container">
      <PageTitle eyebrow="404" title="Esta página se salió del guion">
        La dirección que buscas no existe.
      </PageTitle>
      <Link className="btn btn-vesper" to="/">
        Volver al inicio
      </Link>
    </section>
  );
}
