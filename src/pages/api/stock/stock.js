import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ mensaje: 'Método no permitido' });
  }

  try {
    const [rows] = await pool.query('CALL ProductosConStockTotal()');
    res.status(200).json(rows[0]); // Resultado está en la primera posición
  } catch (error) {
    console.error('Error al obtener stock:', error);
    res.status(500).json({ mensaje: 'Error al consultar stock' });
  }
}
