// demo/scripts/api.js
// This file intentionally uses the global `window.CONFIG` and attaches `Api` to `window`
// so it works with plain <script> includes in demo/index.html (non-module).

async function fetchJSON(url, opts = {}){
  const cfg = window.CONFIG || { TIMEOUT_MS: 10000, AUTH: {} };
  const ctrl = new AbortController();
  const timer = setTimeout(()=>ctrl.abort(), cfg.TIMEOUT_MS || 10000);
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  if(cfg.AUTH && cfg.AUTH.token){ headers.Authorization = `Bearer ${cfg.AUTH.token}`; }
  try{
    const res = await fetch(url, { ...opts, headers, signal: ctrl.signal });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }finally{ clearTimeout(timer); }
}

window.Api = {
  // ✅ ดึงสินค้าจาก API หรือไฟล์โลคอล (fallback)
  async listProducts(){
    const cfg = window.CONFIG || { FEATURE_FLAGS: { useRemoteProducts:false }, BASE_URL: '' };
    if(!cfg.FEATURE_FLAGS.useRemoteProducts){
      // In demo context the products.json is located at ./data/products.json
      return fetch('data/products.json').then(r=>r.json());
    }
    return fetchJSON(`${cfg.BASE_URL}/products`);
  },
  async getProduct(id){
    const cfg = window.CONFIG || { FEATURE_FLAGS: { useRemoteProducts:false }, BASE_URL: '' };
    if(!cfg.FEATURE_FLAGS.useRemoteProducts){
      const list = await this.listProducts();
      return list.find(x => String(x.id)===String(id) || String(x.sku)===String(id));
    }
    return fetchJSON(`${cfg.BASE_URL}/products/${id}`);
  },
  async createOrder(payload){
    if(CONFIG.FEATURE_FLAGS.useRemoteProducts){
      return fetchJSON(`${CONFIG.BASE_URL}/orders`, { method:'POST', body: JSON.stringify(payload) });
    }
    // mock response เมื่อยังไม่มี API จริง
    return { orderId: `DEMO-${Date.now()}` };
  },
  async getOrder(id){
    const cfg = window.CONFIG || { FEATURE_FLAGS: { useRemoteProducts:false }, BASE_URL: '' };
    if(cfg.FEATURE_FLAGS.useRemoteProducts){
      return fetchJSON(`${cfg.BASE_URL}/orders/${id}`);
    }
    // mock ข้อมูลสถานะจัดส่ง
    return { id, status: 'processing', eta: '30-45 นาที', carrier: 'Mock Delivery' };
  }
};
