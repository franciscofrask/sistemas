import { service_ActualizarCantidadItemVenta } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use PUT.' });
  }

  try {
    const { venta_detalle_id, nueva_cantidad } = req.body || {};

    console.log('API /stock/ventas/actualizar-cantidad - datos recibidos:', req.body);

    const result = await service_ActualizarCantidadItemVenta({
      ventaDetalleId: venta_detalle_id,
      nuevaCantidad: nueva_cantidad,
    });

    console.log('API /stock/ventas/actualizar-cantidad - resultado del servicio:', {
      success: result.success,
      message: result.message
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API actualizar cantidad:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}