import { db } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { nombre, descripcion, marca, modelo, categoria, precio } = req.body;
    await db.query('CALL EditarProducto(?, ?, ?, ?, ?, ?, ?)', [
      id,
      nombre,
      descripcion,
      marca,
      modelo,
      categoria,
      precio,
    ]);
    return res.status(200).json({ message: 'Producto actualizado' });
  }

  if (req.method === 'DELETE') {
    await db.query('CALL EliminarProducto(?)', [id]);
    return res.status(200).json({ message: 'Producto eliminado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}