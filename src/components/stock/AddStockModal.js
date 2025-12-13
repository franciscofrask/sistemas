import React, { useState, useEffect } from 'react';
import {
  Modal,
  Grid,
  Title,
  Text,
  Select,
  NumberInput,
  Button,
  Card,
  Group,
  TextInput,
  Table,
  ActionIcon,
  Badge,
  Divider
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPlus } from '@tabler/icons-react';

/**
 * AddStockModal - Componente modal para agregar stock a productos
 * 
 * DESCRIPCIÓN:
 * Modal dinámico que adapta su formulario según el tipo de control de stock del producto.
 * Maneja tres tipos: UNIDAD (cantidad simple), LOTE (selección o creación de lotes),
 * y SERIE (gestión de números de serie individuales).
 * 
 * FUNCIONALIDADES:
 * - Formulario adaptativo según tipo de control de stock
 * - Para UNIDAD: cantidad y almacén
 * - Para LOTE: gestión de lotes existentes o creación de nuevos
 * - Para SERIE: gestión de múltiples números de serie
 * - Validaciones específicas por tipo
 * - Integración con APIs de movimientos de stock
 * 
 * PROPS REQUERIDAS:
 * @param {boolean} opened - Estado del modal (abierto/cerrado)
 * @param {function} onClose - Función para cerrar el modal
 * @param {object|null} producto - Objeto del producto seleccionado {id, nombre, tipo_control_stock}
 * @param {array} almacenes - Array de almacenes disponibles [{id, nombre}]
 * @param {function} onStockAdded - Función callback ejecutada tras agregar stock exitosamente
 */
const AddStockModal = ({
  opened,
  onClose,
  producto,
  almacenes,
  onStockAdded
}) => {
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Estados para LOTE
  const [lotesDisponibles, setLotesDisponibles] = useState([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState('');
  const [crearNuevoLote, setCrearNuevoLote] = useState(false);
  const [codigoLote, setCodigoLote] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [lotesExistentes, setLotesExistentes] = useState([]);
  
  // Estados para SERIE
  const [numeroSerie, setNumeroSerie] = useState('');
  const [seriesAgregadas, setSeriesAgregadas] = useState([]);
  const [seriesExistentes, setSeriesExistentes] = useState([]);

  // Limpiar formulario al abrir/cerrar
  useEffect(() => {
    if (opened && producto) {
      resetForm();
      if (producto.tipo_control_stock === 'LOTE') {
        cargarLotesDisponibles();
      }
    }
  }, [opened, producto]);

  const resetForm = () => {
    // Cargar almacén seleccionado del localStorage
    let almacenPorDefecto = '';
    try {
      const almacenGuardado = localStorage.getItem('almacen_seleccionado');
      if (almacenGuardado) {
        const almacenData = JSON.parse(almacenGuardado);
        almacenPorDefecto = almacenData.id.toString();
      }
    } catch (error) {
      console.error('Error al obtener almacén del localStorage:', error);
    }
    
    setAlmacenSeleccionado(almacenPorDefecto);
    setCantidad(0);
    setLoteSeleccionado('');
    setCrearNuevoLote(false);
    setCodigoLote('');
    setFechaVencimiento('');
    setNumeroSerie('');
    setSeriesAgregadas([]);
    setSeriesExistentes([]);
    
    // Procesar series existentes si es tipo SERIE
    if (producto && producto.tipo_control_stock === 'SERIE' && producto.numeros_serie) {
      const seriesArray = producto.numeros_serie.split(',').map(serie => serie.trim()).filter(serie => serie);
      setSeriesExistentes(seriesArray);
    }
    
    // Procesar códigos de lote existentes si es tipo LOTE
    if (producto && producto.tipo_control_stock === 'LOTE' && producto.codigos_lote) {
      const lotesArray = producto.codigos_lote.split(',').map(lote => lote.trim()).filter(lote => lote);
      setLotesExistentes(lotesArray);
    } else {
      setLotesExistentes([]);
    }
  };

  const cargarLotesDisponibles = async () => {
    try {
      const response = await fetch(`/api/stock/lotes?producto_id=${producto.id}`);
      const result = await response.json();
      if (response.ok && result.success) {
        setLotesDisponibles(result.data || []);
      }
    } catch (error) {
      console.error('Error cargando lotes:', error);
    }
  };

  // Agregar serie a la lista
  const agregarSerie = () => {
    if (!numeroSerie.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Debe ingresar un número de serie',
        color: 'red'
      });
      return;
    }

    // Validar que no exista en las series agregadas
    if (seriesAgregadas.includes(numeroSerie.trim())) {
      notifications.show({
        title: 'Error',
        message: 'Este número de serie ya fue agregado',
        color: 'red'
      });
      return;
    }

    // Validar que no exista en las series existentes
    if (seriesExistentes.includes(numeroSerie.trim())) {
      notifications.show({
        title: 'Serie Existente',
        message: 'Este número de serie ya existe para este producto',
        color: 'orange'
      });
      return;
    }

    setSeriesAgregadas([...seriesAgregadas, numeroSerie.trim()]);
    setNumeroSerie('');
  };

  const eliminarSerie = (serie) => {
    setSeriesAgregadas(seriesAgregadas.filter(s => s !== serie));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Validaciones comunes
      if (!almacenSeleccionado) {
        notifications.show({
          title: 'Error',
          message: 'Debe seleccionar un almacén',
          color: 'red'
        });
        return;
      }

      if (producto.tipo_control_stock === 'UNIDAD') {
        await manejarStockUnidad();
      } else if (producto.tipo_control_stock === 'LOTE') {
        await manejarStockLote();
      } else if (producto.tipo_control_stock === 'SERIE') {
        await manejarStockSerie();
      }

    } catch (error) {
      console.error('Error agregando stock:', error);
      
      // Manejar errores de conexión
      if (error.message.includes('fetch')) {
        notifications.show({
          title: 'Error de Conexión',
          message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
          color: 'red'
        });
      } else {
        notifications.show({
          title: 'Error Inesperado',
          message: 'Ocurrió un error inesperado al agregar stock. Inténtelo nuevamente.',
          color: 'red'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const manejarStockUnidad = async () => {
    if (cantidad <= 0) {
      notifications.show({
        title: 'Error',
        message: 'La cantidad debe ser mayor a 0',
        color: 'red'
      });
      return;
    }

    const response = await fetch('/api/stock/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: producto.id,
        almacen_id: parseInt(almacenSeleccionado),
        cantidad: cantidad,
        tipo_movimiento: 'INGRESO',
        origen: 'AJUSTE_MANUAL',
        documento_tipo: 'AJUSTE_STOCK'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      notifications.show({
        title: 'Éxito',
        message: 'Stock agregado correctamente',
        color: 'green'
      });
      onClose();
      onStockAdded();
    } else {
      notifications.show({
        title: 'Error al Agregar Stock',
        message: result.error || 'No se pudo agregar stock al producto. Inténtelo nuevamente.',
        color: 'red'
      });
      return;
    }
  };

  const manejarStockLote = async () => {
    if (cantidad <= 0) {
      notifications.show({
        title: 'Error',
        message: 'La cantidad debe ser mayor a 0',
        color: 'red'
      });
      return;
    }

    let loteId = loteSeleccionado;

    // Crear nuevo lote si es necesario
    if (crearNuevoLote) {
      if (!codigoLote.trim()) {
        notifications.show({
          title: 'Error',
          message: 'Debe ingresar un código de lote',
          color: 'red'
        });
        return;
      }

      const responseLote = await fetch('/api/stock/lotes/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: producto.id,
          codigo_lote: codigoLote,
          fecha_vencimiento: fechaVencimiento || null
        })
      });

      const resultLote = await responseLote.json();
      
      if (!responseLote.ok || !resultLote.success) {
        // Manejar errores específicos de lotes duplicados
        if (resultLote.details && resultLote.details.includes('Duplicate entry') && resultLote.details.includes('uk_lotes_producto_codigo')) {
          notifications.show({
            title: 'Lote Duplicado',
            message: 'Ya existe un lote con este código para este producto. Use un código diferente.',
            color: 'red'
          });
          return;
        }
        
        notifications.show({
          title: 'Error al Crear Lote',
          message: resultLote.error || 'No se pudo crear el lote. Verifique que el código sea único.',
          color: 'red'
        });
        return;
      }
      
      loteId = resultLote.lote_id;
    }

    if (!loteId) {
      notifications.show({
        title: 'Error',
        message: 'Debe seleccionar o crear un lote',
        color: 'red'
      });
      return;
    }

    // Registrar movimiento de stock
    const response = await fetch('/api/stock/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: producto.id,
        almacen_id: parseInt(almacenSeleccionado),
        cantidad: cantidad,
        lote_id: parseInt(loteId),
        tipo_movimiento: 'INGRESO',
        origen: 'AJUSTE_MANUAL',
        documento_tipo: 'AJUSTE_STOCK'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      notifications.show({
        title: 'Éxito',
        message: 'Stock con lote agregado correctamente',
        color: 'green'
      });
      onClose();
      onStockAdded();
    } else {
      notifications.show({
        title: 'Error en Movimiento de Lote',
        message: result.error || 'No se pudo registrar el movimiento de stock para el lote.',
        color: 'red'
      });
      return;
    }
  };

  const manejarStockSerie = async () => {
    if (seriesAgregadas.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Debe agregar al menos una serie',
        color: 'red'
      });
      return;
    }

    // Crear series en base de datos
    const responseSeries = await fetch('/api/stock/series/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: producto.id,
        series: seriesAgregadas
      })
    });

    const resultSeries = await responseSeries.json();
    
    if (!responseSeries.ok || !resultSeries.success) {
      // Manejar errores específicos de series duplicadas
      if (resultSeries.details && resultSeries.details.includes('Duplicate entry') && resultSeries.details.includes('uk_series_producto_numero')) {
        notifications.show({
          title: 'Serie Duplicada',
          message: 'Una o más series ya existen para este producto. Por favor, use números de serie únicos.',
          color: 'red'
        });
        return;
      }
      
      // Otros errores de creación de series
      notifications.show({
        title: 'Error al Crear Series',
        message: resultSeries.error || 'No se pudieron crear las series. Verifique que los números de serie sean únicos.',
        color: 'red'
      });
      return;
    }

    // Crear movimientos de stock (uno por serie)
    const movimientos = resultSeries.series_creadas.map(serie => ({
      producto_id: producto.id,
      almacen_id: parseInt(almacenSeleccionado),
      cantidad: 1,
      serie_id: serie.serie_id,
      tipo_movimiento: 'INGRESO',
      origen: 'AJUSTE_MANUAL',
      documento_tipo: 'AJUSTE_STOCK'
    }));

    const responseMovimientos = await fetch('/api/stock/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movimientos })
    });

    const resultMovimientos = await responseMovimientos.json();
    
    if (responseMovimientos.ok && resultMovimientos.success) {
      notifications.show({
        title: 'Éxito',
        message: `Stock agregado: ${seriesAgregadas.length} series`,
        color: 'green'
      });
      onClose();
      onStockAdded();
    } else {
      notifications.show({
        title: 'Error en Movimientos',
        message: resultMovimientos.error || 'No se pudo registrar el movimiento de stock para las series.',
        color: 'red'
      });
      return;
    }
  };

  if (!producto) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Agregar Stock - ${producto.nombre}`}
      size="lg"
    >
      <Grid>
        <Grid.Col span={12}>
          <Badge color="blue" size="sm">
            Tipo: {producto.tipo_control_stock}
          </Badge>
        </Grid.Col>

        <Grid.Col span={12}>
          <Select
            label="Almacén"
            placeholder="Seleccione almacén"
            required
            data={almacenes.map(a => ({ value: a.id.toString(), label: a.nombre }))}
            value={almacenSeleccionado}
            onChange={setAlmacenSeleccionado}
          />
        </Grid.Col>

        {/* TIPO UNIDAD */}
        {producto.tipo_control_stock === 'UNIDAD' && (
          <Grid.Col span={12}>
            <NumberInput
              label="Cantidad a agregar"
              placeholder="Ingrese cantidad"
              min={0.1}
              step={0.1}
              required
              value={cantidad}
              onChange={setCantidad}
            />
          </Grid.Col>
        )}

        {/* TIPO LOTE */}
        {producto.tipo_control_stock === 'LOTE' && (
          <>
            {/* Mostrar lotes existentes si los hay */}
            {lotesExistentes.length > 0 && (
              <Grid.Col span={12}>
                <Card withBorder p="sm">
                  <Text size="sm" fw={500} mb="xs" c="blue">Códigos de lote existentes:</Text>
                  <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                    {lotesExistentes.map((lote, index) => (
                      <Badge 
                        key={index} 
                        variant="light" 
                        color="blue" 
                        size="sm" 
                        style={{ marginRight: '4px', marginBottom: '4px' }}
                      >
                        {lote}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </Grid.Col>
            )}
            
            <Grid.Col span={12}>
              <Group>
                <Button
                  variant={!crearNuevoLote ? 'filled' : 'light'}
                  onClick={() => setCrearNuevoLote(false)}
                  size="xs"
                >
                  Usar Lote Existente
                </Button>
                <Button
                  variant={crearNuevoLote ? 'filled' : 'light'}
                  onClick={() => setCrearNuevoLote(true)}
                  size="xs"
                >
                  Crear Nuevo Lote
                </Button>
              </Group>
            </Grid.Col>

            {!crearNuevoLote ? (
              <Grid.Col span={12}>
                <Select
                  label="Lote existente"
                  placeholder="Seleccione lote"
                  data={lotesDisponibles.map(lote => ({
                    value: lote.id.toString(),
                    label: `${lote.codigo_lote} - ${lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString() : 'Sin vencimiento'}`
                  }))}
                  value={loteSeleccionado}
                  onChange={setLoteSeleccionado}
                />
              </Grid.Col>
            ) : (
              <>
                <Grid.Col span={6}>
                  <TextInput
                    label="Código del lote"
                    placeholder="Ej: LT001"
                    required
                    value={codigoLote}
                    onChange={(e) => setCodigoLote(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Fecha de vencimiento"
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.currentTarget.value)}
                  />
                </Grid.Col>
              </>
            )}

            <Grid.Col span={12}>
              <NumberInput
                label="Cantidad a agregar"
                placeholder="Ingrese cantidad"
                min={0.1}
                step={0.1}
                required
                value={cantidad}
                onChange={setCantidad}
              />
            </Grid.Col>
          </>
        )}

        {/* TIPO SERIE */}
        {producto.tipo_control_stock === 'SERIE' && (
          <>
            <Grid.Col span={12}>
              <Group>
                <TextInput
                  label="Número de serie"
                  placeholder="Ingrese número de serie"
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.currentTarget.value)}
                  style={{ flex: 1 }}
                  onKeyPress={(e) => e.key === 'Enter' && agregarSerie()}
                />
                <Button
                  leftSection={<IconPlus size={14} />}
                  onClick={agregarSerie}
                  mt="xl"
                >
                  Agregar
                </Button>
              </Group>
            </Grid.Col>

            {/* Mostrar series existentes si las hay */}
            {seriesExistentes.length > 0 && (
              <Grid.Col span={12}>
                <Card withBorder p="sm">
                  <Text size="sm" fw={500} mb="xs" c="blue">Series existentes:</Text>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {seriesExistentes.map((serie, index) => (
                      <Badge 
                        key={index} 
                        variant="light" 
                        color="blue" 
                        size="sm" 
                        style={{ marginRight: '4px', marginBottom: '4px' }}
                      >
                        {serie}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </Grid.Col>
            )}

            {seriesAgregadas.length > 0 && (
              <Grid.Col span={12}>
                <Text size="sm" fw={500} mb="xs" c="green">Nuevas series a agregar:</Text>
                <Table size="sm" withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Número de Serie</Table.Th>
                      <Table.Th width="80">Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {seriesAgregadas.map((serie, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>{serie}</Table.Td>
                        <Table.Td>
                          <ActionIcon
                            color="red"
                            variant="light"
                            size="sm"
                            onClick={() => eliminarSerie(serie)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                <Text size="xs" c="dimmed" mt="xs">
                  Total: {seriesAgregadas.length} serie(s)
                </Text>
              </Grid.Col>
            )}
          </>
        )}

        <Grid.Col span={12}>
          <Divider my="md" />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              color="green"
              loading={loading}
              onClick={handleSubmit}
            >
              Agregar Stock
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default AddStockModal;