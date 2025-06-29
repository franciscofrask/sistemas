import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM almacenes');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { nombre, ubicacion } = req.body;
    await db.query('CALL CrearAlmacen(?, ?)', [nombre, ubicacion]);
    return res.status(201).json({ message: 'Almacén creado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
