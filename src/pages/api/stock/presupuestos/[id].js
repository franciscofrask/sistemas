import { db } from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  console.log('ID recibido:', req.body);

  if (req.method === 'PUT') {
    const {
      id_cliente,
      id_vendedor,
      fecha_vencimiento,
      items,
      descuento,
      impuestos,
      forma_pago,
      moneda,
      observaciones
    } = req.body;

if (typeof id_cliente !== 'number' || isNaN(id_cliente) || id_cliente < 1) {
  return res.status(400).json({ error: 'Falta o es inválido: id_cliente' });
}

if (!id_vendedor) {
  return res.status(400).json({ error: 'Falta el campo: id_vendedor' });
}
if (!fecha_vencimiento) {
  return res.status(400).json({ error: 'Falta el campo: fecha_vencimiento' });
}
if (!Array.isArray(items) || items.length === 0) {
  return res.status(400).json({ error: 'El array de items está vacío o es inválido' });
}
if (descuento === undefined) {
  return res.status(400).json({ error: 'Falta el campo: descuento' });
}
if (impuestos === undefined) {
  return res.status(400).json({ error: 'Falta el campo: impuestos' });
}
if (!forma_pago) {
  return res.status(400).json({ error: 'Falta el campo: forma_pago' });
}
if (!moneda) {
  return res.status(400).json({ error: 'Falta el campo: moneda' });
}


    try {
      const [result] = await db.query(
        `CALL EditarPresupuesto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parseInt(id),
          id_cliente,
          id_vendedor,
          fecha_vencimiento,
          JSON.stringify(items),
          descuento,
          impuestos,
          forma_pago,
          moneda,
          observaciones ?? ''
        ]
      );

      return res.status(200).json({ mensaje: 'Presupuesto editado correctamente' });
    } catch (error) {
      console.error('Error al editar presupuesto:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
