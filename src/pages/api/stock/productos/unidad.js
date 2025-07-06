import { db } from '@/lib/db';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const {
        id_producto,
        numero_serie,
        id_almacen,
        observaciones,
        cantidad
      } = req.body;

      if (!id_producto || !numero_serie || !id_almacen) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
      }

      const unidades = cantidad || 1;

      await db.query(
        'CALL IngresarProductoIndividual(?, ?, ?, ?, ?)',
        [id_producto, numero_serie, id_almacen, observaciones || '', unidades]
      );

      return res.status(201).json({ message: `Se ingresaron ${unidades} unidades` });
    }

    if (req.method === 'GET') {
      const [rows] = await db.query('SELECT * FROM vista_unidades_con_almacen WHERE estado = "Disponible"');
      return res.status(200).json(rows);
    }

    return res.status(405).json({ message: 'Método no permitido' });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
