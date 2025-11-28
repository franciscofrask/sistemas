// src/services/permisos.js
import { service_DBconn } from "@/services/db";

export async function service_VerificarPermisoRuta(usuario_id, ruta) {
    let connection;
    
    try {
        connection = await service_DBconn();
        
        // Obtener rol del usuario
        const [usuario] = await connection.execute(
            'SELECT rol_id FROM usuarios WHERE id = ?',
            [usuario_id]
        );
        
        if (usuario.length === 0) {
            return { tiene_permiso: false, motivo: 'Usuario no encontrado' };
        }
        
        const rol_id = usuario[0].rol_id;
        
        // Verificar si la ruta requiere permisos específicos
        const [funcionalidad] = await connection.execute(
            'SELECT id, nombre FROM funcionalidades WHERE ruta = ? OR ruta LIKE ?',
            [ruta, ruta + '%']
        );
        
        if (funcionalidad.length === 0) {
            // Si no hay funcionalidad definida para esta ruta, permitir acceso
            return { tiene_permiso: true, motivo: 'Ruta sin restricciones' };
        }
        
        const func_id = funcionalidad[0].id;
        const func_nombre = funcionalidad[0].nombre;
        
        // Verificar permisos del rol para esta funcionalidad
        const [permiso] = await connection.execute(
            'SELECT puede_acceder FROM permisos_rol_funcionalidad WHERE rol_id = ? AND funcionalidad_id = ?',
            [rol_id, func_id]
        );
        
        let tiene_acceso;
        
        if (permiso.length === 0) {
            // Sin permiso explícito, por defecto permitir (excepto para funcionalidades sensibles)
            tiene_acceso = !['DASHBOARD', 'ADMINISTRACION'].includes(func_nombre);
        } else {
            tiene_acceso = permiso[0].puede_acceder === 1;
        }
        
        await connection.end();
        
        return {
            tiene_permiso: tiene_acceso,
            funcionalidad: func_nombre,
            motivo: tiene_acceso ? 'Acceso permitido' : 'Acceso denegado por permisos de rol'
        };
        
    } catch (error) {
        console.error('Error verificando permisos de ruta:', error);
        if (connection) await connection.end();
        return { tiene_permiso: false, motivo: 'Error interno del servidor' };
    }
}

export async function service_ObtenerRutasPermitidas(usuario_id) {
    let connection;
    
    try {
        connection = await service_DBconn();
        
        // Obtener rol del usuario
        const [usuario] = await connection.execute(
            'SELECT rol_id FROM usuarios WHERE id = ?',
            [usuario_id]
        );
        
        if (usuario.length === 0) {
            return [];
        }
        
        const rol_id = usuario[0].rol_id;
        
        // Obtener todas las rutas permitidas para el rol
        const [rutas] = await connection.execute(`
            SELECT f.ruta, f.nombre
            FROM funcionalidades f
            LEFT JOIN permisos_rol_funcionalidad p ON f.id = p.funcionalidad_id AND p.rol_id = ?
            WHERE f.ruta IS NOT NULL 
            AND (
                p.puede_acceder = 1 
                OR (p.puede_acceder IS NULL AND f.nombre NOT IN ('DASHBOARD', 'ADMINISTRACION'))
            )
        `, [rol_id]);
        
        await connection.end();
        
        return rutas.map(r => ({ ruta: r.ruta, funcionalidad: r.nombre }));
        
    } catch (error) {
        console.error('Error obteniendo rutas permitidas:', error);
        if (connection) await connection.end();
        return [];
    }
}

// Servicio para obtener permisos de un usuario específico
export async function service_ObtenerPermisosUsuario(usuario_id) {
    let connection;
    
    try {
        connection = await service_DBconn();
        
        const [results] = await connection.execute(
            'CALL obtener_permisos_usuario(?)',
            [usuario_id]
        );
        
        await connection.end();
        
        // Los resultados están en results[0] debido a la estructura del procedimiento almacenado
        const permisos = results[0] || [];
        
        return {
            success: true,
            data: permisos
        };
        
    } catch (error) {
        console.error('Error obteniendo permisos de usuario:', error);
        if (connection) await connection.end();
        return {
            success: false,
            message: 'Error al obtener permisos del usuario'
        };
    }
}

// Servicio para obtener permisos de un rol específico
export async function service_ObtenerPermisosRol(rol_id) {
    let connection;
    
    try {
        connection = await service_DBconn();
        
        const [results] = await connection.execute(
            'CALL obtener_permisos_rol(?)',
            [rol_id]
        );
        
        await connection.end();
        
        // Los resultados están en results[0] debido a la estructura del procedimiento almacenado
        const permisos = results[0] || [];
        
        return {
            success: true,
            data: permisos
        };
        
    } catch (error) {
        console.error('Error obteniendo permisos de rol:', error);
        if (connection) await connection.end();
        return {
            success: false,
            message: 'Error al obtener permisos del rol'
        };
    }
}

// Servicio para asignar/modificar permiso de funcionalidad
export async function service_AsignarPermisoFuncionalidad(rol_id, funcionalidad_id, puede_acceder) {
    let connection;
    
    try {
        connection = await service_DBconn();
        
        await connection.execute(
            'CALL asignar_permiso_funcionalidad(?, ?, ?)',
            [rol_id, funcionalidad_id, puede_acceder]
        );
        
        await connection.end();
        
        return {
            success: true,
            message: 'Permiso actualizado correctamente'
        };
        
    } catch (error) {
        console.error('Error asignando permiso:', error);
        if (connection) await connection.end();
        return {
            success: false,
            message: 'Error al asignar el permiso'
        };
    }
}