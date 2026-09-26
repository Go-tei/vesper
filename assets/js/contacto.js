'use strict';

requireAuth();

const contactForm = document.getElementById('contact-form');
const contactMessage = document.getElementById('contact-message');

contactForm.addEventListener('submit', function (event) {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.classList.add('was-validated');
    return;
  }

  contactMessage.hidden = false;
  contactMessage.textContent = 'Consulta validada. En esta versión académica no se envía a un servidor.';
  contactForm.reset();
  contactForm.classList.remove('was-validated');
});
