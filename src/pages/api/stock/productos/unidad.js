import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      id_producto,
      numero_serie,
      id_almacen,
      observaciones,
      cantidad
    } = req.body;

    // Validación mínima
    if (!id_producto || !numero_serie || !id_almacen) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const unidades = cantidad || 1;

    try {
      await db.query(
        'CALL IngresarProductoIndividual(?, ?, ?, ?, ?)',
        [id_producto, numero_serie, id_almacen, observaciones || '', unidades]
      );
      return res.status(201).json({ message: `Se ingresaron ${unidades} unidades` });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  res.status(405).json({ message: 'Método no permitido' });
}
