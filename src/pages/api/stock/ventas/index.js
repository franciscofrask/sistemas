import { service_ListarVentas } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use GET.' });
  }

  try {
    const {
      almacen_id,
      cliente_id,
      estado,
      fecha_desde,
      fecha_hasta,
      q,
      limit,
      offset,
    } = req.query || {};

    console.log('API /stock/ventas - parámetros recibidos:', req.query);

    const result = await service_ListarVentas({
      almacenId: almacen_id ? parseInt(almacen_id) : null,
      clienteId: cliente_id ? parseInt(cliente_id) : null,
      estado: estado || null,
      fechaDesde: fecha_desde || null,
      fechaHasta: fecha_hasta || null,
      busqueda: q || null,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    console.log('API /stock/ventas - resultado del servicio:', {
      success: result.success,
      dataExists: !!result.data,
      itemsLength: result.data?.items?.length,
      total: result.data?.total
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API listar ventas:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
