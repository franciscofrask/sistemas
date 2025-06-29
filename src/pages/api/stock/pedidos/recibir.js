import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { id_pedido, id_almacen, generar_serie } = req.body;
  await db.query('CALL RecibirPedidoConGasto(?, ?, ?)', [id_pedido, id_almacen, generar_serie]);
  res.status(200).json({ message: 'Pedido recibido y stock actualizado' });
}