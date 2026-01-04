import { service_GetDetalleCompra } from '@/services/compras.js';
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

    const { compra_id } = req.query;

    if (!compra_id) {
      return res.status(400).json({ success: false, message: 'compra_id es requerido' });
    }

    const result = await service_GetDetalleCompra(compra_id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.message === 'Compra no encontrada' ? 404 : 500).json(result);
    }
  } catch (error) {
    console.error('Error en API detalle compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR',
    });
  }
}