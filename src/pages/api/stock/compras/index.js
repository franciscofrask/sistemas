import { service_ListarCompras } from '@/services/compras.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth].js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.token) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const {
      almacen_id,
      proveedor_id,
      estado,
      fecha_desde,
      fecha_hasta,
      busqueda,
      limit = '50',
      offset = '0',
    } = req.query;

    const result = await service_ListarCompras({
      almacenId: almacen_id ? parseInt(almacen_id) : null,
      proveedorId: proveedor_id ? parseInt(proveedor_id) : null,
      estado: estado || null,
      fechaDesde: fecha_desde || null,
      fechaHasta: fecha_hasta || null,
      busqueda: busqueda || null,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error en API listar compras:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR',
    });
  }
}