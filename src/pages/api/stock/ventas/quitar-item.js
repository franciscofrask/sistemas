import { service_QuitarItemVenta } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use DELETE.' });
  }

  try {
    const { venta_detalle_id } = req.body || {};

    console.log('API /stock/ventas/quitar-item - datos recibidos:', req.body);

    const result = await service_QuitarItemVenta({
      ventaDetalleId: venta_detalle_id,
    });

    console.log('API /stock/ventas/quitar-item - resultado del servicio:', {
      success: result.success,
      message: result.message
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API quitar item venta:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}