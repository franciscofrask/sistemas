import { service_DBconn } from './db.js';

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
