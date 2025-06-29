import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' });

  const [rows] = await db.query('SELECT * FROM vista_resumen_financiero');
  res.status(200).json(rows);
}
