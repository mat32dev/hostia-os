// HosT.ia POS — IndexedDB wrapper for offline storage

const DB_NAME = 'hostia_pos';
const DB_VERSION = 1;

let db = null;

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Tables
      if (!db.objectStoreNames.contains('tables')) {
        const tables = db.createObjectStore('tables', { keyPath: 'id', autoIncrement: true });
        tables.createIndex('number', 'number', { unique: true });
        tables.createIndex('status', 'status', { unique: false });
        tables.createIndex('zone', 'zone', { unique: false });
      }

      // Menu items
      if (!db.objectStoreNames.contains('menu_items')) {
        const menu = db.createObjectStore('menu_items', { keyPath: 'id', autoIncrement: true });
        menu.createIndex('category', 'category', { unique: false });
        menu.createIndex('name', 'name', { unique: false });
        menu.createIndex('available', 'is_available', { unique: false });
      }

      // Menu categories
      if (!db.objectStoreNames.contains('categories')) {
        const cats = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        cats.createIndex('name', 'name', { unique: true });
      }

      // Orders
      if (!db.objectStoreNames.contains('orders')) {
        const orders = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        orders.createIndex('date', 'date', { unique: false });
        orders.createIndex('status', 'status', { unique: false });
        orders.createIndex('table_id', 'table_id', { unique: false });
      }

      // Order items
      if (!db.objectStoreNames.contains('order_items')) {
        const items = db.createObjectStore('order_items', { keyPath: 'id', autoIncrement: true });
        items.createIndex('order_id', 'order_id', { unique: false });
      }

      // Payments
      if (!db.objectStoreNames.contains('payments')) {
        const payments = db.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
        payments.createIndex('order_id', 'order_id', { unique: false });
        payments.createIndex('method', 'method', { unique: false });
        payments.createIndex('date', 'date', { unique: false });
      }

      // Settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Inventory
      if (!db.objectStoreNames.contains('inventory')) {
        const inv = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
        inv.createIndex('name', 'name', { unique: false });
        inv.createIndex('category', 'category', { unique: false });
      }

      // Sync queue (for offline → cloud sync)
      if (!db.objectStoreNames.contains('sync_queue')) {
        const sync = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        sync.createIndex('type', 'type', { unique: false });
        sync.createIndex('status', 'status', { unique: false });
      }
    };
  });
}

// Generic helpers
async function getAll(storeName) {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getById(storeName, id) {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getByIndex(storeName, indexName, value) {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index(indexName);
  return new Promise((resolve, reject) => {
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function add(storeName, data) {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put(storeName, data) {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function remove(storeName, id) {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clear(storeName) {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Settings helpers
async function getSetting(key, defaultValue = null) {
  const tx = db.transaction('settings', 'readonly');
  const store = tx.objectStore('settings');
  return new Promise((resolve) => {
    const request = store.get(key);
    request.onsuccess = () => {
      resolve(request.result ? request.result.value : defaultValue);
    };
    request.onerror = () => resolve(defaultValue);
  });
}

async function setSetting(key, value) {
  return put('settings', { key, value });
}

// Export helpers
async function exportData() {
  const data = {};
  const stores = ['tables', 'menu_items', 'categories', 'orders', 'order_items', 'payments', 'settings', 'inventory'];
  for (const store of stores) {
    data[store] = await getAll(store);
  }
  return data;
}

async function importData(data) {
  const stores = Object.keys(data);
  for (const store of stores) {
    await clear(store);
    for (const item of data[store]) {
      await put(store, item);
    }
  }
}

// Seed default data
async function seedDefaultData() {
  const tables = await getAll('tables');
  if (tables.length === 0) {
    const defaultTables = [
      { number: 1, capacity: 2, zone: 'salon', status: 'free' },
      { number: 2, capacity: 2, zone: 'salon', status: 'free' },
      { number: 3, capacity: 4, zone: 'salon', status: 'free' },
      { number: 4, capacity: 4, zone: 'salon', status: 'free' },
      { number: 5, capacity: 6, zone: 'salon', status: 'free' },
      { number: 6, capacity: 2, zone: 'terraza', status: 'free' },
      { number: 7, capacity: 4, zone: 'terraza', status: 'free' },
      { number: 8, capacity: 6, zone: 'terraza', status: 'free' },
      { number: 9, capacity: 2, zone: 'barra', status: 'free' },
      { number: 10, capacity: 4, zone: 'barra', status: 'free' },
    ];
    for (const t of defaultTables) {
      await add('tables', t);
    }
  }

  const categories = await getAll('categories');
  if (categories.length === 0) {
    const defaultCats = [
      { name: 'Entrantes', sort_order: 1 },
      { name: 'Principales', sort_order: 2 },
      { name: 'Postres', sort_order: 3 },
      { name: 'Bebidas', sort_order: 4 },
      { name: 'Vinos', sort_order: 5 },
    ];
    for (const c of defaultCats) {
      await add('categories', c);
    }
  }

  const menu = await getAll('menu_items');
  if (menu.length === 0) {
    const defaultMenu = [
      { name: 'Jamón ibérico', price: 16.00, category: 'Entrantes', cost: 8.00, allergens: '', is_vegetarian: false, is_vegan: false, is_gluten_free: true },
      { name: 'Croquetas de gambas', price: 9.00, category: 'Entrantes', cost: 3.50, allergens: 'gluten,crustaceans', is_vegetarian: false, is_vegan: false, is_gluten_free: false },
      { name: 'Gazpacho', price: 7.00, category: 'Entrantes', cost: 2.00, allergens: '', is_vegetarian: true, is_vegan: true, is_gluten_free: true },
      { name: 'Lubina a la sal', price: 21.00, category: 'Principales', cost: 10.00, allergens: '', is_vegetarian: false, is_vegan: false, is_gluten_free: true },
      { name: 'Solomillo al Oporto', price: 24.00, category: 'Principales', cost: 12.00, allergens: 'gluten', is_vegetarian: false, is_vegan: false, is_gluten_free: false },
      { name: 'Paella de mariscos', price: 19.00, category: 'Principales', cost: 8.00, allergens: 'crustaceans', is_vegetarian: false, is_vegan: false, is_gluten_free: true },
      { name: 'Risotto de setas', price: 17.00, category: 'Principales', cost: 7.00, allergens: '', is_vegetarian: true, is_vegan: false, is_gluten_free: true },
      { name: 'Tarta de queso', price: 7.00, category: 'Postres', cost: 2.50, allergens: 'gluten,dairy', is_vegetarian: true, is_vegan: false, is_gluten_free: false },
      { name: 'Crema catalana', price: 6.00, category: 'Postres', cost: 2.00, allergens: 'dairy,eggs', is_vegetarian: true, is_vegan: false, is_gluten_free: true },
      { name: 'Agua mineral', price: 2.50, category: 'Bebidas', cost: 0.50, allergens: '', is_vegetarian: true, is_vegan: true, is_gluten_free: true },
      { name: 'Refresco', price: 3.00, category: 'Bebidas', cost: 0.80, allergens: '', is_vegetarian: true, is_vegan: true, is_gluten_free: true },
      { name: 'Cerveza', price: 3.50, category: 'Bebidas', cost: 1.00, allergens: 'gluten', is_vegetarian: true, is_vegan: true, is_gluten_free: false },
      { name: 'Vino tinto (copa)', price: 4.00, category: 'Vinos', cost: 1.50, allergens: 'sulfites', is_vegetarian: true, is_vegan: true, is_gluten_free: true },
      { name: 'Vino blanco (copa)', price: 4.00, category: 'Vinos', cost: 1.50, allergens: 'sulfites', is_vegetarian: true, is_vegan: true, is_gluten_free: true },
    ];
    for (const m of defaultMenu) {
      await add('menu_items', m);
    }
  }
}
