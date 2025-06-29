import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM vista_productos_con_stock');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { nombre, descripcion, marca, modelo, categoria, precio } = req.body;
    await db.query('CALL AgregarProducto(?, ?, ?, ?, ?, ?)', [
      nombre, descripcion, marca, modelo, categoria, precio
    ]);
    return res.status(201).json({ message: 'Producto creado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
