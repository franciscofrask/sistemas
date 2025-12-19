// src/services/proveedores.js

// Función para listar proveedores
export async function service_ListarProveedores(_db, incluir_inactivos = 0) {
    console.log('Listando proveedores:', { incluir_inactivos });
    
    try {
        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_listar_proveedores(?)',
            [incluir_inactivos ? 1 : 0]
        );

        console.log('Resultado del SP listar proveedores:', result);
        
        // El resultado viene en result[0] cuando es un procedimiento almacenado
        return result[0] || [];

    } catch (err) {
        console.error('Error en service_ListarProveedores:', err);
        throw new Error('Error listando proveedores: ' + err.message);
    }
}

// Función para crear un proveedor
export async function service_CrearProveedor(_db, datosProveedor) {
    console.log('Creando proveedor:', datosProveedor);
    
    try {
        const { razon_social, cuit, email, telefono, direccion } = datosProveedor;

        // Validaciones básicas
        if (!razon_social || razon_social.trim() === '') {
            throw new Error('La razón social es requerida');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_crear_proveedor(?, ?, ?, ?, ?)',
            [
                razon_social.trim(),
                cuit && cuit.trim() !== '' ? cuit.trim() : null,
                email && email.trim() !== '' ? email.trim() : null,
                telefono && telefono.trim() !== '' ? telefono.trim() : null,
                direccion && direccion.trim() !== '' ? direccion.trim() : null
            ]
        );

        console.log('Resultado del SP crear proveedor:', result);
        
        // El SP devuelve el ID del proveedor creado
        const proveedorId = result[0]?.[0]?.proveedor_id;
        
        return {
            success: true,
            proveedor_id: proveedorId,
            message: 'Proveedor creado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_CrearProveedor:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('razón social es requerida')) {
            throw new Error('La razón social es requerida');
        }
        
        if (err.message.includes('Ya existe un proveedor con ese CUIT')) {
            throw new Error('Ya existe un proveedor con ese CUIT');
        }
        
        // Error genérico
        throw new Error('Error creando proveedor: ' + err.message);
    }
}

// Función para editar un proveedor
export async function service_EditarProveedor(_db, proveedorId, datosProveedor) {
    console.log('Editando proveedor:', { proveedorId, datosProveedor });
    
    try {
        const { razon_social, cuit, email, telefono, direccion, activo } = datosProveedor;

        // Validaciones básicas
        if (!proveedorId) {
            throw new Error('El ID del proveedor es requerido');
        }

        if (!razon_social || razon_social.trim() === '') {
            throw new Error('La razón social es requerida');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_editar_proveedor(?, ?, ?, ?, ?, ?, ?)',
            [
                proveedorId,
                razon_social.trim(),
                cuit && cuit.trim() !== '' ? cuit.trim() : null,
                email && email.trim() !== '' ? email.trim() : null,
                telefono && telefono.trim() !== '' ? telefono.trim() : null,
                direccion && direccion.trim() !== '' ? direccion.trim() : null,
                activo !== undefined ? (activo ? 1 : 0) : 1
            ]
        );

        console.log('Resultado del SP editar proveedor:', result);
        
        return {
            success: true,
            message: 'Proveedor actualizado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_EditarProveedor:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('proveedor_id es requerido')) {
            throw new Error('El ID del proveedor es requerido');
        }
        
        if (err.message.includes('El proveedor no existe o está borrado')) {
            throw new Error('El proveedor no existe o está borrado');
        }
        
        if (err.message.includes('razón social es requerida')) {
            throw new Error('La razón social es requerida');
        }
        
        if (err.message.includes('Ya existe otro proveedor con ese CUIT')) {
            throw new Error('Ya existe otro proveedor con ese CUIT');
        }
        
        // Error genérico
        throw new Error('Error actualizando proveedor: ' + err.message);
    }
}

// Función para borrar un proveedor (borrado lógico)
export async function service_BorrarProveedor(_db, proveedorId) {
    console.log('Borrando proveedor:', { proveedorId });
    
    try {
        // Validaciones básicas
        if (!proveedorId) {
            throw new Error('El ID del proveedor es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_borrar_proveedor_logico(?)',
            [proveedorId]
        );

        console.log('Resultado del SP borrar proveedor:', result);
        
        return {
            success: true,
            message: 'Proveedor eliminado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_BorrarProveedor:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('El proveedor no existe o ya está borrado')) {
            throw new Error('El proveedor no existe o ya está borrado');
        }
        
        if (err.message.includes('el proveedor tiene compras asociadas')) {
            throw new Error('No se puede eliminar: el proveedor tiene compras asociadas');
        }
        
        // Error genérico
        throw new Error('Error eliminando proveedor: ' + err.message);
    }
}

// Función para obtener un proveedor específico
export async function service_ObtenerProveedor(_db, proveedorId) {
    console.log('Obteniendo proveedor:', { proveedorId });
    
    try {
        // Validaciones básicas
        if (!proveedorId) {
            throw new Error('El ID del proveedor es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_get_proveedor(?)',
            [proveedorId]
        );

        console.log('Resultado del SP obtener proveedor:', result);
        
        // Verificar si se encontró el proveedor
        if (!result[0] || result[0].length === 0) {
            throw new Error('Proveedor no encontrado');
        }

        // El resultado viene en result[0][0] para un solo registro
        const proveedor = result[0][0];
        
        return {
            success: true,
            data: proveedor,
            message: 'Proveedor obtenido exitosamente'
        };

    } catch (err) {
        console.error('Error en service_ObtenerProveedor:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('Proveedor no encontrado')) {
            throw new Error('Proveedor no encontrado');
        }
        
        if (err.message.includes('ID del proveedor es requerido')) {
            throw new Error('El ID del proveedor es requerido');
        }
        
        // Error genérico
        throw new Error('Error obteniendo proveedor: ' + err.message);
    }
}