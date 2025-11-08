// demo/scripts/config.js
window.CONFIG = {
  BASE_URL: '',                 // มี API จริงค่อยใส่ เช่น 'https://api.yourdomain.com'
  TIMEOUT_MS: 10000,
  FEATURE_FLAGS: {
    useRemoteProducts: false,   // false = อ่าน data/products.json
    syncCart: false
  },
  AUTH: { token: null }
};

// ให้โค้ดเก่าใช้ง่ายขึ้น
window.Services = window.Services || {};
window.Services.config = {
  DATA_MODE: window.CONFIG.FEATURE_FLAGS.useRemoteProducts ? 'api' : 'local-json',
  API_BASE: window.CONFIG.BASE_URL
};
