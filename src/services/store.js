import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, DEFAULT_USERS } from '../data/seed.js';

const DATA_KEY = 'vesper_store_v2';
const SESSION_KEY = 'vesper_session';
const clone = (value) => JSON.parse(JSON.stringify(value));
const text = (value) => String(value ?? '').trim();
const sameId = (left, right) => String(left) === String(right);
const emailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const phoneValid = (value) =>
  /^\+?[\d\s()-]{8,20}$/.test(value) &&
  value.replace(/\D/g, '').length >= 8 &&
  value.replace(/\D/g, '').length <= 15;
const integer = (value, min, max) =>
  Number.isInteger(Number(value)) && Number(value) >= min && Number(value) <= max;
const safeImage = (value) => /^(assets\/img\/[\w.-]+|https:\/\/[^\s]+)$/.test(value);
const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const memoryStorage = () => {
  const entries = new Map();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: (key) => entries.delete(key),
  };
};
function browserStorage(name) {
  try {
    return globalThis[name] || memoryStorage();
  } catch {
    return memoryStorage();
  }
}
function read(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw == null ? clone(fallback) : JSON.parse(raw);
  } catch {
    return clone(fallback);
  }
}
const sessionFor = (user) =>
  user ? Object.fromEntries(Object.entries(user).filter(([key]) => key !== 'password')) : null;

export const formatCLP = (value) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
export const priceFor = (product) =>
  Math.round(product.precio * (1 - (product.descuento || 0) / 100));

/** Base de datos simulada: credenciales y roles locales, sin seguridad de servidor. */
export function createStore({
  storage = browserStorage('localStorage'),
  sessionStorage = browserStorage('sessionStorage'),
} = {}) {
  const listeners = new Set();
  const persisted = read(storage, DATA_KEY, null);
  const source =
    persisted && typeof persisted === 'object' && !Array.isArray(persisted)
      ? persisted
      : {
          products: read(storage, 'vesper_products', DEFAULT_PRODUCTS),
          users: read(storage, 'vesper_users', DEFAULT_USERS),
          cart: read(storage, 'vesper_cart', []),
          categories: DEFAULT_CATEGORIES,
          orders: [],
          messages: [],
        };
  const array = (value, fallback) => (Array.isArray(value) ? value : clone(fallback));
  const categories = array(source.categories, DEFAULT_CATEGORIES)
    .filter((item) => item?.id != null && text(item.nombre))
    .map((item) => ({ id: item.id, nombre: text(item.nombre) }));
  const products = array(source.products, DEFAULT_PRODUCTS)
    .filter(
      (item) =>
        item?.id != null &&
        text(item.nombre) &&
        Number.isFinite(Number(item.precio)) &&
        Number(item.precio) > 0,
    )
    .map((item) => ({
      id: item.id,
      nombre: text(item.nombre),
      categoria: text(item.categoria) || 'Polera',
      precio: Number(item.precio),
      descripcion: text(item.descripcion),
      imagen: safeImage(text(item.imagen))
        ? text(item.imagen)
        : 'assets/img/sopranos-hoodie-real.png',
      stock: integer(item.stock ?? 12, 0, 100000) ? Number(item.stock ?? 12) : 0,
      descuento: integer(item.descuento ?? 0, 0, 90) ? Number(item.descuento ?? 0) : 0,
    }));
  // Conserva categorías personalizadas del catálogo anterior al migrar.
  for (const product of products) {
    if (!categories.some((category) => category.nombre === product.categoria))
      categories.push({ id: `migrada-${categories.length + 1}`, nombre: product.categoria });
  }
  const users = array(source.users, DEFAULT_USERS)
    .filter(
      (item) =>
        item?.id != null &&
        text(item.nombre) &&
        emailValid(text(item.email)) &&
        typeof item.password === 'string',
    )
    .map((item) => ({
      id: item.id,
      nombre: text(item.nombre),
      email: text(item.email).toLowerCase(),
      password: item.password,
      role: item.role === 'admin' ? 'admin' : 'usuario',
      telefono: text(item.telefono),
      direccion: text(item.direccion),
      comuna: text(item.comuna),
      region: text(item.region),
    }));
  if (!users.some((user) => user.role === 'admin')) {
    const admin = clone(DEFAULT_USERS[0]);
    admin.id = `recuperado-${Date.now()}`;
    admin.email = users.some((user) => user.email === admin.email)
      ? 'administrador@vesper.cl'
      : admin.email;
    users.push(admin);
  }
  let state = {
    products,
    users,
    categories,
    cart: array(source.cart, []),
    orders: array(source.orders, []).filter(
      (order) =>
        order?.id && Array.isArray(order.items) && order.cliente && Number.isFinite(order.total),
    ),
    messages: array(source.messages, []).filter(
      (message) => message?.id && typeof message.mensaje === 'string',
    ),
    session: null,
  };
  const savedSession = read(sessionStorage, SESSION_KEY, null);
  state.session = sessionFor(
    users.find((user) => savedSession?.id != null && sameId(user.id, savedSession.id)),
  );

  function reconcileCart(candidate) {
    const merged = new Map();
    for (const item of candidate.cart) {
      const product = candidate.products.find((product) => sameId(product.id, item?.productId));
      if (!product || product.stock < 1 || !integer(item.cantidad, 1, 100000)) continue;
      const quantity = (merged.get(product.id)?.cantidad || 0) + Number(item.cantidad);
      merged.set(product.id, {
        productId: product.id,
        cantidad: Math.min(quantity, product.stock, 20),
      });
    }
    candidate.cart = [...merged.values()];
    return candidate;
  }
  state = freeze(reconcileCart(state));
  function persist(candidate) {
    const { session, ...data } = candidate;
    let previousSession = null;
    try {
      previousSession = sessionStorage.getItem(SESSION_KEY);
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
      // Una única escritura mantiene juntos stock, pedido y carrito.
      storage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
      try {
        if (previousSession == null) sessionStorage.removeItem(SESSION_KEY);
        else sessionStorage.setItem(SESSION_KEY, previousSession);
      } catch {
        /* Mantener el error útil aunque el almacenamiento esté bloqueado. */
      }
      throw new Error(
        'No se pudieron guardar los cambios. Revisa el espacio y permisos del navegador.',
      );
    }
  }
  function change(update) {
    const candidate = clone(state);
    const result = update(candidate);
    reconcileCart(candidate);
    persist(candidate);
    state = freeze(candidate);
    listeners.forEach((listener) => listener());
    return result == null ? result : clone(result);
  }
  function adminOnly() {
    if (state.session?.role !== 'admin')
      throw new Error('Debes iniciar sesión como administrador.');
  }
  function find(collection, id, label) {
    const item = collection.find((item) => sameId(item.id, id));
    if (!item) throw new Error(`${label} no encontrado.`);
    return item;
  }
  function idFor(collection) {
    return Math.max(Date.now(), ...collection.map((item) => Number(item.id) || 0)) + 1;
  }
  function profileData(data, existing = {}) {
    const result = {
      ...existing,
      nombre: text(data.nombre),
      email: text(data.email).toLowerCase(),
      telefono: text(data.telefono ?? existing.telefono),
      direccion: text(data.direccion ?? existing.direccion),
      comuna: text(data.comuna ?? existing.comuna),
      region: text(data.region ?? existing.region),
    };
    if (result.nombre.length < 3 || result.nombre.length > 100)
      throw new Error('El nombre debe tener entre 3 y 100 caracteres.');
    if (!emailValid(result.email) || result.email.length > 150)
      throw new Error('Ingresa un correo válido.');
    if (state.users.some((user) => user.email === result.email && !sameId(user.id, existing.id)))
      throw new Error('Ya existe un usuario con ese correo.');
    if (result.telefono && !phoneValid(result.telefono))
      throw new Error('Ingresa un teléfono válido de al menos 8 dígitos.');
    if ([result.direccion, result.comuna, result.region].some((value) => value.length > 200))
      throw new Error('La dirección, comuna y región admiten hasta 200 caracteres.');
    return result;
  }
  function passwordFor(value, fallback) {
    const password = value || fallback;
    if (typeof password !== 'string' || password.length < 6 || password.length > 100)
      throw new Error('La contraseña debe tener entre 6 y 100 caracteres.');
    return password;
  }
  const api = {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    login(email, password) {
      const user = state.users.find(
        (user) => user.email === text(email).toLowerCase() && user.password === password,
      );
      if (!user) throw new Error('Correo o contraseña incorrectos.');
      return change((candidate) => {
        candidate.session = sessionFor(user);
        return candidate.session;
      });
    },
    logout() {
      change((candidate) => {
        candidate.session = null;
      });
    },
    register(data) {
      const user = {
        ...profileData(data),
        id: idFor(state.users),
        password: passwordFor(data.password),
        role: 'usuario',
      };
      return change((candidate) => {
        candidate.users.push(user);
        candidate.session = sessionFor(user);
        return candidate.session;
      });
    },
    saveProfile(data) {
      if (!state.session) throw new Error('Inicia sesión para editar tu perfil.');
      const user = find(state.users, state.session.id, 'Usuario');
      const updated = {
        ...profileData(data, user),
        password: passwordFor(data.password, user.password),
        role: user.role,
        id: user.id,
      };
      return change((candidate) => {
        candidate.users = candidate.users.map((entry) =>
          sameId(entry.id, user.id) ? updated : entry,
        );
        candidate.session = sessionFor(updated);
        return candidate.session;
      });
    },
    saveUser(data) {
      adminOnly();
      const existing = data.id != null ? find(state.users, data.id, 'Usuario') : {};
      if (!['admin', 'usuario'].includes(data.role)) throw new Error('Selecciona un rol válido.');
      if (sameId(existing.id, state.session.id) && data.role !== 'admin')
        throw new Error('No puedes quitar tu propio rol de administrador.');
      if (
        existing.role === 'admin' &&
        data.role !== 'admin' &&
        state.users.filter((user) => user.role === 'admin').length === 1
      )
        throw new Error('Debe existir al menos un administrador.');
      const updated = {
        ...profileData(data, existing),
        id: existing.id ?? idFor(state.users),
        role: data.role,
        password: passwordFor(data.password, existing.password),
      };
      return change((candidate) => {
        if (existing.id != null)
          candidate.users = candidate.users.map((user) =>
            sameId(user.id, existing.id) ? updated : user,
          );
        else candidate.users.push(updated);
        if (sameId(updated.id, candidate.session.id)) candidate.session = sessionFor(updated);
        return sessionFor(updated);
      });
    },
    deleteUser(id) {
      adminOnly();
      const user = find(state.users, id, 'Usuario');
      if (sameId(id, state.session.id))
        throw new Error('No puedes eliminar tu propia cuenta activa.');
      if (
        user.role === 'admin' &&
        state.users.filter((entry) => entry.role === 'admin').length === 1
      )
        throw new Error('Debe existir al menos un administrador.');
      change((candidate) => {
        candidate.users = candidate.users.filter((entry) => !sameId(entry.id, id));
      });
    },
    saveProduct(data) {
      adminOnly();
      const existing = data.id != null ? find(state.products, data.id, 'Producto') : {};
      const product = {
        id: existing.id ?? idFor(state.products),
        nombre: text(data.nombre),
        categoria: text(data.categoria),
        descripcion: text(data.descripcion),
        imagen: text(data.imagen),
        precio: Number(data.precio),
        stock: Number(data.stock),
        descuento: Number(data.descuento ?? 0),
      };
      if (product.nombre.length < 3 || product.nombre.length > 120)
        throw new Error('El nombre del producto debe tener entre 3 y 120 caracteres.');
      if (!state.categories.some((category) => category.nombre === product.categoria))
        throw new Error('Selecciona una categoría existente.');
      if (!integer(product.precio, 1, 10000000))
        throw new Error('El precio debe ser un entero positivo, hasta $10.000.000.');
      if (!integer(product.stock, 0, 100000))
        throw new Error('El stock debe ser un entero entre 0 y 100.000.');
      if (!integer(product.descuento, 0, 90))
        throw new Error('El descuento debe ser un entero entre 0 y 90%.');
      if (product.descripcion.length < 10 || product.descripcion.length > 1000)
        throw new Error('La descripción debe tener entre 10 y 1000 caracteres.');
      if (!safeImage(product.imagen))
        throw new Error('Usa una imagen de assets/img/ o una dirección HTTPS válida.');
      return change((candidate) => {
        if (existing.id != null)
          candidate.products = candidate.products.map((item) =>
            sameId(item.id, product.id) ? product : item,
          );
        else candidate.products.push(product);
        return product;
      });
    },
    deleteProduct(id) {
      adminOnly();
      find(state.products, id, 'Producto');
      change((candidate) => {
        candidate.products = candidate.products.filter((item) => !sameId(item.id, id));
      });
    },
    saveCategory(data) {
      adminOnly();
      const existing = data.id != null ? find(state.categories, data.id, 'Categoría') : {};
      const nombre = text(data.nombre);
      if (nombre.length < 3 || nombre.length > 60)
        throw new Error('La categoría debe tener entre 3 y 60 caracteres.');
      if (
        state.categories.some(
          (item) =>
            item.nombre.toLocaleLowerCase() === nombre.toLocaleLowerCase() &&
            !sameId(item.id, existing.id),
        )
      )
        throw new Error('Ya existe una categoría con ese nombre.');
      const category = { id: existing.id ?? idFor(state.categories), nombre };
      return change((candidate) => {
        if (existing.id != null) {
          candidate.categories = candidate.categories.map((item) =>
            sameId(item.id, existing.id) ? category : item,
          );
          candidate.products = candidate.products.map((item) =>
            item.categoria === existing.nombre ? { ...item, categoria: nombre } : item,
          );
        } else candidate.categories.push(category);
        return category;
      });
    },
    deleteCategory(id) {
      adminOnly();
      const category = find(state.categories, id, 'Categoría');
      if (state.products.some((product) => product.categoria === category.nombre))
        throw new Error('No puedes eliminar una categoría que tiene productos.');
      change((candidate) => {
        candidate.categories = candidate.categories.filter((item) => !sameId(item.id, id));
      });
    },
    addToCart(productId, quantity = 1) {
      const product = find(state.products, productId, 'Producto');
      const existing = state.cart.find((item) => sameId(item.productId, productId));
      const total = (existing?.cantidad || 0) + Number(quantity);
      if (!integer(quantity, 1, 20) || total > Math.min(product.stock, 20))
        throw new Error(
          'Cantidad no disponible. Revisa el stock (máximo 20 unidades por producto).',
        );
      change((candidate) => {
        const item = candidate.cart.find((item) => sameId(item.productId, productId));
        if (item) item.cantidad = total;
        else candidate.cart.push({ productId: product.id, cantidad: total });
      });
    },
    updateQuantity(productId, quantity) {
      const product = find(state.products, productId, 'Producto');
      if (!state.cart.some((item) => sameId(item.productId, productId)))
        throw new Error('Producto no encontrado en el carrito.');
      if (!integer(quantity, 1, Math.min(product.stock, 20)))
        throw new Error('La cantidad debe ser un entero dentro del stock disponible (máximo 20).');
      change((candidate) => {
        candidate.cart.find((item) => sameId(item.productId, productId)).cantidad =
          Number(quantity);
      });
    },
    removeFromCart(productId) {
      change((candidate) => {
        candidate.cart = candidate.cart.filter((item) => !sameId(item.productId, productId));
      });
    },
    checkout(details, { fail = false } = {}) {
      if (!state.cart.length) throw new Error('Agrega productos al carrito antes de comprar.');
      const cliente = Object.fromEntries(
        ['nombre', 'email', 'telefono', 'direccion', 'comuna', 'region', 'entrega'].map((key) => [
          key,
          text(details[key]),
        ]),
      );
      if (cliente.nombre.length < 3 || cliente.nombre.length > 100)
        throw new Error('Ingresa un nombre válido (3 a 100 caracteres).');
      if (!emailValid(cliente.email) || cliente.email.length > 150)
        throw new Error('Ingresa un correo válido.');
      if (!phoneValid(cliente.telefono))
        throw new Error('Ingresa un teléfono válido de al menos 8 dígitos.');
      if (!['despacho', 'retiro'].includes(cliente.entrega))
        throw new Error('Selecciona una opción de entrega.');
      if (
        cliente.entrega === 'despacho' &&
        (cliente.direccion.length < 5 || cliente.comuna.length < 2 || cliente.region.length < 2)
      )
        throw new Error('Completa la dirección, comuna y región para el despacho.');
      if ([cliente.direccion, cliente.comuna, cliente.region].some((value) => value.length > 200))
        throw new Error('La dirección, comuna y región admiten hasta 200 caracteres.');
      const items = state.cart.map((item) => {
        const product = find(state.products, item.productId, 'Producto');
        if (!integer(item.cantidad, 1, product.stock))
          throw new Error(`Stock insuficiente para ${product.nombre}.`);
        return {
          productId: product.id,
          nombre: product.nombre,
          precio: priceFor(product),
          cantidad: item.cantidad,
        };
      });
      if (fail)
        throw new Error('El pago fue rechazado. Tu carrito sigue disponible para reintentar.');
      const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      const envio = cliente.entrega === 'despacho' ? 3990 : 0;
      const order = {
        id: idFor(state.orders),
        fecha: new Date().toISOString(),
        userId: state.session?.id ?? null,
        cliente,
        items,
        subtotal,
        envio,
        total: subtotal + envio,
      };
      return change((candidate) => {
        candidate.products = candidate.products.map((product) => {
          const item = items.find((item) => sameId(item.productId, product.id));
          return item ? { ...product, stock: product.stock - item.cantidad } : product;
        });
        candidate.orders.push(order);
        candidate.cart = [];
        return order;
      });
    },
    sendMessage(data) {
      const message = {
        id: idFor(state.messages),
        nombre: text(data.nombre),
        email: text(data.email).toLowerCase(),
        motivo: text(data.motivo),
        mensaje: text(data.mensaje),
        fecha: new Date().toISOString(),
      };
      if (message.nombre.length < 3 || message.nombre.length > 100 || !emailValid(message.email))
        throw new Error('Ingresa un nombre y correo válidos.');
      if (
        !message.motivo ||
        message.motivo.length > 100 ||
        message.mensaje.length < 10 ||
        message.mensaje.length > 2000
      )
        throw new Error('Selecciona un motivo y escribe un mensaje de 10 a 2000 caracteres.');
      return change((candidate) => {
        candidate.messages.push(message);
        return message;
      });
    },
  };
  return api;
}

export const store = createStore();
