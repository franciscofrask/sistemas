import { service_DBconn } from '@/services/db.js';
import { service_ListarCtaCteClientes } from '@/services/clientes.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido. Use GET.' 
    });
  }

  let connection;
  
  try {
    const {
      cliente_id,
      fecha_desde,
      fecha_hasta
    } = req.query || {};

    console.log('API cuenta corriente clientes - parámetros recibidos:', {
      cliente_id,
      fecha_desde,
      fecha_hasta
    });

    // Establecer conexión a la base de datos
    connection = await service_DBconn();

    // Llamar al service
    const result = await service_ListarCtaCteClientes(connection, {
      clienteId: cliente_id,
      fechaDesde: fecha_desde,
      fechaHasta: fecha_hasta
    });

    console.log('API cuenta corriente clientes - resultado:', {
      success: result.success,
      movimientosCount: result.data?.movimientos?.length,
      totalesCount: result.data?.totales?.length
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error en API cuenta corriente clientes:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error interno del servidor'
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error cerrando conexión:', closeError);
      }
    }
  }
}