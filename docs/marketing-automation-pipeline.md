# 🔄 HosT.ia — Pipeline de Automatización de Conversión
## Sistema de 3-Clics: De visitante a suscriptor

---

## El Principio: 3 Clics

Cada producto se instala y funciona en **exactamente 3 clics**:

| Producto | Clic 1 | Clic 2 | Clic 3 | Resultado |
|----------|--------|--------|--------|-----------|
| **Chat** | "Probar gratis" | Introducir número WhatsApp | Responder "Sí" al bot | ✅ Bot activo |
| **POS** | "Descargar gratis" | Instalar PWA en tablet | Abrir y usar | ✅ TPV funcionando |
| **Guard** | "Probar con mi vídeo" | Subir vídeo | Ver resultados | ✅ Análisis completado |

---

## Flujo de Conversión por Producto

### Chat (WhatsApp IA)
```
Visitante → Landing /chat
  ↓ "Probar gratis"
Introduce su número de WhatsApp
  ↓ Clic 2
Bot envía: "Hola 👋 Soy HosT.ia. ¿Quieres activar tu demo?"
  ↓ Clic 3: Responde "Sí"
Bot responde con demo interactiva del restaurante del cliente
  ↓ Cliente queda impresionado
"¿Quieres activarlo en tu negocio? 30 días gratis"
  ↓ Convierte
```

### POS (TPV gratis)
```
Visitante → Landing /pos
  ↓ "Descargar gratis"
Descarga/instala PWA en tablet
  ↓ Clic 2: "Añadir a pantalla de inicio"
TPV instalado con datos de ejemplo
  ↓ Clic 3: Abrir y tocar una mesa
TPV funcionando con carta de ejemplo
  ↓ Cliente ve el valor
"¿Quieres sincronizar con la nube? Gratis"
  ↓ Convierte
```

### Guard (AI seguridad)
```
Visitante → Landing /guard
  ↓ "Probar con mi vídeo"
Sube un vídeo de su cámara (drag & drop)
  ↓ Clic 2
IA analiza el vídeo en 30 segundos
  ↓ Clic 3: Ver resultados
Ve las detecciones y alertas
  ↓ Cliente ve el valor
"¿Quieres análisis automático cada noche? 30 días gratis"
  ↓ Convierte
```

---

## Sistema de Automatización

### Trigger 1: Visitante entra a landing
- Pixel de tracking registra fuente (orgánico, ads, referral)
- Si viene de un anuncio, se personaliza el hero según el anuncio

### Trigger 2: Clic en CTA
- Se registra el producto de interés (chat/guard/pos)
- Se inicia el flujo de 3 clics correspondiente

### Trigger 3: Primer contacto
- Chat: Bot envía mensaje de bienvenida por WhatsApp
- POS: PWA se instala con datos de ejemplo
- Guard: Análisis del vídeo se completa

### Trigger 4: Activación
- Chat: Cliente responde "Sí" → bot activo
- POS: Cliente abre la app → TPV funcionando
- Guard: Cliente ve resultados → análisis completado

### Trigger 5: Conversión
- Se muestra pricing con descuento de primer mes
- "50% descuento en tu primer mes" (urgencia)
- Formulario de pago simplificado (Stripe)

### Trigger 6: Onboarding
- Chat: Configuración automática del restaurante
- POS: Sincronización con nube
- Guard: Conexión con cámara RTSP

### Trigger 7: Retención
- Día 3: "¿Todo bien? ¿Necesitas ayuda?"
- Día 7: "Mira lo que hemos detectado esta semana"
- Día 14: "Tu informe semanal está listo"
- Día 30: "¿Quieres continuar? Renovar o cancelar"

---

## Implementación Técnica

### Tracking
```javascript
// En cada landing page
const params = new URLSearchParams(window.location.search);
const source = params.get('utm_source') || 'organic';
const product = window.location.pathname; // /chat, /guard, /pos

// Registrar evento
fetch('/api/track', {
  method: 'POST',
  body: JSON.stringify({
    event: 'page_view',
    product,
    source,
    timestamp: new Date().toISOString()
  })
});
```

### 3-Click Flow (Chat)
```javascript
// chat.html
async function startDemo() {
  const phone = prompt('Introduce tu número de WhatsApp:');
  if (!phone) return;

  // Clic 2: Registrar número
  await fetch('/api/demo/start', {
    method: 'POST',
    body: JSON.stringify({ phone, product: 'chat' })
  });

  // Clic 3: El bot envía mensaje y el cliente responde
  showToast('✅ Te hemos enviado un mensaje por WhatsApp. Responde "Sí" para activar tu demo.');
}
```

### 3-Click Flow (POS)
```javascript
// pos.html
async function downloadPOS() {
  // Clic 1: Descargar PWA
  const deferredPrompt = await showInstallPrompt();
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      // Clic 2: Instalado
      trackEvent('pos_installed');
      // Clic 3: Cliente abre y usa
    }
  }
}
```

### 3-Click Flow (Guard)
```javascript
// guard.html
async function uploadAndAnalyze(file) {
  // Clic 1: Subir vídeo
  const formData = new FormData();
  formData.append('file', file);

  showProgress();

  // Clic 2: IA analiza
  const result = await fetch('/api/guard/analyze', {
    method: 'POST',
    body: formData
  });

  // Clic 3: Ver resultados
  showResults(await result.json());
  trackEvent('guard_analyzed');
}
```

---

## Métricas de Conversión

| Métrica | Objetivo | Cómo medir |
|---------|----------|-----------|
| **Landing → CTA clic** | >25% | Pixel tracking |
| **CTA → Activación** | >60% | Bot responde / PWA instalada |
| **Activación → Pago** | >15% | Stripe conversion |
| **Día 30 retención** | >70% | Uso activo del producto |
| **CAC** | <30€ | Coste de adquisición / nuevos clientes |
| **LTV** | >500€ | Valor de vida del cliente |

---

## ¿Pueden los agentes de Hermes gestionar esto?

**Sí.** El ESG (orquestador) puede:

1. **Analizar conversiones** — Recibir datos de tracking y sugerir mejoras
2. **Generar variantes A/B** — Crear versiones alternativas de landing pages
3. **Monitorear el funnel** — Detectar cuellos de botella en la conversión
4. **Responder a leads** — Atender automáticamente a quienes escriben por WhatsApp
5. **Generar reportes** — Informes semanales de conversión automáticos

### Cómo activarlo:

```
/personality esg
"Analiza la conversión de esta semana y sugiere mejoras"
```

El ESG analizará los datos y devolverá un plan de acción con 3 fases (como ya hace).

---

## Implementación Inmediata

1. **Añadir tracking a las 4 landing pages** (pixel + eventos)
2. **Crear el flujo de 3 clics** en cada landing
3. **Conectar con Stripe** para pagos
4. **Activar el bot de WhatsApp** para onboarding automático
5. **Configurar ESG** para análisis semanal de conversión
