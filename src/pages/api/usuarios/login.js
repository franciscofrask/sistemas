import { MiddlewarePagina } from "@/middleware";
import { service_DBconn } from "@/services/db";
import { service_Login } from "@/services/usuarios";

export async function Login(req, res) {
    let dbconn;
    try {
        console.log('API Login - Datos recibidos:', req.body);
        
        // Extraer datos del body
        let { usuario, clave } = req.body;

        // Validar campos requeridos
        if (!usuario || !clave) {
            console.log('Error: Campos faltantes');
            throw new Error("Usuario y contraseña son requeridos");
        }
        
        console.log('Intentando conectar a la base de datos...');
        // Conectar a la base de datos
        dbconn = await service_DBconn();

        console.log('Validando credenciales...');
        
        // Ejecutar servicio de login directamente con el usuario ingresado
        console.log('Ejecutando servicio de login con usuario:', usuario);
        let datos = await service_Login(dbconn, usuario, clave);

        // Respuesta exitosa
        res.status(200).json({
            success: true, 
            data: [{
                persona_estado: datos[0].persona_estado,
                nombre: datos[0].persona_datos,
                cuil_cuit: datos[0].cuil_cuit,
                id: datos[0].id,
                uid: datos[0].uid,
                mail: datos[0].mail,
                role: datos[0].role
            }]
        });
    } catch (error) {
        console.error('Error en API Login:', error);
        res.status(400).json({ 
            success: false, 
            mensaje: error.message,
            error_detail: error.toString()
        });
    } finally {
        if (dbconn) {
            try {
                await dbconn.end();
                console.log('Conexión cerrada correctamente');
            } catch (err) {
                console.error('Error cerrando conexión:', err);
            }
        }
    }
}

export default MiddlewarePagina(['POST'], Login);