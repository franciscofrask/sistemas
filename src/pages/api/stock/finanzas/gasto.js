import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { descripcion, monto, categoria } = req.body;
  await db.query('CALL RegistrarGastoManual(?, ?, ?)', [descripcion, monto, categoria]);
  res.status(201).json({ message: 'Gasto registrado' });
}
