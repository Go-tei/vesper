import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { store } from '../services/store';
import Field from '../components/Field';
import Feedback from '../components/Feedback';
import { PageTitle } from '../components/Layout';
import { Receipt } from './CartPages';
export function AuthPage({ register = false }) {
  const { session } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({ nombre: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const target =
    (typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname) || '/perfil';
  if (session) return <Navigate to={session.role === 'admin' ? '/admin' : target} replace />;
  function submit(e) {
    e.preventDefault();
    try {
      if (register) {
        if (data.password !== data.confirm) throw new Error('Las contraseñas no coinciden.');
        store.register(data);
      } else store.login(data.email, data.password);
      const current = store.getSnapshot().session;
      navigate(current.role === 'admin' ? '/admin' : target, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <section className="container login-shell">
      <div className="login-card">
        <p className="eyebrow">TU CUENTA VESPER</p>
        <h1 className="h2">{register ? 'Crear cuenta' : 'Bienvenido de vuelta'}</h1>
        <p>
          {register
            ? 'Guarda tus datos y revisa tus pedidos.'
            : 'Ingresa para continuar tu historia.'}
        </p>
        <form onSubmit={submit} noValidate>
          <Feedback message={error} />
          {(register
            ? [
                ['nombre', 'Nombre', 'text'],
                ['email', 'Correo', 'email'],
                ['password', 'Contraseña', 'password'],
                ['confirm', 'Repetir contraseña', 'password'],
              ]
            : [
                ['email', 'Correo', 'email'],
                ['password', 'Contraseña', 'password'],
              ]
          ).map(([name, label, type]) => (
            <Field
              key={name}
              name={name}
              label={label}
              type={type}
              value={data[name]}
              onChange={(e) => setData({ ...data, [name]: e.target.value })}
              autoComplete={
                name === 'password'
                  ? register
                    ? 'new-password'
                    : 'current-password'
                  : name === 'email'
                    ? 'username'
                    : undefined
              }
              required
            />
          ))}
          <button className="btn btn-vesper w-100">{register ? 'Crear cuenta' : 'Ingresar'}</button>
        </form>
        <p className="mt-3">
          {register ? '¿Ya tienes cuenta?' : '¿Primera vez?'}{' '}
          <Link to={register ? '/login' : '/registro'} state={location.state}>
            {register ? 'Iniciar sesión' : 'Regístrate'}
          </Link>
        </p>
        {!register && (
          <details className="small-note">
            <summary>Cuentas para la demostración</summary>
            <p className="mt-2">
              Administrador: admin@vesper.cl / admin123
              <br />
              Cliente: usuario@vesper.cl / user123
            </p>
            <p>Usa datos ficticios. Las cuentas de esta versión se guardan localmente.</p>
          </details>
        )}
      </div>
    </section>
  );
}
export function ProfilePage() {
  const { session, orders } = useShop();
  const location = useLocation();
  const [data, setData] = useState(() => ({
    nombre: session?.nombre || '',
    email: session?.email || '',
    telefono: session?.telefono || '',
    direccion: session?.direccion || '',
    comuna: session?.comuna || '',
    region: session?.region || '',
    password: '',
  }));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  function submit(e) {
    e.preventDefault();
    try {
      store.saveProfile(data);
      setMessage('Perfil actualizado.');
      setError('');
      setData({ ...data, password: '' });
    } catch (err) {
      setError(err.message);
      setMessage('');
    }
  }
  return (
    <section className="container">
      <PageTitle eyebrow="TU ESPACIO" title="Mi perfil" />
      <div className="row g-4">
        <div className="col-lg-5">
          <form className="panel" onSubmit={submit} noValidate>
            <h2 className="h4">Mis datos</h2>
            <Feedback message={error} />
            <Feedback message={message} type="success" />
            {[
              ['nombre', 'Nombre', 'text'],
              ['email', 'Correo', 'email'],
              ['telefono', 'Teléfono', 'tel'],
              ['direccion', 'Dirección', 'text'],
              ['comuna', 'Comuna', 'text'],
              ['region', 'Región', 'text'],
              ['password', 'Nueva contraseña (opcional)', 'password'],
            ].map(([name, label, type]) => (
              <Field
                key={name}
                name={name}
                label={label}
                type={type}
                value={data[name]}
                onChange={(e) => setData({ ...data, [name]: e.target.value })}
              />
            ))}
            <button className="btn btn-vesper">Guardar perfil</button>
          </form>
        </div>
        <div className="col-lg-7">
          <h2 className="h4">Mi historial de compras</h2>
          {orders.filter((o) => String(o.userId) === String(session.id)).length ? (
            orders
              .filter((o) => String(o.userId) === String(session.id))
              .slice()
              .reverse()
              .map((order) => (
                <details key={order.id} className="mb-3">
                  <summary className="panel">
                    Pedido {order.id} · {new Date(order.fecha).toLocaleDateString('es-CL')}
                  </summary>
                  <Receipt order={order} />
                </details>
              ))
          ) : (
            <div className="empty-state">
              Aún no tienes pedidos. <Link to="/productos">Explorar catálogo</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
