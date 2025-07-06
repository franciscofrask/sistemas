import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM clientes WHERE activo IS TRUE');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { nombre, apellido, dni, email, telefono, direccion } = req.body;
    await db.query('CALL AgregarCliente(?, ?, ?, ?, ?, ?)', [
      nombre,
      apellido,
      dni,
      email,
      telefono,
      direccion,
    ]);
    return res.status(201).json({ message: 'Cliente creado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
