import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nombre, descripcion, precio, codigo_barra } = req.body;

  try {
    await pool.query('CALL CrearProducto(?, ?, ?, ?)', [
      nombre, descripcion, precio, codigo_barra,
    ]);
    res.status(201).json({ mensaje: 'Producto creado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
}
