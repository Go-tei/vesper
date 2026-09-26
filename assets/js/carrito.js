'use strict';

const cartSession = requireAuth('usuario');
const cartBody = document.getElementById('cart-body');
const cartTotal = document.getElementById('cart-total');
const cartEmpty = document.getElementById('cart-empty');
const checkoutButton = document.getElementById('checkout-btn');
const checkoutMessage = document.getElementById('checkout-message');

function renderCart() {
  if (!cartSession) return;

  const cart = getCart();
  const products = getProducts();
  cartBody.innerHTML = '';
  let total = 0;

  const validItems = cart.filter(function (item) {
    return products.some(function (product) { return product.id === item.productId; });
  });

  if (validItems.length !== cart.length) saveCart(validItems);

  cartEmpty.hidden = validItems.length > 0;
  checkoutButton.disabled = validItems.length === 0;

  validItems.forEach(function (item) {
    const product = products.find(function (entry) { return entry.id === item.productId; });
    const subtotal = product.precio * item.cantidad;
    total += subtotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${product.imagen}" alt="${product.nombre}" width="64" height="76" style="object-fit:cover">
          <div><strong>${product.nombre}</strong><br><small>${product.categoria}</small></div>
        </div>
      </td>
      <td>${formatCLP(product.precio)}</td>
      <td><input class="form-control form-control-sm qty-control" type="number" min="1" max="20" value="${item.cantidad}" data-id="${item.productId}"></td>
      <td>${formatCLP(subtotal)}</td>
      <td><button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.productId}">Quitar</button></td>
    `;
    cartBody.appendChild(row);
  });

  cartTotal.textContent = formatCLP(total);

  document.querySelectorAll('.qty-control').forEach(function (input) {
    input.addEventListener('change', function () {
      changeQuantity(Number(input.dataset.id), Number(input.value));
    });
  });

  document.querySelectorAll('.remove-item').forEach(function (button) {
    button.addEventListener('click', function () {
      removeItem(Number(button.dataset.id));
    });
  });
}

function changeQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(function (entry) { return entry.productId === productId; });
  if (!item) return;

  item.cantidad = Math.max(1, Math.min(20, quantity || 1));
  saveCart(cart);
  renderCart();
}

function removeItem(productId) {
  saveCart(getCart().filter(function (entry) { return entry.productId !== productId; }));
  renderCart();
}

checkoutButton.addEventListener('click', function () {
  checkoutMessage.hidden = false;
  checkoutMessage.textContent = 'Compra simulada correctamente. Para esta evaluación no se envían datos a un backend.';
  saveCart([]);
  renderCart();
});

renderCart();
