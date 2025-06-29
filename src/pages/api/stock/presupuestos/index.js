import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM vista_presupuestos');
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { id_cliente, productos, observaciones } = req.body;
    await db.query('CALL CrearPresupuesto(?, ?, ?)', [
      id_cliente,
      JSON.stringify(productos),
      observaciones,
    ]);
    return res.status(201).json({ message: 'Presupuesto creado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
