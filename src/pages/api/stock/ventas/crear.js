import { service_CrearVenta } from '@/services/ventas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use POST.' });
  }

  try {
    const {
      cliente_id,
      almacen_id,
      tipo_comprobante,
      nro_comprobante,
      observaciones,
      creado_por,
      presupuesto_id,
    } = req.body || {};

    if (!cliente_id) return res.status(400).json({ success: false, message: 'cliente_id es requerido' });
    if (!almacen_id) return res.status(400).json({ success: false, message: 'almacen_id es requerido' });
    if (!creado_por) return res.status(400).json({ success: false, message: 'creado_por es requerido' });

    const result = await service_CrearVenta({
      clienteId: parseInt(cliente_id),
      almacenId: parseInt(almacen_id),
      tipoComprobante: tipo_comprobante || 'TICKET',
      nroComprobante: nro_comprobante || '',
      observaciones: observaciones || '',
      creadoPor: parseInt(creado_por),
      presupuestoId: presupuesto_id ? parseInt(presupuesto_id) : null,
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API crear venta:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
