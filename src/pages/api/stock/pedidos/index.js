import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM vista_pedidos_detallado');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { id_proveedor, items, observaciones } = req.body;
    await db.query('CALL CrearPedido(?, ?, ?)', [id_proveedor, JSON.stringify(items), observaciones]);
    return res.status(201).json({ message: 'Pedido creado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}