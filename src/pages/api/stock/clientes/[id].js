import { db } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { nombre, apellido, email, telefono, direccion } = req.body;
    await db.query('CALL EditarCliente(?, ?, ?, ?, ?, ?)', [
      id,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
    ]);
    return res.status(200).json({ message: 'Cliente actualizado' });
  }

  if (req.method === 'DELETE') {
    await db.query('CALL EliminarCliente(?)', [id]);
    return res.status(200).json({ message: 'Cliente eliminado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
