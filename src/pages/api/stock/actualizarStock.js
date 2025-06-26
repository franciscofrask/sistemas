import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { producto_id, almacen_id, cantidad } = req.body;

  try {
    await pool.query('CALL ActualizarStock(?, ?, ?)', [
      producto_id, almacen_id, cantidad
    ]);

    res.status(200).json({ mensaje: 'Stock actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar stock' });
  }
}
