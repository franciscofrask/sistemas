import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { id_producto, numero_serie, id_almacen, observaciones } = req.body;

  await db.query('CALL IngresarProductoIndividual(?, ?, ?, ?)', [
    id_producto,
    numero_serie,
    id_almacen,
    observaciones,
  ]);

  res.status(201).json({ message: 'Unidad ingresada' });
}
