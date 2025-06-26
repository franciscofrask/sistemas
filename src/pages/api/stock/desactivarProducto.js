import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { id } = req.body;

  try {
    await pool.query('CALL DesactivarProducto(?)', [id]);
    res.status(200).json({ mensaje: 'Producto desactivado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al desactivar producto' });
  }
}
