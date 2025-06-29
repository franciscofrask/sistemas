import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM proveedores');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { razon_social, cuit, telefono, email, direccion } = req.body;
    await db.query('CALL AgregarProveedor(?, ?, ?, ?, ?)', [
      razon_social,
      cuit,
      telefono,
      email,
      direccion,
    ]);
    return res.status(201).json({ message: 'Proveedor agregado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
