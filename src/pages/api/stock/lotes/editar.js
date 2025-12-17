import { service_EditarLote } from '../../../../services/productos';
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
        const { loteId, codigoLote, fechaVenc } = req.body;

        console.log('Datos recibidos para editar lote:', { loteId, codigoLote, fechaVenc });

        // Validaciones
        if (!loteId) {
            return res.status(400).json({ 
                error: 'ID del lote requerido',
                message: 'El ID del lote es obligatorio'
            });
        }

        if (!codigoLote) {
            return res.status(400).json({ 
                error: 'Código del lote requerido',
                message: 'El código del lote es obligatorio'
            });
        }

        if (!fechaVenc) {
            return res.status(400).json({ 
                error: 'Fecha de vencimiento requerida',
                message: 'La fecha de vencimiento es obligatoria'
            });
        }

        // Validar formato de fecha
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fechaVenc)) {
            return res.status(400).json({ 
                error: 'Formato de fecha inválido',
                message: 'La fecha debe estar en formato YYYY-MM-DD'
            });
        }

        // Llamar al servicio
        const result = await service_EditarLote(connection, loteId, codigoLote, fechaVenc);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });

    } catch (error) {
        console.error('Error en API editar lote:', error);
        
        // Manejar errores de negocio
        if (error.message.includes('no existe') || 
            error.message.includes('NO_EXISTE')) {
            return res.status(404).json({
                error: 'Lote no encontrado',
                message: error.message
            });
        }

        if (error.message.includes('duplicado') ||
            error.message.includes('DUPLICADO')) {
            return res.status(409).json({
                error: 'Código duplicado',
                message: error.message
            });
        }

        if (error.message.includes('requerido') ||
            error.message.includes('REQUERIDO')) {
            return res.status(400).json({
                error: 'Datos requeridos',
                message: error.message
            });
        }

        // Error interno del servidor
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'Error procesando la solicitud de edición del lote'
        });
    } finally {
        await connection.end();
    }
}