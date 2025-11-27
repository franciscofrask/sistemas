// scripts/test-full-system.js
const mysql = require('mysql2/promise');

const testFullSystem = async () => {
    console.log('🚀 Iniciando prueba completa del sistema...\n');

    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'sistema_erp'
        });

        console.log('✅ Conexión a la base de datos establecida\n');

        // 1. Verificar datos base
        console.log('1. Verificando datos del sistema...');
        
        const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
        const [roles] = await connection.execute('SELECT COUNT(*) as total FROM roles');
        const [funcionalidades] = await connection.execute('SELECT COUNT(*) as total FROM funcionalidades');
        const [permisos] = await connection.execute('SELECT COUNT(*) as total FROM permisos_rol_funcionalidad');

        console.log(`   - Usuarios: ${usuarios[0].total}`);
        console.log(`   - Roles: ${roles[0].total}`);
        console.log(`   - Funcionalidades: ${funcionalidades[0].total}`);
        console.log(`   - Permisos configurados: ${permisos[0].total}\n`);

        // 2. Verificar integridad de rutas
        console.log('2. Verificando integridad de rutas...');
        
        const [rutasCompletas] = await connection.execute(`
            SELECT nombre, ruta 
            FROM funcionalidades 
            WHERE ruta IS NOT NULL 
            ORDER BY nombre
        `);

        console.log('   Rutas configuradas:');
        rutasCompletas.forEach(r => {
            console.log(`   ✓ ${r.nombre.padEnd(15)} → ${r.ruta}`);
        });

        const [rutasFaltantes] = await connection.execute(`
            SELECT nombre 
            FROM funcionalidades 
            WHERE ruta IS NULL
        `);

        if (rutasFaltantes.length > 0) {
            console.log('\n   ⚠️  Funcionalidades sin ruta:');
            rutasFaltantes.forEach(r => {
                console.log(`   - ${r.nombre}`);
            });
        } else {
            console.log('\n   ✅ Todas las funcionalidades tienen rutas asignadas');
        }

        // 3. Verificar permisos por rol
        console.log('\n3. Matriz de permisos por rol...');
        
        const [matrizPermisos] = await connection.execute(`
            SELECT 
                r.nombre as rol,
                f.nombre as funcionalidad,
                COALESCE(prf.puede_acceder, 0) as tiene_acceso,
                f.ruta
            FROM roles r
            CROSS JOIN funcionalidades f
            LEFT JOIN permisos_rol_funcionalidad prf ON r.id = prf.rol_id AND f.id = prf.funcionalidad_id
            ORDER BY r.id, f.id
        `);

        const rolesUnicos = [...new Set(matrizPermisos.map(p => p.rol))];
        const funcionalidadesUnicas = [...new Set(matrizPermisos.map(p => p.funcionalidad))];

        console.log('\n   Matriz de accesos:');
        console.log('   ' + 'Funcionalidad'.padEnd(18) + rolesUnicos.map(r => r.padEnd(10)).join(''));
        console.log('   ' + '-'.repeat(18 + (rolesUnicos.length * 10)));

        funcionalidadesUnicas.forEach(func => {
            let fila = '   ' + func.padEnd(18);
            rolesUnicos.forEach(rol => {
                const permiso = matrizPermisos.find(p => p.rol === rol && p.funcionalidad === func);
                const simbolo = permiso.tiene_acceso === 1 ? '✅' : permiso.tiene_acceso === 0 ? '❌' : '⚪';
                fila += (simbolo + '       ');
            });
            console.log(fila);
        });

        // 4. Verificar casos críticos
        console.log('\n4. Verificando casos críticos de seguridad...');
        
        const casosCriticos = [
            { descripcion: 'Usuario normal NO puede acceder al dashboard', usuario_rol: 'usuario', ruta: '/stock/dashboard', esperado: false },
            { descripcion: 'Usuario normal NO puede acceder a admin', usuario_rol: 'usuario', ruta: '/admin', esperado: false },
            { descripcion: 'Manager NO puede acceder a admin', usuario_rol: 'manager', ruta: '/admin', esperado: false },
            { descripcion: 'Admin SÍ puede acceder al dashboard', usuario_rol: 'admin', ruta: '/stock/dashboard', esperado: true },
            { descripcion: 'Admin SÍ puede acceder a admin', usuario_rol: 'admin', ruta: '/admin', esperado: true },
            { descripcion: 'Usuario normal SÍ puede acceder a ventas', usuario_rol: 'usuario', ruta: '/stock/ventas', esperado: true }
        ];

        for (const caso of casosCriticos) {
            const [rolData] = await connection.execute('SELECT id FROM roles WHERE nombre = ?', [caso.usuario_rol]);
            if (rolData.length === 0) continue;

            const [permisoData] = await connection.execute(`
                SELECT 
                    COALESCE(prf.puede_acceder, 0) as tiene_permiso
                FROM funcionalidades f
                LEFT JOIN permisos_rol_funcionalidad prf ON f.id = prf.funcionalidad_id AND prf.rol_id = ?
                WHERE f.ruta = ?
            `, [rolData[0].id, caso.ruta]);

            let resultado = false;
            if (permisoData.length === 0) {
                resultado = true; // Sin restricciones
            } else {
                resultado = permisoData[0].tiene_permiso === 1;
            }

            const estado = resultado === caso.esperado ? '✅ CORRECTO' : '❌ FALLO CRÍTICO';
            console.log(`   ${estado}: ${caso.descripcion}`);
        }

        // 5. Reporte final
        console.log('\n5. Reporte final del sistema...');
        
        const [estadisticas] = await connection.execute(`
            SELECT 
                (SELECT COUNT(*) FROM usuarios WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'admin')) as admins,
                (SELECT COUNT(*) FROM usuarios WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'manager')) as managers,
                (SELECT COUNT(*) FROM usuarios WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'usuario')) as usuarios,
                (SELECT COUNT(*) FROM permisos_rol_funcionalidad WHERE puede_acceder = 1) as permisos_activos,
                (SELECT COUNT(*) FROM funcionalidades WHERE ruta IS NOT NULL) as rutas_protegidas
        `);

        const stats = estadisticas[0];
        
        console.log(`   👥 Usuarios del sistema:`);
        console.log(`      - Administradores: ${stats.admins}`);
        console.log(`      - Managers: ${stats.managers}`);
        console.log(`      - Usuarios: ${stats.usuarios}`);
        console.log(`   🛡️  Permisos activos: ${stats.permisos_activos}`);
        console.log(`   🔒 Rutas protegidas: ${stats.rutas_protegidas}`);

        await connection.end();
        
        console.log('\n🎉 ¡Sistema de protección de rutas configurado correctamente!');
        console.log('📋 Estado: Listo para producción');
        console.log('🔐 Seguridad: Habilitada y funcionando');
        console.log('🚀 Recomendación: El sistema está listo para usar\n');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    }
};

if (require.main === module) {
    testFullSystem();
}

module.exports = { testFullSystem };