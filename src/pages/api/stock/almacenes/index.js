import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await db.query(
        'SELECT id_almacen, nombre, ubicacion FROM almacenes WHERE activo = TRUE'
      );
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { nombre, ubicacion } = req.body;
      if (!nombre || !ubicacion) {
        return res.status(400).json({ message: 'Faltan datos' });
      }

      await db.query('CALL CrearAlmacen(?, ?)', [nombre, ubicacion]);
      return res.status(201).json({ message: 'Almacén creado' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}
