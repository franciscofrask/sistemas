// src/pages/api/stock/almacenes/[id].js
import { getConnection } from '../../../../lib/db';
import { service_ObtenerAlmacenPorId, service_EditarAlmacen, service_BorrarAlmacen } from '../../../../services/almacenes';

export default async function handler(req, res) {
    const { method, query } = req;
    const { id } = query;
    const connection = await getConnection();

    try {
        switch (method) {
            case 'GET':
                try {
                    const almacen = await service_ObtenerAlmacenPorId(connection, parseInt(id));

                    if (!almacen) {
                        return res.status(404).json({
                            error: true,
                            message: 'Almacén no encontrado',
                            data: null
                        });
                    }

                    return res.status(200).json({
                        error: false,
                        message: 'Almacén obtenido exitosamente',
                        data: almacen
                    });
                } catch (error) {
                    console.error('Error obteniendo almacén:', error);
                    return res.status(500).json({
                        error: true,
                        message: 'Error obteniendo almacén',
                        data: null
                    });
                }

            case 'PUT':
                try {
                    const { nombre, codigo, direccion, descripcion, activo } = req.body;

                    // Validaciones básicas
                    if (!nombre || nombre.trim() === '') {
                        return res.status(400).json({
                            error: true,
                            message: 'El nombre del almacén es requerido',
                            data: null
                        });
                    }

                    const result = await service_EditarAlmacen(connection, parseInt(id), {
                        nombre,
                        codigo,
                        direccion,
                        descripcion,
                        activo
                    });

                    return res.status(200).json({
                        error: false,
                        message: result.message,
                        data: result
                    });
                } catch (error) {
                    console.error('Error editando almacén:', error);
                    
                    // Manejar errores específicos
                    if (error.message.includes('ID de almacén es requerido') ||
                        error.message.includes('El nombre del almacén es requerido')) {
                        return res.status(400).json({
                            error: true,
                            message: error.message,
                            data: null
                        });
                    }

                    if (error.message.includes('El almacén no existe o está borrado')) {
                        return res.status(404).json({
                            error: true,
                            message: error.message,
                            data: null
                        });
                    }

                    if (error.message.includes('Ya existe otro almacén con ese nombre')) {
                        return res.status(409).json({
                            error: true,
                            message: error.message,
                            data: null
                        });
                    }

                    return res.status(500).json({
                        error: true,
                        message: 'Error interno del servidor',
                        data: null
                    });
                }

            case 'DELETE':
                try {
                    // Validaciones básicas
                    if (!id || isNaN(parseInt(id))) {
                        return res.status(400).json({
                            error: true,
                            message: 'ID de almacén inválido',
                            data: null
                        });
                    }

                    const result = await service_BorrarAlmacen(connection, parseInt(id));

                    return res.status(200).json({
                        error: false,
                        message: result.message,
                        data: result
                    });
                } catch (error) {
                    console.error('Error borrando almacén:', error);
                    
                    // Manejar errores específicos
                    if (error.message.includes('ID de almacén es requerido')) {
                        return res.status(400).json({
                            error: true,
                            message: error.message,
                            data: null
                        });
                    }

                    if (error.message.includes('El almacén no existe o ya está borrado')) {
                        return res.status(404).json({
                            error: true,
                            message: error.message,
                            data: null
                        });
                    }

                    // Errores de integridad referencial (409 Conflict)
                    if (error.message.includes('No se puede borrar:')) {
                        return res.status(409).json({
                            error: true,
                            message: error.message,
                            data: null
                        });
                    }

                    return res.status(500).json({
                        error: true,
                        message: 'Error interno del servidor',
                        data: null
                    });
                }

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).json({
                    error: true,
                    message: `Método ${method} no permitido`,
                    data: null
                });
        }
    } catch (error) {
        console.error('Error en API de almacén:', error);
        return res.status(500).json({
            error: true,
            message: 'Error interno del servidor',
            data: null
        });
    } finally {
        await connection.end();
    }
}