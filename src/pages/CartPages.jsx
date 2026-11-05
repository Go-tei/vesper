import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { store, formatCLP, priceFor } from '../services/store';
import { PageTitle } from '../components/Layout';
import Field from '../components/Field';
import Feedback from '../components/Feedback';
export function cartLines(cart, products) {
  return cart
    .map((item) => ({ ...item, product: products.find((p) => p.id === item.productId) }))
    .filter((item) => item.product);
}
export function CartPage() {
  const { cart, products } = useShop();
  const [error, setError] = useState('');
  const lines = cartLines(cart, products);
  const total = lines.reduce((s, i) => s + priceFor(i.product) * i.cantidad, 0);
  function change(id, quantity) {
    try {
      store.updateQuantity(id, quantity);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <section className="container">
      <PageTitle eyebrow="01 / TU SELECCIÓN" title="Carrito" />
      <Feedback message={error} />
      {!lines.length ? (
        <div className="empty-state">
          Tu carrito está vacío. <Link to="/productos">Explorar el catálogo</Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>
                      <span className="visually-hidden">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map(({ product, cantidad }) => (
                    <tr key={product.id}>
                      <td>
                        <Link className="cart-product" to={`/productos/${product.id}`}>
                          <img src={product.imagen} alt="" />
                          <strong>{product.nombre}</strong>
                        </Link>
                      </td>
                      <td>{formatCLP(priceFor(product))}</td>
                      <td>
                        <input
                          className="form-control qty-control"
                          type="number"
                          aria-label={`Cantidad de ${product.nombre}`}
                          min="1"
                          max={Math.min(20, product.stock)}
                          value={cantidad}
                          onChange={(e) => change(product.id, Number(e.target.value))}
                        />
                      </td>
                      <td>{formatCLP(priceFor(product) * cantidad)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          aria-label={`Quitar ${product.nombre}`}
                          onClick={() => store.removeFromCart(product.id)}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link className="d-inline-block mt-3" to="/productos">
              ← Seguir explorando
            </Link>
          </div>
          <aside className="col-lg-4">
            <div className="panel cart-summary">
              <h2 className="h4">Resumen</h2>
              <p className="d-flex justify-content-between">
                <span>Subtotal</span>
                <strong>{formatCLP(total)}</strong>
              </p>
              <p className="small">El despacho se calcula en el siguiente paso.</p>
              <Link className="btn btn-vesper w-100" to="/checkout">
                Continuar al checkout
              </Link>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
export function CheckoutPage() {
  const { session, cart, products } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(
    () =>
      location.state?.details || {
        nombre: session?.nombre || '',
        email: session?.email || '',
        telefono: session?.telefono || '',
        direccion: session?.direccion || '',
        comuna: session?.comuna || '',
        region: session?.region || '',
        entrega: 'despacho',
      },
  );
  const [payment, setPayment] = useState('exitoso');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lines = cartLines(cart, products);
  const subtotal = lines.reduce((s, i) => s + priceFor(i.product) * i.cantidad, 0);
  const envio = data.entrega === 'despacho' ? 3990 : 0;
  function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const order = store.checkout(data, { fail: payment === 'fallido' });
      navigate(`/compra/${order.id}`, { replace: true });
    } catch (err) {
      if (payment === 'fallido' && err.message.toLowerCase().includes('pago'))
        navigate('/pago-error', { state: { message: err.message, details: data } });
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (!lines.length) return <Navigate to="/carrito" replace />;
  return (
    <section className="container">
      <PageTitle eyebrow="02 / ENTREGA Y PAGO" title="Checkout">
        Completa tus datos para preparar tu pedido.
      </PageTitle>
      <div className="row g-4">
        <div className="col-lg-8">
          <form className="panel" onSubmit={submit} noValidate>
            <Feedback message={error} />
            <h2 className="h4 mb-3">Datos de contacto</h2>
            <div className="row">
              {[
                ['nombre', 'Nombre', 'text'],
                ['email', 'Correo', 'email'],
                ['telefono', 'Teléfono', 'tel'],
              ].map(([name, label, type]) => (
                <div className="col-md-6" key={name}>
                  <Field
                    name={name}
                    label={label}
                    type={type}
                    value={data[name]}
                    onChange={(e) => setData({ ...data, [name]: e.target.value })}
                    autoComplete={name === 'nombre' ? 'name' : name === 'email' ? 'email' : 'tel'}
                    required
                  />
                </div>
              ))}
            </div>
            <h2 className="h4">Entrega</h2>
            <label htmlFor="entrega" className="form-label">
              Método de entrega
            </label>
            <select
              id="entrega"
              className="form-select mb-3"
              value={data.entrega}
              onChange={(e) => setData({ ...data, entrega: e.target.value })}
            >
              <option value="despacho">Despacho a domicilio — {formatCLP(3990)}</option>
              <option value="retiro">Retiro en Santiago — gratis</option>
            </select>
            {data.entrega === 'despacho' ? (
              <div className="row">
                {[
                  ['direccion', 'Dirección'],
                  ['comuna', 'Comuna'],
                  ['region', 'Región'],
                ].map(([name, label]) => (
                  <div className={name === 'direccion' ? 'col-12' : 'col-md-6'} key={name}>
                    <Field
                      name={name}
                      label={label}
                      value={data[name]}
                      onChange={(e) => setData({ ...data, [name]: e.target.value })}
                      required
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="small">
                Retiro de demostración en Santiago Centro. Te contactaremos para coordinar.
              </p>
            )}
            <h2 className="h4">Pago de demostración</h2>
            <p className="small">No ingreses datos bancarios. Este flujo no realiza cobros.</p>
            <label className="form-label" htmlFor="pago">
              Resultado de la simulación
            </label>
            <select
              id="pago"
              className="form-select mb-4"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="exitoso">Pago aprobado</option>
              <option value="fallido">Pago rechazado</option>
            </select>
            <button className="btn btn-vesper w-100" disabled={busy}>
              Confirmar compra simulada · {formatCLP(subtotal + envio)}
            </button>
          </form>
        </div>
        <aside className="col-lg-4">
          <div className="panel cart-summary">
            <h2 className="h4">Tu pedido</h2>
            {lines.map((i) => (
              <p key={i.product.id} className="d-flex justify-content-between gap-3">
                <span>
                  {i.product.nombre} × {i.cantidad}
                </span>
                <strong>{formatCLP(priceFor(i.product) * i.cantidad)}</strong>
              </p>
            ))}
            <hr />
            <p>Subtotal: {formatCLP(subtotal)}</p>
            <p>Envío: {formatCLP(envio)}</p>
            <p className="price">Total: {formatCLP(subtotal + envio)}</p>
            <Link to="/carrito">Editar carrito</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
export function Receipt({ order }) {
  return (
    <div className="panel">
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <h2 className="h4">Pedido {order.id}</h2>
        <span>{new Date(order.fecha).toLocaleString('es-CL')}</span>
      </div>
      <p>
        <strong>{order.cliente.nombre}</strong> · {order.cliente.email}
      </p>
      <p>
        {order.cliente.entrega === 'retiro'
          ? 'Retiro en Santiago Centro'
          : `${order.cliente.direccion}, ${order.cliente.comuna}, ${order.cliente.region}`}
      </p>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>{formatCLP(item.precio)}</td>
                <td>{formatCLP(item.precio * item.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        Subtotal: {formatCLP(order.subtotal)} · Envío: {formatCLP(order.envio)}
      </p>
      <p className="price">Total: {formatCLP(order.total)}</p>
      <p className="small-note mb-0">
        Comprobante académico de compra simulada. Sin validez tributaria.
      </p>
    </div>
  );
}
export function SuccessPage() {
  const { id } = useParams();
  const { orders } = useShop();
  const order = orders.find((o) => String(o.id) === id);
  return (
    <section className="container">
      <PageTitle
        eyebrow="03 / LISTO"
        title={order ? 'Tu compra fue exitosa' : 'Pedido no encontrado'}
      >
        {order
          ? 'Tu selección ya tiene una nueva historia.'
          : 'Este comprobante no está guardado en este navegador.'}
      </PageTitle>
      {order && <Receipt order={order} />}
      <Link className="btn btn-vesper mt-4" to="/productos">
        Volver al catálogo
      </Link>
      {order && (
        <button className="btn btn-outline-dark mt-4 ms-2" onClick={() => window.print()}>
          Imprimir resumen
        </button>
      )}
    </section>
  );
}
export function PaymentErrorPage() {
  const location = useLocation();
  return (
    <section className="container">
      <PageTitle eyebrow="PAGO NO COMPLETADO" title="No se pudo realizar el pago">
        La simulación fue rechazada. Tus productos siguen en el carrito y no se generó ningún pedido
        ni cobro.
      </PageTitle>
      <Link className="btn btn-vesper" to="/checkout" state={{ details: location.state?.details }}>
        Reintentar pago
      </Link>
      <Link className="btn btn-outline-dark ms-2" to="/carrito">
        Revisar carrito
      </Link>
    </section>
  );
}
