import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { nombre } = req.query;

    try {
      let rows;
      if (nombre) {
        const [result] = await db.query(
          'SELECT * FROM clientes WHERE activo IS TRUE AND nombre LIKE ?',
          [`${nombre}%`]
        );
        rows = result;
      } else {
        const [result] = await db.query(
          'SELECT * FROM clientes WHERE activo IS TRUE'
        );
        rows = result;
      }

      return res.status(200).json(rows);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      return res.status(500).json({ message: 'Error del servidor' });
    }
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
