import bcrypt from 'bcryptjs';

export async function service_Login(_db, _usuario, _clave) {
    try {
        console.log('Ejecutando login para usuario:', _usuario);
        
        // Primero obtenemos el usuario con el procedimiento
        let query = 'CALL ObtenerUsuario(?)';
        let values = [_usuario];
        
        const [rows] = await _db.execute(query, values);
        console.log('Resultado del procedimiento ObtenerUsuario:', rows);
        
        let resultado = rows[0];
        
        if (!resultado || resultado.length === 0) {
            throw new Error('Usuario no encontrado o inactivo');
        }
        
        const usuario = resultado[0];
        
        // Verificar la contraseña con bcrypt
        const contrasenaValida = await bcrypt.compare(_clave, usuario.contrasena_hash);
        
        if (!contrasenaValida) {
            throw new Error('Credenciales inválidas');
        }
        
        console.log('Login exitoso para:', _usuario);
        
        // Devolver en formato compatible con el sistema existente
        return [{
            id: usuario.id,
            uid: usuario.nombre_usuario,
            cuil_cuit: usuario.nombre_usuario, // Usar nombre_usuario como cuil_cuit por compatibilidad
            persona_datos: usuario.nombre_completo,
            mail: usuario.correo,
            persona_estado: 1,
            role_id: usuario.rol_id,
            role: usuario.rol_nombre,
            mensaje: 'Login exitoso'
        }];
        
    } catch (err) {
        console.error('Error en service_Login:', err);
        if (err instanceof Error) {
            if (err.sqlMessage) {
                throw new Error(`Error en la base de datos: ${err.sqlMessage}`);
            } else {
                throw new Error(err.message);
            }
        }
        throw new Error('Error desconocido en el login');
    }
}

export async function service_ObtenerPermisos(_db, _usuario_id) {
    try {
        let query = `
            SELECT s.id, s.nombre, s.ruta, s.icono, p.puede_acceder
            FROM sistemas s
            LEFT JOIN permisos_usuario_sistema p ON s.id = p.sistema_id AND p.usuario_id = ?
            WHERE s.activo = 1
        `;
        let values = [_usuario_id];
        const [rows] = await _db.execute(query, values);
        return rows;
    } catch (err) {
        throw new Error('Error obteniendo permisos');
    }
}