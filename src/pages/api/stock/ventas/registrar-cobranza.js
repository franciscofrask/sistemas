import { service_RegistrarCobranzaAplicada } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use POST.' });
  }

  try {
    const {
      cliente_id,
      venta_id,
      importe,
      observaciones,
      creado_por,
    } = req.body || {};

    console.log('API /stock/ventas/registrar-cobranza - datos recibidos:', req.body);

    const result = await service_RegistrarCobranzaAplicada({
      clienteId: cliente_id,
      ventaId: venta_id,
      importe: importe,
      observaciones: observaciones,
      creadoPor: creado_por,
    });

    console.log('API /stock/ventas/registrar-cobranza - resultado del servicio:', {
      success: result.success,
      message: result.message
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API registrar cobranza:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}