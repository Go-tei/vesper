import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProductCard } from '../src/components/ProductCard';
import { ProductList } from '../src/components/ProductList';
import Feedback from '../src/components/Feedback';
import Field from '../src/components/Field';
import CatalogPage from '../src/pages/CatalogPage';
import ContactPage from '../src/pages/ContactPage';
import { AuthPage } from '../src/pages/AuthPages';
import { CartPage, CheckoutPage, SuccessPage, PaymentErrorPage } from '../src/pages/CartPages';
import { store, formatCLP, priceFor } from '../src/services/store';
import { mount, change, click, submit } from './helpers';

const product = {
  id: 42,
  nombre: 'Polera Twin Peaks',
  categoria: 'Polera',
  precio: 20000,
  descripcion: 'Polera de algodón inspirada en la Red Room.',
  imagen: 'assets/img/twinpeaks-tee-real.png',
  stock: 4,
  descuento: 0,
};

describe('Componentes React: renderizado, propiedades, estado y eventos', () => {
  let view;
  afterEach(() => {
    if (view) view.unmount();
    view = null;
  });

  it('renderiza los datos del producto recibidos por props', () => {
    view = mount(<ProductCard product={product} onAdd={() => {}} />);
    expect(view.container.textContent).toContain(product.nombre);
    expect(view.container.textContent).toContain(formatCLP(product.precio));
    expect(view.container.querySelector('img').getAttribute('alt')).toBe(product.nombre);
  });

  it('enlaza cada tarjeta al detalle de su producto', () => {
    view = mount(<ProductCard product={product} onAdd={() => {}} />);
    expect(view.container.querySelector('a[href="/productos/42"]')).not.toBeNull();
  });

  it('ejecuta una sola vez el callback al agregar el producto', () => {
    const onAdd = jasmine.createSpy('onAdd');
    view = mount(<ProductCard product={product} onAdd={onAdd} />);
    click(view.container.querySelector('button'));
    expect(onAdd).toHaveBeenCalledOnceWith(product.id);
  });

  it('bloquea la compra de un producto sin stock', () => {
    const onAdd = jasmine.createSpy('onAdd');
    view = mount(<ProductCard product={{ ...product, stock: 0 }} onAdd={onAdd} />);
    const button = view.container.querySelector('button');
    expect(button.disabled).toBeTrue();
    click(button);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('muestra el precio con descuento y la rebaja del producto', () => {
    const offer = { ...product, descuento: 25 };
    view = mount(<ProductCard product={offer} onAdd={() => {}} />);
    expect(view.container.textContent).toContain(formatCLP(priceFor(offer)));
    expect(view.container.textContent).toContain('25');
  });

  it('renderiza todos los productos de una lista', () => {
    view = mount(
      <ProductList
        products={[product, { ...product, id: 43, nombre: 'Polerón Vesper' }]}
        onAdd={() => {}}
      />,
    );
    expect(view.container.querySelectorAll('article').length).toBe(2);
    expect(view.container.textContent).toContain('Polerón Vesper');
  });

  it('informa cuando la lista de productos está vacía', () => {
    view = mount(<ProductList products={[]} onAdd={() => {}} />);
    expect(view.container.textContent).toContain('No hay productos');
    expect(view.container.querySelector('article')).toBeNull();
  });

  it('oculta el mensaje de error cuando no hay error', () => {
    view = mount(<Feedback message="" />);
    expect(view.container.querySelector('[role="alert"]')).toBeNull();
    expect(view.container.textContent).toBe('');
  });

  it('muestra un error condicional con rol de alerta', () => {
    view = mount(<Feedback message="Correo inválido" />);
    expect(view.container.querySelector('[role="alert"]').textContent).toContain('Correo inválido');
  });

  it('anuncia los mensajes de éxito como estado', () => {
    view = mount(<Feedback message="Producto guardado" type="success" />);
    expect(view.container.querySelector('[role="status"]').textContent).toContain(
      'Producto guardado',
    );
  });

  it('asocia la etiqueta y el valor al campo recibido por props', () => {
    view = mount(<Field label="Nombre" name="nombre" value="Vesper" onChange={() => {}} />);
    const input = view.container.querySelector('input');
    const label = view.container.querySelector('label');
    expect(input.value).toBe('Vesper');
    expect(label.htmlFor).toBe(input.id);
  });

  it('propaga un evento de entrada al callback del campo', () => {
    const onChange = jasmine.createSpy('onChange');
    view = mount(<Field label="Nombre" name="nombre" value="" onChange={onChange} />);
    change(view.container.querySelector('input'), 'Ana');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('actualiza el DOM cuando cambia el estado de un formulario controlado', () => {
    function ControlledForm() {
      const [value, setValue] = useState('');
      return (
        <>
          <Field
            label="Nombre"
            name="nombre"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <output>{value}</output>
        </>
      );
    }
    view = mount(<ControlledForm />);
    change(view.container.querySelector('input'), 'María');
    expect(view.container.querySelector('input').value).toBe('María');
    expect(view.container.querySelector('output').textContent).toBe('María');
  });

  it('muestra el error de validación junto al campo', () => {
    view = mount(
      <Field
        label="Correo"
        name="email"
        value=""
        onChange={() => {}}
        error="Ingresa un correo válido."
      />,
    );
    expect(view.container.textContent).toContain('Ingresa un correo válido.');
    expect(view.container.querySelector('input').getAttribute('aria-invalid')).toBe('true');
  });
});

describe('Catálogo React: filtros y navegación', () => {
  let view;
  const second = {
    ...product,
    id: 43,
    nombre: 'Polerón Vesper',
    categoria: 'Polerón',
    descuento: 20,
  };
  const snapshot = {
    products: [product, second],
    categories: [
      { id: 1, nombre: 'Polera' },
      { id: 2, nombre: 'Polerón' },
    ],
    cart: [],
    session: null,
    users: [],
    orders: [],
    messages: [],
  };
  afterEach(() => {
    if (view) view.unmount();
    view = null;
  });

  it('filtra el catálogo al escribir en el buscador controlado', () => {
    view = mount(<CatalogPage />, { snapshot });
    change(view.container.querySelector('input[type="search"]'), 'Twin');
    expect(view.container.querySelectorAll('article').length).toBe(1);
    expect(view.container.querySelector('article').textContent).toContain('Twin Peaks');
  });

  it('filtra el catálogo al seleccionar una categoría', () => {
    view = mount(<CatalogPage />, { snapshot });
    change(view.container.querySelector('select'), 'Polerón');
    expect(view.container.querySelectorAll('article').length).toBe(1);
    expect(view.container.querySelector('article').textContent).toContain('Polerón Vesper');
  });

  it('muestra solamente productos rebajados en la vista de ofertas', () => {
    view = mount(<CatalogPage offersOnly />, { snapshot, route: '/ofertas' });
    expect(view.container.querySelectorAll('article').length).toBe(1);
    expect(view.container.querySelector('article').textContent).toContain('Polerón Vesper');
  });

  it('informa sin coincidencias cuando ningún producto satisface la búsqueda', () => {
    view = mount(<CatalogPage />, { snapshot });
    change(view.container.querySelector('input[type="search"]'), 'No existe');
    expect(view.container.querySelector('article')).toBeNull();
    expect(view.container.textContent).toContain('No hay productos');
  });
});

describe('Formularios y carrito: integración con el servicio simulado', () => {
  let view;
  const session = {
    id: 2,
    nombre: 'Ana Pérez',
    email: 'ana@example.cl',
    telefono: '912345678',
    direccion: 'Avenida Uno 123',
    comuna: 'Santiago',
    region: 'Metropolitana',
    role: 'usuario',
  };
  const snapshot = {
    products: [product],
    categories: [],
    cart: [{ productId: product.id, cantidad: 2 }],
    session,
    users: [],
    orders: [],
    messages: [],
  };
  afterEach(() => {
    if (view) view.unmount();
    view = null;
  });

  it('autocompleta los datos del usuario conectado en contacto', () => {
    view = mount(<ContactPage />, { snapshot });
    expect(view.container.querySelector('[name="nombre"]').value).toBe(session.nombre);
    expect(view.container.querySelector('[name="email"]').value).toBe(session.email);
    expect(view.container.querySelector('[role="alert"]')).toBeNull();
  });

  it('envía los campos controlados de contacto al servicio y muestra confirmación', () => {
    const send = spyOn(store, 'sendMessage').and.returnValue({ id: 'consulta-1' });
    view = mount(<ContactPage />, { snapshot });
    change(view.container.querySelector('select'), 'Tallas y stock');
    change(view.container.querySelector('textarea'), 'Quisiera conocer las tallas disponibles.');
    submit(view.container.querySelector('form'));
    expect(send).toHaveBeenCalledOnceWith({
      nombre: session.nombre,
      email: session.email,
      motivo: 'Tallas y stock',
      mensaje: 'Quisiera conocer las tallas disponibles.',
    });
    expect(view.container.querySelector('[role="status"]').textContent).toContain(
      'Consulta guardada',
    );
    expect(view.container.querySelector('textarea').value).toBe('');
  });

  it('conserva los datos y muestra el error cuando falla la validación del servicio', () => {
    spyOn(store, 'sendMessage').and.throwError('Ingresa un mensaje de al menos 10 caracteres.');
    view = mount(<ContactPage />, { snapshot });
    change(view.container.querySelector('textarea'), 'Hola');
    submit(view.container.querySelector('form'));
    expect(view.container.querySelector('[role="alert"]').textContent).toContain('al menos 10');
    expect(view.container.querySelector('textarea').value).toBe('Hola');
    expect(view.container.querySelector('[role="status"]')).toBeNull();
  });

  it('calcula el subtotal del carrito según la cantidad', () => {
    view = mount(<CartPage />, { snapshot });
    expect(view.container.querySelector('input[type="number"]').value).toBe('2');
    expect(view.container.textContent).toContain(formatCLP(product.precio * 2));
    expect(view.container.querySelector('a[href="/checkout"]')).not.toBeNull();
  });

  it('propaga al servicio el cambio de cantidad del producto correcto', () => {
    const update = spyOn(store, 'updateQuantity');
    view = mount(<CartPage />, { snapshot });
    change(view.container.querySelector('input[type="number"]'), '3');
    expect(update).toHaveBeenCalledOnceWith(product.id, 3);
  });

  it('elimina del carrito el producto elegido por el usuario', () => {
    const remove = spyOn(store, 'removeFromCart');
    view = mount(<CartPage />, { snapshot });
    click(view.container.querySelector('button'));
    expect(remove).toHaveBeenCalledOnceWith(product.id);
  });

  it('informa el carrito vacío y oculta el acceso al checkout', () => {
    view = mount(<CartPage />, { snapshot: { ...snapshot, cart: [] } });
    expect(view.container.textContent).toContain('Tu carrito está vacío');
    expect(view.container.querySelector('a[href="/checkout"]')).toBeNull();
  });

  it('autocompleta nombre y dirección del usuario en el checkout', () => {
    view = mount(<CheckoutPage />, { snapshot });
    expect(view.container.querySelector('[name="nombre"]').value).toBe(session.nombre);
    expect(view.container.querySelector('[name="direccion"]').value).toBe(session.direccion);
    expect(view.container.querySelector('[name="email"]').value).toBe(session.email);
  });

  it('actualiza el total y oculta la dirección al elegir retiro gratuito', () => {
    view = mount(<CheckoutPage />, { snapshot });
    const button = view.container.querySelector('button');
    expect(button.textContent).toContain(formatCLP(product.precio * 2 + 3990));
    change(view.container.querySelector('#entrega'), 'retiro');
    expect(view.container.querySelector('[name="direccion"]')).toBeNull();
    expect(button.textContent).toContain(formatCLP(product.precio * 2));
  });
});

describe('Navegación de acceso y resultado de compra', () => {
  let view;
  const client = {
    id: 2,
    nombre: 'Ana Pérez',
    email: 'ana@example.cl',
    telefono: '912345678',
    direccion: 'Avenida Uno 123',
    comuna: 'Santiago',
    region: 'Metropolitana',
    role: 'usuario',
  };
  const order = {
    id: 'prueba-1',
    fecha: '2026-11-05T13:00:00.000Z',
    cliente: { ...client, entrega: 'despacho' },
    items: [{ productId: product.id, nombre: product.nombre, precio: 20000, cantidad: 2 }],
    subtotal: 40000,
    envio: 3990,
    total: 43990,
  };
  const snapshot = {
    products: [product],
    categories: [],
    cart: [{ productId: product.id, cantidad: 2 }],
    session: client,
    users: [],
    orders: [order],
    messages: [],
  };
  afterEach(() => {
    view?.unmount();
    view = null;
  });

  function openCheckout() {
    view = mount(
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/compra/:id" element={<SuccessPage />} />
        <Route path="/pago-error" element={<PaymentErrorPage />} />
      </Routes>,
      { snapshot, route: '/checkout' },
    );
  }

  it('navega al comprobante y muestra el resumen cuando el servicio aprueba la compra', () => {
    const checkout = spyOn(store, 'checkout').and.returnValue(order);
    openCheckout();
    submit(view.container.querySelector('form'));
    expect(checkout).toHaveBeenCalledOnceWith(
      {
        nombre: client.nombre,
        email: client.email,
        telefono: client.telefono,
        direccion: client.direccion,
        comuna: client.comuna,
        region: client.region,
        entrega: 'despacho',
      },
      { fail: false },
    );
    expect(view.container.querySelector('h1').textContent).toBe('Tu compra fue exitosa');
    expect(view.container.textContent).toContain('prueba-1');
    expect(view.container.textContent).toContain(formatCLP(order.total));
  });

  it('navega al fallo y permite reintentar cuando se rechaza el pago simulado', () => {
    const checkout = spyOn(store, 'checkout').and.throwError('El pago fue rechazado.');
    openCheckout();
    change(view.container.querySelector('#pago'), 'fallido');
    submit(view.container.querySelector('form'));
    expect(checkout).toHaveBeenCalledWith(jasmine.any(Object), { fail: true });
    expect(view.container.querySelector('h1').textContent).toBe('No se pudo realizar el pago');
    expect(view.container.querySelector('a[href="/checkout"]').textContent).toContain('Reintentar');
  });

  it('muestra las credenciales inválidas sin abandonar el formulario de ingreso', () => {
    spyOn(store, 'login').and.throwError('Correo o contraseña incorrectos.');
    view = mount(<AuthPage />, { snapshot: { ...snapshot, session: null } });
    change(view.container.querySelector('[name="email"]'), 'ana@example.cl');
    change(view.container.querySelector('[name="password"]'), 'incorrecta');
    submit(view.container.querySelector('form'));
    expect(view.container.querySelector('[role="alert"]').textContent).toContain('incorrectos');
    expect(view.container.querySelector('form')).not.toBeNull();
  });

  it('impide registrar cuando la confirmación de contraseña no coincide', () => {
    const register = spyOn(store, 'register');
    view = mount(<AuthPage register />, { snapshot: { ...snapshot, session: null } });
    change(view.container.querySelector('[name="password"]'), 'segura123');
    change(view.container.querySelector('[name="confirm"]'), 'otra123');
    submit(view.container.querySelector('form'));
    expect(register).not.toHaveBeenCalled();
    expect(view.container.querySelector('[role="alert"]').textContent).toContain('no coinciden');
  });

  it('envía las credenciales y abre el perfil después de iniciar sesión correctamente', () => {
    const login = spyOn(store, 'login').and.returnValue(client);
    spyOn(store, 'getSnapshot').and.returnValue(snapshot);
    view = mount(
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/perfil" element={<h1>Perfil del cliente</h1>} />
      </Routes>,
      { snapshot: { ...snapshot, session: null }, route: '/login' },
    );
    change(view.container.querySelector('[name="email"]'), client.email);
    change(view.container.querySelector('[name="password"]'), 'segura123');
    submit(view.container.querySelector('form'));
    expect(login).toHaveBeenCalledOnceWith(client.email, 'segura123');
    expect(view.container.querySelector('h1').textContent).toBe('Perfil del cliente');
  });
});
