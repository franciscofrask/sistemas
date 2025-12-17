import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Grid,
  Title,
  Text,
  Badge,
  Card,
  Group,
  Table,
  TextInput,
  Select,
  ActionIcon,
  Loader,
  Center,
  Stack,
  Divider,
  Box,
  Button,
  Tooltip,
  Menu,
  Modal
} from '@mantine/core';
import { IconSearch, IconCalendar, IconPackage, IconBarcode, IconPlus, IconSettings, IconEdit, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

/**
 * ProductDetailDrawer - Componente drawer para mostrar detalles del producto
 * 
 * DESCRIPCIÓN:
 * Drawer que muestra información detallada de un producto incluyendo stock por almacén,
 * lotes (para productos LOTE) y series (para productos SERIE). Incluye funcionalidades
 * de búsqueda y filtrado para navegar eficientemente por los datos.
 * 
 * FUNCIONALIDADES:
 * - Vista adaptativa según tipo de control de stock (UNIDAD/LOTE/SERIE)
 * - Información general del producto y almacén
 * - Tabla de lotes con fechas de vencimiento (productos LOTE)
 * - Tabla de series con números únicos (productos SERIE)
 * - Buscador para filtrar lotes/series
 * - Indicadores visuales de stock y fechas
 * - Manejo de estados de carga
 * 
 * PROPS REQUERIDAS:
 * @param {boolean} opened - Estado del drawer (abierto/cerrado)
 * @param {function} onClose - Función para cerrar el drawer
 * @param {object|null} producto - Objeto del producto seleccionado
 * @param {string|number} almacenId - ID del almacén actual seleccionado
 */
const ProductDetailDrawer = ({
  opened,
  onClose,
  producto,
  almacenId
}) => {
  const [loading, setLoading] = useState(false);
  const [detalleData, setDetalleData] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(''); // Para lotes: 'vencidos', 'por_vencer', 'vigentes'
  
  // Estados para modal de agregar atributo
  const [modalAtributoAbierto, setModalAtributoAbierto] = useState(false);
  const [serieSeleccionada, setSerieSeleccionada] = useState(null);
  const [cargandoAtributo, setCargandoAtributo] = useState(false);
  const [formAtributo, setFormAtributo] = useState({
    clave: '',
    valor: ''
  });
  
  // Estados para atributos de series
  const [atributosSeries, setAtributosSeries] = useState({});
  const [cargandoAtributos, setCargandoAtributos] = useState(false);

  // Estados para modal de editar atributos
  const [modalEditarAtributos, setModalEditarAtributos] = useState(false);
  const [atributosEdicion, setAtributosEdicion] = useState([]);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  // Estados para modal de confirmación de borrado masivo
  const [modalBorradoMasivo, setModalBorradoMasivo] = useState(false);
  const [cargandoBorradoMasivo, setCargandoBorradoMasivo] = useState(false);

  // Estados para modal de edición de lotes
  const [modalEditarLoteAbierto, setModalEditarLoteAbierto] = useState(false);
  const [loteParaEditar, setLoteParaEditar] = useState(null);
  const [cargandoEdicionLote, setCargandoEdicionLote] = useState(false);
  const [formLote, setFormLote] = useState({
    codigoLote: '',
    fechaVenc: ''
  });

  // Estados para modal de edición de series
  const [modalEditarSerieAbierto, setModalEditarSerieAbierto] = useState(false);
  const [serieParaEditar, setSerieParaEditar] = useState(null);
  const [cargandoEdicionSerie, setCargandoEdicionSerie] = useState(false);
  const [formSerie, setFormSerie] = useState({
    numeroSerie: ''
  });

  // Cargar datos del producto cuando se abre el drawer
  useEffect(() => {
    if (opened && producto && almacenId) {
      cargarDetalleProducto();
      
    }
  }, [opened, producto, almacenId]);

  const cargarDetalleProducto = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/stock/productos/detalle-producto?producto_id=${producto.id}&almacen_id=${almacenId}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setDetalleData(result.data);
        
        // Si es producto tipo SERIE, cargar atributos
        if (producto.tipo_control_stock === 'SERIE' && result.data[2]) {
          await cargarAtributosSeries(result.data[2]);
        }
      } else {
        notifications.show({
          title: 'Error',
          message: 'No se pudo cargar el detalle del producto',
          color: 'red'
        });
      }
    } catch (error) {
      console.error('Error cargando detalle:', error);
      notifications.show({
        title: 'Error',
        message: 'Error de conexión al cargar detalle',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar atributos de todas las series
  const cargarAtributosSeries = async (series) => {
    setCargandoAtributos(true);
    const atributosMap = {};
    
    try {
      // Cargar atributos para cada serie en paralelo
      const promesasAtributos = series.map(async (serie) => {
        try {
          const response = await fetch(`/api/stock/series/listar-atributos?serie_id=${serie.serie_id}`);
          const result = await response.json();
          
          if (response.ok && result.success) {
            atributosMap[serie.serie_id] = result.data;
          } else {
            atributosMap[serie.serie_id] = [];
          }
        } catch (error) {
          console.error(`Error cargando atributos para serie ${serie.serie_id}:`, error);
          atributosMap[serie.serie_id] = [];
        }
      });
      
      await Promise.all(promesasAtributos);
      setAtributosSeries(atributosMap);
      
    } catch (error) {
      console.error('Error cargando atributos de series:', error);
    } finally {
      setCargandoAtributos(false);
    }
  };

  // Procesar datos según la estructura de respuesta
  const procesarDatos = () => {
    if (!detalleData || !Array.isArray(detalleData)) return null;
    
    return {
      producto: detalleData[0]?.[0] || null,
      lotes: detalleData[1] || [],
      series: detalleData[2] || []
    };
  };

  // Filtrar lotes según búsqueda y filtros
  const filtrarLotes = (lotes) => {
    let lotesFiltereds = lotes.filter(lote => 
      lote.lote_codigo?.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (filtroFecha === 'vencidos') {
      const hoy = new Date();
      lotesFiltereds = lotesFiltereds.filter(lote => 
        new Date(lote.fecha_vencimiento) < hoy
      );
    } else if (filtroFecha === 'por_vencer') {
      const hoy = new Date();
      const en30Dias = new Date();
      en30Dias.setDate(hoy.getDate() + 30);
      lotesFiltereds = lotesFiltereds.filter(lote => {
        const fechaVenc = new Date(lote.fecha_vencimiento);
        return fechaVenc >= hoy && fechaVenc <= en30Dias;
      });
    } else if (filtroFecha === 'vigentes') {
      const hoy = new Date();
      const en30Dias = new Date();
      en30Dias.setDate(hoy.getDate() + 30);
      lotesFiltereds = lotesFiltereds.filter(lote => 
        new Date(lote.fecha_vencimiento) > en30Dias
      );
    }

    return lotesFiltereds;
  };

  // Filtrar series según búsqueda
  const filtrarSeries = (series) => {
    return series.filter(serie => 
      serie.serie_numero?.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  // Obtener todas las claves de atributos únicas para crear columnas dinámicas
  const obtenerClavesAtributos = () => {
    const claves = new Set();
    Object.values(atributosSeries).forEach(atributos => {
      atributos.forEach(attr => claves.add(attr.clave));
    });
    return Array.from(claves).sort();
  };

  // Obtener valor de atributo específico para una serie
  const obtenerValorAtributo = (serieId, clave) => {
    const atributos = atributosSeries[serieId] || [];
    const atributo = atributos.find(attr => attr.clave === clave);
    return atributo ? atributo.valor : '-';
  };

  // Obtener color del badge según fecha de vencimiento
  const getColorFechaVencimiento = (fechaVencimiento) => {
    const hoy = new Date();
    const fecha = new Date(fechaVencimiento);
    const diferenciaDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) return 'red';      // Vencido
    if (diferenciaDias <= 30) return 'orange'; // Por vencer (30 días)
    return 'green';                            // Vigente
  };

  // Funciones para manejar atributos de serie
  const abrirModalAtributo = (serie) => {
    setSerieSeleccionada(serie);
    setFormAtributo({ clave: '', valor: '' });
    setModalAtributoAbierto(true);
  };

  const cerrarModalAtributo = () => {
    setModalAtributoAbierto(false);
    setSerieSeleccionada(null);
    setFormAtributo({ clave: '', valor: '' });
  };

  const manejarCambioFormAtributo = (campo, valor) => {
    setFormAtributo(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const guardarAtributo = async () => {
    if (!serieSeleccionada) return;
    
    // Validaciones
    if (!formAtributo.clave.trim()) {
      notifications.show({
        title: 'Error de validación',
        message: 'La clave del atributo es requerida',
        color: 'red'
      });
      return;
    }

    if (!formAtributo.valor.trim()) {
      notifications.show({
        title: 'Error de validación',
        message: 'El valor del atributo es requerido',
        color: 'red'
      });
      return;
    }

    setCargandoAtributo(true);

    try {
      const response = await fetch('/api/stock/series/atributos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serie_id: serieSeleccionada.serie_id,
          clave: formAtributo.clave.trim(),
          valor: formAtributo.valor.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Éxito',
          message: `Atributo agregado exitosamente a la serie ${serieSeleccionada.serie_numero}`,
          color: 'green'
        });
        
        cerrarModalAtributo();
        
        // Recargar atributos de las series para mostrar el nuevo atributo
        const datos = procesarDatos();
        if (datos && datos.series) {
          await cargarAtributosSeries(datos.series);
        }
        
      } else {
        throw new Error(data.message || 'Error al guardar el atributo');
      }

    } catch (error) {
      console.error('Error guardando atributo:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo guardar el atributo',
        color: 'red'
      });
    } finally {
      setCargandoAtributo(false);
    }
  };

  // Funciones para editar atributos
  const abrirModalEditarAtributos = (serie) => {
    setSerieSeleccionada(serie);
    
    // Obtener los atributos de la serie seleccionada
    const atributos = atributosSeries[serie.serie_id] || [];
    
    // Si no hay atributos, crear uno vacío para empezar
    if (atributos.length === 0) {
      setAtributosEdicion([{ clave: '', valor: '', esNuevo: true }]);
    } else {
      // Cargar atributos existentes para edición
      setAtributosEdicion(atributos.map(attr => ({
        clave: attr.clave,
        valor: attr.valor,
        esNuevo: false
      })));
    }
    
    setModalEditarAtributos(true);
  };

  const cerrarModalEditarAtributos = () => {
    setModalEditarAtributos(false);
    setSerieSeleccionada(null);
    setAtributosEdicion([]);
  };

  const actualizarAtributoEdicion = (index, campo, valor) => {
    setAtributosEdicion(prev => {
      const nuevo = [...prev];
      nuevo[index] = { ...nuevo[index], [campo]: valor };
      return nuevo;
    });
  };

  const agregarNuevoAtributoEdicion = () => {
    setAtributosEdicion(prev => [
      ...prev,
      { clave: '', valor: '', esNuevo: true }
    ]);
  };

  const eliminarAtributoEdicion = (index) => {
    setAtributosEdicion(prev => prev.filter((_, i) => i !== index));
  };

  const guardarAtributosEditados = async () => {
    if (!serieSeleccionada) return;
    
    // Validar que todos los atributos tengan clave y valor
    const atributosValidos = atributosEdicion.filter(attr => 
      attr.clave.trim() && attr.valor.trim()
    );
    
    if (atributosValidos.length === 0) {
      notifications.show({
        title: 'Error de validación',
        message: 'Debe agregar al menos un atributo con clave y valor',
        color: 'red'
      });
      return;
    }

    setCargandoEdicion(true);

    try {
      // Guardar todos los atributos válidos
      const promesasGuardado = atributosValidos.map(async (atributo) => {
        const response = await fetch('/api/stock/series/atributos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            serie_id: serieSeleccionada.serie_id,
            clave: atributo.clave.trim(),
            valor: atributo.valor.trim()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error guardando atributo ${atributo.clave}`);
        }

        return response.json();
      });

      await Promise.all(promesasGuardado);

      notifications.show({
        title: 'Éxito',
        message: `Atributos actualizados exitosamente para la serie ${serieSeleccionada.serie_numero}`,
        color: 'green'
      });
      
      cerrarModalEditarAtributos();
      
      // Recargar atributos de las series
      const datos = procesarDatos();
      if (datos && datos.series) {
        await cargarAtributosSeries(datos.series);
      }
      
    } catch (error) {
      console.error('Error guardando atributos editados:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudieron guardar los atributos',
        color: 'red'
      });
    } finally {
      setCargandoEdicion(false);
    }
  };

  // Función para borrar un atributo específico
  const borrarAtributo = async (serie, clave) => {
    try {
      const response = await fetch(`/api/stock/series/borrar-atributo?serie_id=${serie.serie_id}&clave=${encodeURIComponent(clave)}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Éxito',
          message: `Atributo "${clave}" eliminado exitosamente de la serie ${serie.serie_numero}`,
          color: 'green'
        });
        
        // Recargar atributos de las series
        const datos = procesarDatos();
        if (datos && datos.series) {
          await cargarAtributosSeries(datos.series);
        }
        
      } else {
        throw new Error(data.message || 'Error al borrar el atributo');
      }

    } catch (error) {
      console.error('Error borrando atributo:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo borrar el atributo',
        color: 'red'
      });
    }
  };

  // Función para confirmar borrado de todos los atributos
  const confirmarBorrarTodosAtributos = (serie) => {
    const atributos = atributosSeries[serie.serie_id] || [];
    
    if (atributos.length === 0) {
      notifications.show({
        title: 'Información',
        message: `La serie ${serie.serie_numero} no tiene atributos para eliminar`,
        color: 'blue'
      });
      return;
    }

    // Establecer la serie seleccionada y abrir modal de confirmación
    setSerieSeleccionada(serie);
    setModalBorradoMasivo(true);
  };

  // Función para ejecutar el borrado masivo de atributos
  const ejecutarBorradoMasivo = async () => {
    if (!serieSeleccionada) return;
    
    const atributos = atributosSeries[serieSeleccionada.serie_id] || [];
    
    if (atributos.length === 0) {
      setModalBorradoMasivo(false);
      return;
    }

    setCargandoBorradoMasivo(true);

    try {
      // Borrar todos los atributos en paralelo
      const promesasBorrado = atributos.map(async (atributo) => {
        const response = await fetch(`/api/stock/series/borrar-atributo?serie_id=${serieSeleccionada.serie_id}&clave=${encodeURIComponent(atributo.clave)}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error borrando atributo ${atributo.clave}`);
        }

        return response.json();
      });

      await Promise.all(promesasBorrado);

      notifications.show({
        title: 'Éxito',
        message: `Todos los atributos fueron eliminados exitosamente de la serie ${serieSeleccionada.serie_numero}`,
        color: 'green'
      });
      
      setModalBorradoMasivo(false);
      setSerieSeleccionada(null);
      
      // Recargar atributos de las series
      const datos = procesarDatos();
      if (datos && datos.series) {
        await cargarAtributosSeries(datos.series);
      }
      
    } catch (error) {
      console.error('Error ejecutando borrado masivo:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudieron eliminar todos los atributos',
        color: 'red'
      });
    } finally {
      setCargandoBorradoMasivo(false);
    }
  };

  const cancelarBorradoMasivo = () => {
    setModalBorradoMasivo(false);
    setSerieSeleccionada(null);
  };

  // Funciones para manejar edición de lotes
  const abrirModalEditarLote = (lote) => {
    setLoteParaEditar(lote);
    setFormLote({
      codigoLote: lote.lote_codigo,
      fechaVenc: lote.fecha_vencimiento.split('T')[0] // Convertir fecha a formato YYYY-MM-DD
    });
    setModalEditarLoteAbierto(true);
  };

  const cerrarModalEditarLote = () => {
    setModalEditarLoteAbierto(false);
    setLoteParaEditar(null);
    setFormLote({
      codigoLote: '',
      fechaVenc: ''
    });
  };

  const manejarCambioFormLote = (campo, valor) => {
    setFormLote(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const guardarEdicionLote = async () => {
    if (!loteParaEditar) return;

    // Validaciones
    if (!formLote.codigoLote.trim()) {
      notifications.show({
        title: 'Error de validación',
        message: 'El código del lote es requerido',
        color: 'red'
      });
      return;
    }

    if (!formLote.fechaVenc) {
      notifications.show({
        title: 'Error de validación',
        message: 'La fecha de vencimiento es requerida',
        color: 'red'
      });
      return;
    }

    setCargandoEdicionLote(true);

    try {
      const response = await fetch('/api/stock/lotes/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loteId: loteParaEditar.lote_id,
          codigoLote: formLote.codigoLote.trim(),
          fechaVenc: formLote.fechaVenc
        })
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Éxito',
          message: `Lote editado exitosamente`,
          color: 'green'
        });
        
        cerrarModalEditarLote();
        
        // Recargar datos del producto para mostrar los cambios
        await cargarDetalleProducto();
        
      } else {
        throw new Error(data.message || 'Error al editar el lote');
      }

    } catch (error) {
      console.error('Error editando lote:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo editar el lote',
        color: 'red'
      });
    } finally {
      setCargandoEdicionLote(false);
    }
  };

  // Funciones para manejar edición de series
  const abrirModalEditarSerie = (serie) => {
    setSerieParaEditar(serie);
    setFormSerie({
      numeroSerie: serie.serie_numero
    });
    setModalEditarSerieAbierto(true);
  };

  const cerrarModalEditarSerie = () => {
    setModalEditarSerieAbierto(false);
    setSerieParaEditar(null);
    setFormSerie({
      numeroSerie: ''
    });
  };

  const manejarCambioFormSerie = (campo, valor) => {
    setFormSerie(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const guardarEdicionSerie = async () => {
    if (!serieParaEditar) return;

    // Validaciones
    if (!formSerie.numeroSerie.trim()) {
      notifications.show({
        title: 'Error de validación',
        message: 'El número de serie es requerido',
        color: 'red'
      });
      return;
    }

    setCargandoEdicionSerie(true);

    try {
      const response = await fetch('/api/stock/series/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serieId: serieParaEditar.serie_id,
          numeroSerie: formSerie.numeroSerie.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Éxito',
          message: `Serie editada exitosamente`,
          color: 'green'
        });
        
        cerrarModalEditarSerie();
        
        // Recargar datos del producto para mostrar los cambios
        await cargarDetalleProducto();
        
      } else {
        throw new Error(data.message || 'Error al editar la serie');
      }

    } catch (error) {
      console.error('Error editando serie:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo editar la serie',
        color: 'red'
      });
    } finally {
      setCargandoEdicionSerie(false);
    }
  };

  const datos = procesarDatos();

  if (!producto) return null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={`Detalle: ${producto.nombre}`}
      size="lg"
      position="right"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      {loading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : datos?.producto ? (
        <Stack gap="md">
          {/* Información del producto */}
          <Card withBorder p="md">
            <Group justify="space-between" mb="sm">
              <Title order={3}>{datos.producto.producto_nombre}</Title>
              <Badge color="blue" size="lg">
                {producto.tipo_control_stock}
              </Badge>
            </Group>
            
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Almacén</Text>
                <Text fw={500}>{datos.producto.almacen_nombre}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Stock Total</Text>
                <Text fw={500} size="lg" c={parseInt(datos.producto.stock_total) > 0 ? "green" : "red"}>
                  {parseFloat(datos.producto.stock_total).toLocaleString()}
                </Text>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Filtros y búsqueda */}
          {(datos.lotes.length > 0 || datos.series.length > 0) && (
            <Card withBorder p="sm">
              <Grid>
                <Grid.Col span={8}>
                  <TextInput
                    placeholder={producto.tipo_control_stock === 'LOTE' ? "Buscar por código de lote..." : "Buscar por número de serie..."}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                  />
                </Grid.Col>
                {producto.tipo_control_stock === 'LOTE' && (
                  <Grid.Col span={4}>
                    <Select
                      placeholder="Filtrar por fecha"
                      data={[
                        { value: '', label: 'Todos' },
                        { value: 'vencidos', label: 'Vencidos' },
                        { value: 'por_vencer', label: 'Por vencer (30 días)' },
                        { value: 'vigentes', label: 'Vigentes' }
                      ]}
                      value={filtroFecha}
                      onChange={setFiltroFecha}
                    />
                  </Grid.Col>
                )}
              </Grid>
            </Card>
          )}

          {/* Contenido según tipo de producto */}
          {producto.tipo_control_stock === 'UNIDAD' && (
            <Card withBorder p="md">
              <Group>
                <IconPackage size={24} color="blue" />
                <Box>
                  <Text size="sm" c="dimmed">Producto por unidad</Text>
                  <Text>Stock disponible sin control adicional</Text>
                </Box>
              </Group>
            </Card>
          )}

          {producto.tipo_control_stock === 'LOTE' && datos.lotes.length > 0 && (
            <Card withBorder>
              <Card.Section p="md" pb={0}>
                <Group>
                  <IconCalendar size={20} />
                  <Text fw={500}>Lotes disponibles ({filtrarLotes(datos.lotes).length})</Text>
                </Group>
              </Card.Section>
              
              <Card.Section>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Código de Lote</Table.Th>
                      <Table.Th>Fecha Vencimiento</Table.Th>
                      <Table.Th>Stock</Table.Th>
                      <Table.Th>Estado</Table.Th>
                      <Table.Th width={120}>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtrarLotes(datos.lotes).map((lote) => (
                      <Table.Tr key={lote.lote_id}>
                        <Table.Td>
                          <Text fw={500}>{lote.lote_codigo}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {new Date(lote.fecha_vencimiento).toLocaleDateString('es-ES')}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500} c={parseFloat(lote.stock_lote) > 0 ? "green" : "red"}>
                            {parseFloat(lote.stock_lote).toLocaleString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getColorFechaVencimiento(lote.fecha_vencimiento)} size="sm">
                            {getColorFechaVencimiento(lote.fecha_vencimiento) === 'red' ? 'Vencido' :
                             getColorFechaVencimiento(lote.fecha_vencimiento) === 'orange' ? 'Por vencer' : 'Vigente'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Tooltip label="Editar lote">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="sm"
                                onClick={() => abrirModalEditarLote(lote)}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card.Section>
            </Card>
          )}

          {producto.tipo_control_stock === 'SERIE' && datos.series.length > 0 && (
            <Card withBorder>
              <Card.Section p="md" pb={0}>
                <Group>
                  <IconBarcode size={20} />
                  <Text fw={500}>Series disponibles ({filtrarSeries(datos.series).length})</Text>
                </Group>
              </Card.Section>
              
              <Card.Section>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Número de Serie</Table.Th>
                      <Table.Th>Estado</Table.Th>
                      {/* Columnas dinámicas de atributos */}
                      {obtenerClavesAtributos().map(clave => (
                        <Table.Th key={clave} style={{ textTransform: 'capitalize' }}>
                          {clave}
                        </Table.Th>
                      ))}
                      <Table.Th width={120}>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {cargandoAtributos ? (
                      <Table.Tr>
                        <Table.Td colSpan={3 + obtenerClavesAtributos().length}>
                          <Center py="md">
                            <Group>
                              <Loader size="sm" />
                              <Text size="sm" c="dimmed">Cargando atributos...</Text>
                            </Group>
                          </Center>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filtrarSeries(datos.series).map((serie) => (
                        <Table.Tr key={serie.serie_id}>
                          <Table.Td>
                            <Text fw={500} family="monospace">{serie.serie_numero}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={parseFloat(serie.saldo_serie) > 0 ? "green" : "gray"} size="sm">
                              {parseFloat(serie.saldo_serie) > 0 ? 'Disponible' : 'No disponible'}
                            </Badge>
                          </Table.Td>
                          {/* Valores dinámicos de atributos */}
                          {obtenerClavesAtributos().map(clave => {
                            const valor = obtenerValorAtributo(serie.serie_id, clave);
                            const tieneValor = valor !== '-';
                            
                            return (
                              <Table.Td key={`${serie.serie_id}-${clave}`}>
                                <Group gap="xs" justify="space-between">
                                  <Text size="sm" style={{ flex: 1 }}>{valor}</Text>
                                  {tieneValor && (
                                    <Tooltip label={`Eliminar atributo "${clave}"`}>
                                      <ActionIcon
                                        size="xs"
                                        variant="subtle"
                                        color="red"
                                        onClick={() => borrarAtributo(serie, clave)}
                                      >
                                        <IconTrash size={12} />
                                      </ActionIcon>
                                    </Tooltip>
                                  )}
                                </Group>
                              </Table.Td>
                            );
                          })}
                          <Table.Td>
                          <Group gap="xs">
                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <Tooltip label="Gestionar atributos">
                                  <ActionIcon
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                  >
                                    <IconSettings size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              </Menu.Target>
                              
                              <Menu.Dropdown>
                                <Menu.Label>Gestión de series</Menu.Label>
                                <Menu.Item
                                  leftSection={<IconEdit size={14} />}
                                  onClick={() => abrirModalEditarSerie(serie)}
                                >
                                  Editar número de serie
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Label>Gestión de atributos</Menu.Label>
                                <Menu.Item
                                  leftSection={<IconPlus size={14} />}
                                  onClick={() => abrirModalAtributo(serie)}
                                >
                                  Agregar atributo
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconEdit size={14} />}
                                  onClick={() => abrirModalEditarAtributos(serie)}
                                >
                                  Editar atributos
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                  leftSection={<IconTrash size={14} />}
                                  color="red"
                                  onClick={() => confirmarBorrarTodosAtributos(serie)}
                                >
                                  Eliminar atributos
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                    )}
                  </Table.Tbody>
                </Table>
              </Card.Section>
            </Card>
          )}

          {/* Mensaje cuando no hay datos adicionales */}
          {producto.tipo_control_stock === 'LOTE' && datos.lotes.length === 0 && (
            <Card withBorder p="md" c="dimmed">
              <Center>
                <Text>No hay lotes registrados para este producto</Text>
              </Center>
            </Card>
          )}

          {producto.tipo_control_stock === 'SERIE' && datos.series.length === 0 && (
            <Card withBorder p="md" c="dimmed">
              <Center>
                <Text>No hay series registradas para este producto</Text>
              </Center>
            </Card>
          )}
        </Stack>
      ) : (
        <Center py="xl">
          <Text c="dimmed">No se pudo cargar la información del producto</Text>
        </Center>
      )}

      {/* Modal para agregar atributo a serie */}
      <Modal
        opened={modalAtributoAbierto}
        onClose={cerrarModalAtributo}
        title={`Agregar atributo a serie: ${serieSeleccionada?.serie_numero}`}
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          <TextInput
            label="Clave del atributo"
            placeholder="Ej: color, modelo, ubicación..."
            value={formAtributo.clave}
            onChange={(e) => manejarCambioFormAtributo('clave', e.target.value)}
            required
            maxLength={50}
          />
          
          <TextInput
            label="Valor del atributo"
            placeholder="Ej: azul, ABC-123, estantería A..."
            value={formAtributo.valor}
            onChange={(e) => manejarCambioFormAtributo('valor', e.target.value)}
            required
            maxLength={255}
          />
          
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={cerrarModalAtributo}
              disabled={cargandoAtributo}
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarAtributo}
              loading={cargandoAtributo}
              leftSection={cargandoAtributo ? undefined : <IconPlus size={16} />}
            >
              {cargandoAtributo ? 'Guardando...' : 'Agregar atributo'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal para editar atributos de serie */}
      <Modal
        opened={modalEditarAtributos}
        onClose={cerrarModalEditarAtributos}
        title={`Editar atributos de serie: ${serieSeleccionada?.serie_numero}`}
        centered
        size="md"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          {atributosEdicion.map((atributo, index) => (
            <Group key={index} grow align="flex-end">
              <TextInput
                label={index === 0 ? "Clave" : ""}
                placeholder="Ej: color, modelo..."
                value={atributo.clave}
                onChange={(e) => actualizarAtributoEdicion(index, 'clave', e.target.value)}
                required
                maxLength={50}
                readOnly={!atributo.esNuevo}
                style={{
                  cursor: !atributo.esNuevo ? 'not-allowed' : 'text'
                }}
              />
              
              <TextInput
                label={index === 0 ? "Valor" : ""}
                placeholder="Ej: azul, ABC-123..."
                value={atributo.valor}
                onChange={(e) => actualizarAtributoEdicion(index, 'valor', e.target.value)}
                required
                maxLength={255}
              />
              
              <ActionIcon
                color="red"
                variant="outline"
                onClick={() => eliminarAtributoEdicion(index)}
                disabled={atributosEdicion.length === 1}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={agregarNuevoAtributoEdicion}
          >
            Agregar otro atributo
          </Button>
          
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={cerrarModalEditarAtributos}
              disabled={cargandoEdicion}
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarAtributosEditados}
              loading={cargandoEdicion}
              leftSection={cargandoEdicion ? undefined : <IconEdit size={16} />}
            >
              {cargandoEdicion ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de confirmación para borrado masivo de atributos */}
      <Modal
        opened={modalBorradoMasivo}
        onClose={cancelarBorradoMasivo}
        title="Confirmar eliminación masiva"
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          <Group>
            <IconTrash size={24} color="red" />
            <Text size="lg" fw={600}>
              ¿Eliminar todos los atributos?
            </Text>
          </Group>
          
          {serieSeleccionada && (
            <>
              <Text size="sm" c="dimmed">
                Serie: <Text component="span" fw={500}>{serieSeleccionada.serie_numero}</Text>
              </Text>
              
              {atributosSeries[serieSeleccionada.serie_id] && atributosSeries[serieSeleccionada.serie_id].length > 0 && (
                <div>
                  <Text size="sm" fw={500} mb="xs">Atributos que se eliminarán:</Text>
                  <Stack gap="xs">
                    {atributosSeries[serieSeleccionada.serie_id].map((attr, index) => (
                      <Group key={index} gap="xs">
                        <Text size="sm" fw={500} c="red">•</Text>
                        <Text size="sm"><Text fw={500} component="span">{attr.clave}:</Text> {attr.valor}</Text>
                      </Group>
                    ))}
                  </Stack>
                </div>
              )}
            </>
          )}
          
          <Text size="sm" c="red" style={{ backgroundColor: '#ffebee', padding: '8px', borderRadius: '4px' }}>
            <Text fw={500} component="span">⚠️ Advertencia:</Text> Esta acción eliminará permanentemente 
            TODOS los atributos de la serie. Esta acción no se puede deshacer.
          </Text>
          
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={cancelarBorradoMasivo}
              disabled={cargandoBorradoMasivo}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={ejecutarBorradoMasivo}
              loading={cargandoBorradoMasivo}
              leftSection={cargandoBorradoMasivo ? undefined : <IconTrash size={16} />}
            >
              {cargandoBorradoMasivo ? 'Eliminando...' : 'Eliminar todos'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de edición de lotes */}
      <Modal
        opened={modalEditarLoteAbierto}
        onClose={cerrarModalEditarLote}
        title={`Editar lote: ${loteParaEditar?.lote_codigo || ''}`}
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          <TextInput
            label="Código del lote"
            placeholder="Ingrese el código del lote"
            value={formLote.codigoLote}
            onChange={(e) => manejarCambioFormLote('codigoLote', e.target.value)}
            required
            withAsterisk
          />

          <TextInput
            label="Fecha de vencimiento"
            placeholder="YYYY-MM-DD"
            type="date"
            value={formLote.fechaVenc}
            onChange={(e) => manejarCambioFormLote('fechaVenc', e.target.value)}
            required
            withAsterisk
          />
          
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={cerrarModalEditarLote}
              disabled={cargandoEdicionLote}
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarEdicionLote}
              loading={cargandoEdicionLote}
              leftSection={cargandoEdicionLote ? undefined : <IconEdit size={16} />}
            >
              {cargandoEdicionLote ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de edición de series */}
      <Modal
        opened={modalEditarSerieAbierto}
        onClose={cerrarModalEditarSerie}
        title={`Editar serie: ${serieParaEditar?.serie_numero || ''}`}
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          <TextInput
            label="Número de serie"
            placeholder="Ingrese el número de serie"
            value={formSerie.numeroSerie}
            onChange={(e) => manejarCambioFormSerie('numeroSerie', e.target.value)}
            required
            withAsterisk
          />
          
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={cerrarModalEditarSerie}
              disabled={cargandoEdicionSerie}
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarEdicionSerie}
              loading={cargandoEdicionSerie}
              leftSection={cargandoEdicionSerie ? undefined : <IconEdit size={16} />}
            >
              {cargandoEdicionSerie ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Drawer>
  );
};

export default ProductDetailDrawer;