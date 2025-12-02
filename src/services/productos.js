// src/services/productos.js

export async function service_ObtenerProductosConStock(_db, almacenId = null) {
    try {
        // Usar el procedimiento almacenado para obtener productos con stock total
        // Si se proporciona almacenId, se puede filtrar por almacén específico
        if (almacenId) {
            const [rows] = await _db.execute('CALL sp_get_productos_con_stock_total(?)', [almacenId]);
            return rows[0];
        } else {
            const [rows] = await _db.execute('CALL sp_get_productos_con_stock_total()');
            return rows[0];
        }
    } catch (err) {
        console.error('Error en service_ObtenerProductosConStock:', err);
        throw new Error('Error obteniendo productos con stock');
    }
}

export async function service_ObtenerProductoPorId(_db, _id) {
    try {
        const [rows] = await _db.execute(
            'SELECT * FROM productos WHERE id = ?',
            [_id]
        );
        return rows[0] || null;
    } catch (err) {
        console.error('Error en service_ObtenerProductoPorId:', err);
        throw new Error('Error obteniendo producto por ID');
    }
}