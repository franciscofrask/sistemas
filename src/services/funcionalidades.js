// src/services/funcionalidades.js

export async function service_ObtenerFuncionalidades(_db) {
    try {
        // Usar el procedimiento almacenado para obtener funcionalidades
        const [rows] = await _db.execute('CALL listar_funcionalidades()');
        return rows[0]; // Los procedimientos devuelven el resultado en el primer índice
    } catch (err) {
        console.error('Error en service_ObtenerFuncionalidades:', err);
        throw new Error('Error obteniendo funcionalidades del sistema');
    }
}

export async function service_ObtenerFuncionalidadesPorRol(_db, _rol_id) {
    try {
        // Obtener funcionalidades con permisos del rol
        // Si no hay permiso explícito, se considera que SÍ tiene acceso (por defecto)
        // Solo se restringe explícitamente cuando puede_acceder = 0
        const [rows] = await _db.execute(`
            SELECT 
                f.id, 
                f.nombre, 
                f.descripcion,
                CASE 
                    WHEN p.puede_acceder IS NULL THEN 1
                    ELSE p.puede_acceder 
                END AS puede_acceder
            FROM funcionalidades f
            LEFT JOIN permisos_rol_funcionalidad p ON f.id = p.funcionalidad_id AND p.rol_id = ?
            WHERE CASE 
                    WHEN p.puede_acceder IS NULL THEN 1
                    ELSE p.puede_acceder 
                  END = 1
            ORDER BY f.id
        `, [_rol_id]);
        return rows;
    } catch (err) {
        console.error('Error en service_ObtenerFuncionalidadesPorRol:', err);
        throw new Error('Error obteniendo funcionalidades por rol');
    }
}

export async function service_ObtenerFuncionalidadPorId(_db, _id) {
    try {
        const [rows] = await _db.execute(
            'SELECT id, nombre, descripcion FROM funcionalidades WHERE id = ?',
            [_id]
        );
        return rows[0] || null;
    } catch (err) {
        console.error('Error en service_ObtenerFuncionalidadPorId:', err);
        throw new Error('Error obteniendo funcionalidad por ID');
    }
}