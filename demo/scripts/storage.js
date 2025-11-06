// demo/scripts/storage.js
const KEY = { CART:'cart:v1', ADDRESS:'address:v1' };

export const Storage = {
  getCart(){ try{return JSON.parse(localStorage.getItem(KEY.CART) || '[]')}catch{return[]} },
  setCart(items){ localStorage.setItem(KEY.CART, JSON.stringify(items)); },
  clearCart(){ localStorage.removeItem(KEY.CART); },
  getAddress(){ try{return JSON.parse(localStorage.getItem(KEY.ADDRESS) || 'null')}catch{return null} },
  setAddress(addr){ localStorage.setItem(KEY.ADDRESS, JSON.stringify(addr)); }
};
