// src/hooks/useFuncionalidades.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useFuncionalidades() {
    const { data: session } = useSession();
    const [funcionalidades, setFuncionalidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (session?.user?.token) {
            obtenerFuncionalidades();
        }
    }, [session]);

    const obtenerFuncionalidades = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Construir URL con parámetro para filtrar por rol si hay sesión
            const url = session?.user?.token 
                ? '/api/funcionalidades?filtrar_por_rol=true'
                : '/api/funcionalidades';
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Agregar token si está disponible
            if (session?.user?.token) {
                headers['Authorization'] = `Bearer ${session.user.token}`;
            }
            
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (data.success) {
                // Los datos pueden venir anidados desde el procedimiento almacenado
                const funcionalidadesData = Array.isArray(data.data) ? data.data : data.data[0];
                setFuncionalidades(funcionalidadesData);
            } else {
                setError(data.message || 'Error al obtener funcionalidades');
            }
        } catch (error) {
            console.error('Error obteniendo funcionalidades:', error);
            setError('Error de conexión al obtener funcionalidades');
        } finally {
            setLoading(false);
        }
    };

    // Función para mapear funcionalidades a elementos de menú
    const mapearAMenuItems = () => {
        if (!Array.isArray(funcionalidades)) {
            return [];
        }
        
        return funcionalidades.map(func => {
            const nombre = func.nombre.toLowerCase();
            
            // Usar directamente los datos de la base de datos
            const menuItem = {
                id: func.id,
                label: func.nombre.charAt(0).toUpperCase() + func.nombre.slice(1).toLowerCase(),
                path: func.ruta, // Directamente de la BD
                icon: func.icono, // Directamente de la BD
                descripcion: func.descripcion,
                puede_acceder: func.puede_acceder
            };

            // Solo agregar children para funcionalidades específicas (esto se puede hacer dinámico después si necesitas)
            if (nombre === 'presupuesto') {
                menuItem.children = [
                    { label: 'Listado de presupuestos', path: '/stock/presupuestos' },
                    { label: 'Crear Presupuesto', path: '/stock/presupuestos/crearpresupuesto' }
                ];
            } else if (nombre === 'comercio') {
                menuItem.children = [
                    { label: 'Ventas', path: '/stock/ventas' },
                    { label: 'Crear Venta', path: '/stock/ventas/crearventa' }
                ];
            } else if (nombre === 'administracion') {
                menuItem.children = [
                    { label: 'Usuarios', path: '/admin/usuarios' }
                ];
            }

            return menuItem;
        });
    };

    return { 
        funcionalidades, 
        loading, 
        error, 
        obtenerFuncionalidades,
        mapearAMenuItems
    };
}