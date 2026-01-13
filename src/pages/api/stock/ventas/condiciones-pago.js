import { service_ListarCondicionesPago } from '@/services/ventas.js';

/**
 * API para listar condiciones de pago activas
 * 
 * GET /api/stock/ventas/condiciones-pago
 * 
 * Respuesta:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "codigo": "CONTADO",
 *       "nombre": "Contado",
 *       "requiere_cobranza": 1,
 *       "es_cta_cte": 0,
 *       "dias_vencimiento": 0
 *     },
 *     {
 *       "id": 2,
 *       "codigo": "CUENTA_CORRIENTE", 
 *       "nombre": "Cuenta corriente",
 *       "requiere_cobranza": 1,
 *       "es_cta_cte": 1,
 *       "dias_vencimiento": 0
 *     }
 *   ]
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido. Use GET.'
    });
  }

  try {
    const result = await service_ListarCondicionesPago();

    if (!result.success) {
      const status = result.error === 'VALIDATION_ERROR' ? 400 : 500;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en API condiciones de pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}