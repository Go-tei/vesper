import { useEffect, useId, useState } from 'react';
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { formatCLP, priceFor, store } from '../services/store';

const sameId = (first, second) => String(first) === String(second);
const dateLabel = (value) => new Date(value).toLocaleString('es-CL');
const productDefaults = {
  nombre: '',
  categoria: '',
  precio: '',
  stock: '',
  descuento: '0',
  descripcion: '',
  imagen: 'assets/img/sopranos-hoodie-real.png',
};
const userDefaults = {
  nombre: '',
  email: '',
  password: '',
  role: 'usuario',
  telefono: '',
  direccion: '',
  comuna: '',
  region: '',
};

function Field({ label, value, onChange, as = 'input', children, ...props }) {
  const id = useId();
  const Control = as;
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <Control
        id={id}
        className={as === 'select' ? 'form-select' : 'form-control'}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      >
        {children}
      </Control>
    </div>
  );
}

function Feedback({ error, message }) {
  return (
    <>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="alert alert-success" role="status">
          {message}
        </div>
      )}
    </>
  );
}

function PageTitle({ title, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <h2 className="h3 fw-bold mb-0">{title}</h2>
      {children}
    </div>
  );
}

function NotFound({ children = 'El registro solicitado no existe.' }) {
  return (
    <div className="empty-state">
      <p>{children}</p>
      <Link to="/admin" className="btn btn-outline-vesper">
        Volver al panel
      </Link>
    </div>
  );
}

function useFeedback() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const run = (action, success) => {
    setError('');
    setMessage('');
    try {
      action();
      if (success) setMessage(success);
      return true;
    } catch (problem) {
      setError(problem.message || 'No se pudo guardar el cambio. Inténtalo nuevamente.');
      return false;
    }
  };
  return { error, message, run, setError };
}

function Stat({ label, value }) {
  return (
    <div className="col-6 col-xl-3">
      <div className="panel h-100">
        <p className="eyebrow">{label}</p>
        <p className="h3 fw-bold mb-0">{value}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { products, users, orders, messages } = useShop();
  const sales = orders.reduce((sum, order) => sum + order.total, 0);
  return (
    <>
      <PageTitle title="Resumen de la tienda" />
      <div className="row g-3 mb-4">
        <Stat label="Productos" value={products.length} />
        <Stat label="Usuarios" value={users.length} />
        <Stat label="Pedidos" value={orders.length} />
        <Stat label="Ventas simuladas" value={formatCLP(sales)} />
      </div>
      <section className="panel mb-4" aria-labelledby="recent-orders-title">
        <h3 id="recent-orders-title" className="h5">
          Últimos pedidos
        </h3>
        <OrderTable orders={[...orders].reverse().slice(0, 5)} />
      </section>
      <section className="panel" aria-labelledby="contact-messages-title">
        <h3 id="contact-messages-title" className="h5">
          Consultas de contacto
        </h3>
        {messages.length === 0 ? (
          <p className="mb-0">Todavía no hay consultas.</p>
        ) : (
          <div className="vstack gap-3">
            {[...messages].reverse().map((message) => (
              <article className="border-top pt-3" key={message.id}>
                <h4 className="h6">
                  {message.motivo || message.asunto || 'Consulta'} · {message.nombre}
                </h4>
                <p className="small mb-1">
                  {message.email}
                  {message.fecha ? ` · ${dateLabel(message.fecha)}` : ''}
                </p>
                <p className="mb-0 text-break">{message.mensaje}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ProductList() {
  const { products } = useShop();
  const [query, setQuery] = useState('');
  const feedback = useFeedback();
  const filtered = products.filter((product) =>
    `${product.nombre} ${product.categoria}`
      .toLocaleLowerCase('es')
      .includes(query.trim().toLocaleLowerCase('es')),
  );
  const remove = (product) => {
    if (window.confirm(`¿Eliminar ${product.nombre}? También se quitará de los carritos.`))
      feedback.run(() => store.deleteProduct(product.id), 'Producto eliminado.');
  };
  return (
    <>
      <PageTitle title="Productos">
        <Link className="btn btn-vesper" to="/admin/productos/nuevo">
          Nuevo producto
        </Link>
      </PageTitle>
      <Feedback {...feedback} />
      <Field
        label="Buscar producto"
        type="search"
        value={query}
        onChange={setQuery}
        placeholder="Nombre o categoría"
      />
      {filtered.length === 0 ? (
        <div className="empty-state">No hay productos que coincidan con tu búsqueda.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <caption className="px-3">{filtered.length} productos</caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio final</th>
                <th scope="col">Stock</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link to={`/productos/${product.id}`} className="fw-bold">
                      {product.nombre}
                    </Link>
                  </td>
                  <td>{product.categoria}</td>
                  <td>
                    {formatCLP(priceFor(product))}
                    {product.descuento > 0 && (
                      <small className="d-block">−{product.descuento}%</small>
                    )}
                  </td>
                  <td>
                    <span className={product.stock <= 5 ? 'badge text-bg-danger' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Link
                        className="btn btn-sm btn-outline-dark"
                        to={`/admin/productos/${product.id}`}
                      >
                        Editar<span className="visually-hidden"> {product.nombre}</span>
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        type="button"
                        onClick={() => remove(product)}
                      >
                        Eliminar<span className="visually-hidden"> {product.nombre}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ProductForm() {
  const { id } = useParams();
  const { products, categories } = useShop();
  const original = products.find((product) => sameId(product.id, id));
  const [values, setValues] = useState(() =>
    original ? { ...original } : { ...productDefaults, categoria: categories[0]?.nombre || '' },
  );
  const feedback = useFeedback();
  const navigate = useNavigate();
  useEffect(() => {
    setValues(
      original ? { ...original } : { ...productDefaults, categoria: categories[0]?.nombre || '' },
    );
  }, [id]); // A route change opens a different form; typing remains local state.
  if (id && !original) return <NotFound />;
  const change = (key) => (value) => setValues((previous) => ({ ...previous, [key]: value }));
  const save = (event) => {
    event.preventDefault();
    const ok = feedback.run(() =>
      store.saveProduct({
        ...values,
        precio: Number(values.precio),
        stock: Number(values.stock),
        descuento: Number(values.descuento),
      }),
    );
    if (ok) navigate('/admin/productos');
  };
  return (
    <>
      <PageTitle title={id ? 'Editar producto' : 'Nuevo producto'}>
        <Link to="/admin/productos">Volver al listado</Link>
      </PageTitle>
      <Feedback {...feedback} />
      {categories.length === 0 && (
        <p className="alert alert-warning">
          Crea una <Link to="/admin/categorias">categoría</Link> antes de guardar productos.
        </p>
      )}
      <form className="panel" onSubmit={save}>
        <div className="row">
          <div className="col-md-8">
            <Field
              label="Nombre del producto"
              value={values.nombre}
              onChange={change('nombre')}
              minLength={3}
              maxLength={120}
              required
            />
          </div>
          <div className="col-md-4">
            <Field
              label="Categoría"
              as="select"
              value={values.categoria}
              onChange={change('categoria')}
              required
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categories.map((category) => (
                <option key={category.id}>{category.nombre}</option>
              ))}
            </Field>
          </div>
          <div className="col-md-4">
            <Field
              label="Precio en pesos chilenos"
              type="number"
              min="1"
              step="1"
              value={values.precio}
              onChange={change('precio')}
              required
            />
          </div>
          <div className="col-md-4">
            <Field
              label="Stock disponible"
              type="number"
              min="0"
              step="1"
              value={values.stock}
              onChange={change('stock')}
              required
            />
          </div>
          <div className="col-md-4">
            <Field
              label="Descuento (%)"
              type="number"
              min="0"
              max="90"
              step="1"
              value={values.descuento}
              onChange={change('descuento')}
              required
            />
          </div>
          <div className="col-12">
            <Field
              label="Descripción"
              as="textarea"
              rows="4"
              minLength={10}
              maxLength={1000}
              value={values.descripcion}
              onChange={change('descripcion')}
              required
            />
          </div>
          <div className="col-12">
            <Field
              label="Ruta o URL de imagen"
              value={values.imagen}
              onChange={change('imagen')}
              required
            />
            <p className="form-text">Ejemplo: assets/img/sopranos-hoodie-real.png</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-vesper" disabled={!categories.length}>
            Guardar producto
          </button>
          <Link className="btn btn-outline-secondary" to="/admin/productos">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}

function Categories() {
  const { categories, products } = useShop();
  const [current, setCurrent] = useState(null);
  const [name, setName] = useState('');
  const feedback = useFeedback();
  const cancel = () => {
    setCurrent(null);
    setName('');
  };
  const save = (event) => {
    event.preventDefault();
    if (
      feedback.run(
        () => store.saveCategory({ ...(current ? { id: current.id } : {}), nombre: name }),
        'Categoría guardada.',
      )
    )
      cancel();
  };
  const remove = (category) => {
    if (
      window.confirm(
        `¿Eliminar la categoría ${category.nombre}? Solo se puede eliminar si no tiene productos.`,
      )
    ) {
      if (
        feedback.run(() => store.deleteCategory(category.id), 'Categoría eliminada.') &&
        current &&
        sameId(current.id, category.id)
      )
        cancel();
    }
  };
  return (
    <>
      <PageTitle title="Categorías" />
      <Feedback {...feedback} />
      <div className="row g-4">
        <div className="col-lg-5">
          <form className="panel" onSubmit={save}>
            <h3 className="h5">{current ? 'Editar categoría' : 'Nueva categoría'}</h3>
            <Field
              label="Nombre de categoría"
              minLength={3}
              maxLength={60}
              value={name}
              onChange={setName}
              required
            />
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-vesper">
                Guardar categoría
              </button>
              {current && (
                <button className="btn btn-outline-secondary" type="button" onClick={cancel}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Categoría</th>
                  <th scope="col">Productos</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.nombre}</td>
                    <td>
                      {products.filter((product) => product.categoria === category.nombre).length}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => {
                            setCurrent(category);
                            setName(category.nombre);
                          }}
                        >
                          Editar<span className="visually-hidden"> {category.nombre}</span>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => remove(category)}
                        >
                          Eliminar<span className="visually-hidden"> {category.nombre}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!categories.length && <p className="empty-state">Todavía no hay categorías.</p>}
        </div>
      </div>
    </>
  );
}

function UserList() {
  const { users, orders } = useShop();
  const [query, setQuery] = useState('');
  const feedback = useFeedback();
  const filtered = users.filter((user) =>
    `${user.nombre} ${user.email}`
      .toLocaleLowerCase('es')
      .includes(query.trim().toLocaleLowerCase('es')),
  );
  const remove = (user) => {
    if (
      window.confirm(
        `¿Eliminar al usuario ${user.nombre}? Los pedidos conservarán su información de compra.`,
      )
    )
      feedback.run(() => store.deleteUser(user.id), 'Usuario eliminado.');
  };
  return (
    <>
      <PageTitle title="Usuarios">
        <Link className="btn btn-vesper" to="/admin/usuarios/nuevo">
          Nuevo usuario
        </Link>
      </PageTitle>
      <Feedback {...feedback} />
      <Field
        label="Buscar usuario"
        type="search"
        value={query}
        onChange={setQuery}
        placeholder="Nombre o correo"
      />
      {filtered.length === 0 ? (
        <p className="empty-state">No hay usuarios que coincidan con tu búsqueda.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
                <th scope="col">Rol</th>
                <th scope="col">Pedidos</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>{user.nombre}</td>
                  <td className="text-break">{user.email}</td>
                  <td>{user.role === 'admin' ? 'Administrador' : 'Cliente'}</td>
                  <td>
                    {
                      orders.filter(
                        (order) => order.userId != null && sameId(order.userId, user.id),
                      ).length
                    }
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Link
                        className="btn btn-sm btn-outline-dark"
                        to={`/admin/usuarios/${user.id}`}
                      >
                        Ver / editar<span className="visually-hidden"> {user.nombre}</span>
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => remove(user)}
                      >
                        Eliminar<span className="visually-hidden"> {user.nombre}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function UserFields({ values, change, profile = false }) {
  return (
    <div className="row">
      <div className="col-md-6">
        <Field
          label="Nombre completo"
          value={values.nombre}
          onChange={change('nombre')}
          minLength={3}
          maxLength={100}
          autoComplete="name"
          required
        />
      </div>
      <div className="col-md-6">
        <Field
          label="Correo electrónico"
          value={values.email}
          onChange={change('email')}
          type="email"
          autoComplete="email"
          required
        />
      </div>
      {!profile && (
        <>
          <div className="col-md-6">
            <Field
              label={values.id ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              value={values.password}
              onChange={change('password')}
              type="password"
              autoComplete="new-password"
              minLength={6}
              maxLength={100}
              required={!values.id}
            />
          </div>
          <div className="col-md-6">
            <Field label="Rol" as="select" value={values.role} onChange={change('role')} required>
              <option value="usuario">Cliente</option>
              <option value="admin">Administrador</option>
            </Field>
          </div>
        </>
      )}
      <div className="col-md-6">
        <Field
          label="Teléfono"
          value={values.telefono}
          onChange={change('telefono')}
          type="tel"
          autoComplete="tel"
        />
      </div>
      <div className="col-md-6">
        <Field
          label="Dirección"
          value={values.direccion}
          onChange={change('direccion')}
          autoComplete="street-address"
        />
      </div>
      <div className="col-md-6">
        <Field
          label="Comuna"
          value={values.comuna}
          onChange={change('comuna')}
          autoComplete="address-level2"
        />
      </div>
      <div className="col-md-6">
        <Field
          label="Región"
          value={values.region}
          onChange={change('region')}
          autoComplete="address-level1"
        />
      </div>
    </div>
  );
}

function UserForm() {
  const { id } = useParams();
  const { users, orders } = useShop();
  const original = users.find((user) => sameId(user.id, id));
  const [values, setValues] = useState(() =>
    original ? { ...original, password: '' } : { ...userDefaults },
  );
  const feedback = useFeedback();
  const navigate = useNavigate();
  useEffect(() => {
    setValues(original ? { ...original, password: '' } : { ...userDefaults });
  }, [id]);
  if (id && !original) return <NotFound />;
  const change = (key) => (value) => setValues((previous) => ({ ...previous, [key]: value }));
  const save = (event) => {
    event.preventDefault();
    const data = { ...values, password: values.password || original?.password || '' };
    if (feedback.run(() => store.saveUser(data))) navigate('/admin/usuarios');
  };
  const history = orders.filter(
    (order) => order.userId != null && sameId(order.userId, original?.id),
  );
  return (
    <>
      <PageTitle title={id ? 'Editar usuario' : 'Nuevo usuario'}>
        <Link to="/admin/usuarios">Volver al listado</Link>
      </PageTitle>
      <Feedback {...feedback} />
      <form className="panel mb-4" onSubmit={save}>
        <UserFields values={values} change={change} />
        <div className="d-flex gap-2">
          <button className="btn btn-vesper" type="submit">
            Guardar usuario
          </button>
          <Link className="btn btn-outline-secondary" to="/admin/usuarios">
            Cancelar
          </Link>
        </div>
      </form>
      {id && (
        <section className="panel" aria-labelledby="user-orders-title">
          <h3 className="h5" id="user-orders-title">
            Historial de compras
          </h3>
          <OrderTable orders={[...history].reverse()} />
        </section>
      )}
    </>
  );
}

function OrderTable({ orders }) {
  if (!orders.length) return <p className="mb-0">Todavía no hay pedidos.</p>;
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th scope="col">Pedido</th>
            <th scope="col">Fecha</th>
            <th scope="col">Cliente</th>
            <th scope="col">Total</th>
            <th scope="col">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="text-break">{order.id}</td>
              <td>{dateLabel(order.fecha)}</td>
              <td>{order.cliente.nombre}</td>
              <td>{formatCLP(order.total)}</td>
              <td>
                <Link className="btn btn-sm btn-outline-dark" to={`/admin/ordenes/${order.id}`}>
                  Ver comprobante<span className="visually-hidden"> {order.id}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Orders() {
  const { orders } = useShop();
  return (
    <>
      <PageTitle title="Pedidos y comprobantes" />
      <p>Pedidos completados mediante el pago simulado de la tienda.</p>
      <OrderTable orders={[...orders].reverse()} />
    </>
  );
}

function Receipt() {
  const { id } = useParams();
  const { orders } = useShop();
  const order = orders.find((item) => sameId(item.id, id));
  if (!order) return <NotFound>El pedido solicitado no existe.</NotFound>;
  return (
    <>
      <PageTitle title="Comprobante de compra">
        <Link to="/admin/ordenes">Volver a pedidos</Link>
      </PageTitle>
      <article className="panel">
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
          <div>
            <p className="eyebrow">VESPER夜</p>
            <h3 className="h5 text-break">Pedido {order.id}</h3>
            <p>{dateLabel(order.fecha)}</p>
          </div>
          <span className="badge text-bg-success align-self-start">Pago simulado aprobado</span>
        </div>
        <div className="row mb-4">
          <div className="col-md-6">
            <h4 className="h6">Cliente</h4>
            <p className="mb-1">{order.cliente.nombre}</p>
            <p className="mb-1 text-break">{order.cliente.email}</p>
            <p>{order.cliente.telefono}</p>
          </div>
          <div className="col-md-6">
            <h4 className="h6">Entrega</h4>
            {order.cliente.entrega === 'retiro' ? (
              <p>Retiro en tienda · Santiago</p>
            ) : (
              <p>
                {order.cliente.direccion}
                <br />
                {order.cliente.comuna}, {order.cliente.region}
              </p>
            )}
          </div>
        </div>
        <div className="table-responsive mb-3">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Precio unitario</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td>{item.nombre}</td>
                  <td>{formatCLP(item.precio)}</td>
                  <td>{item.cantidad}</td>
                  <td>{formatCLP(item.precio * item.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="row ms-auto mb-0" style={{ maxWidth: 370 }}>
          <dt className="col-6">Productos</dt>
          <dd className="col-6 text-end">{formatCLP(order.subtotal)}</dd>
          <dt className="col-6">Envío</dt>
          <dd className="col-6 text-end">{formatCLP(order.envio)}</dd>
          <dt className="col-6 fs-5">Total</dt>
          <dd className="col-6 text-end fs-5 fw-bold">{formatCLP(order.total)}</dd>
        </dl>
        <p className="small text-secondary mt-3 mb-0">
          Comprobante académico de una compra simulada. No constituye una boleta tributaria.
        </p>
      </article>
    </>
  );
}

function Reports() {
  const { products, orders, categories } = useShop();
  const critical = products.filter((product) => product.stock <= 5);
  const sales = orders.reduce((sum, order) => sum + order.total, 0);
  const units = orders.reduce(
    (sum, order) => sum + order.items.reduce((count, item) => count + item.cantidad, 0),
    0,
  );
  const sold = new Map();
  orders.forEach((order) =>
    order.items.forEach((item) => {
      const previous = sold.get(item.productId) || { nombre: item.nombre, cantidad: 0, total: 0 };
      sold.set(item.productId, {
        ...previous,
        cantidad: previous.cantidad + item.cantidad,
        total: previous.total + item.cantidad * item.precio,
      });
    }),
  );
  return (
    <>
      <PageTitle title="Reportes" />
      <div className="row g-3 mb-4">
        <Stat label="Ventas con envío" value={formatCLP(sales)} />
        <Stat label="Pedidos" value={orders.length} />
        <Stat label="Unidades vendidas" value={units} />
        <Stat label="Stock crítico" value={critical.length} />
      </div>
      <section className="panel mb-4" aria-labelledby="critical-stock-title">
        <h3 className="h5" id="critical-stock-title">
          Productos con stock crítico
        </h3>
        <p className="small">Productos con cinco unidades o menos, incluidos los agotados.</p>
        {!critical.length ? (
          <p className="mb-0">No hay productos con stock crítico.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {critical.map((product) => (
                  <tr key={product.id}>
                    <td>{product.nombre}</td>
                    <td>{product.stock}</td>
                    <td>
                      <Link to={`/admin/productos/${product.id}`}>Actualizar stock</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="panel mb-4" aria-labelledby="sales-report-title">
        <h3 className="h5" id="sales-report-title">
          Ventas por producto
        </h3>
        {!sold.size ? (
          <p className="mb-0">Los resultados aparecerán al completar la primera compra.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Unidades</th>
                  <th scope="col">Venta sin envío</th>
                </tr>
              </thead>
              <tbody>
                {[...sold.entries()]
                  .sort((a, b) => b[1].cantidad - a[1].cantidad)
                  .map(([id, item]) => (
                    <tr key={id}>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatCLP(item.total)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="panel" aria-labelledby="inventory-report-title">
        <h3 className="h5" id="inventory-report-title">
          Inventario por categoría
        </h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Categoría</th>
                <th scope="col">Productos</th>
                <th scope="col">Unidades disponibles</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const entries = products.filter((product) => product.categoria === category.nombre);
                return (
                  <tr key={category.id}>
                    <td>{category.nombre}</td>
                    <td>{entries.length}</td>
                    <td>{entries.reduce((sum, product) => sum + product.stock, 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Profile() {
  const { session, users } = useShop();
  const original = users.find((user) => sameId(user.id, session.id));
  const [values, setValues] = useState(() => ({ ...userDefaults, ...original }));
  const feedback = useFeedback();
  const change = (key) => (value) => setValues((previous) => ({ ...previous, [key]: value }));
  const save = (event) => {
    event.preventDefault();
    const { nombre, email, telefono, direccion, comuna, region } = values;
    feedback.run(
      () => store.saveProfile({ nombre, email, telefono, direccion, comuna, region }),
      'Perfil actualizado.',
    );
  };
  return (
    <>
      <PageTitle title="Mi perfil" />
      <Feedback {...feedback} />
      <form className="panel" onSubmit={save}>
        <UserFields profile values={values} change={change} />
        <button type="submit" className="btn btn-vesper">
          Guardar perfil
        </button>
      </form>
    </>
  );
}

export default function AdminPages() {
  const { session } = useShop();
  const location = useLocation();
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (session.role !== 'admin')
    return (
      <div className="container section-pad">
        <h1 className="h2">Acceso reservado a administradores</h1>
        <p>Tu cuenta no tiene permisos para administrar la tienda.</p>
        <Link to="/" className="btn btn-vesper">
          Volver al catálogo
        </Link>
      </div>
    );
  const links = [
    ['', 'Resumen'],
    ['productos', 'Productos'],
    ['categorias', 'Categorías'],
    ['usuarios', 'Usuarios'],
    ['ordenes', 'Pedidos'],
    ['reportes', 'Reportes'],
    ['perfil', 'Mi perfil'],
  ];
  return (
    <div className="container">
      <header className="page-title">
        <p className="eyebrow">ADMINISTRACIÓN</p>
        <h1>Panel Vesper</h1>
        <p>Gestiona el catálogo, los clientes y los pedidos de tu tienda.</p>
      </header>
      <div className="row g-4">
        <aside className="col-lg-3">
          <nav className="panel p-2 nav flex-row flex-lg-column gap-1" aria-label="Administración">
            {links.map(([path, label]) => (
              <NavLink
                key={path}
                to={`/admin${path ? `/${path}` : ''}`}
                end={!path}
                className={({ isActive }) =>
                  `btn text-start ${isActive ? 'btn-vesper' : 'btn-light'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section className="col-lg-9" aria-label="Contenido administrativo">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<ProductList />} />
            <Route path="productos/nuevo" element={<ProductForm key="new-product" />} />
            <Route path="productos/:id" element={<ProductForm />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="usuarios" element={<UserList />} />
            <Route path="usuarios/nuevo" element={<UserForm key="new-user" />} />
            <Route path="usuarios/:id" element={<UserForm />} />
            <Route path="ordenes" element={<Orders />} />
            <Route path="ordenes/:id" element={<Receipt />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="*" element={<NotFound>Esta sección no existe.</NotFound>} />
          </Routes>
        </section>
      </div>
    </div>
  );
}
