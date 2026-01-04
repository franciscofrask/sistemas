import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { service_GetCompraParaEdicion } from '../../../../services/compras';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar sesión
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Obtener parámetro de la URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'ID de compra es requerido' });
    }

    // Llamar al service
    const result = await service_GetCompraParaEdicion(id);
    
    if (!result.success) {
      const statusCode = result.message === 'Compra no encontrada o no está en estado BORRADOR' ? 404 : 400;
      return res.status(statusCode).json({ message: result.message });
    }

    return res.status(200).json({ 
      message: 'Compra obtenida para edición',
      data: result.data 
    });

  } catch (error) {
    console.error('Error en API edicion compras:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
}