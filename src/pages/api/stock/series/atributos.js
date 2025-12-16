import { getConnection } from '../../../../lib/db';
import { service_UpsertSerieAtributo } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'PUT') {
        return res.status(405).json({ 
            error: 'Método no permitido',
            message: 'Este endpoint solo acepta peticiones POST y PUT' 
        });
    }

    const connection = await getConnection();

    try {
        const { serie_id, clave, valor } = req.body;

        // Validaciones básicas
        if (!serie_id) {
            return res.status(400).json({
                error: 'Campo requerido faltante',
                message: 'El ID de serie (serie_id) es requerido'
            });
        }

        if (!clave || !clave.trim()) {
            return res.status(400).json({
                error: 'Campo requerido faltante',
                message: 'La clave del atributo es requerida'
            });
        }

        if (valor === null || valor === undefined || !valor.toString().trim()) {
            return res.status(400).json({
                error: 'Campo requerido faltante',
                message: 'El valor del atributo es requerido'
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

        // Ejecutar el upsert del atributo
        const resultado = await service_UpsertSerieAtributo(
            connection, 
            serieIdNumber, 
            clave, 
            valor
        );

        return res.status(200).json({
            success: true,
            message: resultado.message,
            data: resultado.data
        });

    } catch (error) {
        console.error('Error en API series atributos:', error);

        // Manejar errores específicos del procedimiento almacenado
        if (error.message.includes('serie_id es requerido') || 
            error.message.includes('clave no puede estar vacía') ||
            error.message.includes('valor no puede estar vacío') ||
            error.message.includes('La serie no existe o está borrada')) {
            return res.status(400).json({
                error: 'Error de validación',
                message: error.message,
                code: 'VALIDATION_ERROR'
            });
        }

        // Error genérico del servidor
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo guardar el atributo de la serie',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}