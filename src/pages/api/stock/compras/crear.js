import { service_CrearCompra } from '@/services/compras';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    const {
      proveedor_id,
      almacen_id,
      tipo_comprobante,
      nro_comprobante,
      observaciones,
      creado_por,
    } = req.body || {};

    if (!proveedor_id || !almacen_id || !creado_por) {
      return res.status(400).json({ success: false, message: 'proveedor_id, almacen_id y creado_por son requeridos' });
    }

    const result = await service_CrearCompra({
      proveedorId: parseInt(proveedor_id),
      almacenId: parseInt(almacen_id),
      tipoComprobante: tipo_comprobante,
      nroComprobante: nro_comprobante,
      observaciones,
      creadoPor: parseInt(creado_por),
    });

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error inesperado', error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR' });
  }
}
