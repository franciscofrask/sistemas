import { getConnection } from '../../../../lib/db';
import { service_EditarProducto } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
        return res.status(405).json({ 
            error: 'Método no permitido',
            message: 'Este endpoint solo acepta peticiones PUT y PATCH' 
        });
    }

    const connection = await getConnection();

    try {
        const { id } = req.query;
        const {
            nombre,
            sku,
            codigo_barras,
            categoria_id,
            unidad_medida_id,
            tipo_control_stock,
            es_servicio,
            precio_lista,
            activo
        } = req.body;

        // Validar que se proporcione el ID del producto
        if (!id) {
            return res.status(400).json({
                error: 'Parámetro requerido',
                message: 'El ID del producto es requerido'
            });
        }

        // Validar que sea un número válido
        const productoId = parseInt(id);
        if (isNaN(productoId) || productoId <= 0) {
            return res.status(400).json({
                error: 'Parámetro inválido',
                message: 'El ID del producto debe ser un número positivo'
            });
        }

        // Validaciones básicas de campos requeridos
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: 'Campo requerido',
                message: 'El nombre del producto es requerido'
            });
        }

        if (!unidad_medida_id) {
            return res.status(400).json({
                error: 'Campo requerido',
                message: 'La unidad de medida es requerida'
            });
        }

        // Validar tipo_control_stock si se proporciona
        if (tipo_control_stock && !['UNIDAD', 'LOTE', 'SERIE'].includes(tipo_control_stock)) {
            return res.status(400).json({
                error: 'Valor inválido',
                message: 'tipo_control_stock debe ser UNIDAD, LOTE o SERIE'
            });
        }

        // Validar que unidad_medida_id sea un número si se proporciona
        if (unidad_medida_id && (isNaN(parseInt(unidad_medida_id)) || parseInt(unidad_medida_id) <= 0)) {
            return res.status(400).json({
                error: 'Valor inválido',
                message: 'unidad_medida_id debe ser un número positivo'
            });
        }

        // Validar que categoria_id sea un número si se proporciona
        if (categoria_id && (isNaN(parseInt(categoria_id)) || parseInt(categoria_id) <= 0)) {
            return res.status(400).json({
                error: 'Valor inválido',
                message: 'categoria_id debe ser un número positivo'
            });
        }

        // Ejecutar la edición del producto
        const resultado = await service_EditarProducto(connection, productoId, {
            nombre,
            sku,
            codigo_barras,
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            unidad_medida_id: parseInt(unidad_medida_id),
            tipo_control_stock,
            es_servicio: es_servicio ? 1 : 0,
            precio_lista: precio_lista ? parseFloat(precio_lista) : 0,
            activo: activo !== undefined ? (activo ? 1 : 0) : 1
        });

        return res.status(200).json({
            success: true,
            message: resultado.message,
            data: resultado.data
        });

    } catch (error) {
        console.error('Error en API editar producto:', error);

        // Manejar errores específicos del procedimiento almacenado
        if (error.message.includes('producto_id es requerido') ||
            error.message.includes('nombre no puede estar vacío') ||
            error.message.includes('unidad_medida_id es requerido') ||
            error.message.includes('El producto no existe o está borrado') ||
            error.message.includes('No se puede cambiar tipo_control_stock')) {
            return res.status(400).json({
                error: 'Error de validación',
                message: error.message,
                code: 'VALIDATION_ERROR'
            });
        }

        // Manejo específico para conflicto de cambio de tipo de control
        if (error.message.includes('tipo_control_stock') && error.message.includes('historial')) {
            return res.status(409).json({
                error: 'Conflicto',
                message: error.message,
                code: 'BUSINESS_RULE_VIOLATION'
            });
        }

        // Error genérico del servidor
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo editar el producto',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}