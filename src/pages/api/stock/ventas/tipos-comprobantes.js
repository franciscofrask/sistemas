import { service_ListarTiposComprobantes } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use GET.' });
  }

  try {
    const { modulo = 'VENTAS' } = req.query || {};
    const result = await service_ListarTiposComprobantes(modulo || null);

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API tipos comprobantes ventas:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
