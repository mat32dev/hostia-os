# 🏆 Plan Estratégico SEO — Ser #1 en "alquiler local horas valencia"

**Dominio:** ruzafaclub.com · **Negocio:** Ruzafa Club House (alquiler local por horas, Valencia)
**Fecha:** 2026-08-05

---

## 1. Diagnóstico de partida (auditoría real, no supuesta)

| Hallazgo | Detalle | Impacto SEO |
|---|---|---|
| La web es una **SPA de React** | Todo el contenido se renderiza por JS en cliente | 🔴 Google indexa mal el contenido |
| **No existía robots.txt** | devolvía el index.html de la SPA | 🔴 impedía control de rastreo |
| **No existía sitemap.xml** | idem | 🔴 Google no descubría URLs |
| Contenido rico ya existente | aforo 100, 40-80, Calle Matías Perelló 32, catering, rodajes | 🟢 buena base de mensaje |
| Imágenes servidas desde la VPS | migradas en sesión previa | 🟢 ok |
| Categoría intensa | local de eventos Valencia = keywords competitivas | ⚠️ requiere cluster |

**Conclusión:** el bloqueante #1 no era el contenido (ya existía bueno), sino que **Google no podía verlo ni descubrirlo**. Prioridad = hacer el contenido indexable y la arquitectura crawlable.

---

## 2. Qué se ha desplegado (ya verificado en producción)

### Cluster de páginas estáticas (HTML servido, NO JS)
Creadas 5 páginas con contenido real y mensaje comercial, servidas por nginx directamente:

| Página | Keyword objetivo | URL | Estado |
|---|---|---|---|
| Pilar principal | alquiler local horas valencia | `/alquiler-local-horas-valencia/` | ✅ 200 |
| Eventos | alquiler local eventos valencia | `/alquiler-local-eventos-valencia/` | ✅ 200 |
| Cumpleaños | local cumpleaños valencia | `/alquiler-local-cumpleanos-valencia/` | ✅ 200 |
| Empresa | local eventos empresa valencia | `/alquiler-local-empresa-valencia/` | ✅ 200 |
| Guía | guía alquiler local valencia | `/guia-alquiler-local-valencia/` | ✅ 200 |

### Infraestructura SEO
- **robots.txt** → `User-agent: * / Allow: / / Disallow: /api/` + sitemap (✅ 200 text/plain)
- **sitemap.xml** → 6 URLs (home + 5 SEO) (✅ 200 text/xml)
- **Schema LocalBusiness** JSON-LD en cada página (dirección, tel, geo, horario) (✅ validado)
- **Schema FAQPage** en la guía (5 preguntas) (✅)
- **CSS** compartido `/assets/seo.css` (✅ 200)
- **Canonical** correcto en cada página + 1 único `<h1>` + meta description

### Verificación real ejecutada
- Todas las URLs devuelven **HTTP 200 con el `<h1>` del contenido HTML** (no el fallback SPA)
- El schema JSON-LD se parsea correctamente
- La home (SPA) sigue intacta (`<div id="root">` presente, bundle ok)
- `nginx -t` → sintaxis OK

_Generador reutilizable en: `AGENCIA ORKESTRA/hostia-os/docs/seo/generate_seo.py`_

---

## 3. Fase 2 — Consolidated y crecer (próximos pasos para afianzar el #1)

Ya desplegado lo urgente. Para consolidar el ranking, ejecutar en este orden:

### A. Verificación técnica (Google Search Console)
1. Verifica el dominio en **Google Search Console** → Enviar sitemap `https://www.ruzafaclub.com/sitemap.xml`
2. Usa la herramienta **"Comprobar URL"** para forzar el indexado de `/alquiler-local-horas-valencia/`
3. Revisa **"Cobertura"** en 48-72h para detectar errores de rastreo
4. Pide indexación de las 5 URLs nuevas

> ⚠️ La SPA de React puede dar problemas de rendering en GSC. Verifica en "Renderizado" que el contenido de la home se renderiza; si no, considera pre-render o SSR para la home.

### B. Cerrar el fallback SPA en rutas SEO (mejora)
Aunque las páginas ya sirven correctamente por `try_files`, conviene **bloquear explícitamente** en nginx que cualquier `/alquiler-*` no caiga en el fallback SPA. Añadir a la config de nginx (bloque SEO tras el `location /`):

```nginx
# Páginas SEO estáticas — servir HTML real
location ^~ /alquiler-local-horas-valencia/ { try_files $uri $uri/ =404; }
location ^~ /alquiler-local-eventos-valencia/ { try_files $uri $uri/ =404; }
location ^~ /alquiler-local-cumpleanos-valencia/ { try_files $uri $uri/ =404; }
location ^~ /alquiler-local-empresa-valencia/ { try_files $uri $uri/ =404; }
location ^~ /guia-alquiler-local-valencia/ { try_files $uri $uri/ =404; }
```

Esto garantiza que jamás devuelvan el fallback SPA si algo cambia.

### C. Enlazado interno hacia las páginas SEO
- Añadir enlaces desde la home (SPA) hacia las 5 URLs SEO (footer o sección "alquiler por horas")
- Entre páginas SEO ya hay enlaces cruzados (✅ hecho en el generador)
- Esto reparte autoridad y mejora el crawl depth

### D. Datos estructurados adicionales
- Añadir **Event** schema en la home y página principal
- Asegurar **Marca local** y reseñas (Google Business Profile)

---

## 4. Fase 3 — Contenido y autoridad (los 3-6 meses)

### Cluster de keywords a expandir (long-tail transaccional)
| Keyword | Página/CSV a crear |
|---|---|
| alquiler local para fiesta valencia | nueva |
| sala privada para eventos valencia | nueva |
| alquiler local rodaje valencia | nueva |
| lugar para cumpleaños 50 personas valencia | nueva |
| alquiler espacio afterwork valencia | nueva |
| local de eventos con DJ valencia | nueva |

### Autoridad (Google Business Profile + citaciones)
- **Crear/optimizar Google Business Profile** de Ruzafa Club House (prioridad #1 para intento local): categoría "Lugar para eventos", fotos del local, horarios, teléfono
- **Reseñas**: pedir a clientes reales tras cada evento (impacto directo en pack local)
- **Citaciones NAP** consistentes (nombre-dirección-teléfono) en Google, Facebook, Instagram, directorios valencianos
- **Backlinks**: prensa local valenciana, blogs de eventos, colaboraciones con proveedores de catering/DJ

### Contenido recurrente
- Blog mensual: "Ideas para eventos en Ruzafa", "Local para X invitados"
- Cada página SEO apunta al formulario de reserva/WhatsApp (conversión)

---

## 5. KPIs y medición de éxito

| KPI | Métrica | Target |
|---|---|---|
| Indexación | URLs indexadas en Google | 6/6 en 2-4 semanas |
| Posicionamiento | Posición en "alquiler local horas valencia" | Top 10 en 3 meses, Top 3 en 6 |
| Pack local | Posición en "alquiler local valencia" (mapa) | Top 3 en 6 semanas |
| Tráfico orgánico | Consultas orgánicas a las 5 páginas | +200/mes en 3 meses |
| Conversión | Solicitudes de reserva desde SEO | ≥3% tasa de conversión |
| Autoridad | Dominios de referencia (backlinks) | 10+ en 6 meses |

## 6. Acciones inmediatas (checklist siguiente)

- [ ] **Crear/verificar cuenta de Google Search Console** y enviar sitemap
- [ ] Registrar las 5 URLs en **Google Business Profile** (prioridad #1)
- [ ] Solicitar indexación de las URLs nuevas
- [ ] Añadir bloqueos nginx `^~` para rutas SEO (opcional pero recomendado)
- [ ] Añadir Event schema a la home
- [ ] Enlazar home → páginas SEO
- [ ] Programar contenido mensual (cron o calendario)

---

_Generado por Hermes — NEXUS AI Agency. Despliegue verificado en producción ruzafaclub.com el 2026-08-05._
