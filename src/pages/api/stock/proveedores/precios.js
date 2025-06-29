import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query(`
      SELECT 
        pp.id,
        pr.razon_social AS proveedor,
        p.nombre AS producto,
        pp.precio
      FROM productos_proveedor pp
      JOIN proveedores pr ON pr.id_proveedor = pp.id_proveedor
      JOIN productos p ON p.id_producto = pp.id_producto
    `);
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { id_proveedor, id_producto, precio } = req.body;
    await db.query('CALL AsignarPrecioProductoProveedor(?, ?, ?)', [
      id_proveedor,
      id_producto,
      precio,
    ]);
    return res.status(201).json({ message: 'Precio asignado o actualizado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
