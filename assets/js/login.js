'use strict';

const currentSession = getSession();
if (currentSession) {
  window.location.href = 'index.html';
}

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  const user = getUsers().find(function (item) {
    return item.email.toLowerCase() === email && item.password === password;
  });

  if (!user) {
    loginError.textContent = 'Correo o contraseña incorrectos.';
    return;
  }

  setSession(user);
  window.location.href = 'index.html';
});
