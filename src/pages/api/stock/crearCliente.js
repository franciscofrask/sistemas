import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, email, telefono, direccion } = req.body;

  try {
    await pool.query('CALL CrearCliente(?, ?, ?, ?)', [
      nombre, email, telefono, direccion
    ]);
    res.status(201).json({ mensaje: 'Cliente creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear cliente' });
  }
}
