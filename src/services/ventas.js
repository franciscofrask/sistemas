import { service_DBconn } from './db.js';

/**
 * Crea una venta en estado BORRADOR llamando al SP sp_crear_venta
 * @param {Object} params
 * @param {number} params.clienteId
 * @param {number} params.almacenId
 * @param {string} params.tipoComprobante
 * @param {string} params.nroComprobante
 * @param {string} params.observaciones
 * @param {number} params.creadoPor
 * @param {number|null} params.presupuestoId
 */
export async function service_CrearVenta({
  clienteId,
  almacenId,
  tipoComprobante,
  nroComprobante,
  observaciones,
  creadoPor,
  presupuestoId = null,
}) {
  let connection;
  try {
    if (!clienteId) return { success: false, message: 'cliente_id es requerido' };
    if (!almacenId) return { success: false, message: 'almacen_id es requerido' };
    if (!tipoComprobante) tipoComprobante = 'TICKET';
    if (typeof nroComprobante !== 'string') nroComprobante = '';
    if (typeof observaciones !== 'string') observaciones = '';
    if (!creadoPor) return { success: false, message: 'creado_por es requerido' };

    connection = await service_DBconn();

    const params = [
      parseInt(clienteId),
      parseInt(almacenId),
      tipoComprobante,
      nroComprobante,
      observaciones,
      parseInt(creadoPor),
      presupuestoId ? parseInt(presupuestoId) : null,
    ];

    const [rows] = await connection.execute(
      'CALL sp_crear_venta(?, ?, ?, ?, ?, ?, ?)',
      params
    );

    const result = rows?.[0]?.[0];
    const nuevaVentaId = result?.nueva_venta_id || null;

    if (!nuevaVentaId) {
      return { success: false, message: 'No se pudo crear la venta (SP sin retorno)' };
    }

    return {
      success: true,
      data: { venta_id: nuevaVentaId },
      message: 'Venta creada en BORRADOR',
    };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al crear venta', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Agrega un ítem a una venta en BORRADOR llamando al SP sp_agregar_item_venta
 * @param {Object} params
 * @param {number} params.ventaId
 * @param {number} params.productoId
 * @param {number} params.cantidad
 * @param {number} params.precioUnitario
 * @param {number|null} params.loteId
 * @param {number|null} params.serieId
 */
export async function service_AgregarItemVenta({
  ventaId,
  productoId,
  cantidad,
  precioUnitario,
  loteId = null,
  serieId = null,
}) {
  let connection;
  try {
    if (!ventaId) return { success: false, message: 'venta_id es requerido' };
    if (!productoId) return { success: false, message: 'producto_id es requerido' };
    if (cantidad == null) return { success: false, message: 'cantidad es requerida' };
    if (precioUnitario == null) return { success: false, message: 'precio_unitario es requerido' };

    connection = await service_DBconn();

    const params = [
      parseInt(ventaId),
      parseInt(productoId),
      Number(cantidad),
      Number(precioUnitario),
      loteId != null ? parseInt(loteId) : null,
      serieId != null ? parseInt(serieId) : null,
    ];

    await connection.execute(
      'CALL sp_agregar_item_venta(?, ?, ?, ?, ?, ?)',
      params
    );

    return { success: true, message: 'Ítem agregado a la venta' };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al agregar ítem a la venta', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Lista los ítems de una venta llamando al SP sp_listar_items_venta
 * @param {number} ventaId
 */
export async function service_ListarItemsVenta(ventaId) {
  let connection;
  try {
    if (!ventaId) return { success: false, message: 'venta_id es requerido' };

    connection = await service_DBconn();
    const [rows] = await connection.execute('CALL sp_listar_items_venta(?)', [parseInt(ventaId)]);

    const items = rows?.[0] || [];
    return { success: true, data: items };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al listar ítems de la venta', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Confirma una venta (BORRADOR → CONFIRMADA) llamando al SP sp_confirmar_venta
 * @param {number} ventaId
 */
export async function service_ConfirmarVenta(ventaId) {
  let connection;
  try {
    if (!ventaId) return { success: false, message: 'venta_id es requerido' };

    connection = await service_DBconn();
    await connection.execute('CALL sp_confirmar_venta(?)', [parseInt(ventaId)]);

    return { success: true, message: 'Venta confirmada' };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al confirmar venta', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Lista ventas paginadas con filtros llamando al SP sp_listar_ventas
 * @param {Object} params
 * @param {number|null} params.almacenId
 * @param {number|null} params.clienteId
 * @param {string|null} params.estado
 * @param {string|null} params.fechaDesde
 * @param {string|null} params.fechaHasta
 * @param {string|null} params.busqueda
 * @param {number} params.limit
 * @param {number} params.offset
 */
export async function service_ListarVentas({
  almacenId = null,
  clienteId = null,
  estado = null,
  fechaDesde = null,
  fechaHasta = null,
  busqueda = null,
  limit = 50,
  offset = 0,
} = {}) {
  let connection;
  try {
    connection = await service_DBconn();

    const params = [
      almacenId != null ? parseInt(almacenId) : null,
      clienteId != null ? parseInt(clienteId) : null,
      estado || null,
      fechaDesde || null,
      fechaHasta || null,
      busqueda || null,
      parseInt(limit) || 50,
      parseInt(offset) || 0,
    ];

    const [rows] = await connection.execute('CALL sp_listar_ventas(?, ?, ?, ?, ?, ?, ?, ?)', params);

    const totalRow = rows?.[0]?.[0] || { total_count: 0 };
    const items = rows?.[1] || [];
    return { success: true, data: { total: Number(totalRow.total_count || 0), items } };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al listar ventas', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Obtiene cabecera e ítems de una venta en BORRADOR para edición
 * @param {number} ventaId
 */
export async function service_GetVentaParaEdicion(ventaId) {
  let connection;
  try {
    if (!ventaId) return { success: false, message: 'venta_id es requerido' };
    connection = await service_DBconn();
    const [rows] = await connection.execute('CALL sp_get_venta_para_edicion(?)', [parseInt(ventaId)]);

    const cabecera = rows?.[0]?.[0] || null;
    const items = rows?.[1] || [];
    if (!cabecera) {
      return { success: false, message: 'Venta no encontrada o no editable' };
    }
    return { success: true, data: { venta: cabecera, items } };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al obtener venta para edición', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Anula una venta CONFIRMADA llamando al SP sp_anular_venta
 * @param {number} ventaId
 */
export async function service_AnularVenta(ventaId) {
  let connection;
  try {
    if (!ventaId) return { success: false, message: 'venta_id es requerido' };

    connection = await service_DBconn();
    await connection.execute('CALL sp_anular_venta(?)', [parseInt(ventaId)]);

    return { success: true, message: 'Venta anulada' };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al anular venta', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Cancela una venta en BORRADOR llamando al SP sp_cancelar_venta_borrador
 * @param {number} ventaId
 */
export async function service_CancelarVentaBorrador(ventaId) {
  let connection;
  try {
    if (!ventaId) return { success: false, message: 'venta_id es requerido' };

    connection = await service_DBconn();
    await connection.execute('CALL sp_cancelar_venta_borrador(?)', [parseInt(ventaId)]);

    return { success: true, message: 'Venta en borrador cancelada' };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al cancelar venta en borrador', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Obtiene detalle completo de una venta (cabecera, ítems, movimientos)
 * @param {number} ventaId
 */
export async function service_GetDetalleVenta(ventaId) {
  let connection;
  try {
    if (!ventaId) return { success: false, message: 'venta_id es requerido' };
    connection = await service_DBconn();
    const [rows] = await connection.execute('CALL sp_get_detalle_venta(?)', [parseInt(ventaId)]);

    const cabecera = rows?.[0]?.[0] || null;
    const items = rows?.[1] || [];
    const movimientos = rows?.[2] || [];
    if (!cabecera) {
      return { success: false, message: 'Venta no encontrada' };
    }
    return { success: true, data: { venta: cabecera, items, movimientos } };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al obtener detalle de la venta', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}
