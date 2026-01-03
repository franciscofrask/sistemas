import { service_DBconn } from './db.js';

/**
 * Servicio para manejar items vendibles (productos, lotes, series) usando sp_listar_items_vendibles_aplanados
 */

/**
 * Lista todos los items vendibles disponibles en un almacén
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.almacenId - ID del almacén (requerido)
 * @param {string} params.query - Texto de búsqueda (opcional)
 * @param {number} params.limite - Límite de resultados (opcional, default: 30)
 * @returns {Promise<Object>} - Resultado con success y datos
 */
export async function service_ListarItemsVendibles({ almacenId, query = null, limite = 30 }) {
    console.log('Listando items vendibles con parámetros:', { almacenId, query, limite });
  let connection;
  
  try {
    // Validaciones
    if (!almacenId) {
      return {
        success: false,
        message: 'almacen_id es requerido'
      };
    }

    connection = await service_DBconn();

    // Preparar parámetros para el SP
    const params = [
      parseInt(almacenId),
      query || null,
      limite ? parseInt(limite) : 30
    ];

    // Llamar al stored procedure
    const [rows] = await connection.execute(
      'CALL sp_listar_items_vendibles_aplanados(?, ?, ?)',
      params
    );

    // El SP devuelve los resultados en la primera posición del array
    const items = rows[0] || [];

    return {
      success: true,
      data: items,
      message: `${items.length} items vendibles encontrados`,
      params: { almacenId, query, limite }
    };

  } catch (error) {
    console.error('Error en service_ListarItemsVendibles:', error);
    
    // Manejo específico de errores del SP
    if (error.sqlState === '45000') {
      return {
        success: false,
        message: error.sqlMessage || 'Error de validación en el procedimiento almacenado',
        error: 'VALIDATION_ERROR'
      };
    }

    return {
      success: false,
      message: 'Error interno del servidor al listar items vendibles',
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Busca un item vendible específico por sus características
 * @param {Object} params - Parámetros de búsqueda específica
 * @param {number} params.almacenId - ID del almacén (requerido)
 * @param {string} params.codigoBarras - Código de barras a buscar
 * @param {string} params.sku - SKU del producto a buscar
 * @param {string} params.nombreProducto - Nombre del producto a buscar
 * @returns {Promise<Object>} - Resultado con success y datos
 */
export async function service_BuscarItemEspecifico({ almacenId, codigoBarras = null, sku = null, nombreProducto = null }) {
  // Construir query de búsqueda específica
  let query = null;
  
  if (codigoBarras) {
    query = codigoBarras;
  } else if (sku) {
    query = sku;
  } else if (nombreProducto) {
    query = nombreProducto;
  }

  return await service_ListarItemsVendibles({ 
    almacenId, 
    query, 
    limite: 10 // Límite menor para búsquedas específicas
  });
}

/**
 * Obtiene items vendibles con paginación
 * @param {Object} params - Parámetros de búsqueda con paginación
 * @param {number} params.almacenId - ID del almacén (requerido)
 * @param {string} params.query - Texto de búsqueda (opcional)
 * @param {number} params.page - Página actual (default: 1)
 * @param {number} params.pageSize - Tamaño de página (default: 30)
 * @returns {Promise<Object>} - Resultado con success, datos y información de paginación
 */
export async function service_ListarItemsVendiblesPaginado({ almacenId, query = null, page = 1, pageSize = 30 }) {
  try {
    // Calcular offset y límite
    const offset = (page - 1) * pageSize;
    const limite = pageSize;

    // Por ahora, el SP no maneja paginación interna, 
    // así que obtenemos más datos y paginamos en el service
    const result = await service_ListarItemsVendibles({ 
      almacenId, 
      query, 
      limite: limite * 3 // Obtener más datos para simular paginación
    });

    if (!result.success) {
      return result;
    }

    const totalItems = result.data.length;
    const paginatedData = result.data.slice(offset, offset + pageSize);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        hasNextPage: (page * pageSize) < totalItems,
        hasPrevPage: page > 1
      },
      message: `Página ${page} de items vendibles (${paginatedData.length} de ${totalItems})`,
      params: { almacenId, query, page, pageSize }
    };

  } catch (error) {
    console.error('Error en service_ListarItemsVendiblesPaginado:', error);
    return {
      success: false,
      message: 'Error interno del servidor en paginación de items vendibles',
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    };
  }
}