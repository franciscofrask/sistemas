export async function service_Login(_db, _usuario, _clave) {
    try {
        console.log('Ejecutando login para usuario:', _usuario);
        let query = 'CALL Login(?,?)';
        let values = [_usuario, _clave];
        
        const [rows] = await _db.execute(query, values);
        console.log('Resultado del procedimiento Login:', rows);
        
        let resultado = rows[0];
        
        if (!resultado || resultado.length === 0) {
            throw new Error('No se recibió respuesta del procedimiento Login');
        }
        
        if (resultado[0].persona_estado == 0) {
            throw new Error(resultado[0].mensaje || 'Credenciales inválidas');
        }
        
        console.log('Login exitoso para:', _usuario);
        return resultado;
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