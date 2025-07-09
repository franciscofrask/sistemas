// File: /pages/api/stock/presupuestos/index.js
import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const {
    id_cliente,
    id_vendedor,
    fecha_vencimiento,
    items,
    descuento,
    impuestos,
    forma_pago,
    moneda,
    observaciones,
  } = req.body;

  try {
    const [rows] = await db.query(`CALL CrearPresupuesto(?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      id_cliente,
      id_vendedor,
      fecha_vencimiento,
      JSON.stringify(items),
      descuento,
      impuestos,
      forma_pago,
      moneda,
      observaciones,
    ]);

    return res.status(200).json({ mensaje: 'Presupuesto creado exitosamente' });
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    return res.status(500).json({ error: error.message });
  }
}
