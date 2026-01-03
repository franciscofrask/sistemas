import { service_AgregarItemVenta } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use POST.' });
  }

  try {
    const {
      venta_id,
      producto_id,
      cantidad,
      precio_unitario,
      lote_id = null,
      serie_id = null,
    } = req.body || {};

    if (!venta_id) return res.status(400).json({ success: false, message: 'venta_id es requerido' });
    if (!producto_id) return res.status(400).json({ success: false, message: 'producto_id es requerido' });
    if (cantidad == null) return res.status(400).json({ success: false, message: 'cantidad es requerida' });
    if (precio_unitario == null) return res.status(400).json({ success: false, message: 'precio_unitario es requerido' });

    const result = await service_AgregarItemVenta({
      ventaId: parseInt(venta_id),
      productoId: parseInt(producto_id),
      cantidad: Number(cantidad),
      precioUnitario: Number(precio_unitario),
      loteId: lote_id != null ? parseInt(lote_id) : null,
      serieId: serie_id != null ? parseInt(serie_id) : null,
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API agregar item venta:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
