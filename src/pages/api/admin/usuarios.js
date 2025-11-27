import { getToken } from "next-auth/jwt";
import pool from "@/lib/db";

export default async function handler(req, res) {
    // Verificar autenticación y permisos de administrador
    const token = await getToken({ req, secret: "tu_jwt_secret_muy_seguro" });
    
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'No tiene permisos para realizar esta acción' 
        });
    }

    if (req.method === 'GET') {
        try {
            const connection = await pool.getConnection();
            
            // Usar el procedimiento para listar usuarios
            const [users] = await connection.execute('CALL listar_usuarios()');
            connection.release();
            
            return res.status(200).json({
                success: true,
                data: users[0] // Los procedimientos devuelven resultado en el primer índice
            });
            
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear nuevo usuario (POST)
    if (req.method === 'POST') {
        try {
            const { 
                nombre_usuario, 
                correo, 
                contrasena, 
                nombre, 
                apellido, 
                fecha_nacimiento, 
                fecha_incorporacion, 
                rol_id 
            } = req.body;
            
            if (!nombre_usuario || !correo || !contrasena || !nombre || !apellido) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos obligatorios son requeridos'
                });
            }

            const connection = await pool.getConnection();
            
            // Crear usuario usando el procedimiento almacenado
            await connection.execute('CALL crear_usuario(?, ?, ?, ?, ?, ?, ?, ?)', [
                nombre_usuario,
                correo, 
                contrasena,
                nombre,
                apellido,
                fecha_nacimiento || '1990-01-01',
                fecha_incorporacion || new Date().toISOString().split('T')[0],
                rol_id || 2
            ]);
            
            connection.release();
            
            return res.status(201).json({
                success: true,
                message: 'Usuario creado correctamente'
            });
            
        } catch (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor: ' + error.message
            });
        }
    }

    return res.status(405).json({ 
        success: false, 
        message: 'Método no permitido' 
    });
}