import { service_ListarProveedores, service_CrearProveedor, service_EditarProveedor, service_BorrarProveedor, service_ObtenerProveedor } from '../../../../services/proveedores';
import { getConnection } from '../../../../lib/db';

export default async function handler(req, res) {
    const connection = await getConnection();

    try {
        if (req.method === 'GET') {
            // Listar proveedores
            const { incluir_inactivos } = req.query;
            
            console.log('API listar proveedores - parámetros:', { incluir_inactivos });

            const proveedores = await service_ListarProveedores(
                connection, 
                incluir_inactivos === '1' || incluir_inactivos === 'true'
            );

            return res.status(200).json({
                success: true,
                data: proveedores,
                message: 'Proveedores obtenidos correctamente'
            });

        } else if (req.method === 'POST') {
            // Crear proveedor
            const { razon_social, cuit, email, telefono, direccion } = req.body;

            console.log('API crear proveedor - datos recibidos:', req.body);

            // Validaciones
            if (!razon_social || razon_social.trim() === '') {
                return res.status(400).json({
                    error: 'Razón social requerida',
                    message: 'La razón social del proveedor es obligatoria'
                });
            }

            // Llamar al servicio
            const resultado = await service_CrearProveedor(connection, {
                razon_social,
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
        console.error('Error en API proveedores:', error);
        
        // Manejar errores de negocio
        if (error.message.includes('Ya existe un proveedor con ese CUIT')) {
            return res.status(409).json({
                error: 'CUIT duplicado',
                message: error.message
            });
        }

        if (error.message.includes('requerida')) {
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