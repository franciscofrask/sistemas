import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { id, nombre, ubicacion } = req.body;

  try {
    await pool.query('CALL EditarAlmacen(?, ?, ?)', [id, nombre, ubicacion]);
    res.status(200).json({ mensaje: 'Almacén actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al editar almacén' });
  }
}
