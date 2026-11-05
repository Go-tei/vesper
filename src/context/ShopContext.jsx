import { createContext, useContext, useSyncExternalStore } from 'react';
import { store } from '../services/store';
const ShopContext = createContext(null);
export function ShopProvider({ children, value = store }) {
  const snapshot = useSyncExternalStore(value.subscribe, value.getSnapshot, value.getSnapshot);
  return <ShopContext.Provider value={snapshot}>{children}</ShopContext.Provider>;
}
export function useShop() {
  const snapshot = useContext(ShopContext);
  if (!snapshot) throw new Error('useShop necesita ShopProvider.');
  return snapshot;
}
