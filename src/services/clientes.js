// src/services/clientes.js

// Función para listar clientes
export async function service_ListarClientes(_db, incluir_inactivos = 0) {
    console.log('Listando clientes:', { incluir_inactivos });
    
    try {
        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_listar_clientes(?)',
            [incluir_inactivos ? 1 : 0]
        );

        console.log('Resultado del SP listar clientes:', result);
        
        // El resultado viene en result[0] cuando es un procedimiento almacenado
        return result[0] || [];

    } catch (err) {
        console.error('Error en service_ListarClientes:', err);
        throw new Error('Error listando clientes: ' + err.message);
    }
}

// Función para crear un cliente
export async function service_CrearCliente(_db, datosCliente) {
    console.log('Creando cliente:', datosCliente);
    
    try {
        const { nombre, cuit, email, telefono, direccion } = datosCliente;

        // Validaciones básicas
        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre del cliente es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_crear_cliente(?, ?, ?, ?, ?)',
            [
                nombre.trim(),
                cuit && cuit.trim() !== '' ? cuit.trim() : null,
                email && email.trim() !== '' ? email.trim() : null,
                telefono && telefono.trim() !== '' ? telefono.trim() : null,
                direccion && direccion.trim() !== '' ? direccion.trim() : null
            ]
        );

        console.log('Resultado del SP crear cliente:', result);
        
        // El SP devuelve el ID del cliente creado
        const clienteId = result[0]?.[0]?.cliente_id;
        
        return {
            success: true,
            cliente_id: clienteId,
            message: 'Cliente creado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_CrearCliente:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('nombre del cliente es requerido')) {
            throw new Error('El nombre del cliente es requerido');
        }
        
        if (err.message.includes('Ya existe un cliente con ese CUIT')) {
            throw new Error('Ya existe un cliente con ese CUIT');
        }
        
        // Error genérico
        throw new Error('Error creando cliente: ' + err.message);
    }
}

// Función para editar un cliente
export async function service_EditarCliente(_db, clienteId, datosCliente) {
    console.log('Editando cliente:', { clienteId, datosCliente });
    
    try {
        const { nombre, cuit, email, telefono, direccion, activo } = datosCliente;

        // Validaciones básicas
        if (!clienteId) {
            throw new Error('El ID del cliente es requerido');
        }

        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre del cliente es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_editar_cliente(?, ?, ?, ?, ?, ?, ?)',
            [
                clienteId,
                nombre.trim(),
                cuit && cuit.trim() !== '' ? cuit.trim() : null,
                email && email.trim() !== '' ? email.trim() : null,
                telefono && telefono.trim() !== '' ? telefono.trim() : null,
                direccion && direccion.trim() !== '' ? direccion.trim() : null,
                activo !== undefined ? (activo ? 1 : 0) : 1
            ]
        );

        console.log('Resultado del SP editar cliente:', result);
        
        return {
            success: true,
            message: 'Cliente actualizado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_EditarCliente:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('cliente_id es requerido')) {
            throw new Error('El ID del cliente es requerido');
        }
        
        if (err.message.includes('El cliente no existe o está borrado')) {
            throw new Error('El cliente no existe o está borrado');
        }
        
        if (err.message.includes('nombre del cliente es requerido')) {
            throw new Error('El nombre del cliente es requerido');
        }
        
        if (err.message.includes('Ya existe otro cliente con ese CUIT')) {
            throw new Error('Ya existe otro cliente con ese CUIT');
        }
        
        // Error genérico
        throw new Error('Error actualizando cliente: ' + err.message);
    }
}

// Función para borrar un cliente (borrado lógico)
export async function service_BorrarCliente(_db, clienteId) {
    console.log('Borrando cliente:', { clienteId });
    
    try {
        // Validaciones básicas
        if (!clienteId) {
            throw new Error('El ID del cliente es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_borrar_cliente_logico(?)',
            [clienteId]
        );

        console.log('Resultado del SP borrar cliente:', result);
        
        return {
            success: true,
            message: 'Cliente eliminado exitosamente'
        };

    } catch (err) {
        console.error('Error en service_BorrarCliente:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('El cliente no existe o ya está borrado')) {
            throw new Error('El cliente no existe o ya está borrado');
        }
        
        if (err.message.includes('el cliente tiene ventas asociadas')) {
            throw new Error('No se puede eliminar: el cliente tiene ventas asociadas');
        }
        
        if (err.message.includes('el cliente tiene presupuestos asociados')) {
            throw new Error('No se puede eliminar: el cliente tiene presupuestos asociados');
        }
        
        // Error genérico
        throw new Error('Error eliminando cliente: ' + err.message);
    }
}

// Función para obtener un cliente específico
export async function service_ObtenerCliente(_db, clienteId) {
    console.log('Obteniendo cliente:', { clienteId });
    
    try {
        // Validaciones básicas
        if (!clienteId) {
            throw new Error('El ID del cliente es requerido');
        }

        // Llamar al procedimiento almacenado
        const [result] = await _db.execute(
            'CALL sp_get_cliente(?)',
            [clienteId]
        );

        console.log('Resultado del SP obtener cliente:', result);
        
        // Verificar si se encontró el cliente
        if (!result[0] || result[0].length === 0) {
            throw new Error('Cliente no encontrado');
        }

        // El resultado viene en result[0][0] para un solo registro
        const cliente = result[0][0];
        
        return {
            success: true,
            data: cliente,
            message: 'Cliente obtenido exitosamente'
        };

    } catch (err) {
        console.error('Error en service_ObtenerCliente:', err);
        
        // Manejar errores específicos del negocio
        if (err.message.includes('Cliente no encontrado')) {
            throw new Error('Cliente no encontrado');
        }
        
        if (err.message.includes('ID del cliente es requerido')) {
            throw new Error('El ID del cliente es requerido');
        }
        
        // Error genérico
        throw new Error('Error obteniendo cliente: ' + err.message);
    }
}