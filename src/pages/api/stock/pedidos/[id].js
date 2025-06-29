import { db } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM vista_pedidos_detallado WHERE id_pedido = ?', [id]);
    return res.status(200).json(rows);
  }

  res.status(405).json({ message: 'Método no permitido' });
}
