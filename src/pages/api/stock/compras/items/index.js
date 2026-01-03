import { service_ListarItemsCompra } from '@/services/compras.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use GET.' });
  }

  try {
    const { compra_id } = req.query || {};

    if (!compra_id) {
      return res.status(400).json({ success: false, message: 'compra_id es requerido' });
    }

    const result = await service_ListarItemsCompra(parseInt(compra_id));

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API listar items compra:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
