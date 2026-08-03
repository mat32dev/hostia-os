# HosT.ia Android Apps

## 📱 Apps disponibles

| App | Package ID | Descripción |
|-----|-----------|-------------|
| **HosTia POS** | `com.hostia.pos` | TPV completo para tablets Android |
| **HosTia Guard** | `com.hostia.guard` | Análisis de vídeo y alertas de seguridad |

## 🚀 Instalación rápida (sin Android Studio)

### Opción 1: PWA (más rápido, ya funciona)

Abre en Chrome en tu Android:
- **POS**: `https://gethostia.com/pos-app`
- **Guard**: `https://gethostia.com/guard-app`

Luego: Menú → "Añadir a pantalla de inicio" → Se instala como app nativa.

### Opción 2: APK (para Play Store)

#### Requisitos
- Android Studio instalado
- Java 17+
- Node.js 22+

#### Build

```bash
# Clonar el monorepo
git clone https://github.com/mat32dev/hostia-os.git
cd hostia-os

# Build POS
./build-android.sh pos

# Build Guard
./build-android.sh guard

# Build ambos
./build-android.sh all
```

Los APKs se generan en:
- POS: `apps/pos-android/android/app/build/outputs/apk/debug/app-debug.apk`
- Guard: `apps/guard-android/android/app/build/outputs/apk/debug/app-debug.apk`

#### Instalar en dispositivo

```bash
# Con ADB (Android Debug Bridge)
adb install apps/pos-android/android/app/build/outputs/apk/debug/app-debug.apk
adb install apps/guard-android/android/app/build/outputs/apk/debug/app-debug.apk
```

O simplemente copia el APK al móvil y ábrelo.

## 🏗️ Estructura del proyecto

```
apps/
├── pos-android/          # Capacitor wrapper para POS
│   ├── android/          # Proyecto Android nativo
│   ├── capacitor.config.json
│   └── package.json
├── guard-android/        # Capacitor wrapper para Guard
│   ├── android/          # Proyecto Android nativo
│   ├── capacitor.config.json
│   └── package.json
├── pos/public/           # PWA source (POS)
└── guard/public/         # PWA source (Guard)
```

## 🔧 Configuración

### POS (`apps/pos-android/capacitor.config.json`)
```json
{
  "appId": "com.hostia.pos",
  "appName": "HosTia POS",
  "webDir": "../pos/public",
  "server": {
    "url": "https://gethostia.com/pos-app"
  }
}
```

### Guard (`apps/guard-android/capacitor.config.json`)
```json
{
  "appId": "com.hostia.guard",
  "appName": "HosTia Guard",
  "webDir": "../guard/public",
  "server": {
    "url": "https://gethostia.com/guard-app"
  }
}
```

## 📦 CI/CD (GitHub Actions)

Los APKs se generan automáticamente en cada push a `main`:

- `.github/workflows/build-pos-android.yml` — Build POS APK
- `.github/workflows/build-guard-android.yml` — Build Guard APK

Los APKs se suben como artifacts de GitHub Actions.

## 🎯 Play Store

Para publicar en Google Play Store:

1. Genera un AAB (Android App Bundle) en lugar de APK:
   ```bash
   ./gradlew bundleRelease
   ```

2. Sube el AAB a Google Play Console

3. Configura la ficha de la app con:
   - Screenshots de la PWA
   - Descripción
   - Categoría: Business / Productivity

## 📋 Requisitos mínimos

- Android 8.0 (API 26) o superior
- 50MB de espacio libre
- Conexión a internet (para sincronización)
- Cámara (para Guard)

## 🔐 Permisos

### POS
- Internet (sincronización)
- Almacenamiento (datos locales)

### Guard
- Internet (sincronización)
- Cámara (subida de vídeo)
- Almacenamiento (vídeos locales)

## 🆘 Troubleshooting

**El APK no se instala:**
- Activa "Fuentes desconocidas" en Ajustes → Seguridad
- Verifica que el APK no esté corrupto (descarga de nuevo)

**La app se cierra al abrir:**
- Verifica que tienes Android 8.0+
- Limpia caché: Ajustes → Apps → HosTia → Almacenamiento → Limpiar caché

**No se conecta al servidor:**
- Verifica que `gethostia.com` es accesible desde el dispositivo
- Si estás en una red con firewall, añade excepción para `gethostia.com`
