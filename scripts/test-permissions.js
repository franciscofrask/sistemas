// scripts/test-permissions.js
const mysql = require('mysql2/promise');

const testPermissions = async () => {
    console.log('🔧 Iniciando prueba del sistema de permisos...\n');

    try {
        // Conectar a la base de datos
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'sistema_erp'
        });

        console.log('✅ Conexión a la base de datos establecida\n');

        // 1. Verificar estructura de tablas
        console.log('1. Verificando estructura de tablas...');
        
        const [funcionalidades] = await connection.execute('SELECT id, nombre, ruta FROM funcionalidades ORDER BY id');
        console.log(`   - Funcionalidades registradas: ${funcionalidades.length}`);
        funcionalidades.forEach(f => {
            console.log(`     ${f.id}. ${f.nombre} → ${f.ruta || 'Sin ruta'}`);
        });

        console.log();

        // 2. Verificar roles
        const [roles] = await connection.execute('SELECT id, nombre FROM roles ORDER BY id');
        console.log(`   - Roles registrados: ${roles.length}`);
        roles.forEach(r => {
            console.log(`     ${r.id}. ${r.nombre}`);
        });

        console.log();

        // 3. Verificar usuarios
        const [usuarios] = await connection.execute('SELECT id, nombre, correo, rol_id FROM usuarios ORDER BY id');
        console.log(`   - Usuarios registrados: ${usuarios.length}`);
        usuarios.forEach(u => {
            const rol = roles.find(r => r.id === u.rol_id);
            console.log(`     ${u.id}. ${u.nombre} (${u.correo}) - Rol: ${rol?.nombre || 'Sin rol'}`);
        });

        console.log();

        // 4. Verificar permisos por rol
        console.log('2. Verificando permisos por rol...');
        
        for (const rol of roles) {
            console.log(`\n   Rol: ${rol.nombre} (ID: ${rol.id})`);
            
            const [permisos] = await connection.execute(`
                SELECT f.nombre, f.ruta, prf.puede_acceder
                FROM funcionalidades f
                LEFT JOIN permisos_rol_funcionalidad prf ON f.id = prf.funcionalidad_id AND prf.rol_id = ?
                ORDER BY f.id
            `, [rol.id]);

            permisos.forEach(p => {
                const acceso = p.puede_acceder === 1 ? '✅ PERMITIDO' : 
                              p.puede_acceder === 0 ? '❌ DENEGADO' : 
                              '⚪ SIN DEFINIR';
                console.log(`     - ${p.nombre}: ${acceso}`);
            });
        }

        console.log();

        // 5. Probar casos específicos
        console.log('3. Probando casos específicos...');
        
        const casosTest = [
            { usuario_id: 1, ruta: '/stock/dashboard', esperado: true },
            { usuario_id: 2, ruta: '/stock/dashboard', esperado: false },
            { usuario_id: 3, ruta: '/stock/dashboard', esperado: false },
            { usuario_id: 1, ruta: '/admin', esperado: true },
            { usuario_id: 2, ruta: '/admin', esperado: false },
            { usuario_id: 2, ruta: '/stock/ventas', esperado: true },
            { usuario_id: 3, ruta: '/stock/inventario', esperado: true }
        ];

        for (const caso of casosTest) {
            // Obtener rol del usuario
            const [userResult] = await connection.execute(
                'SELECT u.nombre, r.nombre as rol_nombre, u.rol_id FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ?',
                [caso.usuario_id]
            );

            if (userResult.length === 0) {
                console.log(`   ❌ Usuario ${caso.usuario_id} no encontrado`);
                continue;
            }

            const usuario = userResult[0];
            const rol_id = usuario.rol_id;

            // Verificar permiso
            const [permisoResult] = await connection.execute(`
                SELECT 
                    f.nombre,
                    COALESCE(prf.puede_acceder, 0) as tiene_permiso
                FROM funcionalidades f
                LEFT JOIN permisos_rol_funcionalidad prf ON f.id = prf.funcionalidad_id AND prf.rol_id = ?
                WHERE f.ruta = ?
            `, [rol_id, caso.ruta]);

            let resultado;
            if (permisoResult.length === 0) {
                resultado = true; // Ruta sin restricciones
            } else {
                resultado = permisoResult[0].tiene_permiso === 1;
            }

            const estado = resultado === caso.esperado ? '✅ CORRECTO' : '❌ ERROR';
            const simbolo = resultado ? '🟢' : '🔴';
            
            console.log(`   ${estado} ${usuario.nombre} (${usuario.rol_nombre}) → ${caso.ruta} ${simbolo}`);
        }

        console.log('\n🎉 Prueba completada!\n');
        
        await connection.end();

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    }
};

// Ejecutar prueba si se llama directamente
if (require.main === module) {
    testPermissions();
}

module.exports = { testPermissions };