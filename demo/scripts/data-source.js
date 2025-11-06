// demo/scripts/data-source.js  (ไม่ต้องมี <script>...)
// แหล่งข้อมูลกลาง: local JSON / API จริง
(function () {
  const cfg = (window.Services && window.Services.config) || {
    DATA_MODE: "local-json",
    API_BASE: ""
  };

  const norm = (p) => p && ({
    id: p.id ?? p.sku ?? String(p.name || p.title),
    name: p.name ?? p.title ?? "Unnamed",
    price: Number(p.price ?? p.net ?? 0),
    image: p.image ?? p.img ?? p.thumbnail ?? "",
    category: p.category ?? p.cat ?? "",
    tags: p.tags ?? [],
    promo: p.promo ?? p.promotion ?? null,
    raw: p
  });

  async function j(url) {
    const r = await fetch(url, { headers: { "cache-control": "no-cache" } });
    if (!r.ok) throw new Error(`Fetch ${url} ${r.status}`);
    return r.json();
  }

  const DataSource = {
    async getProducts() {
      const list =
        cfg.DATA_MODE === "api"
          ? await j(`${cfg.API_BASE}/products`)
          : await j("data/products.json");      // << สำคัญ: อิงจาก /demo/index.html

      const arr = Array.isArray(list) ? list : (list.items ?? list.data ?? []);
      return arr.map(norm).filter(Boolean);
    },
    async getProduct(id) {
      const items = await this.getProducts();
      return items.find((p) => String(p.id) === String(id)) || null;
    }
  };

  window.Services = window.Services || {};
  window.Services.DataSource = DataSource;
})();
