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

export async function service_RegistrarMovimientoStock(_db, movimientoData) {
    try {
        const {
            producto_id, almacen_id, tipo_movimiento, origen,
            documento_tipo, documento_id, cantidad, lote_id, serie_id, serie
        } = movimientoData;
        
        let finalSerieId = serie_id || null;
        let finalCantidad = cantidad || null;
        
        // Si se proporciona un objeto serie, crear/obtener el serie_id
        if (serie && serie.numero_serie) {
            // Primero intentar encontrar la serie existente
            const [existingSeries] = await _db.execute(
                'SELECT id FROM series WHERE producto_id = ? AND numero_serie = ?',
                [producto_id, serie.numero_serie]
            );
            
            if (existingSeries.length > 0) {
                finalSerieId = existingSeries[0].id;
            } else {
                // Crear nueva serie
                const [result] = await _db.execute(
                    'INSERT INTO series (producto_id, numero_serie) VALUES (?, ?)',
                    [producto_id, serie.numero_serie]
                );
                finalSerieId = result.insertId;
            }
            
            // Para series, la cantidad siempre es 1
            finalCantidad = 1;
        }
        
        // Asegurar que los parámetros undefined se conviertan en null
        const params = [
            producto_id || null,
            almacen_id || null, 
            tipo_movimiento || 'INGRESO',
            origen || 'AJUSTE_MANUAL',
            documento_tipo || 'AJUSTE_STOCK',
            documento_id || null,
            finalCantidad,
            lote_id || null,
            finalSerieId
        ];
        
        // Ejecutar el procedimiento almacenado para registrar movimiento de stock
        await _db.execute(
            'CALL sp_registrar_movimiento_stock(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            params
        );
        
        return true;
    } catch (err) {
        console.error('Error en service_RegistrarMovimientoStock:', err);
        throw new Error('Error registrando movimiento de stock: ' + err.message);
    }
}

export async function service_ListarLotesProducto(_db, productoId) {
    try {
        // Obtener lotes existentes para un producto
        const [rows] = await _db.execute(
            'SELECT * FROM lotes WHERE producto_id = ? ORDER BY fecha_vencimiento ASC',
            [productoId]
        );
        return rows;
    } catch (err) {
        console.error('Error en service_ListarLotesProducto:', err);
        throw new Error('Error obteniendo lotes del producto: ' + err.message);
    }
}

export async function service_CrearLote(_db, loteData) {
    try {
        const { producto_id, codigo_lote, fecha_vencimiento } = loteData;
        
        // Crear nuevo lote
        const [result] = await _db.execute(
            'INSERT INTO lotes (producto_id, codigo_lote, fecha_vencimiento) VALUES (?, ?, ?)',
            [producto_id, codigo_lote, fecha_vencimiento]
        );
        
        return result.insertId;
    } catch (err) {
        console.error('Error en service_CrearLote:', err);
        throw new Error('Error creando lote: ' + err.message);
    }
}

export async function service_CrearSerie(_db, serieData) {
    try {
        const { producto_id, numero_serie } = serieData;
        
        // Crear nueva serie
        const [result] = await _db.execute(
            'INSERT INTO series (producto_id, numero_serie) VALUES (?, ?)',
            [producto_id, numero_serie]
        );
        
        return result.insertId;
    } catch (err) {
        console.error('Error en service_CrearSerie:', err);
        throw new Error('Error creando serie: ' + err.message);
    }
}

export async function service_ObtenerStockProductoAlmacen(_db, productoId, almacenId) {
    try {
        // Llamar al procedimiento almacenado para obtener stock de producto en almacén específico
        const [rows] = await _db.execute('CALL sp_get_stock_producto_almacen(?, ?)', [productoId, almacenId]);
        return rows;
    } catch (err) {
        console.error('Error en service_ObtenerStockProductoAlmacen:', err);
        throw new Error('Error obteniendo stock del producto en almacén: ' + err.message);
    }
}

export async function service_BorrarProductoLogico(_db, productoId) {
    try {
        // Llamar al procedimiento almacenado para borrar lógicamente un producto
        // El procedimiento valida que no tenga stock y hace el borrado lógico del producto y sus hijos
        const [result] = await _db.execute('CALL sp_borrar_producto_logico(?)', [productoId]);
        
        return {
            success: true,
            message: 'Producto borrado lógicamente exitosamente'
        };
    } catch (err) {
        console.error('Error en service_BorrarProductoLogico:', err);
        
        // Verificar si es un error específico del procedimiento almacenado
        if (err.sqlState === '45000') {
            // Error controlado del procedimiento (producto no existe, ya borrado, o tiene stock)
            throw new Error(err.sqlMessage);
        }
        
        // Error genérico
        throw new Error('Error borrando producto: ' + err.message);
    }
}

export async function service_UpsertSerieAtributo(_db, serieId, clave, valor) {
    try {
        // Validaciones básicas en el cliente
        if (!serieId) {
            throw new Error('ID de serie es requerido');
        }
        
        if (!clave || !clave.trim()) {
            throw new Error('La clave del atributo es requerida');
        }
        
        if (valor === null || valor === undefined || !valor.toString().trim()) {
            throw new Error('El valor del atributo es requerido');
        }
        
        // Llamar al procedimiento almacenado para hacer upsert del atributo de serie
        const [result] = await _db.execute(
            'CALL sp_upsert_serie_atributo(?, ?, ?)', 
            [serieId, clave.trim(), valor.toString().trim()]
        );
        
        return {
            success: true,
            message: 'Atributo de serie guardado exitosamente',
            data: {
                serie_id: serieId,
                clave: clave.trim(),
                valor: valor.toString().trim()
            }
        };
        
    } catch (err) {
        console.error('Error en service_UpsertSerieAtributo:', err);
        
        // Verificar si es un error específico del procedimiento almacenado
        if (err.sqlState === '45000') {
            // Errores controlados del procedimiento (validaciones del negocio)
            throw new Error(err.sqlMessage);
        }
        
        // Error genérico
        throw new Error('Error guardando atributo de serie: ' + err.message);
    }
}

export async function service_ListarAtributosSerie(_db, serieId) {
    try {
        // Validación básica en el cliente
        if (!serieId) {
            throw new Error('ID de serie es requerido');
        }

        // Llamar al procedimiento almacenado para listar atributos de la serie
        const [rows] = await _db.execute('CALL sp_listar_atributos_serie(?)', [serieId]);
        
        return rows[0] || [];
        
    } catch (err) {
        console.error('Error en service_ListarAtributosSerie:', err);
        
        // Verificar si es un error específico del procedimiento almacenado
        if (err.sqlState === '45000') {
            // Error controlado del procedimiento
            throw new Error(err.sqlMessage);
        }
        
        // Error genérico
        throw new Error('Error obteniendo atributos de serie: ' + err.message);
    }
}

export async function service_BorrarSerieAtributo(_db, serieId, clave) {
    try {
        // Validaciones básicas en el cliente
        if (!serieId) {
            throw new Error('ID de serie es requerido');
        }
        
        if (!clave || !clave.trim()) {
            throw new Error('La clave del atributo es requerida');
        }

        // Llamar al procedimiento almacenado para borrar el atributo de la serie
        const [result] = await _db.execute(
            'CALL sp_borrar_serie_atributo(?, ?)', 
            [serieId, clave.trim()]
        );
        
        return {
            success: true,
            message: 'Atributo de serie borrado exitosamente',
            data: {
                serie_id: serieId,
                clave: clave.trim()
            }
        };
        
    } catch (err) {
        console.error('Error en service_BorrarSerieAtributo:', err);
        
        // Verificar si es un error específico del procedimiento almacenado
        if (err.sqlState === '45000') {
            // Error controlado del procedimiento
            throw new Error(err.sqlMessage);
        }
        
        // Error genérico
        throw new Error('Error borrando atributo de serie: ' + err.message);
    }
}