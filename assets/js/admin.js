'use strict';

const adminSession = requireAuth('admin');

const userForm = document.getElementById('user-form');
const userId = document.getElementById('user-id');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPassword = document.getElementById('user-password');
const userRole = document.getElementById('user-role');
const userTableBody = document.getElementById('user-table-body');
const userFormTitle = document.getElementById('user-form-title');
const cancelUserEdit = document.getElementById('cancel-user-edit');
const userMessage = document.getElementById('user-message');

const productForm = document.getElementById('product-form');
const productId = document.getElementById('product-id');
const productName = document.getElementById('product-name');
const productCategory = document.getElementById('product-category');
const productPrice = document.getElementById('product-price');
const productDescription = document.getElementById('product-description');
const productImage = document.getElementById('product-image');
const productTableBody = document.getElementById('product-table-body');
const productFormTitle = document.getElementById('product-form-title');
const cancelProductEdit = document.getElementById('cancel-product-edit');
const productMessage = document.getElementById('product-message');

function renderUsers() {
  if (!adminSession) return;

  userTableBody.innerHTML = '';

  getUsers().forEach(function (user) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.nombre}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-dark edit-user" data-id="${user.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger delete-user" data-id="${user.id}">Eliminar</button>
      </td>
    `;
    userTableBody.appendChild(row);
  });

  document.querySelectorAll('.edit-user').forEach(function (button) {
    button.addEventListener('click', function () { editUser(Number(button.dataset.id)); });
  });

  document.querySelectorAll('.delete-user').forEach(function (button) {
    button.addEventListener('click', function () { deleteUser(Number(button.dataset.id)); });
  });
}

function resetUserForm() {
  userForm.reset();
  userId.value = '';
  userFormTitle.textContent = 'Nuevo usuario';
  cancelUserEdit.hidden = true;
  userMessage.textContent = '';
}

function editUser(id) {
  const user = getUsers().find(function (item) { return item.id === id; });
  if (!user) return;

  userId.value = user.id;
  userName.value = user.nombre;
  userEmail.value = user.email;
  userPassword.value = user.password;
  userRole.value = user.role;
  userFormTitle.textContent = 'Editar usuario';
  cancelUserEdit.hidden = false;
  userName.focus();
}

function deleteUser(id) {
  if (id === adminSession.id) {
    userMessage.textContent = 'No puedes eliminar el usuario con el que tienes la sesión iniciada.';
    return;
  }

  const users = getUsers();
  const user = users.find(function (item) { return item.id === id; });
  if (!user) return;

  if (!window.confirm('¿Eliminar a ' + user.nombre + '?')) return;

  saveUsers(users.filter(function (item) { return item.id !== id; }));
  renderUsers();
  resetUserForm();
}

userForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const users = getUsers();
  const id = Number(userId.value);
  const email = userEmail.value.trim().toLowerCase();

  const duplicatedEmail = users.some(function (item) {
    return item.email.toLowerCase() === email && item.id !== id;
  });

  if (duplicatedEmail) {
    userMessage.textContent = 'Ya existe un usuario con ese correo.';
    return;
  }

  if (id) {
    const user = users.find(function (item) { return item.id === id; });
    user.nombre = userName.value.trim();
    user.email = email;
    user.password = userPassword.value;
    user.role = userRole.value;
  } else {
    users.push({
      id: Date.now(),
      nombre: userName.value.trim(),
      email: email,
      password: userPassword.value,
      role: userRole.value
    });
  }

  saveUsers(users);
  renderUsers();
  resetUserForm();
  userMessage.textContent = 'Usuario guardado correctamente.';
});

cancelUserEdit.addEventListener('click', resetUserForm);

function renderProductsAdmin() {
  productTableBody.innerHTML = '';

  getProducts().forEach(function (product) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.nombre}</td>
      <td>${product.categoria}</td>
      <td>${formatCLP(product.precio)}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-dark edit-product" data-id="${product.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger delete-product" data-id="${product.id}">Eliminar</button>
      </td>
    `;
    productTableBody.appendChild(row);
  });

  document.querySelectorAll('.edit-product').forEach(function (button) {
    button.addEventListener('click', function () { editProduct(Number(button.dataset.id)); });
  });

  document.querySelectorAll('.delete-product').forEach(function (button) {
    button.addEventListener('click', function () { deleteProduct(Number(button.dataset.id)); });
  });
}

function resetProductForm() {
  productForm.reset();
  productId.value = '';
  productFormTitle.textContent = 'Nuevo producto';
  cancelProductEdit.hidden = true;
  productMessage.textContent = '';
}

function editProduct(id) {
  const product = getProducts().find(function (item) { return item.id === id; });
  if (!product) return;

  productId.value = product.id;
  productName.value = product.nombre;
  productCategory.value = product.categoria;
  productPrice.value = product.precio;
  productDescription.value = product.descripcion;
  productImage.value = product.imagen;
  productFormTitle.textContent = 'Editar producto';
  cancelProductEdit.hidden = false;
  productName.focus();
}

function deleteProduct(id) {
  const products = getProducts();
  const product = products.find(function (item) { return item.id === id; });
  if (!product) return;
  if (!window.confirm('¿Eliminar ' + product.nombre + '?')) return;

  saveProducts(products.filter(function (item) { return item.id !== id; }));

  const cart = getCart().filter(function (item) { return item.productId !== id; });
  saveCart(cart);

  renderProductsAdmin();
  resetProductForm();
}

productForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const products = getProducts();
  const id = Number(productId.value);
  const data = {
    nombre: productName.value.trim(),
    categoria: productCategory.value,
    precio: Number(productPrice.value),
    descripcion: productDescription.value.trim(),
    imagen: productImage.value.trim()
  };

  if (id) {
    const product = products.find(function (item) { return item.id === id; });
    Object.assign(product, data);
  } else {
    products.push({ id: Date.now(), ...data });
  }

  saveProducts(products);
  renderProductsAdmin();
  resetProductForm();
  productMessage.textContent = 'Producto guardado correctamente.';
});

cancelProductEdit.addEventListener('click', resetProductForm);

renderUsers();
renderProductsAdmin();
