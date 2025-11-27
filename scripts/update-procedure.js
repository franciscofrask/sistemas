const mysql = require('mysql2/promise');

async function updateProcedure() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'sistema_erp'
        });

        console.log('Eliminando procedimiento anterior...');
        await connection.execute('DROP PROCEDURE IF EXISTS crear_usuario');

        console.log('Creando nuevo procedimiento...');
        const procedureSQL = `
        CREATE PROCEDURE crear_usuario(
            IN p_nombre_usuario VARCHAR(50),
            IN p_correo VARCHAR(100),
            IN p_contrasena_hash VARCHAR(255),
            IN p_nombre VARCHAR(100),
            IN p_apellido VARCHAR(100),
            IN p_fecha_nacimiento DATE,
            IN p_fecha_incorporacion DATE,
            IN p_rol_id INT
        )
        BEGIN
            INSERT INTO usuarios (
                nombre_usuario, 
                correo, 
                contrasena_hash, 
                nombre, 
                apellido, 
                fecha_nacimiento, 
                fecha_incorporacion, 
                rol_id
            )
            VALUES (
                p_nombre_usuario, 
                p_correo, 
                p_contrasena_hash, 
                p_nombre, 
                p_apellido, 
                p_fecha_nacimiento, 
                IFNULL(p_fecha_incorporacion, CURDATE()), 
                p_rol_id
            );
        END`;

        await connection.execute(procedureSQL);
        console.log('✅ Procedimiento crear_usuario actualizado exitosamente');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateProcedure();