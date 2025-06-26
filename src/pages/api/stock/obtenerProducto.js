import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;

  try {
    const [rows] = await pool.query('CALL ObtenerProductoPorId(?)', [id]);
    res.status(200).json(rows[0][0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener producto' });
  }
}
