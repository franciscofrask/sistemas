import { pool } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { id, nombre, descripcion, precio, codigo_barra } = req.body;

  try {
    await pool.query('CALL EditarProducto(?, ?, ?, ?, ?)', [
      id, nombre, descripcion, precio, codigo_barra
    ]);
    res.status(200).json({ mensaje: 'Producto actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
}
