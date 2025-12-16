import { getConnection } from '../../../../lib/db';
import { service_ListarAtributosSerie } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            error: 'Método no permitido',
            message: 'Este endpoint solo acepta peticiones GET' 
        });
    }

    const connection = await getConnection();

    try {
        const { serie_id } = req.query;

        // Validar que se proporcione el ID de la serie
        if (!serie_id) {
            return res.status(400).json({
                error: 'Parámetro requerido',
                message: 'El ID de serie (serie_id) es requerido'
            });
        }

        // Validar que sea un número válido
        const serieIdNumber = parseInt(serie_id);
        if (isNaN(serieIdNumber) || serieIdNumber <= 0) {
            return res.status(400).json({
                error: 'Parámetro inválido',
                message: 'El ID de serie debe ser un número positivo'
            });
        }

        // Obtener los atributos de la serie
        const atributos = await service_ListarAtributosSerie(connection, serieIdNumber);

        return res.status(200).json({
            success: true,
            data: atributos,
            count: atributos.length,
            message: `Se encontraron ${atributos.length} atributo(s) para la serie`
        });

    } catch (error) {
        console.error('Error en API listar atributos serie:', error);

        // Manejar errores específicos del procedimiento almacenado
        if (error.message.includes('ID de serie es requerido')) {
            return res.status(400).json({
                error: 'Error de validación',
                message: error.message,
                code: 'VALIDATION_ERROR'
            });
        }

        // Error genérico del servidor
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los atributos de la serie',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}