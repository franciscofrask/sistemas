import { MiddlewareUsuarioLogeado } from "@/middleware/authMiddleware";
import { service_DBconn } from "@/services/db";
import { service_ObtenerPermisos } from "@/services/usuarios";

export async function ObtenerPermisos(req, res) {
    let dbconn;
    try {
        // El usuario ya está validado por el middleware
        const usuario_id = req.usuario.id;
        
        dbconn = await service_DBconn();
        let permisos = await service_ObtenerPermisos(dbconn, usuario_id);

        res.status(200).json({
            success: true, 
            data: permisos
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            mensaje: error.message 
        });
    } finally {
        if (dbconn) dbconn.end();
    }
}

export default MiddlewareUsuarioLogeado(['GET'], ObtenerPermisos);