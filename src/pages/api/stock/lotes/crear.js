import { getConnection } from '../../../../lib/db';
import { service_CrearLote } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const connection = await getConnection();

    try {
        const { producto_id, codigo_lote, fecha_vencimiento } = req.body;

        // Validaciones básicas
        if (!producto_id || !codigo_lote) {
            return res.status(400).json({
                error: 'Faltan campos requeridos: producto_id, codigo_lote'
            });
        }

        const loteId = await service_CrearLote(connection, {
            producto_id,
            codigo_lote,
            fecha_vencimiento
        });

        res.status(201).json({
            success: true,
            lote_id: loteId,
            message: 'Lote creado exitosamente'
        });

    } catch (error) {
        console.error('Error creando lote:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    } finally {
        await connection.end();
    }
}