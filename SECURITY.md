# Sistema de Protección de Rutas y Permisos

## 📋 Descripción

Este sistema implementa un control de acceso basado en roles (RBAC) que protege las rutas de la aplicación tanto del lado del cliente como del servidor. Los usuarios solo pueden acceder a las funcionalidades para las que tienen permisos explícitos.

## 🛡️ Características

- **Protección de rutas del lado del servidor** mediante middleware de Next.js
- **Protección de rutas del lado del cliente** con componentes React
- **Sistema de roles**: Admin, Manager, Usuario
- **Permisos granulares** por funcionalidad
- **Redirección inteligente** a páginas permitidas
- **Verificación en tiempo real** de permisos
- **UI condicional** basada en permisos

## 📊 Estructura de la Base de Datos

### Tablas Principales

1. **usuarios**: Información de usuarios del sistema
2. **roles**: Definición de roles (admin, manager, usuario)
3. **funcionalidades**: Módulos/páginas del sistema
4. **permisos_rol_funcionalidad**: Matriz de permisos

### Funcionalidades y Rutas

| Funcionalidad | Ruta | Admin | Manager | Usuario |
|--------------|------|-------|---------|---------|
| INVENTARIO | `/stock/inventario` | ✅ | ✅ | ✅ |
| ALMACENES | `/stock/almacenes` | ✅ | ✅ | ✅ |
| PROVEEDORES | `/stock/proveedores` | ✅ | ✅ | ✅ |
| CLIENTES | `/stock/clientes` | ✅ | ✅ | ✅ |
| PRESUPUESTO | `/stock/presupuestos` | ✅ | ✅ | ✅ |
| COMERCIO | `/stock/ventas` | ✅ | ✅ | ✅ |
| DASHBOARD | `/stock/dashboard` | ✅ | ❌ | ❌ |
| ADMINISTRACION | `/admin` | ✅ | ❌ | ❌ |

## 🔧 Componentes del Sistema

### 1. Middleware de Servidor (`middleware.js`)
Protege las rutas del lado del servidor antes de que lleguen al cliente.

### 2. RouteGuard (`src/components/Auth/RouteGuard.js`)
Componente que verifica permisos del lado del cliente y maneja redirecciones.

### 3. ProtectedLayout (`src/components/Layout/ProtectedLayout.js`)
Layout que envuelve páginas protegidas con verificación automática de permisos.

### 4. PermissionGate (`src/components/Auth/PermissionGate.js`)
Componente para mostrar/ocultar elementos basado en permisos específicos.

### 5. Servicios de Permisos (`src/services/permisos.js`)
Lógica de negocio para verificar permisos y obtener rutas permitidas.

### 6. APIs de Permisos
- `/api/permisos/verificar-ruta`: Verifica si un usuario puede acceder a una ruta
- `/api/permisos/primera-ruta`: Obtiene la primera ruta permitida para redirección

## 💻 Uso del Sistema

### Proteger una Página Completa

```javascript
import ProtectedLayout from '@/components/Layout/ProtectedLayout';

const MiPagina = () => {
  return (
    <ProtectedLayout>
      <div>Contenido protegido</div>
    </ProtectedLayout>
  );
};

export default MiPagina;
```

### Proteger Elementos Específicos

```javascript
import PermissionGate, { AdminOnly, DashboardAccess } from '@/components/Auth/PermissionGate';

const MiComponente = () => {
  return (
    <div>
      {/* Solo para administradores */}
      <AdminOnly>
        <button>Botón solo para admin</button>
      </AdminOnly>

      {/* Solo si puede acceder al dashboard */}
      <DashboardAccess>
        <div>Panel de estadísticas</div>
      </DashboardAccess>

      {/* Verificación de ruta específica */}
      <PermissionGate route="/stock/ventas">
        <div>Módulo de ventas</div>
      </PermissionGate>
    </div>
  );
};
```

### Verificar Permisos Programáticamente

```javascript
import usePermissions from '@/hooks/usePermissions';

const MiComponente = () => {
  const { hasPermission, canAccess, hasRole } = usePermissions();

  const handleClick = async () => {
    const puedeAcceder = await hasPermission('/admin');
    if (puedeAcceder) {
      // Lógica para usuarios autorizados
    }
  };

  return (
    <div>
      {hasRole('admin') && <div>Contenido para admin</div>}
    </div>
  );
};
```

## 🔒 Flujo de Seguridad

1. **Usuario intenta acceder a una ruta**
2. **Middleware del servidor** verifica autenticación básica
3. **RouteGuard del cliente** verifica permisos específicos
4. **Si no tiene permisos**: Redirige a primera ruta permitida
5. **Si tiene permisos**: Muestra el contenido

## 🛠️ Administración

### Gestión de Usuarios
- Panel en `/admin/usuarios`
- CRUD completo de usuarios
- Asignación de roles

### Configuración de Permisos
Los permisos se configuran en la tabla `permisos_rol_funcionalidad`:

```sql
-- Ejemplo: Dar acceso al dashboard a managers
INSERT INTO permisos_rol_funcionalidad (rol_id, funcionalidad_id, puede_acceder) 
VALUES (3, 8, 1);
```

## 🧪 Pruebas del Sistema

```bash
# Probar estructura de permisos
node scripts/test-permissions.js

# Prueba completa del sistema
node scripts/test-full-system.js
```

## 📝 Estado Actual

✅ **Completado**:
- Sistema de autenticación con bcrypt
- Protección de rutas servidor y cliente
- Matriz de permisos por rol
- Redirección inteligente
- Componentes de protección
- APIs de verificación
- Pruebas automatizadas

🔐 **Seguridad**: El sistema está listo para producción con protección completa contra acceso no autorizado via URL directa.

## 🚀 Próximos Pasos

1. Implementar logs de acceso
2. Agregar 2FA (autenticación de dos factores)
3. Sistema de sesiones distribuidas
4. Monitoreo de intentos de acceso
5. Cache de permisos para mejor rendimiento