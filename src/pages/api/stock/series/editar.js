import { service_EditarSerie } from '../../../../services/productos';
import { getConnection } from '../../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
        return res.status(405).json({ 
            error: 'Método no permitido',
            message: 'Solo se permiten métodos PUT y PATCH'
        });
    }

    const connection = await getConnection();

    try {
        const { serieId, numeroSerie } = req.body;

        console.log('Datos recibidos para editar serie:', { serieId, numeroSerie });

        // Validaciones
        if (!serieId) {
            return res.status(400).json({ 
                error: 'ID de la serie requerido',
                message: 'El ID de la serie es obligatorio'
            });
        }

        if (!numeroSerie) {
            return res.status(400).json({ 
                error: 'Número de serie requerido',
                message: 'El número de serie es obligatorio'
            });
        }

        if (typeof numeroSerie !== 'string' || numeroSerie.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Número de serie inválido',
                message: 'El número de serie debe ser un texto válido'
            });
        }

        // Llamar al servicio
        const result = await service_EditarSerie(connection, serieId, numeroSerie);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });

    } catch (error) {
        console.error('Error en API editar serie:', error);
        
        // Manejar errores de negocio
        if (error.message.includes('no existe') || 
            error.message.includes('eliminada')) {
            return res.status(404).json({
                error: 'Serie no encontrada',
                message: error.message
            });
        }

        if (error.message.includes('Ya existe una serie') ||
            error.message.includes('duplicado')) {
            return res.status(409).json({
                error: 'Número de serie duplicado',
                message: error.message
            });
        }

        if (error.message.includes('requerido') ||
            error.message.includes('vacío')) {
            return res.status(400).json({
                error: 'Datos requeridos',
                message: error.message
            });
        }

        // Error interno del servidor
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'Error procesando la solicitud de edición de la serie'
        });
    } finally {
        await connection.end();
    }
}