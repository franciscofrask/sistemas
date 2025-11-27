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
                setFuncionalidades(data.data);
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
        return funcionalidades.map(func => {
            const nombre = func.nombre.toLowerCase();
            
            // Mapeo de rutas según las funcionalidades existentes
            const rutaMap = {
                'dashboard': '/stock/dashboard',
                'inventario': '/stock/inventario',
                'almacenes': '/stock/almacenes', 
                'proveedores': '/stock/proveedores',
                'clientes': '/stock/clientes',
                'presupuesto': '/stock/presupuestos',
                'comercio': '/stock/ventas',
                'administracion': '/admin/usuarios'
            };

            // Mapeo de iconos
            const iconoMap = {
                'dashboard': 'IconLayoutDashboard',
                'inventario': 'IconStack',
                'almacenes': 'IconBuildingWarehouse',
                'proveedores': 'IconTruck',
                'clientes': 'IconUsers',
                'presupuesto': 'IconFileText',
                'comercio': 'IconShoppingCart',
                'administracion': 'IconShield'
            };

            return {
                id: func.id,
                label: func.nombre.charAt(0).toUpperCase() + func.nombre.slice(1).toLowerCase(),
                path: rutaMap[nombre],
                icon: iconoMap[nombre],
                descripcion: func.descripcion,
                puede_acceder: func.puede_acceder,
                children: nombre === 'presupuesto' ? [
                    { label: 'Listado de presupuestos', path: '/stock/presupuestos' },
                    { label: 'Crear Presupuesto', path: '/stock/presupuestos/crearpresupuesto' }
                ] : nombre === 'comercio' ? [
                    { label: 'Ventas', path: '/stock/ventas' },
                    { label: 'Crear Venta', path: '/stock/ventas/crearventa' }
                ] : nombre === 'administracion' ? [
                    { label: 'Usuarios', path: '/admin/usuarios' }
                ] : undefined
            };
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