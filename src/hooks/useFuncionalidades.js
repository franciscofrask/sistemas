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
                : '';
            
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
        
        // Definir orden deseado
        const ordenDeseado = [
            'ventas', 'compras', 'productos', 'presupuesto', 'presupuestos', 
            'proveedores', 'almacenes', 'clientes', 'dashboard', 'administracion'
        ];
        
        const menuItems = funcionalidades.map(func => {
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
            } else if (nombre === 'comercio' || nombre === 'ventas') {
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

        // Ordenar según el orden deseado
        return menuItems.sort((a, b) => {
            const nombreA = a.label.toLowerCase();
            const nombreB = b.label.toLowerCase();
            
            const indexA = ordenDeseado.findIndex(item => 
                nombreA.includes(item) || item.includes(nombreA)
            );
            const indexB = ordenDeseado.findIndex(item => 
                nombreB.includes(item) || item.includes(nombreB)
            );
            
            // Si ambos están en la lista, ordenar por índice
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            
            // Si solo uno está en la lista, ese va primero
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            
            // Si ninguno está en la lista, mantener orden alfabético
            return nombreA.localeCompare(nombreB);
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