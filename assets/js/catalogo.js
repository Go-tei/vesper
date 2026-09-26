'use strict';

const sessionCatalogo = requireAuth();
const catalogContainer = document.getElementById('catalogo-productos');
const filterCategory = document.getElementById('filtro-categoria');
const filterText = document.getElementById('filtro-texto');
const catalogStatus = document.getElementById('catalog-status');

function renderProducts() {
  if (!sessionCatalogo) return;

  const category = filterCategory.value;
  const text = filterText.value.trim().toLowerCase();

  const products = getProducts().filter(function (product) {
    const matchesCategory = category === 'todos' || product.categoria === category;
    const matchesText = product.nombre.toLowerCase().includes(text) || product.descripcion.toLowerCase().includes(text);
    return matchesCategory && matchesText;
  });

  catalogContainer.innerHTML = '';

  if (products.length === 0) {
    catalogContainer.innerHTML = '<div class="col-12"><div class="empty-state">No hay productos que coincidan con el filtro.</div></div>';
  }

  products.forEach(function (product) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    const action = sessionCatalogo.role === 'usuario'
      ? '<button class="btn btn-vesper w-100 add-cart-btn" data-id="' + product.id + '">Agregar al carrito</button>'
      : '<a class="btn btn-outline-vesper w-100" href="admin.html#productos">Editar en mantenedor</a>';

    col.innerHTML = `
      <article class="card product-card">
        <img src="${product.imagen}" class="card-img-top" alt="${product.nombre}">
        <div class="card-body d-flex flex-column">
          <p class="eyebrow">${product.categoria}</p>
          <h2 class="card-title h5">${product.nombre}</h2>
          <p class="card-text flex-grow-1">${product.descripcion}</p>
          <p class="price">${formatCLP(product.precio)}</p>
          ${action}
        </div>
      </article>
    `;

    catalogContainer.appendChild(col);
  });

  catalogStatus.textContent = products.length + (products.length === 1 ? ' producto visible' : ' productos visibles');

  document.querySelectorAll('.add-cart-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      addToCart(Number(button.dataset.id));
    });
  });
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find(function (item) { return item.productId === productId; });

  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({ productId: productId, cantidad: 1 });
  }

  saveCart(cart);

  const alertBox = document.getElementById('catalog-alert');
  alertBox.textContent = 'Producto agregado al carrito.';
  alertBox.hidden = false;
  window.setTimeout(function () { alertBox.hidden = true; }, 1800);
}

if (filterCategory && filterText) {
  filterCategory.addEventListener('change', renderProducts);
  filterText.addEventListener('input', renderProducts);
  renderProducts();
}
