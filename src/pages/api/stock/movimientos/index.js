import { getConnection } from '../../../../lib/db';
import { service_RegistrarMovimientoStock } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        const {
            producto_id,
            almacen_id,
            tipo_movimiento = 'INGRESO',
            origen = 'AJUSTE_MANUAL',
            documento_tipo = 'AJUSTE_STOCK',
            documento_id = null,
            cantidad,
            lote_id = null,
            serie_id = null,
            movimientos = [] // Para productos SERIE que envían múltiples movimientos
        } = req.body;

        // Validaciones básicas
        if (!producto_id || !almacen_id || !cantidad) {
            await connection.rollback();
            return res.status(400).json({
                error: 'Faltan campos requeridos: producto_id, almacen_id, cantidad'
            });
        }

        // Si es un array de movimientos (para series), procesarlos uno por uno
        if (movimientos && movimientos.length > 0) {
            for (const movimiento of movimientos) {
                await service_RegistrarMovimientoStock(connection, movimiento);
            }
        } else {
            // Movimiento único
            await service_RegistrarMovimientoStock(connection, {
                producto_id,
                almacen_id,
                tipo_movimiento,
                origen,
                documento_tipo,
                documento_id,
                cantidad,
                lote_id,
                serie_id
            });
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Movimiento(s) de stock registrado(s) exitosamente',
            movimientos_registrados: movimientos.length > 0 ? movimientos.length : 1
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error registrando movimiento de stock:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    } finally {
        await connection.end();
    }
}