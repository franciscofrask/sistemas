import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id_cliente, productos, descuentos, impuestos, promociones } = req.body;
    await db.query('CALL RegistrarVentaCompleta(?, ?, ?, ?, ?)', [
      id_cliente,
      JSON.stringify(productos),
      descuentos,
      impuestos,
      promociones,
    ]);
    return res.status(201).json({ message: 'Venta registrada' });
  }

  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM ventas ORDER BY fecha DESC LIMIT 10');
    return res.status(200).json(rows);
  }

  res.status(405).json({ message: 'Método no permitido' });
}