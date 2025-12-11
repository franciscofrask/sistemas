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

export async function service_CrearProducto(_db, datosProducto) {
    try {
        const {
            nombre, sku, codigo_barras, categoria_id, unidad_medida_id,
            tipo_control_stock, es_servicio, precio_lista
        } = datosProducto;
        
        // Ejecutar el procedimiento almacenado para crear el producto
        const [result] = await _db.execute(
            'CALL sp_crear_producto(?, ?, ?, ?, ?, ?, ?, ?, @producto_id)',
            [nombre, sku, codigo_barras, categoria_id, unidad_medida_id, 
             tipo_control_stock, es_servicio, precio_lista]
        );
        
        // Obtener el ID del producto creado
        const [idResult] = await _db.execute('SELECT @producto_id as producto_id');
        return idResult[0].producto_id;
        
    } catch (err) {
        console.error('Error en service_CrearProducto:', err);
        throw new Error('Error creando producto: ' + err.message);
    }
}

export async function service_CrearLoteConStock(_db, productoId, lote, almacenId) {
    try {
        const { codigo_lote, fecha_venc, cantidad } = lote;
        
        // Ejecutar el procedimiento almacenado para crear lote con stock
        await _db.execute(
            'CALL sp_crear_lote_con_stock(?, ?, ?, ?, ?)',
            [productoId, codigo_lote, fecha_venc, almacenId, cantidad]
        );
        
        return true;
    } catch (err) {
        console.error('Error en service_CrearLoteConStock:', err);
        throw new Error('Error creando lote: ' + err.message);
    }
}

export async function service_CrearSeriesConStock(_db, productoId, series, almacenId) {
    try {
        // Convertir array de series a string CSV
        const seriesCSV = series.join(',');
        
        // Ejecutar el procedimiento almacenado para crear series con stock
        await _db.execute(
            'CALL sp_crear_series_con_stock(?, ?, ?)',
            [productoId, almacenId, seriesCSV]
        );
        
        return true;
    } catch (err) {
        console.error('Error en service_CrearSeriesConStock:', err);
        throw new Error('Error creando series: ' + err.message);
    }
}

export async function service_ListarUnidadesMedida(_db) {
    try {
        // Ejecutar el procedimiento almacenado para listar unidades de medida
        const [rows] = await _db.execute('CALL sp_listar_unidades_medida()');
        return rows[0];
    } catch (err) {
        console.error('Error en service_ListarUnidadesMedida:', err);
        throw new Error('Error obteniendo unidades de medida: ' + err.message);
    }
}

export async function service_ListarCategoriasProducto(_db) {
    try {
        // Ejecutar el procedimiento almacenado para listar categorías de productos
        const [rows] = await _db.execute('CALL sp_listar_categorias_producto()');
        return rows[0];
    } catch (err) {
        console.error('Error en service_ListarCategoriasProducto:', err);
        throw new Error('Error obteniendo categorías de productos: ' + err.message);
    }
}