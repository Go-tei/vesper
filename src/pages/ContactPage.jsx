import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { store } from '../services/store';
import { PageTitle } from '../components/Layout';
import Field from '../components/Field';
import Feedback from '../components/Feedback';
export default function ContactPage() {
  const { session } = useShop();
  const [data, setData] = useState({
    nombre: session?.nombre || '',
    email: session?.email || '',
    motivo: '',
    mensaje: '',
  });
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  function change(e) {
    setData({ ...data, [e.target.name]: e.target.value });
    setSent(false);
  }
  function submit(e) {
    e.preventDefault();
    setSent(false);
    try {
      store.sendMessage(data);
      setSent(true);
      setError('');
      setData({ ...data, motivo: '', mensaje: '' });
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <section className="container">
      <PageTitle eyebrow="HABLEMOS" title="Contacto">
        Consultas de stock, tallas y colaboraciones. Estamos al otro lado.
      </PageTitle>
      <form className="panel mx-auto" style={{ maxWidth: 760 }} onSubmit={submit} noValidate>
        <Feedback message={error} />
        <Feedback
          type="success"
          message={
            sent ? 'Consulta guardada en este navegador. Esta demostración no envía correos.' : ''
          }
        />
        <div className="row">
          <div className="col-md-6">
            <Field
              label="Nombre"
              name="nombre"
              value={data.nombre}
              onChange={change}
              required
              minLength={3}
            />
          </div>
          <div className="col-md-6">
            <Field
              label="Correo"
              name="email"
              type="email"
              value={data.email}
              onChange={change}
              required
            />
          </div>
        </div>
        <label className="form-label" htmlFor="motivo">
          Motivo
        </label>
        <select
          className="form-select mb-3"
          id="motivo"
          name="motivo"
          value={data.motivo}
          onChange={change}
          required
        >
          <option value="">Selecciona un motivo</option>
          {['Consulta por producto', 'Tallas y stock', 'Colaboración', 'Otro'].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <label className="form-label" htmlFor="mensaje">
          Mensaje
        </label>
        <textarea
          className="form-control mb-3"
          id="mensaje"
          name="mensaje"
          rows="5"
          minLength="10"
          maxLength="2000"
          value={data.mensaje}
          onChange={change}
          required
        />
        <button className="btn btn-vesper">Enviar consulta</button>
      </form>
    </section>
  );
}
