import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM proveedores WHERE activo IS TRUE');
    return res.status(200).json(rows);
    
  }


  if (req.method === 'POST') {
    console.log(req.body);
    const { razon_social, cuit_cuil,email, telefono, direccion, condiciones_pago } = req.body;
    await db.query('CALL AgregarProveedor(?, ?, ?, ?, ?, ?)', [
      razon_social,
      cuit_cuil,
      email,
      telefono,
      direccion,
      condiciones_pago
    ]);
    return res.status(201).json({ message: 'Proveedor agregado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
}
