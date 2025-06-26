import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { id, nombre, email, telefono, direccion } = req.body;

  try {
    await pool.query('CALL EditarCliente(?, ?, ?, ?, ?)', [
      id, nombre, email, telefono, direccion
    ]);
    res.status(200).json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al editar cliente' });
  }
}
