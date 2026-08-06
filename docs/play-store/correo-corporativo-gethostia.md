# 📧 Configuración correo corporativo — Get Hostia (hola@gethostia.com)

**Decisión final:** Zoho Mail Free (0 €) — correo gestionado para evitar problemas de entregabilidad en la VPS de Hetzner.
**Fecha:** 2026-08-03

---

## 1. Por qué NO correo en tu VPS (decisión técnica)

| Factor | Self-hosted (Postfix en VPS) | Zoho gestionado |
|---|---|---|
| Entregabilidad Gmail/Outlook | ⚠️ Mala (IP de datacenter, PTR genérico de Hetzner) | ✅ Excelente (IPs de correo reputadas) |
| rDNS/PTR | Necesitas cambiarlo en panel Hetzner | ✅ Ya resuelto por Zoho |
| Mantenimiento | Postfix+Dovecot+DKIM+antispam+SSL | ✅ Cero |
| Riesgo | Alto (IP marcada por vecinos) | ✅ Bajo |

**Conclusión:** la VPS es para web (nginx+docker). El correo va aparte.

---

## 2. Pasos en orden

### Paso 1 — Crea la cuenta Zoho (tú, 5 min)
1. https://www.zoho.com/mail/ → **Empezar ahora**
2. Plan **Forever Free**
3. Introduce dominio **gethostia.com**
4. Crea buzón: **usuario `hola`**, contraseña segura
5. Zoho te mostrará los **valores exactos** de sus registros (MX, SPF, DKIM)

### Paso 2 — Añade los registros en Cloudflare (tú, 10 min)
Ver sección 4. **Usa SIEMPRE los valores que te muestre Zoho en su panel** — los de abajo son la referencia estándar, pero Zoho puede asignarte data centers distintos y variar el punto de verificación (`mx.zoho.eu` vs `mx.zoho.com`).

### Paso 3 — Verifica el dominio en Zoho
- Zoho → **Dominios → Verificar** → método **TXT** (añade el registro TXT de verificación en Cloudflare) → **Verificar**.

### Paso 4 — Confirma el envío desde `hola@gethostia.com`
- Envía un correo de prueba a tu Gmail y a un Outlook. Revisa que no caiga en spam.

---

## 3. Proxys / fallback si Zoho no te convence

- **Google Workspace** (6,20 €/usuario/mes): elige si quieres Gmail corporativo con todo el ecosistema.
- **Microsoft 365 Business Basic** (~5,6 €/usuario/mes): si prefieres Outlook/Teams.
- Zoho Free es suficiente para un solo buzón de contacto.

---

## 4. Registros DNS de referencia (para pegar en Cloudflare → gethostia.com → DNS)

> ⚠️ **IMPORTANTE:** reemplaza por los valores exactos que te muestre tu panel de Zoho. Algunos ejemplos varían entre Zoho EU y Zoho US.

### MX (reemplaza los MX del hosting si existieran)
```
Nombre: gethostia.com
Tipo:  MX
TTL:   1h (Auto)

Priority 10  →  mx.zoho.eu
Priority 20  →  mx2.zoho.eu
```

### SPF (edita el registro TXT `@` existente, NO dupliques)
```
Nombre: @
Tipo:  TXT
Valor: v=spf1 include:zoho.eu ~all
```

### DKIM (Zoho te da el selector, normalmente `zoho`)
```
Nombre: zoho._domainkey
Tipo:  TXT
Valor: <el valor DKIM que te da Zoho — NO lo pongas de memoria, cópialo del panel>
```

### Registro de verificación de dominio (si Zoho lo pide)
```
Nombre: <lo que indique Zoho, suele ser un TXT en @ o un CNAME>
Tipo:  TXT / CNAME
Valor: <valores del panel Zoho>
```

---

## 5. Tras tener el correo funcionando

- [ ] Actualizar los docs legales si cambia el email de contacto
- [ ] Configurar reenvío/alias adicional en Zoho (`soporte@`, `admin@`)
- [ ] (Opcional) DMARC: `_dmarc TXT v=DMARC1; p=none; rua=mailto:<tu-email>` para monitorizar
- [ ] Poner `hola@gethostia.com` ya "real" en aviso-legal.md y privacy-policy.md
