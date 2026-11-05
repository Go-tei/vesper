const baseUsers = [
  {
    id: 1,
    nombre: 'Administrador Vesper',
    email: 'admin@vesper.cl',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 2,
    nombre: 'Usuario Demo',
    email: 'usuario@vesper.cl',
    password: 'user123',
    role: 'usuario',
  },
];

const baseProducts = [
  {
    id: 1,
    nombre: 'Polerón The Sopranos Noir',
    categoria: 'Polerón',
    precio: 42990,
    descripcion: 'Hoodie negro oversize con gráfica estilo noir inspirada en The Sopranos.',
    imagen: 'assets/img/sopranos-hoodie-real.png',
  },
  {
    id: 2,
    nombre: 'Polera Twin Peaks Red Room',
    categoria: 'Polera',
    precio: 26990,
    descripcion: 'Polera gráfica inspirada en Twin Peaks con referencia a la Red Room.',
    imagen: 'assets/img/twinpeaks-tee-real.png',
  },
  {
    id: 3,
    nombre: 'Gorro Blade Runner Neon',
    categoria: 'Accesorio',
    precio: 18990,
    descripcion:
      'Gorra negra con bordado futurista y estética cyber-noir inspirada en Blade Runner.',
    imagen: 'assets/img/bladerunner-cap-real.png',
  },
  {
    id: 4,
    nombre: 'Polera Björk Avant Pop',
    categoria: 'Polera',
    precio: 27990,
    descripcion: 'Diseño art-pop de alto contraste inspirado en el imaginario visual de Björk.',
    imagen: 'assets/img/bjork-tee-real.png',
  },
  {
    id: 5,
    nombre: 'Polerón Pearl Monochrome',
    categoria: 'Polerón',
    precio: 41990,
    descripcion: 'Polerón con vibra cinematográfica y gráfica oscura inspirado en Pearl.',
    imagen: 'assets/img/pearl-hoodie-real.png',
  },
  {
    id: 6,
    nombre: 'Polera Psycho Shower Scene',
    categoria: 'Polera',
    precio: 25990,
    descripcion: 'Polera monocromática con gráfica thriller inspirada en Psycho.',
    imagen: 'assets/img/psycho-tee-real.png',
  },
  {
    id: 7,
    nombre: 'Gorro Sade Smooth Operator',
    categoria: 'Accesorio',
    precio: 17990,
    descripcion: 'Gorro de perfil elegante con inspiración visual en Sade.',
    imagen: 'assets/img/sade-cap-real.png',
  },
  {
    id: 8,
    nombre: 'Polerón Bowie Lightning',
    categoria: 'Polerón',
    precio: 43990,
    descripcion: 'Hoodie glam con rayo icónico y energía inspirada en David Bowie.',
    imagen: 'assets/img/bowie-hoodie-real.png',
  },
  {
    id: 9,
    nombre: 'Polera PlayStation 2 Boot Sequence',
    categoria: 'Polera',
    precio: 24990,
    descripcion: 'Gráfica retro-gamer inspirada en la identidad visual de PlayStation 2.',
    imagen: 'assets/img/ps2-tee-real.png',
  },
  {
    id: 10,
    nombre: 'Gorro PlayStation 1 Retro Core',
    categoria: 'Accesorio',
    precio: 16990,
    descripcion: 'Accesorio con look retro y detalles inspirados en la primera PlayStation.',
    imagen: 'assets/img/ps1-cap-real.png',
  },
  {
    id: 11,
    nombre: 'Polerón Evangelion Test Type-01',
    categoria: 'Polerón',
    precio: 44990,
    descripcion: 'Polerón técnico de alto contraste inspirado en Evangelion y Unit-01.',
    imagen: 'assets/img/eva-hoodie-real.png',
  },
  {
    id: 12,
    nombre: 'Polera Inuyasha Moonlight',
    categoria: 'Polera',
    precio: 26990,
    descripcion: 'Polera anime con paleta rojo/negro inspirada en Inuyasha.',
    imagen: 'assets/img/inuyasha-tee-real.png',
  },
  {
    id: 13,
    nombre: 'Polera Parasyte Mutation',
    categoria: 'Polera',
    precio: 27990,
    descripcion: 'Diseño oscuro de sci-fi corporal inspirado en Parasyte.',
    imagen: 'assets/img/parasyte-tee-real.png',
  },
];

// Credenciales únicamente para la demostración académica local; no usar en producción.
export const DEFAULT_USERS = baseUsers.map((user) => ({
  ...user,
  telefono: '',
  direccion: '',
  comuna: '',
  region: '',
}));
export const DEFAULT_CATEGORIES = [
  { id: 1, nombre: 'Polera' },
  { id: 2, nombre: 'Polerón' },
  { id: 3, nombre: 'Accesorio' },
];
export const DEFAULT_PRODUCTS = baseProducts.map((product, index) => ({
  ...product,
  stock: index === 12 ? 3 : 12,
  descuento: [1, 3, 8].includes(index) ? 20 : 0,
}));
