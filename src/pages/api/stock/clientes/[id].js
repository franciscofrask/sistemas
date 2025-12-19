import { service_EditarCliente, service_BorrarCliente, service_ObtenerCliente } from '../../../../services/clientes';
import { getConnection } from '../../../../lib/db';

export default async function handler(req, res) {
    const { id } = req.query;
    const connection = await getConnection();

    try {
        if (req.method === 'GET') {
            // Obtener cliente específico
            console.log('API obtener cliente - ID:', id);

            // Validaciones
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    error: 'ID inválido',
                    message: 'El ID del cliente debe ser un número válido'
                });
            }

            // Llamar al servicio
            const resultado = await service_ObtenerCliente(connection, parseInt(id));

            return res.status(200).json({
                success: true,
                data: resultado.data,
                message: resultado.message
            });

        } else if (req.method === 'PUT') {
            // Editar cliente
            const { nombre, cuit, email, telefono, direccion, activo } = req.body;

            console.log('API editar cliente - datos recibidos:', { id, ...req.body });

            // Validaciones
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    error: 'ID inválido',
                    message: 'El ID del cliente debe ser un número válido'
                });
            }

            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    error: 'Nombre requerido',
                    message: 'El nombre del cliente es obligatorio'
                });
            }

            // Llamar al servicio
            const resultado = await service_EditarCliente(connection, parseInt(id), {
                nombre,
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
            // Eliminar cliente (soft delete)
            console.log('API borrar cliente - ID recibido:', id);

            // Validaciones
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    error: 'ID inválido',
                    message: 'El ID del cliente debe ser un número válido'
                });
            }

            // Llamar al servicio
            const resultado = await service_BorrarCliente(connection, parseInt(id));

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
        console.error('Error en API editar cliente:', error);
        
        // Manejar errores de negocio
        if (error.message.includes('El cliente no existe o está borrado')) {
            return res.status(404).json({
                error: 'Cliente no encontrado',
                message: error.message
            });
        }

        if (error.message.includes('Ya existe otro cliente con ese CUIT')) {
            return res.status(409).json({
                error: 'CUIT duplicado',
                message: error.message
            });
        }

        if (error.message.includes('el cliente tiene ventas asociadas')) {
            return res.status(409).json({
                error: 'Cliente con ventas',
                message: error.message
            });
        }

        if (error.message.includes('el cliente tiene presupuestos asociados')) {
            return res.status(409).json({
                error: 'Cliente con presupuestos',
                message: error.message
            });
        }

        if (error.message.includes('requerido')) {
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