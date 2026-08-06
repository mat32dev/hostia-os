# 🚀 HosT.ia — Subida a Google Play Store

**Fecha de auditoría:** 2026-08-03
**Estado de los AAB:** ✅ Validados con `bundletool` (validación oficial de Google) y firmados con keystore release.

---

## 1. 📦 Artefactos listos para subir

| App | AAB | Package | versionCode | versionName | minSdk | targetSdk |
|---|---|---|---|---|---|---|
| **HosTia POS** | `apks/hostia-pos-release.aab` (1.4 MB) | `com.hostia.pos` | 1 | 1.0 | 24 (Android 7.0) | 36 |
| **HosTia Guard** | `apks/hostia-guard-release.aab` (1.4 MB) | `com.hostia.guard` | 1 | 1.0 | 24 (Android 7.0) | 36 |

> ✅ **Ambos AAB pasan `bundletool validate --bundle` sin errores ni warnings de firma.**
> ✅ Firmados con keystore release (`hostia-pos.keystore` / `hostia-guard.keystore`).
> ⚠️ **Guarda los keystores para siempre.** Si los pierdes no podrás actualizar las apps (Play exigirá APP SIGNING de Google, pero el upload key del AAB debe coincidir).

---

## 2. 👉 Pasos de subida (acción 100% manual, requiere tu cuenta Google)

### Requisitos previos (una sola vez)
1. **Cuenta de desarrollador de Google Play** — https://play.google.com/console — registro 25 USD (pago único) con tu cuenta Google corporativa (`...@gethostia.com` idealmente).
2. Tener el **dominio verificado** `gethostia.com` (✅ confirmado, HTTP 200).

### Para CADA app (POS y Guard repetir el proceso)

**a) Crear la app**
- Consola → **Create app** / **Crear app**.
- Nombre: `HosTia POS` (una) y `HosTia Guard` (otra).
- Idioma por defecto: **Español (España)**.
- App o juego: **App**.
- Gratuita o de pago: **Gratuita** (con compras in-app opcionales más adelante).
- Declaración: marca la casilla **"Declaro que cumplo las políticas…"** → **Crear app**.

**b) Cargar el AAB en Producción**
1. Menú izquierdo → **Producción** → **Crear nueva versión**.
2. **Sección "App bundle"** → **Subir** → selecciona `hostia-pos-release.aab` (o guard).
3. Deja la versión en **Drive**/**Borrador** (no la despliegues aún si falta la ficha).
4. **Guardar**.

**c) Completar la ficha de tienda**
Menú → **Presencia en tienda** → **Ficha de tienda**. Completa los campos (ver plantilla en `ficha-tienda-pos.md` y `ficha-tienda-guard.md`).

**d) Subir contenido gráfico**
- **Icono** (512×512 PNG, 32-bit)
- **Imagen destacada** (1024×500 JPG)
- **Teléfono** (1–8 screenshots): usa los mockups existentes en `content/social/product-mockups/`.

**e) Política de privacidad y Datos de la app**
- URL de la política: `https://gethostia.com/privacidad` (✅ HTTP 200). **Importante: Guard trata datos biométricos (vídeo) — requerirá Declaraciones del formulario de datos sensibles.**
- **Datos de la app**: formulario obligatorio (declarar si recoge datos de usuarios).

**f) Revisión**
- **Panel de versiones** (Producción) → **Revisar versión** → **Iniciar lanzamiento a Producción**.

---

## 3. 🚧 Bloqueantes / trampas típicas

1. **Política de privacidad obligatoria** → ✅ `gethostia.com/privacidad` activa.
2. **Guard = datos biométricos** (vídeo de cámara, análisis de transacciones) → requiere **EIPD**, y Google puede exigir declaración extra de datos sensibles. **No declares la app como "solo herramienta" — declara el acceso a cámara.**
3. **Manifiesto usa `CAMERA` permission** → revisar si `guard` pide permiso cámara correctamente declarado.
4. **versionCode = 1** para ambos — la **próxima subida debe incrementar** (2, 3…).
5. **App signing de Google**: al subir el primer AAB, Play generará un **clave de firma de app** distinta del keystore local. Descarga y guarda el **PEPK** (.pepk) si alguna vez exportas app signing.

---

## 4. 🔑 Datos de firma (NO COMPARTIR)

| App | Keystore | Alias | StorePass | KeyPass |
|---|---|---|---|---|
| POS | `apps/pos-android/android/app/hostia-pos.keystore` | `hostia` | `hostia2026` | `hostia2026` |
| Guard | `apps/guard-android/android/hostia-guard.keystore` | `hostia` | `hostia2026` | `hostia2026` |

> 🔐 **Recomendación urgente:** rotar estas contraseñas y guardar los keystores en un gestor (1Password/KeePass) + backup offsite. Están en texto plano en `build.gradle` y en este repo.
