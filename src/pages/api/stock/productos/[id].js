import { db } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

if (req.method === 'PUT') {
  try {
    const {
      nombre,
      descripcion,
      marca,
      modelo,
      categoria,
      precio_compra,
      precio_venta,
      codigo_producto,
      tipo_envio,
      plazo_entrega,
      garantia,
    } = req.body;

    await db.query('CALL EditarProducto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      nombre,
      descripcion,
      marca,
      modelo,
      categoria,
      precio_compra,
      precio_venta,
      codigo_producto,
      tipo_envio,
      plazo_entrega,
      garantia,
    ]);

    return res.status(200).json({ message: 'Producto actualizado' });
  } catch (error) {
    console.error('Error en PUT /productos/[id]:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
  if (req.method === 'DELETE') {
    await db.query('CALL EliminarProducto(?)', [id]);
    return res.status(200).json({ message: 'Producto eliminado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}