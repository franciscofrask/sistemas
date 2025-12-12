import { getConnection } from '../../../../lib/db';
import { service_CrearSerie } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const connection = await getConnection();

    try {
        const { producto_id, series } = req.body;

        // Validaciones básicas
        if (!producto_id || !series || !Array.isArray(series) || series.length === 0) {
            return res.status(400).json({
                error: 'Faltan campos requeridos: producto_id, series (array)'
            });
        }

        const seriesCreadas = [];

        for (const numeroSerie of series) {
            if (numeroSerie.trim()) {
                const serieId = await service_CrearSerie(connection, {
                    producto_id,
                    numero_serie: numeroSerie.trim()
                });
                seriesCreadas.push({ serie_id: serieId, numero_serie: numeroSerie.trim() });
            }
        }

        res.status(201).json({
            success: true,
            series_creadas: seriesCreadas,
            cantidad: seriesCreadas.length,
            message: 'Series creadas exitosamente'
        });

    } catch (error) {
        console.error('Error creando series:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    } finally {
        await connection.end();
    }
}