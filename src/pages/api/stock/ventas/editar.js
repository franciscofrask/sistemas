import { service_EditarVentaBorrador } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use PUT.' });
  }

  try {
    const {
      venta_id,
      cliente_id,
      almacen_id,
      tipo_comprobante,
      nro_comprobante,
      observaciones,
      condicion_pago_codigo,
    } = req.body || {};

    console.log('API /stock/ventas/editar - datos recibidos:', req.body);

    const result = await service_EditarVentaBorrador({
      ventaId: venta_id,
      clienteId: cliente_id,
      almacenId: almacen_id,
      tipoComprobante: tipo_comprobante,
      nroComprobante: nro_comprobante,
      observaciones: observaciones,
      condicionPagoCodigo: condicion_pago_codigo,
    });

    console.log('API /stock/ventas/editar - resultado del servicio:', {
      success: result.success,
      message: result.message
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API editar venta:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}