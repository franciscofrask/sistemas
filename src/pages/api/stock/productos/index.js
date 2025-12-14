import { getConnection } from '../../../../lib/db';
import { service_CrearProducto, service_CrearLoteConStock, service_CrearSeriesConStock } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        const {
            nombre,
            sku,
            codigo_barras,
            categoria_id,
            unidad_medida_id,
            tipo_control_stock,
            es_servicio = false,
            precio_lista = 0,
            lotes = [],
            series = [],
            almacen_id
        } = req.body;

        // Validaciones básicas
        if (!nombre || !tipo_control_stock || !categoria_id || !unidad_medida_id) {
            await connection.rollback();
            return res.status(400).json({
                error: 'Faltan campos requeridos: nombre, tipo_control_stock, categoria_id, unidad_medida_id'
            });
        }

        // Crear el producto principal
        const productoId = await service_CrearProducto(connection, {
            nombre,
            sku,
            codigo_barras,
            categoria_id,
            unidad_medida_id,
            tipo_control_stock,
            es_servicio,
            precio_lista
        });

        console.log('Producto creado con ID:', productoId);

        // Procesar según el tipo de control de stock
        if (tipo_control_stock === 'LOTE') {
            if (!lotes || lotes.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    error: 'Para productos tipo LOTE se requieren datos de lotes'
                });
            }

            if (!almacen_id) {
                await connection.rollback();
                return res.status(400).json({
                    error: 'Se requiere almacén para crear lotes'
                });
            }

            // Crear cada lote con su stock
            for (const lote of lotes) {
                await service_CrearLoteConStock(connection, productoId, lote, almacen_id);
                console.log('Lote creado:', lote.codigo_lote);
            }

        } else if (tipo_control_stock === 'SERIE') {
          

            if (!almacen_id) {
                await connection.rollback();
                return res.status(400).json({
                    error: 'Se requiere almacén para crear series'
                });
            }

            // Crear series con stock
            await service_CrearSeriesConStock(connection, productoId, series, almacen_id);
            console.log('Series creadas:', series.length, 'unidades');
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            producto_id: productoId,
            datos: {
                nombre,
                sku,
                tipo_control_stock,
                lotes_creados: tipo_control_stock === 'LOTE' ? lotes.length : 0,
                series_creadas: tipo_control_stock === 'SERIE' ? series.length : 0
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error creando producto:', error);
        
        // Manejar errores específicos de duplicados
        if (error.message.includes('Duplicate entry') && error.message.includes('uk_productos_sku')) {
            return res.status(400).json({
                error: 'SKU Duplicado',
                message: 'Ya existe un producto con este SKU. Por favor, use un SKU diferente.',
                details: 'El SKU debe ser único para cada producto'
            });
        }
        
        if (error.message.includes('Duplicate entry') && error.message.includes('uk_productos_codigo_barras')) {
            return res.status(400).json({
                error: 'Código de Barras Duplicado',
                message: 'Ya existe un producto con este código de barras. Por favor, use un código diferente.',
                details: 'El código de barras debe ser único para cada producto'
            });
        }
        
        // Error genérico para otros casos
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    } finally {
        await connection.end();
    }
}