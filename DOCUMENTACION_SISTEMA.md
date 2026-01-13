# 📋 Documentación Completa del Sistema ERP

## 🏗️ Arquitectura General

### Stack Tecnológico
- **Framework:** Next.js 15.3.4 (Pages Router)
- **UI Library:** Mantine 8.3.9
- **Autenticación:** NextAuth.js 4.24.13
- **Base de Datos:** MySQL con `mysql2`
- **Estilos:** CSS Modules + PostCSS
- **Validación:** JWT con `jose` y `jsonwebtoken`

### Estructura del Proyecto
```
src/
├── components/          # Componentes reutilizables
│   ├── Auth/           # Protección de rutas y permisos
│   ├── Layout/         # Layouts de aplicación
│   ├── Navbars/        # Navegación (sidebar, navbar)
│   └── stock/          # Componentes específicos de stock
├── hooks/              # Hooks personalizados
├── layouts/            # Layouts base
├── lib/                # Utilidades de DB
├── middleware/         # Middleware de autenticación
├── pages/              # Rutas de la aplicación
│   ├── api/           # Endpoints de API
│   ├── autenticacion/ # Páginas de login/logout
│   └── stock/         # Módulos de gestión de stock
├── services/          # Servicios de negocio
├── styles/           # Estilos globales
└── utils/            # Utilidades generales
```

## 🔐 Sistema de Autenticación

### Flujo de Login
1. **Pantalla de Ingreso:** [`src/pages/autenticacion/ingresar.js`](src/pages/autenticacion/ingresar.js)
   - Genera JWT temporal con `NEXT_PUBLIC_FRONT_JWT`
   - Envía credenciales a [`/api/usuarios/login`](src/pages/api/usuarios/login.js)

2. **Validación Backend:** [`src/services/usuarios.js`](src/services/usuarios.js)
   - Ejecuta `CALL ObtenerUsuario(?)`
   - Verifica contraseña con `bcrypt.compare()`
   - Retorna datos del usuario normalizados

3. **Sesión NextAuth:** [`src/pages/api/auth/[...nextauth].js`](src/pages/api/auth/[...nextauth].js)
   - Crea sesión JWT interna
   - Genera token personalizado con `jose`
   - Establece sesión de 8 horas

### Sistema de Permisos

#### Protección de Rutas
- **RouteGuard:** [`src/components/Auth/RouteGuard.js`](src/components/Auth/RouteGuard.js)
  - Intercepta navegación
  - Valida token en `session.user.token`
  - Consulta permisos vía [`/api/permisos/verificar-ruta`](src/pages/api/permisos/verificar-ruta.js)
  - Redirige a primera ruta permitida si no autorizado

#### Servicios de Permisos
- **Verificación:** [`src/services/permisos.js`](src/services/permisos.js)
  - `service_VerificarPermisoRuta()`: Consulta `permisos_rol_funcionalidad`
  - `service_ObtenerRutasPermitidas()`: Lista rutas por rol
  - Integración con tablas: `usuarios`, `funcionalidades`, `roles`

#### Componentes de UI
- **PermissionGate:** [`src/components/Auth/PermissionGate.js`](src/components/Auth/PermissionGate.js)
  - Renderizado condicional por permisos
  - Componentes helper: `AdminOnly`, `ManagerOrAdmin`

## 🏪 Módulo de Ventas

### Flujo Completo de Venta

#### 1. Creación de Venta (BORRADOR)
**Vista:** [`src/pages/stock/ventas/crearventa.js`](src/pages/stock/ventas/crearventa.js)

**Datos requeridos:**
- Cliente (desde `/api/stock/clientes`)
- Almacén (desde localStorage + `/api/stock/almacenes`)
- Tipo de comprobante (desde `/api/stock/ventas/tipos-comprobantes`)
- **Condición de pago** (desde `/api/stock/ventas/condiciones-pago`)
- Número de comprobante (opcional)
- Observaciones (opcional)

**API:** [`/api/stock/ventas/crear`](src/pages/api/stock/ventas/crear.js)
- **Servicio:** [`service_CrearVenta()`](src/services/ventas.js)
- **SP:** `sp_crear_venta`
- **Estado inicial:** BORRADOR

#### 2. Agregado de Items
**Búsqueda de Productos Vendibles:**
- **API:** [`/api/stock/productos/vendibles`](src/pages/api/stock/productos/vendibles.js)
- **Servicio:** [`service_ListarItemsVendibles()`](src/services/itemsVendibles.js)
- **SP:** `sp_listar_items_vendibles_aplanados`
- **Filtros:** Por almacén, búsqueda de texto, límite

**Agregado de Items:**
- **API:** [`/api/stock/ventas/items/agregar`](src/pages/api/stock/ventas/items/agregar.js)
- **Servicio:** [`service_AgregarItemVenta()`](src/services/ventas.js)
- **SP:** `sp_agregar_item_venta`
- **Datos:** producto_id, cantidad, precio_unitario, lote_id?, serie_id?

#### 3. Confirmación de Venta
**Transición:** BORRADOR → CONFIRMADA
- **API:** [`/api/stock/ventas/confirmar`](src/pages/api/stock/ventas/confirmar.js)
- **Servicio:** [`service_ConfirmarVenta()`](src/services/ventas.js)
- **SP:** `sp_confirmar_venta`
- **Efectos:** Genera movimientos de stock, bloquea edición

#### 4. Anulación de Venta
**Transición:** CONFIRMADA → ANULADA
- **API:** [`/api/stock/ventas/anular`](src/pages/api/stock/ventas/anular.js)
- **Servicio:** [`service_AnularVenta()`](src/services/ventas.js)
- **SP:** `sp_anular_venta`
- **Efectos:** Revierte movimientos de stock

### Condiciones de Pago (NUEVO)

#### Tabla de Maestros
```sql
condiciones_pago:
- id, codigo, nombre
- requiere_cobranza, es_cta_cte, dias_vencimiento
- activo, creado_en, actualizado_en
```

#### Códigos Disponibles
- `CONTADO`: Pago inmediato
- `CUENTA_CORRIENTE`: Cuenta corriente del cliente
- `TARJETA_CREDITO`: Pago con tarjeta de crédito
- `TARJETA_DEBITO`: Pago con tarjeta de débito

#### Integración
- **Campo en ventas:** `condicion_pago_id` (FK)
- **API condiciones:** [`/api/stock/ventas/condiciones-pago`](src/pages/api/stock/ventas/condiciones-pago.js)
- **SP actualizado:** `sp_crear_venta` incluye `p_condicion_pago_codigo`

## 🗄️ Base de Datos

### Conexión
**Servicio:** [`src/services/db.js`](src/services/db.js)
```javascript
// Variables de entorno requeridas
NEXT_PUBLIC_DB_HOST=localhost
NEXT_PUBLIC_DB_USER=usuario
NEXT_PUBLIC_DB_PW=contraseña
NEXT_PUBLIC_DB_DB=base_datos
NEXT_PUBLIC_DB_PORT=3306
```

### Stored Procedures Principales

#### Autenticación
- `ObtenerUsuario(usuario)`: Valida credenciales

#### Ventas
- `sp_crear_venta(cliente_id, almacen_id, tipo_comprobante, nro_comprobante, observaciones, creado_por, presupuesto_id, condicion_pago_codigo)`
- `sp_agregar_item_venta(venta_id, producto_id, cantidad, precio_unitario, lote_id, serie_id)`
- `sp_listar_items_venta(venta_id)`
- `sp_confirmar_venta(venta_id)`
- `sp_anular_venta(venta_id)`
- `sp_get_venta_para_edicion(venta_id)`
- `sp_listar_ventas(...filtros...)`

#### Productos Vendibles
- `sp_listar_items_vendibles_aplanados(almacen_id, query, limite)`

#### Permisos
- `obtener_permisos_usuario(usuario_id)`
- `obtener_permisos_rol(rol_id)`

## 🎨 Layout y Navegación

### Layout Principal
**Componente:** [`src/layouts/index.js`](src/layouts/index.js)
- **AppShell de Mantine:** Header + Sidebar + Main
- **Gestión de almacén:** Selector en header con localStorage
- **Breadcrumbs automáticos:** Basados en ruta actual
- **Sidebar colapsible:** Con indicador visual

### Protección de Layout
**Wrapper:** [`src/components/Layout/ProtectedLayout.js`](src/components/Layout/ProtectedLayout.js)
```jsx
export default function ProtectedLayout({ children }) {
    return (
        <RouteGuard>
            <LayoutBase>
                {children}
            </LayoutBase>
        </RouteGuard>
    );
}
```

### Gestión de Errores
- **ErrorBoundary:** [`src/components/ErrorBoundary.js`](src/components/ErrorBoundary.js)
- **Handler global:** [`src/hooks/useErrorHandler.js`](src/hooks/useErrorHandler.js)
- **Utilidades:** [`src/utils/errorHandler.js`](src/utils/errorHandler.js)

## ⚙️ Configuración y Variables

### Variables de Entorno Críticas
```bash
# Autenticación NextAuth
NEXTAUTH_SECRET=tu_secreto_muy_seguro_aqui

# JWT para APIs frontend
NEXT_PUBLIC_FRONT_JWT=jwt_para_login_temporal

# JWT para sesiones internas
NEXT_PUBLIC_USER_JWT=jwt_para_sesiones_usuario
NEXT_PUBLIC_USER_JWT_TIME=8h

# JWT para permisos (legacy)
JWT_SECRET=jwt_para_primera_ruta

# Base de datos MySQL
NEXT_PUBLIC_DB_HOST=localhost
NEXT_PUBLIC_DB_USER=erp_user
NEXT_PUBLIC_DB_PW=password_seguro
NEXT_PUBLIC_DB_DB=sistema_erp
NEXT_PUBLIC_DB_PORT=3306
```

### Scripts de Package.json
```bash
npm run dev     # Servidor de desarrollo
npm run build   # Build de producción
npm run start   # Servidor de producción
npm run lint    # Análisis de código
```

### Configuración Next.js
**Archivo:** [`next.config.mjs`](next.config.mjs)
- React Strict Mode deshabilitado
- Optimización de hot reload
- Configuración de webpack personalizada

## 🚀 Guía de Inicio Rápido

### Instalación
```bash
# Clonar repositorio
git clone [url-repositorio]
cd sistemas

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env.local
# Editar .env.local con tus variables
```

### Base de Datos
1. Crear base de datos MySQL
2. Ejecutar migraciones/scripts SQL
3. Insertar datos semilla (usuarios, roles, funcionalidades)
4. Ejecutar scripts de condiciones de pago (nuevo)

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
# Login por defecto: admin / admin123
```

## 🔧 Troubleshooting

### Errores Comunes

#### Error de Conexión DB
```
Error conectando a la base de datos
```
**Solución:** Verificar variables `NEXT_PUBLIC_DB_*` en `.env.local`

#### Token Inválido
```
Token inválido
```
**Solución:** Sincronizar `JWT_SECRET` entre archivos que usan `jsonwebtoken` vs `jose`

#### Permisos No Funcionan
**Causas posibles:**
- Usuario sin rol asignado
- Funcionalidad sin ruta configurada
- Permisos de rol no definidos

#### Almacén No Selecciona
**Solución:** Verificar estructura en localStorage:
```javascript
// Formato esperado en 'almacen_seleccionado'
{ "id": 2, "nombre": "Casa Central" }
```

### Performance
- **next.config.mjs** limita hot reload agresivo
- **useStableSession** evita re-renders innecesarios
- **API responses** incluyen metadata para debugging

## 📈 Extensibilidad

### Agregar Nuevo Módulo
1. Crear páginas en `src/pages/[modulo]/`
2. Crear APIs en `src/pages/api/[modulo]/`
3. Crear servicios en `src/services/[modulo].js`
4. Agregar funcionalidad en tabla `funcionalidades`
5. Configurar permisos en `permisos_rol_funcionalidad`

### Agregar Nuevos Campos
1. Alterar tabla en MySQL
2. Actualizar SP correspondiente
3. Modificar servicio en `src/services/`
4. Actualizar API endpoint
5. Actualizar formularios en componentes

### Personalizar UI
- **Tema Mantine:** Modificar en `src/pages/_app.js`
- **Colores:** Usar `#EE0E0F` (rojo corporativo) y `#140D0D` (fondo oscuro)
- **Componentes:** Extender de Mantine en `src/components/`

---

## 🎯 Próximos Pasos Sugeridos

1. **Tesorería:** Integrar cobros con condiciones de pago
2. **Reportes:** Dashboard con métricas de ventas
3. **Multi-empresa:** Soporte para múltiples empresas
4. **Mobile:** PWA para dispositivos móviles
5. **Notificaciones:** Sistema de alerts en tiempo real

---

*Documentación actualizada: Enero 2026*
*Sistema: ERP Municipal v0.1.0*