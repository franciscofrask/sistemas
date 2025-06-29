import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const connection = await db.getConnection();
  const [resumen] = await connection.query('CALL GetPanelControlCompleto()');
  connection.release();
  res.status(200).json({ dashboard: resumen });
}