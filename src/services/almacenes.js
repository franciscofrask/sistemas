// src/services/almacenes.js

export async function service_ListarAlmacenes(_db, solo_activos = 1) {
    try {
        // Usar el procedimiento almacenado para obtener la lista de almacenes
        // solo_activos: 1 para solo activos, 0 para todos
        const [rows] = await _db.execute('CALL sp_listar_almacenes(?)', [solo_activos]);
        return rows[0]; // Los procedimientos devuelven el resultado en el primer índice
    } catch (err) {
        console.error('Error en service_ListarAlmacenes:', err);
        throw new Error('Error obteniendo lista de almacenes');
    }
}

export async function service_ObtenerAlmacenPorId(_db, _id) {
    try {
        const [rows] = await _db.execute(
            'SELECT * FROM almacenes WHERE id = ?',
            [_id]
        );
        return rows[0] || null;
    } catch (err) {
        console.error('Error en service_ObtenerAlmacenPorId:', err);
        throw new Error('Error obteniendo almacén por ID');
    }
}