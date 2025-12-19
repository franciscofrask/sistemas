// src/services/almacenes.js

export async function service_ListarAlmacenes(_db, solo_activos = 1) {
    try {
        // Usar el procedimiento almacenado para obtener la lista de almacenes
        // solo_activos: 1 para solo activos, 0 para todos
        const [rows] = await _db.execute('CALL sp_listar_almacenes(?)', [solo_activos]);
        return rows[0]; // Los procedimientos devuelven el resultado en el primer índice
    } catch (err) {
        console.error('Error en service_ListarAlmacenes:', err);
        throw new Error('Error obteniendo lista de almacenes');
    }
}

export async function service_ObtenerAlmacenPorId(_db, _id) {
    try {
        const [rows] = await _db.execute(
            'SELECT * FROM almacenes WHERE id = ?',
            [_id]
        );
        return rows[0] || null;
    } catch (err) {
        console.error('Error en service_ObtenerAlmacenPorId:', err);
        throw new Error('Error obteniendo almacén por ID');
    }
}

// Función para crear un almacén
export async function service_CrearAlmacen(_db, datosAlmacen) {
    console.log('Creando almacén:', datosAlmacen);
    
    try {
        const { nombre, codigo, direccion, descripcion } = datosAlmacen;

        // Validaciones básicas
        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre del almacén es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_crear_almacen(?, ?, ?, ?)',
            [
                nombre.trim(),
                codigo && codigo.trim() !== '' ? codigo.trim() : null,
                direccion && direccion.trim() !== '' ? direccion.trim() : null,
                descripcion && descripcion.trim() !== '' ? descripcion.trim() : null
            ]
        );

        console.log('Resultado del SP crear almacén:', result);
        
        // El SP devuelve el ID del almacén creado
        const almacenId = result[0]?.[0]?.almacen_id;
        
        return {
            success: true,
            almacen_id: almacenId,
            message: 'Almacén creado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_CrearAlmacen:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('nombre del almacén es requerido')) {
            throw new Error('El nombre del almacén es requerido');
        }
        
        if (err.message.includes('Ya existe un almacén con ese nombre')) {
            throw new Error('Ya existe un almacén con ese nombre');
        }
        
        // Error genérico
        throw new Error('Error creando almacén: ' + err.message);
    }
}

// Función para editar un almacén
export async function service_EditarAlmacen(_db, almacenId, datosAlmacen) {
    console.log('Editando almacén:', almacenId, datosAlmacen);
    
    try {
        const { nombre, codigo, direccion, descripcion, activo } = datosAlmacen;

        // Validaciones básicas
        if (!almacenId) {
            throw new Error('ID de almacén es requerido');
        }

        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre del almacén es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_editar_almacen(?, ?, ?, ?, ?, ?)',
            [
                almacenId,
                nombre.trim(),
                codigo && codigo.trim() !== '' ? codigo.trim() : null,
                direccion && direccion.trim() !== '' ? direccion.trim() : null,
                descripcion && descripcion.trim() !== '' ? descripcion.trim() : null,
                activo !== undefined ? (activo ? 1 : 0) : 1
            ]
        );

        console.log('Resultado del SP editar almacén:', result);
        
        return {
            success: true,
            message: 'Almacén actualizado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_EditarAlmacen:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('almacen_id es requerido')) {
            throw new Error('ID de almacén es requerido');
        }
        
        if (err.message.includes('El almacén no existe o está borrado')) {
            throw new Error('El almacén no existe o está borrado');
        }
        
        if (err.message.includes('El nombre del almacén es requerido')) {
            throw new Error('El nombre del almacén es requerido');
        }
        
        if (err.message.includes('Ya existe otro almacén con ese nombre')) {
            throw new Error('Ya existe otro almacén con ese nombre');
        }
        
        // Error genérico
        throw new Error('Error actualizando almacén: ' + err.message);
    }
}

// Función para borrar un almacén (lógico)
export async function service_BorrarAlmacen(_db, almacenId) {
    console.log('Borrando almacén:', almacenId);
    
    try {
        // Validaciones básicas
        if (!almacenId) {
            throw new Error('ID de almacén es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_borrar_almacen_logico(?)',
            [almacenId]
        );

        console.log('Resultado del SP borrar almacén:', result);
        
        return {
            success: true,
            message: 'Almacén borrado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_BorrarAlmacen:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('El almacén no existe o ya está borrado')) {
            throw new Error('El almacén no existe o ya está borrado');
        }
        
        if (err.message.includes('el almacén tiene movimientos de stock')) {
            throw new Error('No se puede borrar: el almacén tiene movimientos de stock');
        }
        
        if (err.message.includes('el almacén tiene ventas asociadas')) {
            throw new Error('No se puede borrar: el almacén tiene ventas asociadas');
        }
        
        if (err.message.includes('el almacén tiene compras asociadas')) {
            throw new Error('No se puede borrar: el almacén tiene compras asociadas');
        }
        
        if (err.message.includes('el almacén tiene ajustes asociados')) {
            throw new Error('No se puede borrar: el almacén tiene ajustes asociados');
        }
        
        if (err.message.includes('el almacén tiene transferencias asociadas')) {
            throw new Error('No se puede borrar: el almacén tiene transferencias asociadas');
        }
        
        // Error genérico
        throw new Error('Error borrando almacén: ' + err.message);
    }
}