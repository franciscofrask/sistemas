import { db } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { nombre, ubicacion } = req.body;
    await db.query('CALL EditarAlmacen(?, ?, ?)', [id, nombre, ubicacion]);
    return res.status(200).json({ message: 'Almacén actualizado' });
  }

  if (req.method === 'DELETE') {
    await db.query('CALL EliminarAlmacen(?)', [id]);
    return res.status(200).json({ message: 'Almacén eliminado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
