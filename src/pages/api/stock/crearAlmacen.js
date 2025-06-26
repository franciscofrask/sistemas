import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, ubicacion } = req.body;

  try {
    await pool.query('CALL CrearAlmacen(?, ?)', [nombre, ubicacion]);
    res.status(201).json({ mensaje: 'Almacén creado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear almacén' });
  }
}
