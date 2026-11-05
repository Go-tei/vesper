import { Route, Routes } from 'react-router-dom';
import AdminPages from '../src/pages/AdminPages';
import { ShopProvider } from '../src/context/ShopContext';
import { createStore, store } from '../src/services/store';
import { change, click, mount, submit } from './helpers';

function memoryStorage() {
  const entries = new Map();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: (key) => entries.delete(key),
  };
}

describe('Administración React: acceso, formularios y operaciones CRUD', () => {
  let view;
  let db;
  beforeEach(() => {
    db = createStore({ storage: memoryStorage(), sessionStorage: memoryStorage() });
  });
  afterEach(() => {
    view?.unmount();
    view = null;
  });

  function open(route = '/admin') {
    view = mount(
      <ShopProvider value={db}>
        <Routes>
          <Route path="/admin/*" element={<AdminPages />} />
          <Route path="/login" element={<h1>Acceso a Vesper</h1>} />
        </Routes>
      </ShopProvider>,
      { route },
    );
  }
  function field(label) {
    const element = [...view.container.querySelectorAll('label')].find(
      (entry) => entry.textContent === label,
    );
    if (!element) throw new Error(`No se encontró el campo ${label}`);
    return document.getElementById(element.htmlFor);
  }
  it('redirige al login cuando un visitante abre una ruta administrativa', () => {
    open('/admin/productos');
    expect(view.container.textContent).toContain('Acceso a Vesper');
    expect(view.container.textContent).not.toContain('Panel Vesper');
  });

  it('impide que una cuenta de cliente vea los mantenedores', () => {
    db.login('usuario@vesper.cl', 'user123');
    open('/admin/usuarios');
    expect(view.container.textContent).toContain('Acceso reservado a administradores');
    expect(view.container.querySelector('form')).toBeNull();
  });

  it('muestra el resumen y la navegación de administración al administrador', () => {
    db.login('admin@vesper.cl', 'admin123');
    open();
    expect(view.container.textContent).toContain('Resumen de la tienda');
    expect(view.container.querySelector('nav[aria-label="Administración"]')).not.toBeNull();
    expect(view.container.querySelector('a[href="/admin/reportes"]')).not.toBeNull();
    expect(view.container.textContent).toContain('Todavía no hay pedidos.');
  });

  it('crea, consulta, edita y elimina una categoría desde el DOM', () => {
    db.login('admin@vesper.cl', 'admin123');
    spyOn(store, 'saveCategory').and.callFake((data) => db.saveCategory(data));
    spyOn(store, 'deleteCategory').and.callFake((id) => db.deleteCategory(id));
    spyOn(window, 'confirm').and.returnValue(true);
    open('/admin/categorias');
    change(field('Nombre de categoría'), 'Colección de prueba');
    submit(view.container.querySelector('form'));
    let row = [...view.container.querySelectorAll('tbody tr')].find((entry) =>
      entry.textContent.includes('Colección de prueba'),
    );
    expect(row).toBeDefined();
    click(row.querySelector('button'));
    expect(field('Nombre de categoría').value).toBe('Colección de prueba');
    change(field('Nombre de categoría'), 'Colección editada');
    submit(view.container.querySelector('form'));
    row = [...view.container.querySelectorAll('tbody tr')].find((entry) =>
      entry.textContent.includes('Colección editada'),
    );
    expect(row).toBeDefined();
    click(row.querySelectorAll('button')[1]);
    expect(view.container.querySelector('tbody').textContent).not.toContain('Colección editada');
    expect(
      db.getSnapshot().categories.some((category) => category.nombre === 'Colección editada'),
    ).toBeFalse();
    expect(window.confirm).toHaveBeenCalledTimes(1);
  });

  it('muestra el error del servicio al intentar eliminar una categoría con productos', () => {
    db.login('admin@vesper.cl', 'admin123');
    spyOn(store, 'deleteCategory').and.callFake((id) => db.deleteCategory(id));
    spyOn(window, 'confirm').and.returnValue(true);
    open('/admin/categorias');
    click(view.container.querySelector('tbody tr').querySelectorAll('button')[1]);
    expect(view.container.querySelector('[role="alert"]').textContent).toContain('tiene productos');
    expect(db.getSnapshot().categories.length).toBe(3);
  });

  it('guarda un producto mediante un formulario controlado y vuelve al listado actualizado', () => {
    db.login('admin@vesper.cl', 'admin123');
    spyOn(store, 'saveProduct').and.callFake((data) => db.saveProduct(data));
    open('/admin/productos/nuevo');
    change(field('Nombre del producto'), 'Polera de presentación');
    change(field('Precio en pesos chilenos'), '20000');
    change(field('Stock disponible'), '8');
    change(field('Descuento (%)'), '10');
    change(field('Descripción'), 'Una polera para probar el flujo administrativo.');
    submit(view.container.querySelector('form'));
    expect(view.container.querySelector('table').textContent).toContain('Polera de presentación');
    const product = db
      .getSnapshot()
      .products.find((entry) => entry.nombre === 'Polera de presentación');
    expect(product.stock).toBe(8);
    expect(product.descuento).toBe(10);
    expect(view.container.querySelector(`a[href="/productos/${product.id}"]`)).not.toBeNull();
  });

  it('no elimina un producto cuando el administrador cancela la confirmación', () => {
    db.login('admin@vesper.cl', 'admin123');
    const remove = spyOn(store, 'deleteProduct');
    spyOn(window, 'confirm').and.returnValue(false);
    open('/admin/productos');
    const row = view.container.querySelector('tbody tr');
    click(row.querySelector('button'));
    expect(remove).not.toHaveBeenCalled();
    expect(db.getSnapshot().products.length).toBe(13);
  });
});
