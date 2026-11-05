import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ShopProvider } from '../src/context/ShopContext';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export function mount(element, { snapshot, route = '/' } = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const source = snapshot
    ? {
        getSnapshot: () => snapshot,
        subscribe: () => () => {},
      }
    : null;
  act(() => {
    root.render(
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {source ? <ShopProvider value={source}>{element}</ShopProvider> : element}
      </MemoryRouter>,
    );
  });
  return {
    container,
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

export function change(element, value) {
  if (!element) throw new Error('No se encontró el campo para cambiar.');
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(
      new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }),
    );
  });
}

export function click(element) {
  if (!element) throw new Error('No se encontró el botón.');
  act(() => element.click());
}

export function submit(form) {
  act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
