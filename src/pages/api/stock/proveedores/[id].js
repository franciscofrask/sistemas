import { db } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { razon_social, cuit, telefono, email, direccion } = req.body;
    await db.query('CALL EditarProveedor(?, ?, ?, ?, ?, ?)', [
      id,
      razon_social,
      cuit,
      telefono,
      email,
      direccion,
    ]);
    return res.status(200).json({ message: 'Proveedor actualizado' });
  }

  if (req.method === 'DELETE') {
    await db.query('CALL EliminarProveedor(?)', [id]);
    return res.status(200).json({ message: 'Proveedor eliminado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
