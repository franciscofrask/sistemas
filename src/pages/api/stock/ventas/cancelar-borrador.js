import { service_CancelarVentaBorrador } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use POST.' });
  }

  try {
    const { venta_id } = req.body || {};
    if (!venta_id) return res.status(400).json({ success: false, message: 'venta_id es requerido' });

    const result = await service_CancelarVentaBorrador(parseInt(venta_id));

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API cancelar venta borrador:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
