// HosT.ia POS — Main Application Logic

// State
let currentTable = null;
let currentOrder = { items: [], notes: '' };
let currentCategory = null;
let tipPercent = 0;
let businessInfo = { name: 'Mi Restaurante', currency: 'EUR', tax_rate: 10 };

// ─── Init ───
document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  await seedDefaultData();
  await loadBusinessInfo();
  renderTables();
  renderCategories();
  renderMenuItems();
  updateDate();
  setInterval(updateDate, 60000);
});

async function loadBusinessInfo() {
  businessInfo.name = await getSetting('business_name', 'Mi Restaurante');
  businessInfo.currency = await getSetting('currency', 'EUR');
  businessInfo.tax_rate = await getSetting('tax_rate', 10);
}

function updateDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('posDate').textContent = now.toLocaleDateString('es-ES', options);
}

// ─── Tables ───
async function renderTables() {
  const tables = await getAll('tables');
  const grid = document.getElementById('tablesGrid');

  // Sort by zone then number
  const zones = ['salon', 'terraza', 'barra'];
  tables.sort((a, b) => {
    const zoneA = zones.indexOf(a.zone);
    const zoneB = zones.indexOf(b.zone);
    if (zoneA !== zoneB) return zoneA - zoneB;
    return a.number - b.number;
  });

  grid.innerHTML = tables.map(table => `
    <button class="table-btn ${table.status === 'occupied' ? 'occupied' : ''}"
            onclick="selectTable(${table.id})"
            data-id="${table.id}">
      <span class="table-num">${table.number}</span>
      <span class="table-cap">${table.capacity}p</span>
      <span class="table-zone">${table.zone}</span>
    </button>
  `).join('');
}

async function selectTable(tableId) {
  currentTable = await getById('tables', tableId);
  document.getElementById('orderTableNum').textContent = currentTable.number;
  document.getElementById('orderTableLabel').textContent = `Mesa ${currentTable.number} · ${currentTable.zone} · ${currentTable.capacity} personas`;

  // Load existing order if table has one
  const existingOrder = await getOpenOrderByTable(tableId);
  if (existingOrder) {
    currentOrder = existingOrder;
  } else {
    currentOrder = { items: [], notes: '', table_id: tableId };
  }

  renderOrderItems();
  document.getElementById('btnPay').disabled = currentOrder.items.length === 0;
}

async function getOpenOrderByTable(tableId) {
  const orders = await getByIndex('orders', 'table_id', tableId);
  return orders.find(o => o.status === 'pending' || o.status === 'confirmed');
}

// ─── Menu ───
async function renderCategories() {
  const categories = await getAll('categories');
  const container = document.getElementById('menuCategories');

  container.innerHTML = `
    <button class="category-btn ${!currentCategory ? 'active' : ''}" onclick="filterCategory(null)">Todo</button>
    ${categories.map(c => `
      <button class="category-btn ${currentCategory === c.name ? 'active' : ''}"
              onclick="filterCategory('${c.name}')">${c.name}</button>
    `).join('')}
  `;
}

function filterCategory(category) {
  currentCategory = category;
  renderCategories();
  renderMenuItems();
}

async function renderMenuItems() {
  let items = await getAll('menu_items');
  items = items.filter(i => i.is_available);

  if (currentCategory) {
    items = items.filter(i => i.category === currentCategory);
  }

  const container = document.getElementById('menuItems');
  container.innerHTML = items.map(item => `
    <div class="menu-item" onclick="addToOrder(${item.id})">
      <div class="menu-item-name">${item.name}</div>
      <div class="menu-item-price">${formatPrice(item.price)}</div>
      ${renderTags(item)}
    </div>
  `).join('');
}

function renderTags(item) {
  const tags = [];
  if (item.is_vegetarian) tags.push('<span class="menu-item-tag veg">🌱 Veg</span>');
  if (item.is_vegan) tags.push('<span class="menu-item-tag veg">🌿 Vegan</span>');
  if (item.is_gluten_free) tags.push('<span class="menu-item-tag gf">🌾 SG</span>');
  if (item.allergens) {
    const allergenList = item.allergens.split(',');
    if (allergenList.length > 0) tags.push(`<span class="menu-item-tag" title="${item.allergens}">⚠️</span>`);
  }
  return tags.length ? `<div class="menu-item-tags">${tags.join('')}</div>` : '';
}

// ─── Order ───
async function addToOrder(itemId) {
  if (!currentTable) {
    showToast('Selecciona una mesa primero', 'error');
    return;
  }

  const item = await getById('menu_items', itemId);
  if (!item) return;

  // Check if item already in order
  const existing = currentOrder.items.find(i => i.menu_item_id === itemId);
  if (existing) {
    existing.quantity++;
    existing.total_price = existing.unit_price * existing.quantity;
  } else {
    currentOrder.items.push({
      menu_item_id: itemId,
      name: item.name,
      quantity: 1,
      unit_price: item.price,
      total_price: item.price,
      notes: '',
      modifiers: null
    });
  }

  renderOrderItems();
  document.getElementById('btnPay').disabled = false;
}

function renderOrderItems() {
  const container = document.getElementById('orderItems');

  if (currentOrder.items.length === 0) {
    container.innerHTML = '<div class="order-empty"><p>👆 Selecciona una mesa y añade productos</p></div>';
    updateTotal();
    return;
  }

  container.innerHTML = currentOrder.items.map((item, index) => `
    <div class="order-item">
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        ${item.notes ? `<div class="order-item-notes">${item.notes}</div>` : ''}
      </div>
      <div class="order-item-qty">
        <button class="qty-btn" onclick="updateQty(${index}, -1)">−</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
      </div>
      <div class="order-item-price">${formatPrice(item.total_price)}</div>
      <button class="order-item-remove" onclick="removeItem(${index})">×</button>
    </div>
  `).join('');

  updateTotal();
}

function updateQty(index, delta) {
  const item = currentOrder.items[index];
  item.quantity += delta;

  if (item.quantity <= 0) {
    currentOrder.items.splice(index, 1);
  } else {
    item.total_price = item.unit_price * item.quantity;
  }

  renderOrderItems();
  document.getElementById('btnPay').disabled = currentOrder.items.length === 0;
}

function removeItem(index) {
  currentOrder.items.splice(index, 1);
  renderOrderItems();
  document.getElementById('btnPay').disabled = currentOrder.items.length === 0;
}

function clearOrder() {
  if (currentOrder.items.length === 0) return;
  if (!confirm('¿Limpiar la comanda actual?')) return;
  currentOrder = { items: [], notes: '', table_id: currentTable?.id };
  renderOrderItems();
  document.getElementById('btnPay').disabled = true;
}

function updateTotal() {
  const subtotal = currentOrder.items.reduce((sum, i) => sum + i.total_price, 0);
  const tax = subtotal * (businessInfo.tax_rate / 100);
  const total = subtotal + tax + (subtotal * (tipPercent / 100));
  document.querySelector('.total-amount').textContent = formatPrice(total);
}

// ─── Payment ───
function showPayment() {
  if (currentOrder.items.length === 0) return;
  const subtotal = currentOrder.items.reduce((sum, i) => sum + i.total_price, 0);
  const tax = subtotal * (businessInfo.tax_rate / 100);
  const tip = subtotal * (tipPercent / 100);
  const total = subtotal + tax + tip;
  document.getElementById('paymentTotal').textContent = formatPrice(total);
  openModal('paymentModal');
}

function setTip(percent) {
  tipPercent = percent;
  document.querySelectorAll('.tip-buttons button').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.textContent) === percent);
  });

  const subtotal = currentOrder.items.reduce((sum, i) => sum + i.total_price, 0);
  const tax = subtotal * (businessInfo.tax_rate / 100);
  const tip = subtotal * (tipPercent / 100);
  const total = subtotal + tax + tip;
  document.getElementById('paymentTotal').textContent = formatPrice(total);
}

async function processPayment(method) {
  if (currentOrder.items.length === 0) return;

  const subtotal = currentOrder.items.reduce((sum, i) => sum + i.total_price, 0);
  const tax = subtotal * (businessInfo.tax_rate / 100);
  const tip = subtotal * (tipPercent / 100);
  const total = subtotal + tax + tip;

  // Save order
  const orderData = {
    ...currentOrder,
    table_id: currentTable.id,
    status: 'paid',
    subtotal,
    tax,
    tip,
    total,
    payment_method: method,
    payment_status: 'paid',
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    closed_at: new Date().toISOString()
  };

  const orderId = await add('orders', orderData);

  // Save order items
  for (const item of currentOrder.items) {
    await add('order_items', { ...item, order_id: orderId });
  }

  // Save payment
  await add('payments', {
    order_id: orderId,
    amount: total,
    method,
    tip_amount: tip,
    status: 'paid',
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  });

  // Free the table
  await put('tables', { ...currentTable, status: 'free' });

  // Notify Guard if cash payment
  if (method === 'cash') {
    await notifyGuard(orderId, total, currentTable.number);
  }

  closeModal('paymentModal');
  showToast(`✅ Cobrado: ${formatPrice(total)} (${method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'QR'})`, 'success');

  // Reset
  currentOrder = { items: [], notes: '' };
  currentTable = null;
  tipPercent = 0;
  document.getElementById('orderTableNum').textContent = '—';
  document.getElementById('orderTableLabel').textContent = 'Selecciona una mesa';
  document.getElementById('btnPay').disabled = true;
  renderOrderItems();
  renderTables();
}

async function notifyGuard(orderId, amount, tableNumber) {
  // Add to sync queue for Guard notification
  await add('sync_queue', {
    type: 'guard_expected_payment',
    data: {
      tenant_id: 1,
      transaction_id: orderId,
      amount,
      table_number: tableNumber,
      timestamp: new Date().toISOString(),
      payment_method: 'cash'
    },
    status: 'pending',
    created_at: new Date().toISOString()
  });
}

// ─── Report ───
async function showReport() {
  const today = new Date().toISOString().split('T')[0];
  const orders = await getByIndex('orders', 'date', today);
  const payments = await getByIndex('payments', 'date', today);

  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalTips = payments.reduce((sum, p) => sum + (p.tip_amount || 0), 0);
  const avgOrder = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Payment breakdown
  const cashTotal = payments.filter(p => p.method === 'cash').reduce((s, p) => s + p.amount, 0);
  const cardTotal = payments.filter(p => p.method === 'card').reduce((s, p) => s + p.amount, 0);
  const qrTotal = payments.filter(p => p.method === 'qr').reduce((s, p) => s + p.amount, 0);

  // Top items
  const itemCounts = {};
  for (const order of paidOrders) {
    const items = await getByIndex('order_items', 'order_id', order.id);
    for (const item of items) {
      if (!itemCounts[item.name]) itemCounts[item.name] = { qty: 0, revenue: 0 };
      itemCounts[item.name].qty += item.quantity;
      itemCounts[item.name].revenue += item.total_price;
    }
  }
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const reportHTML = `
    <div class="report-grid">
      <div class="report-stat">
        <div class="report-stat-value">${paidOrders.length}</div>
        <div class="report-stat-label">Comandas</div>
      </div>
      <div class="report-stat">
        <div class="report-stat-value">${formatPrice(totalRevenue)}</div>
        <div class="report-stat-label">Ingresos</div>
      </div>
      <div class="report-stat">
        <div class="report-stat-value">${formatPrice(avgOrder)}</div>
        <div class="report-stat-label">Ticket medio</div>
      </div>
      <div class="report-stat">
        <div class="report-stat-value">${formatPrice(totalTips)}</div>
        <div class="report-stat-label">Propinas</div>
      </div>
    </div>

    <div class="report-section">
      <h3>💰 Pagos</h3>
      <ul class="report-list">
        <li><span>💵 Efectivo</span><span>${formatPrice(cashTotal)}</span></li>
        <li><span>💳 Tarjeta</span><span>${formatPrice(cardTotal)}</span></li>
        <li><span>📱 QR/Bizum</span><span>${formatPrice(qrTotal)}</span></li>
      </ul>
    </div>

    <div class="report-section">
      <h3>🏆 Top productos</h3>
      <ul class="report-list">
        ${topItems.map(([name, data]) => `<li><span>${name}</span><span>${data.qty}x · ${formatPrice(data.revenue)}</span></li>`).join('') || '<li><span>Sin datos</span></li>'}
      </ul>
    </div>
  `;

  document.getElementById('reportContent').innerHTML = reportHTML;
  openModal('reportModal');
}

// ─── Utils ───
function formatPrice(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: businessInfo.currency
  }).format(amount);
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});
