// src/services/productos.js

export async function service_ObtenerProductosConStock(_db, almacenId = null) {
    try {
        // Usar el procedimiento almacenado para obtener productos con stock total
        // Siempre pasamos un parámetro: almacenId o NULL
        const [rows] = await _db.execute('CALL sp_get_productos_con_stock_total(?)', [almacenId]);
        return rows[0];
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

export async function service_ObtenerAlmacenesConStockProducto(_db, productoId = null) {
    try {
        // Usar el procedimiento almacenado para obtener almacenes con stock de un producto
        // Siempre pasamos un parámetro: productoId o NULL
        const [rows] = await _db.execute('CALL sp_get_almacenes_con_stock_producto(?)', [productoId]);
        return rows[0];
    } catch (err) {
        console.error('Error en service_ObtenerAlmacenesConStockProducto:', err);
        throw new Error('Error obteniendo almacenes con stock del producto');
    }
}