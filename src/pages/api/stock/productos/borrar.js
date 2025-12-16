import { getConnection } from '../../../../lib/db';
import { service_BorrarProductoLogico } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ 
            error: 'Método no permitido',
            message: 'Este endpoint solo acepta peticiones DELETE' 
        });
    }

    const connection = await getConnection();

    try {
        const { id } = req.query;

        // Validar que se proporcione el ID del producto
        if (!id) {
            return res.status(400).json({
                error: 'ID de producto requerido',
                message: 'Debe proporcionar el ID del producto a borrar'
            });
        }

        // Validar que sea un número válido
        const productoId = parseInt(id);
        if (isNaN(productoId) || productoId <= 0) {
            return res.status(400).json({
                error: 'ID inválido',
                message: 'El ID del producto debe ser un número positivo'
            });
        }

        // Ejecutar el borrado lógico
        const resultado = await service_BorrarProductoLogico(connection, productoId);

        return res.status(200).json({
            success: true,
            message: resultado.message,
            data: {
                producto_id: productoId,
                borrado_en: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error en API borrar producto:', error);

        // Manejar errores específicos del procedimiento almacenado
        if (error.message.includes('no existe o ya está borrado') || 
            error.message.includes('tiene stock')) {
            return res.status(409).json({
                error: 'Conflicto',
                message: error.message,
                code: 'BUSINESS_RULE_VIOLATION'
            });
        }

        // Error genérico del servidor
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo completar la operación de borrado',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });

    } finally {
        if (connection) {
            connection.end();
        }
    }
}