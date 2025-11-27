import { requireAuth } from "@/middleware/authMiddleware";
import { service_DBconn } from "@/services/db";

export default async function handler(req, res) {
    // Verificar autenticación y permisos de administrador
    const user = await requireAuth(req, res, 'admin');
    if (!user) return; // requireAuth ya envió la respuesta de error

    const { params } = req.query;
    
    // Extraer userId y action de los parámetros
    const userId = params[0];
    const action = params[1];

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'ID de usuario requerido'
        });
    }

    // Cambiar rol del usuario
    if (action === 'rol' && req.method === 'PUT') {
        try {
            const { rol_id } = req.body;
            
            if (!rol_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de rol requerido'
                });
            }

            const connection = await service_DBconn();
            
            await connection.execute('CALL asignar_rol_usuario(?, ?)', [
                userId, rol_id
            ]);
            
            await connection.end();
            
            return res.status(200).json({
                success: true,
                message: 'Rol actualizado correctamente'
            });
            
        } catch (error) {
            console.error('Error al actualizar rol:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener usuario específico
    if (req.method === 'GET') {
        try {
            const connection = await service_DBconn();
            
            const [user] = await connection.execute(
                `SELECT 
                    u.id,
                    u.nombre_usuario,
                    u.correo,
                    CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
                    u.nombre,
                    u.apellido,
                    u.activo,
                    u.rol_id,
                    u.fecha_nacimiento,
                    u.fecha_incorporacion,
                    u.creado_en,
                    u.actualizado_en,
                    r.nombre as rol_nombre,
                    r.descripcion as rol_descripcion
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.id
                WHERE u.id = ? AND u.borrado_en IS NULL`,
                [userId]
            );
            
            await connection.end();
            
            if (user.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: user[0]
            });
            
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar usuario
    if (req.method === 'PUT') {
        try {
            const { nombre, apellido, correo, nombre_usuario, rol_id } = req.body;
            
            if (!nombre || !apellido || !correo || !nombre_usuario) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios'
                });
            }

            const connection = await service_DBconn();
            
            await connection.execute('CALL editar_usuario(?, ?, ?, ?, ?, ?)', [
                userId,
                nombre_usuario,
                correo,
                nombre,
                apellido,
                rol_id || null
            ]);
            
            await connection.end();
            
            return res.status(200).json({
                success: true,
                message: 'Usuario actualizado correctamente'
            });
            
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor: ' + error.message
            });
        }
    }

    // Eliminar usuario (borrado lógico)
    if (req.method === 'DELETE') {
        try {
            const connection = await service_DBconn();
            
            await connection.execute('CALL borrar_usuario_logico(?)', [userId]);
            
            await connection.end();
            
            return res.status(200).json({
                success: true,
                message: 'Usuario desactivado correctamente'
            });
            
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    return res.status(405).json({ 
        success: false, 
        message: 'Método no permitido' 
    });
}