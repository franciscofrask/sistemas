import { service_ListarItemsVendibles, service_BuscarItemEspecifico, service_ListarItemsVendiblesPaginado } from '@/services/itemsVendibles.js';

/**
 * API para listar items vendibles (productos, lotes, series) disponibles en un almacén
 * 
 * GET /api/stock/productos/vendibles?almacen_id=2&q=busqueda&limite=30&page=1&page_size=20
 * 
 * Parámetros de query:
 * - almacen_id: ID del almacén (requerido)
 * - q: Texto de búsqueda (opcional) - busca en nombre, SKU, código barras, código lote, número serie
 * - limite: Límite de resultados (opcional, default: 30)
 * - page: Página para paginación (opcional, default: 1)
 * - page_size: Tamaño de página (opcional, default: 30)
 * - codigo_barras: Búsqueda específica por código de barras
 * - sku: Búsqueda específica por SKU
 * - nombre_producto: Búsqueda específica por nombre de producto
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido. Use GET.'
    });
  }

  try {
    const { 
      almacen_id, 
      q, 
      limite, 
      page, 
      page_size,
      codigo_barras,
      sku,
      nombre_producto
    } = req.query;

    // Validación del parámetro requerido
    if (!almacen_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro almacen_id es requerido',
        example: '/api/stock/productos/vendibles?almacen_id=2&q=yerba'
      });
    }

    // Validar que almacen_id sea un número
    const almacenId = parseInt(almacen_id);
    if (isNaN(almacenId) || almacenId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'almacen_id debe ser un número entero positivo'
      });
    }

    let result;

    // Determinar tipo de búsqueda
    if (codigo_barras || sku || nombre_producto) {
      // Búsqueda específica
      result = await service_BuscarItemEspecifico({
        almacenId,
        codigoBarras: codigo_barras,
        sku: sku,
        nombreProducto: nombre_producto
      });
    } else if (page && page_size) {
      // Búsqueda paginada
      result = await service_ListarItemsVendiblesPaginado({
        almacenId,
        query: q,
        page: parseInt(page) || 1,
        pageSize: parseInt(page_size) || 30
      });
    } else {
      // Búsqueda simple
      result = await service_ListarItemsVendibles({
        almacenId,
        query: q,
        limite: limite ? parseInt(limite) : 30
      });
    }

    if (!result.success) {
      const statusCode = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(statusCode).json(result);
    }

    // Agregar información adicional para el frontend
    const response = {
      ...result,
      metadata: {
        timestamp: new Date().toISOString(),
        almacen_id: almacenId,
        query_params: {
          q: q || null,
          limite: limite ? parseInt(limite) : 30,
          page: page ? parseInt(page) : null,
          page_size: page_size ? parseInt(page_size) : null
        },
        total_items: result.data ? result.data.length : 0
      }
    };

    // Si hay paginación, incluirla en metadata
    if (result.pagination) {
      response.metadata.pagination = result.pagination;
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error en API /api/stock/productos/vendibles:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}