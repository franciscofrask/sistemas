import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const [rows] = await pool.query('CALL ListarClientes()');
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al listar clientes' });
  }
}
