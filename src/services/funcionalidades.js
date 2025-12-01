// src/services/funcionalidades.js

export async function service_ObtenerFuncionalidades(_db) {
    try {
        // Usar el procedimiento almacenado para obtener funcionalidades (sin filtro de rol)
        const [rows] = await _db.execute('CALL listar_funcionalidades(?)', [null]);
        return rows[0]; // Los procedimientos devuelven el resultado en el primer índice
    } catch (err) {
        console.error('Error en service_ObtenerFuncionalidades:', err);
        throw new Error('Error obteniendo funcionalidades del sistema');
    }
}

export async function service_ObtenerFuncionalidadesPorRol(_db, _rol_id) {
    try {
        // Usar el procedimiento almacenado para obtener funcionalidades filtradas por rol
        const [rows] = await _db.execute('CALL listar_funcionalidades(?)', [_rol_id]);
        return rows[0]; // Los procedimientos devuelven el resultado en el primer índice
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