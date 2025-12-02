// src/services/productos.js

export async function service_ObtenerProductosConStock(_db) {
    try {
        // Usar el procedimiento almacenado para obtener productos con stock total
        const [rows] = await _db.execute('CALL sp_get_productos_con_stock_total()');
        return rows[0]; // Los procedimientos devuelven el resultado en el primer índice
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