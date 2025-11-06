// demo/scripts/app.js
// ===== Elements & State =====
const els = {
  // landing -> app
  landing: document.getElementById('landing'),
  app: document.getElementById('app'),
  startBtn: document.getElementById('startBtn'),

  // list & filters
  search: document.getElementById('searchInput'),
  results: document.getElementById('results'),
  panel: document.getElementById('panel'),
  filterBtn: document.getElementById('filterBtn'),
  closePanel: document.getElementById('closePanel'),
  resetBtn: document.getElementById('resetBtn'),
  applyBtn: document.getElementById('applyBtn'),
  chips: document.querySelectorAll('.chip'),
  summary: document.getElementById('activeSummary'),
  cardTpl: document.getElementById('cardTpl'),
  sortSelect: document.getElementById('sortSelect'),

  // PDP
  pdp: document.getElementById('pdp'),
  pdpClose: document.getElementById('pdpClose'),
  pdpTitle: document.getElementById('pdpTitle'),
  pdpPrice: document.getElementById('pdpPrice'),
  pdpHeat: document.getElementById('pdpHeat'),
  pdpSauce: document.getElementById('pdpSauce'),
  sauceList: document.getElementById('sauceList'),
  pdpAddons: document.getElementById('pdpAddons'),
  addonList: document.getElementById('addonList'),
  qtyMinus: document.getElementById('qtyMinus'),
  qtyPlus: document.getElementById('qtyPlus'),
  qtyVal: document.getElementById('qtyVal'),
  addToCart: document.getElementById('addToCart'),
  recoList: document.getElementById('recoList'),

  // Cart
  cartBtn: document.getElementById('cartBtn'),
  cartBadge: document.getElementById('cartBadge'),
  cart: document.getElementById('cart'),
  cartClose: document.getElementById('cartClose'),
  cartItems: document.getElementById('cartItems'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn')
};

const state = {
  q: "",
  filters: { category:new Set(), protein:new Set(), base:new Set(), price:"", promo:false },
  sort: "recommended",
  products: [],
  cart: JSON.parse(localStorage.getItem('cart')||"[]"),
  pdp: { id:null, qty:1, heat:null, sauce:null, addons:[] }
};

// ===== ช่วยแม็ปชิป → หมวดจริงใน JSON =====
const CATEGORY_ALIASES = {
  'อาหาร': 'พร้อมทาน',
  'ขนม': 'ทานเล่น',
  'ของใช้': 'ของใช้'
};

// ===== Init =====
els.startBtn?.addEventListener('click', (e)=>{
  e.preventDefault();
  els.landing?.classList.add('hidden');
  els.app?.classList.remove('hidden');
  document.getElementById('app')?.scrollIntoView({behavior:'smooth', block:'start'});
  els.search?.focus();
});

// Load products via DataSource (มี normalize กันฟิลด์)
(async ()=>{
  try{
    const data = await window.Services?.DataSource?.getProducts?.();
    const list = Array.isArray(data) ? data : [];
    state.products = list.map(p => ({
      id: p.id ?? p.sku ?? String(p.name || p.title),
      name: p.name ?? p.title ?? 'Unnamed',
      price: Number(p.price ?? p.net ?? 0),
      image: p.image ?? p.img ?? p.thumbnail ?? '',
      category: p.category ?? p.cat ?? '',     // สำคัญ: ต้องเป็น "พร้อมทาน/ทานเล่น/ของใช้"
      protein: p.protein ?? p.meat ?? '',
      base: p.base ?? null,
      promo: p.promo ?? p.promotion ?? null,
      tags: p.tags ?? [],
      heatable: !!p.heatable,
      options: p.options || {}
    }));
  }catch(err){
    console.error('โหลดสินค้าไม่สำเร็จ:', err);
    state.products = [];
  }
  render();
})();

// Search
els.search?.addEventListener('input', e=>{ state.q = e.target.value.trim(); render(); });

// Chips (รองรับทั้ง boolean chip และ chip หมวดแบบ cat:อาหาร)
els.chips.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const key = btn.dataset.chip || '';
    if (key.startsWith('cat:')) {
      const label = key.slice(4);
      const mapped = CATEGORY_ALIASES[label] || label;
      const set = state.filters.category;
      if (set.has(mapped)) set.delete(mapped); else set.add(mapped);
      btn.classList.toggle('active', set.has(mapped));
      render();
      return;
    }
    // เช็คกรณี promo / อื่น ๆ ที่เป็น boolean
    state.filters[key] = !state.filters[key];
    btn.classList.toggle('active', state.filters[key]);
    render();
  });
});

// Panel
els.filterBtn?.addEventListener('click', ()=> els.panel?.classList.add('open'));
els.closePanel?.addEventListener('click', ()=> els.panel?.classList.remove('open'));
els.applyBtn?.addEventListener('click', ()=>{
  ['category','protein','base'].forEach(name=>{
    const set = new Set();
    document.querySelectorAll(`input[name="${name}"]:checked`).forEach(i=>set.add(i.value));
    state.filters[name] = set;
  });
  const price = document.querySelector('input[name="price"]:checked');
  state.filters.price = price ? price.value : "";
  state.filters.promo = !!document.querySelector('input[name="promo"]:checked');
  els.panel?.classList.remove('open'); render();
});
els.resetBtn?.addEventListener('click', ()=>{
  state.filters = {category:new Set(), protein:new Set(), base:new Set(), price:"", promo:false};
  document.querySelectorAll('#panel input')?.forEach(i=>{
    if(i.type==='checkbox') i.checked=false;
    if(i.type==='radio') i.checked = (i.value==="");
  });
  els.chips.forEach(c=>c.classList.remove('active'));
  render();
});
els.sortSelect?.addEventListener('change', e=>{ state.sort = e.target.value; render(); });

// Cart UI
els.cartBtn?.addEventListener('click', ()=> els.cart?.classList.add('open'));
els.cartClose?.addEventListener('click', ()=> els.cart?.classList.remove('open'));

// ===== Core Render =====
function render(){
  let list = filterProducts(state.products, state);
  list = sortProducts(list, state.sort);
  renderSummary();
  renderCards(list);
  updateCartBadge();
}

function filterProducts(items, st){
  const q = st.q.toLowerCase();
  const f = st.filters;
  return items.filter(p=>{
    if(q){
      const inName = p.name?.toLowerCase().includes(q);
      const inTags = (p.tags||[]).some(t=> t.toLowerCase().includes(q));
      if(!(inName || inTags)) return false;
    }
    if(f.promo && !p.promo) return false;
    if(f.price){
      if(f.price==='lte30' && !(p.price<=30)) return false;
      if(f.price==='31to50' && !(p.price>=31 && p.price<=50)) return false;
      if(f.price==='gt50' && !(p.price>50)) return false;
    }
    if(f.category.size && !f.category.has(p.category)) return false;
    if(f.protein.size && !f.protein.has(p.protein)) return false;
    if(f.base.size && p.base !== null && !f.base.has(p.base)) return false;
    return true;
  });
}

function sortProducts(list, mode){
  const arr = [...list];
  if(mode==='price_asc') arr.sort((a,b)=>a.price-b.price);
  else if(mode==='price_desc') arr.sort((a,b)=>b.price-a.price);
  else if(mode==='promo_first') arr.sort((a,b)=>(b.promo?1:0)-(a.promo?1:0));
  return arr;
}

function renderSummary(){
  const parts = []; const f = state.filters;
  if(f.category.size) parts.push('หมวด: '+[...f.category].join('/'));
  if(f.protein.size) parts.push('โปรตีน: '+[...f.protein].join('/'));
  if(f.base.size) parts.push('ฐาน: '+[...f.base].join('/'));
  if(f.price) parts.push('ราคา: '+(f.price==='lte30'?'≤30':f.price==='31to50'?'31–50':'>50'));
  if(f.promo) parts.push('มีโปร');
  if(state.q) parts.push('ค้นหา: '+state.q);
  const el = els.summary;
  if(!el) return;
  if(parts.length){ el.textContent='กำลังกรอง: '+parts.join(' · '); el.classList.remove('hide'); }
  else el.classList.add('hide');
}

function renderCards(list){
  if(!els.results || !els.cardTpl){ return; }
  els.results.innerHTML = '';
  if(!list.length){
    const empty = document.createElement('div');
    empty.className='empty';
    empty.textContent='ไม่พบผลลัพธ์ ลองลบหรือผ่อนเงื่อนไขบางอย่าง';
    els.results.appendChild(empty);
    return;
  }
  list.forEach(p=>{
    const card = els.cardTpl.content.cloneNode(true);
    card.querySelector('.title').textContent = p.name;
    card.querySelector('.price').textContent = '฿'+p.price;
    const promoBadge = card.querySelector('.badge.promo');
    if(p.promo && promoBadge) promoBadge.classList.remove('hide');

    const thumb = card.querySelector('.thumb');
    if (thumb){
      if (p.image) {
        const im = document.createElement('img');
        im.src = p.image; im.alt = p.name; im.loading = 'lazy';
        im.onerror = ()=> { thumb.innerHTML = '<div class="ph">IMG</div>'; };
        thumb.innerHTML = '';
        thumb.appendChild(im);
      } else {
        thumb.innerHTML = '<div class="ph">IMG</div>';
      }
    }
    const el = card.querySelector('.card');
    el.addEventListener('click', ()=> openPDP(p.id));
    els.results.appendChild(card);
  });
}

// ===== PDP =====
function openPDP(pid){
  const p = state.products.find(x=>x.id===pid);
  if(!p || !els.pdp) return;

  state.pdp = { id:p.id, qty:1, heat: p.heatable ? 'อุ่น' : null, sauce:null, addons:[] };
  els.qtyVal && (els.qtyVal.textContent = '1');
  els.pdpTitle && (els.pdpTitle.textContent = p.name);
  els.pdpPrice && (els.pdpPrice.textContent = '฿'+p.price);

  const hero = document.querySelector('.pdp-hero .hero-img');
  if (hero) hero.innerHTML = p.image ? `<img src="${p.image}" alt="${p.name}">` : 'IMG';

  // heatable
  toggleBlock(els.pdpHeat, !!p.heatable);
  if(p.heatable && els.pdpHeat){
    els.pdpHeat.querySelectorAll('.seg-btn').forEach(b=>{
      b.classList.toggle('active', b.dataset.heat==='อุ่น');
      b.onclick = ()=>{
        els.pdpHeat.querySelectorAll('.seg-btn').forEach(btn=>btn.classList.remove('active'));
        b.classList.add('active');
        state.pdp.heat = b.dataset.heat;
      };
    });
  }

  // sauces
  toggleBlock(els.pdpSauce, !!(p.options && p.options.sauces && p.options.sauces.length));
  if(els.sauceList){
    els.sauceList.innerHTML='';
    (p.options?.sauces || []).forEach((name,i)=>{
      const btn = document.createElement('button');
      btn.className='seg-btn';
      btn.textContent = name;
      if(i===0){ btn.classList.add('active'); state.pdp.sauce = name; }
      btn.onclick = ()=>{
        els.sauceList.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        state.pdp.sauce = name;
      };
      els.sauceList.appendChild(btn);
    });
  }

  // addons
  toggleBlock(els.pdpAddons, !!(p.options && p.options.addons && p.options.addons.length));
  if(els.addonList){
    els.addonList.innerHTML='';
    (p.options?.addons || []).forEach(name=>{
      const label = document.createElement('label');
      const cb = document.createElement('input');
      cb.type='checkbox'; cb.value=name;
      cb.onchange = ()=>{
        if(cb.checked) state.pdp.addons.push(name);
        else state.pdp.addons = state.pdp.addons.filter(x=>x!==name);
      };
      label.appendChild(cb);
      label.appendChild(document.createTextNode(name));
      els.addonList.appendChild(label);
    });
  }

  // qty
  els.qtyMinus && (els.qtyMinus.onclick = ()=>{ if(state.pdp.qty>1){ state.pdp.qty--; els.qtyVal.textContent=String(state.pdp.qty);} });
  els.qtyPlus && (els.qtyPlus.onclick = ()=>{ state.pdp.qty++; els.qtyVal.textContent=String(state.pdp.qty); });

  // add to cart
  els.addToCart && (els.addToCart.onclick = ()=>{ addCurrentToCart(); closePDP(); });

  // reco
  renderRecommendations(p);

  // open
  els.pdp.classList.remove('hidden');
}
function closePDP(){ els.pdp?.classList.add('hidden'); }
document.querySelector('.sheet-backdrop')?.addEventListener('click', closePDP);
els.pdpClose?.addEventListener('click', closePDP);
window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !els.pdp?.classList.contains('hidden')) closePDP(); });

function toggleBlock(el, show){ el?.classList.toggle('hidden', !show); }

function renderRecommendations(p){
  if(!els.recoList || !els.cardTpl) return;
  const all = state.products.filter(x => x.id !== p.id);
  let sameBase = [];
  if (p.base) sameBase = all.filter(x => x.base && x.base === p.base);
  const sameCategory = all.filter(x => x.category === p.category && !sameBase.includes(x));
  const similar = [...sameBase, ...sameCategory].slice(0, 2);
  const cross = all.filter(x => x.category !== p.category);
  const crossPick = cross[Math.floor(Math.random() * cross.length)] || null;

  const recos = [...similar];
  if (crossPick) recos.push(crossPick);

  els.recoList.innerHTML = '';
  recos.forEach(r => {
    const card = els.cardTpl.content.cloneNode(true);
    card.querySelector('.title').textContent = r.name;
    card.querySelector('.price').textContent = '฿' + r.price;
    const promoBadge = card.querySelector('.badge.promo');
    if (r.promo && promoBadge) promoBadge.classList.remove('hide');

    const thumb = card.querySelector('.thumb');
    if (thumb) {
      if (r.image) {
        const im = document.createElement('img');
        im.src = r.image; im.alt = r.name; im.loading = 'lazy';
        im.onerror = () => { thumb.innerHTML = '<div class="ph">IMG</div>'; };
        thumb.innerHTML = '';
        thumb.appendChild(im);
      } else {
        thumb.innerHTML = '<div class="ph">IMG</div>';
      }
    }
    card.querySelector('.card').addEventListener('click', () => openPDP(r.id));
    els.recoList.appendChild(card);
  });
}

// ===== Cart =====
function addCurrentToCart(){
  const p = state.products.find(x=>x.id===state.pdp.id);
  if(!p) return;

  const ADDON_PRICES = { "เพิ่มไข่ต้ม": 5 };
  const addonsSelected = state.pdp.addons || [];
  const addonExtra = addonsSelected.reduce((s,name)=> s + (ADDON_PRICES[name]||0), 0);
  const unitPrice = p.price + addonExtra;

  const entry = {
    id: p.id,
    name: p.name,
    price: unitPrice,
    qty: state.pdp.qty,
    heat: state.pdp.heat,
    sauce: state.pdp.sauce,
    addons: addonsSelected
  };
  state.cart.push(entry);
  persistCart();
  updateCartBadge();
  renderCart();
}

function persistCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); }
function updateCartBadge(){
  if(!els.cartBadge) return;
  const count = state.cart.reduce((n,it)=> n+it.qty, 0);
  els.cartBadge.textContent = String(count);
  els.cartBadge.classList.toggle('hide', count===0);
}
function renderCart(){
  if(!els.cartItems || !els.cartTotal) return;
  els.cartItems.innerHTML='';
  if(state.cart.length===0){
    els.cartItems.textContent='ยังไม่มีสินค้าในตะกร้า';
  }else{
    state.cart.forEach((it,idx)=>{
      const row = document.createElement('div');
      row.className='cart-item';
      const left = document.createElement('div');
      left.innerHTML = `<div><strong>${it.name}</strong></div>` +
        `<div style="font-size:12px;color:#666">${[it.heat, it.sauce, ...(it.addons||[])].filter(Boolean).join(' · ')}</div>` +
        `<div style="font-size:12px;color:#666">x${it.qty}</div>`;
      const right = document.createElement('div');
      right.innerHTML = `<div>฿${it.price*it.qty}</div>`;
      const del = document.createElement('button');
      del.textContent='ลบ'; del.className='ghost';
      del.onclick = ()=>{ state.cart.splice(idx,1); persistCart(); updateCartBadge(); renderCart(); };
      right.appendChild(del);
      row.appendChild(left); row.appendChild(right);
      els.cartItems.appendChild(row);
    });
  }
  const total = state.cart.reduce((s,it)=> s + it.price*it.qty, 0);
  els.cartTotal.textContent = 'รวม: ฿'+total;
}
renderCart(); updateCartBadge();

// ไปหน้า Checkout จาก Cart (มี guard)
els.checkoutBtn?.addEventListener('click', ()=>{
  if(state.cart.length===0){
    alert('ยังไม่มีสินค้าในตะกร้า');
    return;
  }
  window.location.href = 'checkout.html';
});
