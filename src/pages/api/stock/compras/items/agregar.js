import { service_AgregarItemCompra } from '@/services/compras.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use POST.' });
  }

  try {
    const {
      compra_id,
      producto_id,
      cantidad,
      precio_unitario,
      codigo_lote = null,
      fecha_vencimiento = null,
      serie_id = null,
      numero_serie = null,
    } = req.body || {};

    if (!compra_id) return res.status(400).json({ success: false, message: 'compra_id es requerido' });
    if (!producto_id) return res.status(400).json({ success: false, message: 'producto_id es requerido' });
    if (cantidad == null) return res.status(400).json({ success: false, message: 'cantidad es requerida' });
    if (precio_unitario == null) return res.status(400).json({ success: false, message: 'precio_unitario es requerido' });

    const result = await service_AgregarItemCompra({
      compraId: parseInt(compra_id),
      productoId: parseInt(producto_id),
      cantidad: Number(cantidad),
      precioUnitario: Number(precio_unitario),
      codigoLote: typeof codigo_lote === 'string' ? codigo_lote : null,
      fechaVencimiento: typeof fecha_vencimiento === 'string' ? fecha_vencimiento : null,
      serieId: serie_id != null ? parseInt(serie_id) : null,
      numeroSerie: typeof numero_serie === 'string' ? numero_serie : null,
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API agregar item compra:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
