import { getConnection } from '../../../../lib/db';
import { service_BorrarSerieAtributo } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ 
            error: 'Método no permitido',
            message: 'Este endpoint solo acepta peticiones DELETE' 
        });
    }

    const connection = await getConnection();

    try {
        const { serie_id, clave } = req.query;

        // Validar que se proporcionen los parámetros requeridos
        if (!serie_id) {
            return res.status(400).json({
                error: 'Parámetro requerido',
                message: 'El ID de serie (serie_id) es requerido'
            });
        }

        if (!clave) {
            return res.status(400).json({
                error: 'Parámetro requerido',
                message: 'La clave del atributo (clave) es requerida'
            });
        }

        // Validar que serie_id sea un número válido
        const serieIdNumber = parseInt(serie_id);
        if (isNaN(serieIdNumber) || serieIdNumber <= 0) {
            return res.status(400).json({
                error: 'Parámetro inválido',
                message: 'El ID de serie debe ser un número positivo'
            });
        }

        // Ejecutar el borrado del atributo
        const resultado = await service_BorrarSerieAtributo(
            connection, 
            serieIdNumber, 
            clave
        );

        return res.status(200).json({
            success: true,
            message: resultado.message,
            data: resultado.data
        });

    } catch (error) {
        console.error('Error en API borrar atributo serie:', error);

        // Manejar errores específicos del procedimiento almacenado
        if (error.message.includes('ID de serie es requerido') || 
            error.message.includes('La clave del atributo es requerida')) {
            return res.status(400).json({
                error: 'Error de validación',
                message: error.message,
                code: 'VALIDATION_ERROR'
            });
        }

        // Error genérico del servidor
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo borrar el atributo de la serie',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}