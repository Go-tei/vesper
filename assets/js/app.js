'use strict';

const VESPER_KEYS = {
  users: 'vesper_users',
  products: 'vesper_products',
  cart: 'vesper_cart',
  session: 'vesper_session'
};

const DEFAULT_USERS = [
  {
    id: 1,
    nombre: 'Administrador Vesper',
    email: 'admin@vesper.cl',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 2,
    nombre: 'Usuario Demo',
    email: 'usuario@vesper.cl',
    password: 'user123',
    role: 'usuario'
  }
];

const PRODUCT_SEED_VERSION = '3';

const DEFAULT_PRODUCTS = [
  { id: 1, nombre: 'Polerón The Sopranos Noir', categoria: 'Polerón', precio: 42990, descripcion: 'Hoodie negro oversize con gráfica estilo noir inspirada en The Sopranos.', imagen: 'assets/img/sopranos-hoodie-real.png' },
  { id: 2, nombre: 'Polera Twin Peaks Red Room', categoria: 'Polera', precio: 26990, descripcion: 'Polera gráfica inspirada en Twin Peaks con referencia a la Red Room.', imagen: 'assets/img/twinpeaks-tee-real.png' },
  { id: 3, nombre: 'Gorro Blade Runner Neon', categoria: 'Accesorio', precio: 18990, descripcion: 'Gorra negra con bordado futurista y estética cyber-noir inspirada en Blade Runner.', imagen: 'assets/img/bladerunner-cap-real.png' },
  { id: 4, nombre: 'Polera Björk Avant Pop', categoria: 'Polera', precio: 27990, descripcion: 'Diseño art-pop de alto contraste inspirado en el imaginario visual de Björk.', imagen: 'assets/img/bjork-tee-real.png' },
  { id: 5, nombre: 'Polerón Pearl Monochrome', categoria: 'Polerón', precio: 41990, descripcion: 'Polerón con vibra cinematográfica y gráfica oscura inspirado en Pearl.', imagen: 'assets/img/pearl-hoodie-real.png' },
  { id: 6, nombre: 'Polera Psycho Shower Scene', categoria: 'Polera', precio: 25990, descripcion: 'Polera monocromática con gráfica thriller inspirada en Psycho.', imagen: 'assets/img/psycho-tee-real.png' },
  { id: 7, nombre: 'Gorro Sade Smooth Operator', categoria: 'Accesorio', precio: 17990, descripcion: 'Gorro de perfil elegante con inspiración visual en Sade.', imagen: 'assets/img/sade-cap-real.png' },
  { id: 8, nombre: 'Polerón Bowie Lightning', categoria: 'Polerón', precio: 43990, descripcion: 'Hoodie glam con rayo icónico y energía inspirada en David Bowie.', imagen: 'assets/img/bowie-hoodie-real.png' },
  { id: 9, nombre: 'Polera PlayStation 2 Boot Sequence', categoria: 'Polera', precio: 24990, descripcion: 'Gráfica retro-gamer inspirada en la identidad visual de PlayStation 2.', imagen: 'assets/img/ps2-tee-real.png' },
  { id: 10, nombre: 'Gorro PlayStation 1 Retro Core', categoria: 'Accesorio', precio: 16990, descripcion: 'Accesorio con look retro y detalles inspirados en la primera PlayStation.', imagen: 'assets/img/ps1-cap-real.png' },
  { id: 11, nombre: 'Polerón Evangelion Test Type-01', categoria: 'Polerón', precio: 44990, descripcion: 'Polerón técnico de alto contraste inspirado en Evangelion y Unit-01.', imagen: 'assets/img/eva-hoodie-real.png' },
  { id: 12, nombre: 'Polera Inuyasha Moonlight', categoria: 'Polera', precio: 26990, descripcion: 'Polera anime con paleta rojo/negro inspirada en Inuyasha.', imagen: 'assets/img/inuyasha-tee-real.png' },
  { id: 13, nombre: 'Polera Parasyte Mutation', categoria: 'Polera', precio: 27990, descripcion: 'Diseño oscuro de sci-fi corporal inspirado en Parasyte.', imagen: 'assets/img/parasyte-tee-real.png' }
];

function initializeData() {
  if (!localStorage.getItem(VESPER_KEYS.users)) {
    localStorage.setItem(VESPER_KEYS.users, JSON.stringify(DEFAULT_USERS));
  }

  const savedSeedVersion = localStorage.getItem('vesper_products_seed_version');
  if (!localStorage.getItem(VESPER_KEYS.products) || savedSeedVersion !== PRODUCT_SEED_VERSION) {
    localStorage.setItem(VESPER_KEYS.products, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem('vesper_products_seed_version', PRODUCT_SEED_VERSION);
    localStorage.setItem(VESPER_KEYS.cart, JSON.stringify([]));
  }

  if (!localStorage.getItem(VESPER_KEYS.cart)) {
    localStorage.setItem(VESPER_KEYS.cart, JSON.stringify([]));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(VESPER_KEYS.users)) || [];
}

function saveUsers(users) {
  localStorage.setItem(VESPER_KEYS.users, JSON.stringify(users));
}

function getProducts() {
  return JSON.parse(localStorage.getItem(VESPER_KEYS.products)) || [];
}

function saveProducts(products) {
  localStorage.setItem(VESPER_KEYS.products, JSON.stringify(products));
}

function getCart() {
  return JSON.parse(localStorage.getItem(VESPER_KEYS.cart)) || [];
}

function saveCart(cart) {
  localStorage.setItem(VESPER_KEYS.cart, JSON.stringify(cart));
  updateCartBadge();
}

function getSession() {
  return JSON.parse(sessionStorage.getItem(VESPER_KEYS.session)) || null;
}

function setSession(user) {
  sessionStorage.setItem(VESPER_KEYS.session, JSON.stringify({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    role: user.role
  }));
}

function clearSession() {
  sessionStorage.removeItem(VESPER_KEYS.session);
}

function requireAuth(role) {
  const session = getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  if (role && session.role !== role) {
    window.location.href = 'index.html';
    return null;
  }

  return session;
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

function formatCLP(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  const total = getCart().reduce(function (sum, item) {
    return sum + item.cantidad;
  }, 0);

  badge.textContent = total;
}

function setupNavbar() {
  const session = getSession();
  const userName = document.getElementById('nav-user-name');
  const roleBadge = document.getElementById('nav-role');
  const adminLink = document.getElementById('nav-admin');
  const cartLink = document.getElementById('nav-cart');
  const logoutButton = document.getElementById('logout-btn');

  if (session && userName) userName.textContent = session.nombre;
  if (session && roleBadge) roleBadge.textContent = session.role;

  if (adminLink) adminLink.hidden = !session || session.role !== 'admin';
  if (cartLink) cartLink.hidden = !session || session.role !== 'usuario';

  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }

  updateCartBadge();
}

function setCurrentYear() {
  document.querySelectorAll('[data-year]').forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
}

initializeData();
setCurrentYear();
setupNavbar();
