// demo/scripts/storage.js
// Attach a simple storage helper to window so demo pages using plain <script> can access it.
const STORAGE_KEY = { CART:'cart:v1', ADDRESS:'address:v1' };

window.Storage = {
  getCart(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY.CART) || '[]')}catch{return[]} },
  setCart(items){ localStorage.setItem(STORAGE_KEY.CART, JSON.stringify(items)); },
  clearCart(){ localStorage.removeItem(STORAGE_KEY.CART); },
  getAddress(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY.ADDRESS) || 'null')}catch{return null} },
  setAddress(addr){ localStorage.setItem(STORAGE_KEY.ADDRESS, JSON.stringify(addr)); }
};
