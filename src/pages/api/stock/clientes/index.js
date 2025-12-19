import { service_ListarClientes, service_CrearCliente, service_EditarCliente, service_BorrarCliente, service_ObtenerCliente } from '../../../../services/clientes';
import { getConnection } from '../../../../lib/db';

export default async function handler(req, res) {
    const connection = await getConnection();

    try {
        if (req.method === 'GET') {
            // Listar clientes
            const { incluir_inactivos } = req.query;
            
            console.log('API listar clientes - parámetros:', { incluir_inactivos });

            const clientes = await service_ListarClientes(
                connection, 
                incluir_inactivos === '1' || incluir_inactivos === 'true'
            );

            return res.status(200).json({
                success: true,
                data: clientes,
                message: 'Clientes obtenidos correctamente'
            });

        } else if (req.method === 'POST') {
            // Crear cliente
            const { nombre, cuit, email, telefono, direccion } = req.body;

            console.log('API crear cliente - datos recibidos:', req.body);

            // Validaciones
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    error: 'Nombre requerido',
                    message: 'El nombre del cliente es obligatorio'
                });
            }

            // Llamar al servicio
            const resultado = await service_CrearCliente(connection, {
                nombre,
                cuit,
                email,
                telefono,
                direccion
            });

            return res.status(201).json({
                success: true,
                data: resultado,
                message: resultado.message
            });

        } else {
            return res.status(405).json({ 
                error: 'Método no permitido',
                message: 'Solo se permiten métodos GET y POST'
            });
        }

    } catch (error) {
        console.error('Error en API clientes:', error);
        
        // Manejar errores de negocio
        if (error.message.includes('Ya existe un cliente con ese CUIT')) {
            return res.status(409).json({
                error: 'CUIT duplicado',
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