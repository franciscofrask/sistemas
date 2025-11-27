// src/pages/api/admin/usuarios/crear.js
import bcrypt from 'bcryptjs';
import { validateToken } from '@/middleware/authMiddleware';
import { service_CrearUsuario } from '@/services/usuarios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Método no permitido'
        });
    }

    try {
        // Validar token de administrador
        const tokenValidation = await validateToken(req);
        
        if (!tokenValidation.success) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Verificar que el usuario sea administrador
        console.log('Usuario en token:', tokenValidation.user);
        const userRole = tokenValidation.user.role || tokenValidation.user.rol;
        
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para crear usuarios',
                debug: { userRole, tokenUser: tokenValidation.user }
            });
        }

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

        // Validaciones básicas
        if (!nombre_usuario || !correo || !contrasena || !nombre || !apellido || !rol_id) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios'
            });
        }

        // Validar formato del correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de correo electrónico inválido'
            });
        }

        // Validar longitud de contraseña
        if (contrasena.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Hash de la contraseña
        const saltRounds = 12;
        const contrasena_hash = await bcrypt.hash(contrasena, saltRounds);

        // Formatear fechas para MySQL (YYYY-MM-DD)
        const formatDateForMySQL = (date) => {
            if (!date) return null;
            
            // Si ya es una fecha válida, convertirla
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return null;
            
            return dateObj.toISOString().split('T')[0];
        };

        // Preparar datos para el servicio
        const datosUsuario = {
            nombre_usuario,
            correo,
            contrasena_hash,
            nombre,
            apellido,
            fecha_nacimiento: formatDateForMySQL(fecha_nacimiento),  // Formatear fecha
            fecha_incorporacion: formatDateForMySQL(fecha_incorporacion),  // Formatear fecha
            rol_id: parseInt(rol_id)
        };

        // Llamar al servicio para crear el usuario
        const resultado = await service_CrearUsuario(datosUsuario);

        if (resultado.success) {
            return res.status(201).json({
                success: true,
                message: resultado.message
            });
        } else {
            return res.status(400).json({
                success: false,
                message: resultado.message
            });
        }

    } catch (error) {
        console.error('Error en API crear usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}