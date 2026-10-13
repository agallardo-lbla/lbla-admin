# ⚠️ MÓDULO DEPRECADO — ABSORBIDO POR PORTAL LBLA

> [!CAUTION]
> **Este repositorio ha sido formalmente descomisionado el 12 de octubre de 2026.**
> Su pipeline de CI/CD automático (push → main) ha sido **deshabilitado** para evitar despliegues divergentes.

---

## Estado Oficial: DEPRECADO / ABSORBIDO

La consola administrativa `07-LBLA-ADMIN` (**`admin.lbla.cl`**, SPA React + TypeScript + Vite) ha sido **completamente absorbida y sustituida** por el módulo de **Administración y Gobernanza de Portal LBLA** (`09-LBLA-CORE/apps/portal/`), operativo desde la ruta:

```
https://core.lbla.cl/portal/admin/gestion/
```

### Capacidades migradas a Portal LBLA

| Funcionalidad (Admin SPA) | Nueva ubicación en Portal LBLA | URL canónica |
|:---|:---|:---|
| Gestión de Identidades OIDC y OAuth2 | Gestión Institucional | `/portal/admin/gestion/` |
| Carga e Ingesta SIGE (Preview + Apply) | Actualización SIGE | `/portal/admin/sige/` |
| Reconciliación Google Workspace | Sincronización Google Workspace | `/portal/admin/google/` |
| Visor de Auditoría Inmutable | Registro de Auditoría | `/portal/admin/auditoria/` |
| Períodos Lectivos y Estructura Académica | Gestión Institucional | `/portal/admin/gestion/` |

### Acceso al nuevo módulo

El acceso es **exclusivo para usuarios con rol `SUPERADMIN`** autenticados en Portal LBLA:

1. Ingresar en `https://core.lbla.cl/portal/login/` con credenciales institucionales o Google Workspace SSO.
2. En el sidebar izquierdo, sección **ADMINISTRACIÓN Y GOBERNANZA**, seleccionar el módulo deseado.
3. Cualquier intento de acceso desde roles no autorizados (`DOCENTE`, `ASISTENTE`, etc.) resulta en **HTTP 403 Forbidden** registrado en AuditLog.

---

## ¿Por qué se tomó esta decisión?

- **Límite estricto de cPanel BlueHosting**: 4 slots Passenger activos (`04-LBLA-LABORATORIOS`, `05-BIBLIOTECA-CRA`, `08-MIPYME-LBLA`, `09-LBLA-CORE`). `07-LBLA-ADMIN` es una SPA estática que **no consume slot Python**, pero su mantenimiento como repositorio independiente genera divergencia operacional.
- **Simplificación del ecosistema**: Consolidar la gobernanza dentro del mismo proceso Django de LBLA Core elimina la latencia de red API↔SPA y reduce la superficie de ataque CORS.
- **Cero pérdida de datos**: Todas las capacidades fueron re-implementadas con acceso directo a los modelos Django de `apps.identity`, `apps.sige`, `apps.audit` y `apps.personas`.

---

## Estado de los archivos

- **`src/`**: Código fuente TypeScript/React — congelado como referencia histórica. No se actualiza.
- **`dist/`**: Build de producción — el desplegado en `admin.lbla.cl` permanece en cPanel como fallback sin mantenimiento activo.
- **`.github/workflows/deploy.yml`**: Pipeline renombrado a `deploy.yml.disabled`. **No se ejecuta automáticamente.**
- **`.github/workflows/ci.yml`**: Mantenido como referencia; no se ejecuta en push a main.

---

## Fecha de congelamiento

**12 de Octubre de 2026** — Confirmado por: Departamento de Informática LBLA / Antigravity (Google DeepMind).
