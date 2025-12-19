import { service_EditarProveedor, service_BorrarProveedor, service_ObtenerProveedor } from '../../../../services/proveedores';
import { getConnection } from '../../../../lib/db';

export default async function handler(req, res) {
    const { id } = req.query;
    const connection = await getConnection();

    try {
        if (req.method === 'GET') {
            // Obtener proveedor específico
            console.log('API obtener proveedor - ID:', id);

            // Validaciones
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    error: 'ID inválido',
                    message: 'El ID del proveedor debe ser un número válido'
                });
            }

            // Llamar al servicio
            const resultado = await service_ObtenerProveedor(connection, parseInt(id));

            return res.status(200).json({
                success: true,
                data: resultado.data,
                message: resultado.message
            });

        } else if (req.method === 'PUT') {
            // Editar proveedor
            const { razon_social, cuit, email, telefono, direccion, activo } = req.body;

            console.log('API editar proveedor - datos recibidos:', { id, ...req.body });

            // Validaciones
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    error: 'ID inválido',
                    message: 'El ID del proveedor debe ser un número válido'
                });
            }

            if (!razon_social || razon_social.trim() === '') {
                return res.status(400).json({
                    error: 'Razón social requerida',
                    message: 'La razón social del proveedor es obligatoria'
                });
            }

            // Llamar al servicio
            const resultado = await service_EditarProveedor(connection, parseInt(id), {
                razon_social,
                cuit,
                email,
                telefono,
                direccion,
                activo
            });

            return res.status(200).json({
                success: true,
                data: resultado,
                message: resultado.message
            });

        } else if (req.method === 'DELETE') {
            // Eliminar proveedor (soft delete)
            console.log('API borrar proveedor - ID recibido:', id);

            // Validaciones
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    error: 'ID inválido',
                    message: 'El ID del proveedor debe ser un número válido'
                });
            }

            // Llamar al servicio
            const resultado = await service_BorrarProveedor(connection, parseInt(id));

            return res.status(200).json({
                success: true,
                data: resultado,
                message: resultado.message
            });

        } else {
            return res.status(405).json({ 
                error: 'Método no permitido',
                message: 'Solo se permiten métodos GET, PUT y DELETE'
            });
        }

    } catch (error) {
        console.error('Error en API editar proveedor:', error);
        
        // Manejar errores de negocio
        if (error.message.includes('El proveedor no existe o está borrado')) {
            return res.status(404).json({
                error: 'Proveedor no encontrado',
                message: error.message
            });
        }

        if (error.message.includes('Ya existe otro proveedor con ese CUIT')) {
            return res.status(409).json({
                error: 'CUIT duplicado',
                message: error.message
            });
        }

        if (error.message.includes('el proveedor tiene compras asociadas')) {
            return res.status(409).json({
                error: 'Proveedor con compras',
                message: error.message
            });
        }

        if (error.message.includes('requerido') || error.message.includes('requerida')) {
            return res.status(400).json({
                error: 'Datos requeridos',
                message: error.message
            });
        }

        return res.status(500).json({
            error: 'Error interno del servidor',
            message: 'Error procesando la solicitud'
        });
    } finally {
        await connection.end();
    }
}