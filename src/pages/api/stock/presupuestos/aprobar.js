import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const { id_presupuesto } = req.body;
  await db.query('CALL AprobarPresupuesto(?)', [id_presupuesto]);
  res.status(200).json({ message: 'Presupuesto aprobado' });
}
