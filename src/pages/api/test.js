import { pool } from '@/lib/db';

export default async function handler(req, res) {
  try {
    const [result] = await pool.query('SELECT NOW() AS ahora');
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
