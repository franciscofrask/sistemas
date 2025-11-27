// Crear procedimiento listar_usuarios
const { service_DBconn } = require('./src/services/db');

async function crearProcedimientoListarUsuarios() {
    let connection;
    
    try {
        connection = await service_DBconn();
        
        // Eliminar procedimiento si existe
        await connection.execute('DROP PROCEDURE IF EXISTS listar_usuarios');
        
        // Crear procedimiento listar_usuarios
        const crearProcedimiento = `
        CREATE PROCEDURE listar_usuarios()
        BEGIN
            SELECT 
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
            WHERE u.borrado_en IS NULL
            ORDER BY u.creado_en DESC;
        END
        `;
        
        await connection.execute(crearProcedimiento);
        console.log('✅ Procedimiento listar_usuarios creado exitosamente');
        
    } catch (error) {
        console.error('❌ Error creando procedimiento:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

crearProcedimientoListarUsuarios();