// src/pages/api/permisos/primera-ruta.js
import jwt from 'jsonwebtoken';
import { service_ObtenerRutasPermitidas } from '@/services/permisos';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Método no permitido'
        });
    }

    try {
        // Obtener el token del header de autorización
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Verificar el token
        let usuario_id;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            usuario_id = decoded.id;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Obtener todas las rutas permitidas
        const rutasPermitidas = await service_ObtenerRutasPermitidas(usuario_id);

        if (rutasPermitidas.length === 0) {
            return res.status(200).json({
                success: true,
                ruta: '/stock/inventario', // Ruta por defecto
                funcionalidad: 'INVENTARIO',
                message: 'No se encontraron rutas específicas, usando ruta por defecto'
            });
        }

        // Definir el orden de prioridad para las rutas
        const prioridadRutas = [
            '/stock/inventario',     // 1. Inventario (acceso básico)
            '/stock/ventas',         // 2. Ventas
            '/stock/clientes',       // 3. Clientes  
            '/stock/proveedores',    // 4. Proveedores
            '/stock/presupuestos',   // 5. Presupuestos
            '/stock/almacenes',      // 6. Almacenes
            '/stock/dashboard',      // 7. Dashboard (manager/admin)
            '/admin'                 // 8. Administración (solo admin)
        ];

        // Buscar la primera ruta según el orden de prioridad
        for (const rutaPrioridad of prioridadRutas) {
            const rutaEncontrada = rutasPermitidas.find(r => r.ruta === rutaPrioridad);
            if (rutaEncontrada) {
                return res.status(200).json({
                    success: true,
                    ruta: rutaEncontrada.ruta,
                    funcionalidad: rutaEncontrada.funcionalidad,
                    message: 'Primera ruta permitida encontrada'
                });
            }
        }

        // Si no hay coincidencias con prioridades, usar la primera disponible
        return res.status(200).json({
            success: true,
            ruta: rutasPermitidas[0].ruta,
            funcionalidad: rutasPermitidas[0].funcionalidad,
            message: 'Usando primera ruta disponible'
        });

    } catch (error) {
        console.error('Error obteniendo primera ruta:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}