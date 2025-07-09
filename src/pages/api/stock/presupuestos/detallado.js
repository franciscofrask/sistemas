// File: /pages/api/stock/presupuestos/detallado.js
import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const [rows] = await db.query(`SELECT * FROM vista_presupuestos_detallado`);

    // Agrupar por id_presupuesto
    const agrupado = {};
    for (const row of rows) {
      const id = row.id_presupuesto;
      if (!agrupado[id]) {
        agrupado[id] = {
          id_presupuesto: id,
          numero_presupuesto: row.numero_presupuesto,
          fecha: row.fecha,
          fecha_vencimiento: row.fecha_vencimiento,
          estado: row.estado,
          total: row.total,
          descuento: row.descuento,
          impuestos: row.impuestos,
          moneda: row.moneda,
          forma_pago: row.forma_pago,
          observaciones: row.observaciones,
          cliente: row.cliente,
          telefono: row.telefono,
          productos: []
        };
      }

      agrupado[id].productos.push({
        id_producto: row.id_producto,
        nombre: row.producto,
        marca: row.marca,
        modelo: row.modelo,
        cantidad: row.cantidad,
        precio_unitario: row.precio_unitario
      });
    }

    return res.status(200).json(Object.values(agrupado));
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    return res.status(500).json({ error: error.message });
  }
}
