import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { id } = req.body;

  try {
    await pool.query('CALL DesactivarCliente(?)', [id]);
    res.status(200).json({ mensaje: 'Cliente desactivado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al desactivar cliente' });
  }
}
