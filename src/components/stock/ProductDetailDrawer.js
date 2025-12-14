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
  Box
} from '@mantine/core';
import { IconSearch, IconCalendar, IconPackage, IconBarcode } from '@tabler/icons-react';
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

  // Obtener color del badge según fecha de vencimiento
  const getColorFechaVencimiento = (fechaVencimiento) => {
    const hoy = new Date();
    const fecha = new Date(fechaVencimiento);
    const diferenciaDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) return 'red';      // Vencido
    if (diferenciaDias <= 30) return 'orange'; // Por vencer (30 días)
    return 'green';                            // Vigente
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
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtrarSeries(datos.series).map((serie) => (
                      <Table.Tr key={serie.serie_id}>
                        <Table.Td>
                          <Text fw={500} family="monospace">{serie.serie_numero}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={parseFloat(serie.saldo_serie) > 0 ? "green" : "gray"} size="sm">
                            {parseFloat(serie.saldo_serie) > 0 ? 'Disponible' : 'No disponible'}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
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
    </Drawer>
  );
};

export default ProductDetailDrawer;