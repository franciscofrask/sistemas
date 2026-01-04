import { service_DBconn } from './db.js';

/**
 * Obtiene el detalle completo de una compra llamando al SP sp_get_detalle_compra
 * @param {number} compraId - ID de la compra
 * @returns {Object} { success: boolean, message?: string, data?: { cabecera: Object, items: Array, movimientos: Array } }
 */
export async function service_GetDetalleCompra(compraId) {
  let connection;
  try {
    if (!compraId) return { success: false, message: 'compra_id es requerido' };

    connection = await service_DBconn();
    const [rows] = await connection.execute('CALL sp_get_detalle_compra(?)', [parseInt(compraId)]);
    
    // El SP devuelve 3 resultsets: [0] = cabecera, [1] = items, [2] = movimientos
    const cabecera = rows[0]?.[0] || null;
    const items = rows[1] || [];
    const movimientos = rows[2] || [];

    if (!cabecera) {
      return { success: false, message: 'Compra no encontrada' };
    }

    return { success: true, data: { cabecera, items, movimientos } };
  } catch (error) {
    console.error('Error en service_GetDetalleCompra:', error);
    return { success: false, message: 'Error interno al obtener detalle de compra', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Lista compras paginadas con filtros llamando al SP sp_listar_compras
 * @param {Object} params
 * @param {number|null} params.almacenId - ID del almacén o null
 * @param {number|null} params.proveedorId - ID del proveedor o null  
 * @param {string|null} params.estado - 'BORRADOR' | 'CONFIRMADA' | 'ANULADA' | null
 * @param {string|null} params.fechaDesde - Fecha desde o null
 * @param {string|null} params.fechaHasta - Fecha hasta o null
 * @param {string|null} params.busqueda - Buscar en nro_comprobante y razon_social
 * @param {number} params.limit - Límite de registros (default 50)
 * @param {number} params.offset - Offset para paginación (default 0)
 * @returns {Object} { success: boolean, message?: string, data?: { total: number, items: Array } }
 */
export async function service_ListarCompras({
  almacenId = null,
  proveedorId = null,
  estado = null,
  fechaDesde = null,
  fechaHasta = null,
  busqueda = null,
  limit = 50,
  offset = 0,
}) {
  let connection;
  try {
    connection = await service_DBconn();

    // Preparar parámetros para el SP
    const params = [
      almacenId,
      proveedorId, 
      estado,
      fechaDesde,
      fechaHasta,
      busqueda,
      parseInt(limit),
      parseInt(offset),
    ];

    const [rows] = await connection.execute('CALL sp_listar_compras(?, ?, ?, ?, ?, ?, ?, ?)', params);
    
    // El SP devuelve 2 resultsets: [0] = count, [1] = items
    const total = rows[0]?.[0]?.total_count || 0;
    const items = rows[1] || [];

    return { success: true, data: { total, items } };
  } catch (error) {
    console.error('Error en service_ListarCompras:', error);
    return { success: false, message: 'Error interno al listar compras', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Agrega un ítem a una compra en BORRADOR llamando al SP sp_agregar_item_compra
 * @param {Object} params
 * @param {number} params.compraId
 * @param {number} params.productoId
 * @param {number} params.cantidad
 * @param {number} params.precioUnitario
 * @param {string|null} params.codigoLote
 * @param {string|null} params.fechaVencimiento - Formato 'YYYY-MM-DD' o null
 * @param {number|null} params.serieId
 * @param {string|null} params.numeroSerie
 */
export async function service_AgregarItemCompra({
  compraId,
  productoId,
  cantidad,
  precioUnitario,
  codigoLote = null,
  fechaVencimiento = null,
  serieId = null,
  numeroSerie = null,
}) {
  let connection;
  try {
    if (!compraId) return { success: false, message: 'compra_id es requerido' };
    if (!productoId) return { success: false, message: 'producto_id es requerido' };
    if (cantidad == null) return { success: false, message: 'cantidad es requerida' };
    if (precioUnitario == null) return { success: false, message: 'precio_unitario es requerido' };

    // Normalizar opcionales
    const _codigoLote = (typeof codigoLote === 'string' && codigoLote.trim().length > 0) ? codigoLote.trim() : null;
    const _fechaVenc = (typeof fechaVencimiento === 'string' && fechaVencimiento.trim().length > 0) ? fechaVencimiento.trim() : null;
    const _serieId = (serieId != null && !Number.isNaN(parseInt(serieId))) ? parseInt(serieId) : null;
    const _numeroSerie = (typeof numeroSerie === 'string' && numeroSerie.trim().length > 0) ? numeroSerie.trim() : null;

    connection = await service_DBconn();

    const params = [
      parseInt(compraId),
      parseInt(productoId),
      Number(cantidad),
      Number(precioUnitario),
      _codigoLote,
      _fechaVenc,
      _serieId,
      _numeroSerie,
    ];

    await connection.execute(
      'CALL sp_agregar_item_compra(?, ?, ?, ?, ?, ?, ?, ?)',
      params
    );

    return { success: true, message: 'Ítem agregado a la compra' };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al agregar ítem a la compra', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Confirma una compra en estado BORRADOR llamando al SP sp_confirmar_compra
 * @param {number} compraId
 */
export async function service_ConfirmarCompra(compraId) {
  let connection;
  try {
    if (!compraId) return { success: false, message: 'compra_id es requerido' };
    connection = await service_DBconn();
    await connection.execute('CALL sp_confirmar_compra(?)', [parseInt(compraId)]);
    return { success: true, message: 'Compra confirmada' };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al confirmar compra', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Crea una compra en estado BORRADOR llamando al SP sp_crear_compra
 * @param {Object} params
 * @param {number} params.proveedorId
 * @param {number} params.almacenId
 * @param {string} params.tipoComprobante
 * @param {string} params.nroComprobante
 * @param {string} params.observaciones
 * @param {number} params.creadoPor
 */
export async function service_CrearCompra({
  proveedorId,
  almacenId,
  tipoComprobante,
  nroComprobante,
  observaciones,
  creadoPor,
}) {
  let connection;
  try {
    if (!proveedorId) return { success: false, message: 'proveedor_id es requerido' };
    if (!almacenId) return { success: false, message: 'almacen_id es requerido' };
    if (!creadoPor) return { success: false, message: 'creado_por es requerido' };

    const _tipo = typeof tipoComprobante === 'string' && tipoComprobante.trim() ? tipoComprobante.trim() : 'FACTURA';
    const _nro = typeof nroComprobante === 'string' ? nroComprobante : '';
    const _obs = typeof observaciones === 'string' ? observaciones : '';

    connection = await service_DBconn();

    const params = [
      parseInt(proveedorId),
      parseInt(almacenId),
      _tipo,
      _nro,
      _obs,
      parseInt(creadoPor),
    ];

    const [rows] = await connection.execute(
      'CALL sp_crear_compra(?, ?, ?, ?, ?, ?)',
      params
    );

    const result = rows?.[0]?.[0];
    const nuevaCompraId = result?.nueva_compra_id || null;
    if (!nuevaCompraId) {
      return { success: false, message: 'No se pudo crear la compra (SP sin retorno)' };
    }

    return { success: true, data: { compra_id: nuevaCompraId }, message: 'Compra creada en BORRADOR' };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al crear compra', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Lista los ítems de una compra llamando al SP sp_listar_items_compra
 * @param {number} compraId
 */
export async function service_ListarItemsCompra(compraId) {
  let connection;
  try {
    if (!compraId) return { success: false, message: 'compra_id es requerido' };

    connection = await service_DBconn();
    const [rows] = await connection.execute('CALL sp_listar_items_compra(?)', [parseInt(compraId)]);

    const items = rows?.[0] || [];
    return { success: true, data: items };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al listar ítems de la compra', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Obtiene una compra en estado BORRADOR para edición llamando al SP sp_get_compra_para_edicion
 * @param {number} compraId - ID de la compra
 * @returns {Object} { success: boolean, message?: string, data?: { cabecera: Object, items: Array } }
 */
export async function service_GetCompraParaEdicion(compraId) {
  let connection;
  try {
    if (!compraId) return { success: false, message: 'compra_id es requerido' };

    connection = await service_DBconn();
    const [rows] = await connection.execute('CALL sp_get_compra_para_edicion(?)', [parseInt(compraId)]);
    
    // El SP devuelve 2 resultsets: [0] = cabecera, [1] = items
    const cabecera = rows[0]?.[0] || null;
    const items = rows[1] || [];

    if (!cabecera) {
      return { success: false, message: 'Compra no encontrada o no está en estado BORRADOR' };
    }

    return { success: true, data: { cabecera, items } };
  } catch (error) {
    console.error('Error en service_GetCompraParaEdicion:', error);
    if (error.message.includes('Sólo se puede editar')) {
      return { success: false, message: 'Solo se puede editar una compra en estado BORRADOR' };
    }
    if (error.message.includes('La compra no existe')) {
      return { success: false, message: 'La compra no existe' };
    }
    return { success: false, message: 'Error interno al obtener compra para edición', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}
