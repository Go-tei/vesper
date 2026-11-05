import { createStore, priceFor, formatCLP } from '../src/services/store.js';

function storageMock(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}
const delivery = {
  nombre: 'Cliente Prueba',
  email: 'cliente@example.cl',
  telefono: '+56912345678',
  direccion: 'Calle Uno 123',
  comuna: 'Santiago',
  region: 'Metropolitana',
  entrega: 'despacho',
};

describe('Persistencia y reglas de negocio de Vesper', () => {
  let storage;
  let sessionStorage;
  let db;
  beforeEach(() => {
    storage = storageMock();
    sessionStorage = storageMock();
    db = createStore({ storage, sessionStorage });
  });

  it('mantiene una referencia estable para React hasta cambiar los datos', () => {
    const first = db.getSnapshot();
    expect(db.getSnapshot()).toBe(first);
    expect(Object.isFrozen(first.products[0])).toBeTrue();
    const listener = jasmine.createSpy('listener');
    const unsubscribe = db.subscribe(listener);
    db.addToCart(1);
    expect(db.getSnapshot()).not.toBe(first);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    db.removeFromCart(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('migra productos personalizados y carritos anteriores sin restaurar el seed', () => {
    storage = storageMock({
      vesper_products: JSON.stringify([
        {
          id: 99,
          nombre: 'Producto conservado',
          categoria: 'Edición limitada',
          precio: 20000,
          descripcion: 'Descripción de prueba',
          imagen: 'assets/img/sopranos-hoodie-real.png',
        },
      ]),
      vesper_cart: JSON.stringify([{ productId: 99, cantidad: 2 }]),
    });
    db = createStore({ storage, sessionStorage });
    expect(db.getSnapshot().products.length).toBe(1);
    expect(db.getSnapshot().products[0].nombre).toBe('Producto conservado');
    expect(
      db.getSnapshot().categories.some((category) => category.nombre === 'Edición limitada'),
    ).toBeTrue();
    expect(db.getSnapshot().cart[0].cantidad).toBe(2);
  });

  it('recupera almacenamiento corrupto sin romper la aplicación', () => {
    db = createStore({
      storage: storageMock({
        vesper_store_v2: '{malformado',
        vesper_cart: 'null',
        vesper_products: 'false',
      }),
      sessionStorage,
    });
    expect(db.getSnapshot().products.length).toBe(13);
    expect(db.getSnapshot().cart).toEqual([]);
  });

  it('autentica sin distinguir mayúsculas y no expone la contraseña en sesión', () => {
    expect(() => db.login('admin@vesper.cl', 'incorrecta')).toThrowError(/incorrectos/);
    const session = db.login(' ADMIN@VESPER.CL ', 'admin123');
    expect(session.role).toBe('admin');
    expect(session.password).toBeUndefined();
    expect(JSON.parse(sessionStorage.getItem('vesper_session')).password).toBeUndefined();
    db.logout();
    expect(db.getSnapshot().session).toBeNull();
  });

  it('registra usuarios, evita correos duplicados y fuerza rol de cliente', () => {
    const session = db.register({ ...delivery, password: 'segura123', role: 'admin' });
    expect(session.role).toBe('usuario');
    expect(() => db.register({ ...delivery, password: 'segura123' })).toThrowError(/correo/);
    db.saveProfile({ ...delivery, nombre: 'Nuevo Nombre' });
    expect(db.getSnapshot().session.nombre).toBe('Nuevo Nombre');
  });

  it('impide operaciones administrativas a visitantes y clientes', () => {
    expect(() => db.deleteProduct(1)).toThrowError(/administrador/);
    db.login('usuario@vesper.cl', 'user123');
    expect(() => db.saveCategory({ nombre: 'Prueba' })).toThrowError(/administrador/);
  });

  it('crea, consulta, actualiza y elimina un producto, persistiendo los cambios', () => {
    db.login('admin@vesper.cl', 'admin123');
    const product = db.saveProduct({
      nombre: 'Polera de prueba',
      categoria: 'Polera',
      precio: 18000,
      stock: 5,
      descuento: 10,
      descripcion: 'Descripción para prueba CRUD',
      imagen: 'assets/img/twinpeaks-tee-real.png',
    });
    expect(db.getSnapshot().products.find((item) => item.id === product.id).stock).toBe(5);
    db.saveProduct({ ...product, precio: 20000 });
    const reloaded = createStore({ storage, sessionStorage });
    expect(reloaded.getSnapshot().products.find((item) => item.id === product.id).precio).toBe(
      20000,
    );
    db.deleteProduct(product.id);
    expect(db.getSnapshot().products.some((item) => item.id === product.id)).toBeFalse();
  });

  it('rechaza precios, stock, imágenes y descuentos inválidos', () => {
    db.login('admin@vesper.cl', 'admin123');
    const product = db.getSnapshot().products[0];
    expect(() => db.saveProduct({ ...product, precio: -1 })).toThrowError(/precio/);
    expect(() => db.saveProduct({ ...product, stock: 1.5 })).toThrowError(/stock/);
    expect(() => db.saveProduct({ ...product, descuento: 99 })).toThrowError(/descuento/);
    expect(() => db.saveProduct({ ...product, imagen: 'javascript:alert(1)' })).toThrowError(
      /imagen/,
    );
  });

  it('propaga nombres de categoría y protege categorías con productos', () => {
    db.login('admin@vesper.cl', 'admin123');
    db.saveCategory({ id: 1, nombre: 'Poleras gráficas' });
    expect(db.getSnapshot().products.find((product) => product.id === 2).categoria).toBe(
      'Poleras gráficas',
    );
    expect(() => db.deleteCategory(1)).toThrowError(/tiene productos/);
    const category = db.saveCategory({ nombre: 'Colección futura' });
    db.deleteCategory(category.id);
    expect(db.getSnapshot().categories.some((item) => item.id === category.id)).toBeFalse();
  });

  it('protege al administrador activo y conserva un administrador', () => {
    db.login('admin@vesper.cl', 'admin123');
    const admin = db.getSnapshot().users[0];
    expect(() => db.deleteUser(admin.id)).toThrowError(/propia cuenta/);
    expect(() => db.saveUser({ ...admin, role: 'usuario' })).toThrowError(/propio rol/);
    const user = db.saveUser({
      nombre: 'Usuario Nuevo',
      email: 'nuevo@example.cl',
      password: 'segura123',
      role: 'usuario',
    });
    db.saveUser({ ...user, nombre: 'Usuario Editado', password: '' });
    expect(db.getSnapshot().users.find((item) => item.id === user.id).nombre).toBe(
      'Usuario Editado',
    );
    db.deleteUser(user.id);
    expect(db.getSnapshot().users.some((item) => item.id === user.id)).toBeFalse();
  });

  it('agrupa cantidades del carrito y rechaza fracciones o exceso de stock', () => {
    db.addToCart(13, 2);
    db.addToCart(13);
    expect(db.getSnapshot().cart).toEqual([{ productId: 13, cantidad: 3 }]);
    expect(() => db.addToCart(13)).toThrowError(/Cantidad no disponible/);
    expect(() => db.updateQuantity(13, 1.5)).toThrowError(/entero/);
    db.updateQuantity(13, 2);
    expect(db.getSnapshot().cart[0].cantidad).toBe(2);
    db.removeFromCart(13);
    expect(db.getSnapshot().cart).toEqual([]);
  });

  it('reconcilia el carrito cuando el administrador reduce stock o elimina productos', () => {
    db.addToCart(1, 5);
    db.login('admin@vesper.cl', 'admin123');
    db.saveProduct({ ...db.getSnapshot().products[0], stock: 2 });
    expect(db.getSnapshot().cart[0].cantidad).toBe(2);
    db.deleteProduct(1);
    expect(db.getSnapshot().cart).toEqual([]);
  });

  it('conserva carrito, stock y pedidos al rechazar un pago', () => {
    db.addToCart(2, 2);
    const before = db.getSnapshot();
    expect(() => db.checkout(delivery, { fail: true })).toThrowError(/rechazado/);
    expect(db.getSnapshot()).toBe(before);
    expect(db.getSnapshot().orders).toEqual([]);
  });

  it('genera pedido con descuento, envío e instantánea independiente del catálogo', () => {
    db.login('usuario@vesper.cl', 'user123');
    db.addToCart(2, 2);
    const product = db.getSnapshot().products.find((item) => item.id === 2);
    const order = db.checkout(delivery);
    expect(order.subtotal).toBe(priceFor(product) * 2);
    expect(order.envio).toBe(3990);
    expect(order.total).toBe(order.subtotal + 3990);
    expect(order.userId).toBe(2);
    expect(db.getSnapshot().cart).toEqual([]);
    expect(db.getSnapshot().products.find((item) => item.id === 2).stock).toBe(product.stock - 2);
    order.items[0].nombre = 'Mutación externa';
    expect(db.getSnapshot().orders[0].items[0].nombre).toBe(product.nombre);
    db.login('admin@vesper.cl', 'admin123');
    db.deleteProduct(2);
    expect(db.getSnapshot().orders[0].items[0].nombre).toBe(product.nombre);
  });

  it('permite retiro sin dirección y valida los datos de despacho y carrito vacío', () => {
    expect(() => db.checkout(delivery)).toThrowError(/Agrega productos/);
    db.addToCart(1);
    expect(() => db.checkout({ ...delivery, direccion: '' })).toThrowError(/dirección/);
    const order = db.checkout({
      ...delivery,
      entrega: 'retiro',
      direccion: '',
      comuna: '',
      region: '',
    });
    expect(order.envio).toBe(0);
    expect(order.userId).toBeNull();
  });

  it('conserva el estado si la persistencia falla durante una compra', () => {
    db.addToCart(1);
    const before = db.getSnapshot();
    spyOn(storage, 'setItem').and.throwError('QuotaExceededError');
    expect(() => db.checkout(delivery)).toThrowError(/No se pudieron guardar/);
    expect(db.getSnapshot()).toBe(before);
  });

  it('valida y guarda consultas locales y aplica formato monetario chileno', () => {
    expect(() => db.sendMessage({ ...delivery, motivo: '', mensaje: 'Hola' })).toThrowError(
      /motivo/,
    );
    db.sendMessage({
      ...delivery,
      motivo: 'Tallas y stock',
      mensaje: 'Necesito información de tallas.',
    });
    expect(db.getSnapshot().messages.length).toBe(1);
    expect(formatCLP(1000)).toContain('1.000');
  });
});
