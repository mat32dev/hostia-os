// HosT.ia Guard — Main Application Logic

// State
let selectedFile = null;
let analysisResults = [];
let alerts = [];

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  setInterval(updateDate, 60000);
  setupUploadZone();
  loadRecentAlerts();
});

function updateDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('guardDate').textContent = now.toLocaleDateString('es-ES', options);
}

// ─── Upload Zone ───
function setupUploadZone() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('videoInput');

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  });

  input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });
}

function handleFileSelect(file) {
  // Validate file type
  const validTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv|webm)$/i)) {
    showToast('❌ Formato no soportado. Usa MP4, AVI, MOV o WebM.', 'error');
    return;
  }

  // Validate size (500MB max)
  if (file.size > 500 * 1024 * 1024) {
    showToast('❌ El archivo es demasiado grande (máx 500MB)', 'error');
    return;
  }

  selectedFile = file;

  // Show file info
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatFileSize(file.size);
  document.getElementById('uploadInfo').style.display = 'block';
  document.getElementById('uploadActions').style.display = 'flex';
  document.getElementById('uploadZone').style.borderColor = 'var(--accent)';

  // Get video duration
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.onloadedmetadata = () => {
    document.getElementById('fileDuration').textContent = formatDuration(video.duration);
    URL.revokeObjectURL(video.src);
  };
  video.src = URL.createObjectURL(file);

  showToast('✅ Vídeo listo para analizar', 'success');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function resetUpload() {
  selectedFile = null;
  document.getElementById('uploadInfo').style.display = 'none';
  document.getElementById('uploadActions').style.display = 'none';
  document.getElementById('uploadProgress').style.display = 'none';
  document.getElementById('uploadZone').style.borderColor = '#3a3a4a';
  document.getElementById('videoInput').value = '';
  document.getElementById('analysisStatus').textContent = 'Analizando...';
}

// ─── Analysis ───
async function startAnalysis() {
  if (!selectedFile) return;

  document.getElementById('uploadActions').style.display = 'none';
  document.getElementById('uploadProgress').style.display = 'block';
  document.getElementById('analysisStatus').textContent = 'Subiendo...';
  document.getElementById('guardStatus').textContent = '🟡 Analizando...';

  // Simulate upload progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = Math.round(progress) + '%';
  }, 300);

  try {
    // Upload to API
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('tenant_id', '1');
    formData.append('camera_id', 'default');
    formData.append('date', new Date().toISOString().split('T')[0]);

    const response = await fetch('/api/guard/upload', {
      method: 'POST',
      body: formData
    });

    clearInterval(progressInterval);
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressText').textContent = '100%';

    if (!response.ok) throw new Error('Upload failed');

    const result = await response.json();

    document.getElementById('analysisStatus').textContent = '✅ Análisis completado';
    document.getElementById('guardStatus').textContent = '🟢 Sistema activo';

    // Show results
    showResults(result);
    showToast('✅ Análisis completado', 'success');

  } catch (error) {
    clearInterval(progressInterval);
    document.getElementById('analysisStatus').textContent = '❌ Error en el análisis';
    document.getElementById('guardStatus').textContent = '🔴 Error';
    showToast('❌ Error al analizar el vídeo', 'error');
    console.error(error);
  }
}

// ─── Results ───
function showResults(result) {
  document.getElementById('resultsSummary').style.display = 'block';

  // Update stats
  document.getElementById('statFrames').textContent = result.processed_frames || 0;
  document.getElementById('statSuspicious').textContent = result.suspicious_activities || 0;
  document.getElementById('statAlerts').textContent = result.alerts || 0;
  document.getElementById('statConfidence').textContent = '87%';

  // Generate alerts from results
  if (result.alerts > 0) {
    generateAlerts(result);
  }
}

function generateAlerts(result) {
  const container = document.getElementById('alertsList');
  container.innerHTML = '';

  const mockAlerts = [
    {
      id: 1,
      type: 'unregistered_transaction',
      severity: 'high',
      title: '🚨 Posible transacción no registrada',
      description: `Se detectó un intercambio de efectivo a las 21:34 que no aparece en el TPV. Confianza: 87%`,
      timestamp: '21:34',
      camera_id: 'Barra',
      amount: 18.50
    },
    {
      id: 2,
      type: 'unverified_sale',
      severity: 'medium',
      title: '⚠️ Venta sin confirmación visual',
      description: `Se registró una venta de 24,00€ en el TPV a las 20:15 pero no se detectó efectivo en el vídeo.`,
      timestamp: '20:15',
      camera_id: 'Salón',
      amount: 24.00
    }
  ];

  mockAlerts.forEach(alert => {
    const card = createAlertCard(alert);
    container.appendChild(card);
  });
}

function createAlertCard(alert) {
  const div = document.createElement('div');
  div.className = `alert-card alert-${alert.severity}`;
  div.innerHTML = `
    <div class="alert-header">
      <div class="alert-title">${alert.title}</div>
      <span class="alert-severity ${alert.severity}">${alert.severity}</span>
    </div>
    <div class="alert-description">${alert.description}</div>
    <div class="alert-meta">
      <span>📹 ${alert.camera_id}</span>
      <span>⏰ ${alert.timestamp}</span>
      ${alert.amount ? `<span>💰 ${formatPrice(alert.amount)}</span>` : ''}
    </div>
    <div class="alert-actions">
      <button class="alert-btn ok" onclick="resolveAlert(${alert.id}, 'valid')">✅ Válido</button>
      <button class="alert-btn investigate" onclick="resolveAlert(${alert.id}, 'investigate')">🔍 Investigar</button>
      <button class="alert-btn dismiss" onclick="resolveAlert(${alert.id}, 'false_positive')">✕ Falso positivo</button>
    </div>
  `;
  return div;
}

async function resolveAlert(alertId, status) {
  try {
    await fetch(`/api/guard/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes: '' })
    });

    const card = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (card) {
      card.style.opacity = '0.5';
      card.style.pointerEvents = 'none';
    }

    showToast(`✅ Alerta marcada como ${status}`, 'success');
  } catch (error) {
    showToast('❌ Error al resolver la alerta', 'error');
  }
}

// ─── Recent Alerts ───
async function loadRecentAlerts() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`/api/guard/alerts?tenant_id=1&date=${today}`);
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        const container = document.getElementById('alertsList');
        container.innerHTML = '';
        data.forEach(alert => {
          container.appendChild(createAlertCard(alert));
        });
      }
    }
  } catch (e) {
    // No alerts yet, that's fine
  }
}

// ─── Utils ───
function formatPrice(amount) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
