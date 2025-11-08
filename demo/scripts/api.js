// demo/scripts/api.js
import { CONFIG } from './config.js';

async function fetchJSON(url, opts = {}){
  const ctrl = new AbortController();
  const timer = setTimeout(()=>ctrl.abort(), CONFIG.TIMEOUT_MS);
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  if(CONFIG.AUTH.token){ headers.Authorization = `Bearer ${CONFIG.AUTH.token}`; }
  try{
    const res = await fetch(url, { ...opts, headers, signal: ctrl.signal });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }finally{ clearTimeout(timer); }
}

export const Api = {
  // ✅ ดึงสินค้าจาก API หรือไฟล์โลคอล (fallback)
  async listProducts(){
    if(!CONFIG.FEATURE_FLAGS.useRemoteProducts){
      return fetch('../data/products.json').then(r=>r.json());
    }
    return fetchJSON(`${CONFIG.BASE_URL}/products`);
  },
  async getProduct(id){
    if(!CONFIG.FEATURE_FLAGS.useRemoteProducts){
      const list = await this.listProducts();
      return list.find(x => String(x.id)===String(id) || String(x.sku)===String(id));
    }
    return fetchJSON(`${CONFIG.BASE_URL}/products/${id}`);
  },
  async createOrder(payload){
    if(CONFIG.FEATURE_FLAGS.useRemoteProducts){
      return fetchJSON(`${CONFIG.BASE_URL}/orders`, { method:'POST', body: JSON.stringify(payload) });
    }
    // mock response เมื่อยังไม่มี API จริง
    return { orderId: `DEMO-${Date.now()}` };
  },
  async getOrder(id){
    if(CONFIG.FEATURE_FLAGS.useRemoteProducts){
      return fetchJSON(`${CONFIG.BASE_URL}/orders/${id}`);
    }
    // mock ข้อมูลสถานะจัดส่ง
    return { id, status: 'processing', eta: '30-45 นาที', carrier: 'Mock Delivery' };
  }
};
