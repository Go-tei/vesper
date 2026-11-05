# VESPER 夜 — Entrega 2

Tienda de streetwear y cultura pop para **DSY1104 · Desarrollo Fullstack II**. Migración de la primera entrega HTML/JavaScript a React, con diseño Bootstrap, datos locales, compra simulada y administración.

## Ejecutar

Requisitos: **Node.js 22.12 o superior** y npm. Instalar dependencias con el lockfile:

```bash
npm ci
npm run dev
```

Abrir la dirección que muestra Vite (normalmente `http://localhost:5173`). No se debe abrir `index.html` con doble clic: React necesita el servidor o la compilación.

```bash
npm run build          # salida lista para hosting en dist/
npm run preview        # revisar la compilación localmente
npm test               # Jasmine + Karma + Chromium/Chrome Headless
npm run test:watch     # repetir pruebas durante el desarrollo
npm run package        # crear artifacts/vesper-entrega-2.zip
```

Para los tests se necesita Chrome o Chromium instalado. En Linux se detecta `/usr/bin/chromium`; en otros sistemas se puede definir `CHROME_BIN` con la ruta del ejecutable. El informe medido se genera en `coverage/index.html`, `coverage/lcov.info` y `coverage/coverage-summary.json`.

Antes de empaquetar la entrega: ejecutar `npm test` y `npm run build`, luego `npm run package`. El ZIP contiene código, documentación, pruebas, cobertura disponible y compilación; excluye `.git`, dependencias y archivos `.env`.

## Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@vesper.cl | admin123 |
| Cliente | usuario@vesper.cl | user123 |

También se puede registrar un cliente nuevo. El catálogo y la compra son públicos. Utilizar **datos ficticios**: esta es una simulación frontend, las credenciales se almacenan localmente y no ofrecen autenticación de producción.

## Qué incluye

- Catálogo, detalle, búsqueda combinada con categorías, ofertas y stock.
- Nosotros, journal con artículos y contacto con validación y consultas visibles para el administrador.
- Registro, sesión por pestaña, perfil con dirección y historial de compras.
- Carrito persistente, cantidades y límites de stock, despacho o retiro, checkout con datos del perfil y resumen de pedido.
- Selector de pago simulado aprobado/rechazado. El rechazo conserva el carrito; la compra aprobada descuenta stock y guarda un comprobante.
- Panel protegido por rol: productos, categorías y usuarios con CRUD, pedidos, comprobantes, reportes de ventas, stock crítico y perfil.
- Jasmine y Karma: pruebas de DOM, props, estado, eventos, formularios, administración, mocks y servicio de persistencia.

## Arquitectura

```text
src/
  main.jsx                React + HashRouter + ShopProvider
  App.jsx                 Rutas de la tienda
  components/             Presentación reutilizable, campos y navegación
  pages/                  Vistas y formularios React
  context/ShopContext.jsx useSyncExternalStore y suscripción al estado
  services/store.js       Reglas, CRUD, persistencia y compra simulada
  data/                   Catálogo inicial y artículos
  style.css               Identidad VESPER sobre Bootstrap
public/assets/            Imágenes y recursos de la primera entrega
```

Los datos se guardan en `localStorage.vesper_store_v2`; la sesión en `sessionStorage.vesper_session`. Se recuperan productos, usuarios y carrito de las claves de la primera entrega, sin sobreescribir sus cambios. El estado de React se actualiza por suscripción después de guardar. Los pedidos conservan nombre, precio y cantidad de sus productos aunque luego se edite el catálogo.

Para reiniciar una demostración, borrar los datos del sitio en las herramientas del navegador y recargar. Esto elimina las cuentas, productos y pedidos creados en ese navegador. Los datos no se sincronizan entre equipos o pestañas abiertas.

La navegación usa **HashRouter** (`/#/productos`), por lo que funciona en hosting estático sin reglas de reescritura. Publicar el contenido de `dist/`. Se conservan redirecciones para las páginas antiguas `login.html`, `admin.html`, `carrito.html` y `contacto.html`.

## Documentación para entregar y presentar

- [ERS actualizado V2](docs/ERS-v2.md): requisitos, aceptación y alcance.
- [Cobertura del testing](docs/cobertura-testing.md): casos, resultados medidos y límites.
- [Guía de presentación](docs/guia-presentacion.md): guion de 15 minutos y preguntas técnicas.

La pauta solicita una base simulada en JavaScript. No se ha entregado ni implementado un backend HTTP o una pasarela de pagos. Si el docente exige integración real adicional, será una etapa distinta. Los comprobantes de esta aplicación son académicos y no tienen validez tributaria.
