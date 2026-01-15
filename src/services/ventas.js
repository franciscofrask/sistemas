import { service_DBconn } from './db.js';

/**
 * Crea una venta en estado BORRADOR llamando al SP sp_crear_venta
 * @param {Object} params
 * @param {number} params.clienteId
 * @param {number} params.almacenId
 * @param {string} params.tipoComprobante - Código del tipo de comprobante (ej: 'FA', 'NC', 'TICKET')
 * @param {string} params.nroComprobante
 * @param {string} params.observaciones
 * @param {number} params.creadoPor
 * @param {number|null} params.presupuestoId
 * @param {string} params.condicionPagoCodigo - Código de condición de pago (ej: 'CONTADO', 'CUENTA_CORRIENTE')
 */
export async function service_CrearVenta({
  clienteId,
  almacenId,
  tipoComprobante,
  nroComprobante,
  observaciones,
  creadoPor,
  presupuestoId = null,
  condicionPagoCodigo = 'CONTADO',
}) {
  let connection;
  try {
    if (!clienteId) return { success: false, message: 'cliente_id es requerido' };
    if (!almacenId) return { success: false, message: 'almacen_id es requerido' };
    if (!tipoComprobante) return { success: false, message: 'tipo_comprobante (código) es requerido' };
    if (typeof nroComprobante !== 'string') nroComprobante = '';
    if (typeof observaciones !== 'string') observaciones = '';
    if (!creadoPor) return { success: false, message: 'creado_por es requerido' };
    if (typeof condicionPagoCodigo !== 'string') condicionPagoCodigo = 'CONTADO';

    connection = await service_DBconn();

    const params = [
      parseInt(clienteId),
      parseInt(almacenId),
      tipoComprobante,
      nroComprobante,
      observaciones,
      parseInt(creadoPor),
      presupuestoId ? parseInt(presupuestoId) : null,
      condicionPagoCodigo,
    ];

    const [rows] = await connection.execute(
      'CALL sp_crear_venta(?, ?, ?, ?, ?, ?, ?, ?)',
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

    return { success: true, message: 'Venta confirmada exitosamente' };
  } catch (error) {
    console.error('Error en service_ConfirmarVenta:', error);
    
    if (error?.sqlState === '45000') {
      // Manejar errores específicos de validación del SP
      const errorMessage = error.sqlMessage || 'Error de validación';
      
      // Mapear errores comunes para mejor UX
      let friendlyMessage = errorMessage;
      
      if (errorMessage.includes('condición de pago inválida')) {
        friendlyMessage = 'La venta tiene una condición de pago que no existe o es inválida';
      } else if (errorMessage.includes('condición de pago está inactiva')) {
        friendlyMessage = 'No se puede confirmar: la condición de pago seleccionada está inactiva';
      } else if (errorMessage.includes('Cuenta corriente requiere un cliente')) {
        friendlyMessage = 'Para ventas en cuenta corriente debe seleccionar un cliente específico';
      } else if (errorMessage.includes('Consumidor final')) {
        friendlyMessage = 'No se puede confirmar en cuenta corriente con "Consumidor final". Seleccione un cliente específico o cambie la condición de pago';
      } else if (errorMessage.includes('no tiene ítems cargados')) {
        friendlyMessage = 'La venta debe tener al menos un producto agregado antes de confirmar';
      } else if (errorMessage.includes('Falta lote')) {
        friendlyMessage = 'Error: hay productos que requieren lote pero no lo tienen asignado';
      } else if (errorMessage.includes('Falta serie')) {
        friendlyMessage = 'Error: hay productos que requieren número de serie pero no lo tienen asignado';
      }
      
      return { 
        success: false, 
        message: friendlyMessage,
        originalError: errorMessage,
        error: 'VALIDATION_ERROR' 
      };
    }
    
    return { 
      success: false, 
      message: 'Error interno del servidor al confirmar venta', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' 
    };
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

    console.log('Ejecutando sp_listar_ventas con parámetros:', params);
    const [rows] = await connection.execute('CALL sp_listar_ventas(?, ?, ?, ?, ?, ?, ?, ?)', params);
    console.log('Resultados del SP sp_listar_ventas:', rows);
    console.log('Estructura rows:', {
      length: rows.length,
      firstResult: rows[0]?.length,
      secondResult: rows[1]?.length,
      sample: rows[0]?.slice(0, 2)
    });

    // Verificar si el SP retorna directamente los items o si tiene estructura de total + items
    let total = 0;
    let items = [];

    if (Array.isArray(rows[0]) && rows[0].length > 0) {
      // Si el primer resultado parece ser items (tiene propiedades de venta)
      const firstRow = rows[0][0];
      if (firstRow && (firstRow.id || firstRow.fecha || firstRow.cliente_nombre)) {
        // Es directamente la lista de ventas
        items = rows[0];
        total = items.length;
      } else if (firstRow && firstRow.total_count !== undefined) {
        // Es el formato esperado: primer resultado = total, segundo = items
        total = Number(firstRow.total_count || 0);
        items = Array.isArray(rows[1]) ? rows[1] : [];
      }
    }

    console.log(`Procesado: ${items.length} items, total: ${total}`);
    return { success: true, data: { total, items } };
  } catch (error) {
    console.error('Error en service_ListarVentas:', error);
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

    console.log('Resultados del SP sp_get_detalle_venta:', rows);

    const cabecera = rows?.[0]?.[0] || null;
    const items = Array.isArray(rows?.[1]) ? rows[1] : [];
    const movimientos = Array.isArray(rows?.[2]) ? rows[2] : [];
    
    if (!cabecera) {
      return { success: false, message: 'Venta no encontrada' };
    }
    
    console.log('Datos procesados:', { cabecera, items: items.length, movimientos: movimientos.length });
    
    return { success: true, data: { venta: cabecera, items, movimientos } };
  } catch (error) {
    console.error('Error en service_GetDetalleVenta:', error);
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al obtener detalle de la venta', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Lista tipos de comprobantes disponibles (SP: sp_listar_tipos_comprobantes)
 * @param {string|null} modulo - Ej: 'VENTA', 'COMPRA' o null para todos
 */
export async function service_ListarTiposComprobantes(modulo = null) {
  let connection;
  try {
    connection = await service_DBconn();
    const [rows] = await connection.execute('CALL sp_listar_tipos_comprobantes(?)', [modulo || null]);

    const items = rows?.[0] || [];
    return { success: true, data: items };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al listar tipos de comprobante', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Lista condiciones de pago activas
 * @returns {Promise<Object>} - Resultado con success y datos
 */
export async function service_ListarCondicionesPago() {
  let connection;
  try {
    connection = await service_DBconn();
    
    const [rows] = await connection.execute(
      'SELECT id, codigo, nombre, requiere_cobranza, es_cta_cte, dias_vencimiento FROM condiciones_pago WHERE activo = 1 ORDER BY id ASC'
    );

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error en service_ListarCondicionesPago:', error);
    return { 
      success: false, 
      message: 'Error interno al listar condiciones de pago', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' 
    };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Edita una venta en estado BORRADOR llamando al SP sp_editar_venta_borrador
 * @param {Object} params
 * @param {number} params.ventaId
 * @param {number} params.clienteId
 * @param {number} params.almacenId
 * @param {string} params.tipoComprobante
 * @param {string} params.nroComprobante
 * @param {string} params.observaciones
 * @param {string} params.condicionPagoCodigo
 */
export async function service_EditarVentaBorrador({
  ventaId,
  clienteId,
  almacenId,
  tipoComprobante,
  nroComprobante,
  observaciones,
  condicionPagoCodigo = 'CONTADO',
}) {
  let connection;
  try {
    if (!ventaId) return { success: false, message: 'venta_id es requerido' };
    if (!clienteId) return { success: false, message: 'cliente_id es requerido' };
    if (!almacenId) return { success: false, message: 'almacen_id es requerido' };
    if (!tipoComprobante) return { success: false, message: 'tipo_comprobante es requerido' };
    if (typeof nroComprobante !== 'string') nroComprobante = '';
    if (typeof observaciones !== 'string') observaciones = '';
    if (typeof condicionPagoCodigo !== 'string') condicionPagoCodigo = 'CONTADO';

    connection = await service_DBconn();

    const params = [
      parseInt(ventaId),
      parseInt(clienteId),
      parseInt(almacenId),
      tipoComprobante,
      nroComprobante,
      observaciones,
      condicionPagoCodigo,
    ];

    const [rows] = await connection.execute(
      'CALL sp_editar_venta_borrador(?, ?, ?, ?, ?, ?, ?)',
      params
    );

    const ventaActualizada = rows?.[0]?.[0];

    if (!ventaActualizada) {
      return { success: false, message: 'No se pudo editar la venta' };
    }

    return {
      success: true,
      data: { venta: ventaActualizada },
      message: 'Venta actualizada correctamente',
    };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al editar venta', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Quita un ítem de una venta en estado BORRADOR llamando al SP sp_quitar_item_venta
 * @param {Object} params
 * @param {number} params.ventaDetalleId
 */
export async function service_QuitarItemVenta({
  ventaDetalleId,
}) {
  let connection;
  try {
    if (!ventaDetalleId) return { success: false, message: 'venta_detalle_id es requerido' };

    connection = await service_DBconn();

    const [rows] = await connection.execute(
      'CALL sp_quitar_item_venta(?)',
      [parseInt(ventaDetalleId)]
    );

    const result = rows?.[0]?.[0];

    if (!result) {
      return { success: false, message: 'No se pudo quitar el ítem' };
    }

    return {
      success: true,
      data: { 
        venta_id: result.venta_id,
        nuevo_total: result.nuevo_total 
      },
      message: 'Ítem eliminado correctamente',
    };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al quitar ítem', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Actualiza la cantidad de un ítem en una venta en estado BORRADOR llamando al SP sp_actualizar_cantidad_item_venta
 * @param {Object} params
 * @param {number} params.ventaDetalleId
 * @param {number} params.nuevaCantidad
 */
export async function service_ActualizarCantidadItemVenta({
  ventaDetalleId,
  nuevaCantidad,
}) {
  let connection;
  try {
    if (!ventaDetalleId) return { success: false, message: 'venta_detalle_id es requerido' };
    if (nuevaCantidad == null || nuevaCantidad <= 0) return { success: false, message: 'La cantidad debe ser mayor a 0' };

    connection = await service_DBconn();

    const [rows] = await connection.execute(
      'CALL sp_actualizar_cantidad_item_venta(?, ?)',
      [parseInt(ventaDetalleId), parseFloat(nuevaCantidad)]
    );

    const result = rows?.[0]?.[0];

    if (!result) {
      return { success: false, message: 'No se pudo actualizar la cantidad' };
    }

    return {
      success: true,
      data: { 
        venta_id: result.venta_id,
        nuevo_total: result.nuevo_total 
      },
      message: 'Cantidad actualizada correctamente',
    };
  } catch (error) {
    if (error?.sqlState === '45000') {
      return { success: false, message: error.sqlMessage || 'Error de validación', error: 'VALIDATION_ERROR' };
    }
    return { success: false, message: 'Error interno al actualizar cantidad', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' };
  } finally {
    if (connection) await connection.end();
  }
}
