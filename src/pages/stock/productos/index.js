import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Table,
  Tabs,
  Pagination,
  ActionIcon,
  Modal,
  Select,
  NumberInput,
  Checkbox,
  Loader,
  Menu,
  Textarea,
  Badge,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconPencil,
  IconTrash,
  IconSettings,
  IconEye,
  IconLibraryPlus,
  IconPackages,
  IconBarcode,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconPlus,
} from "@tabler/icons-react";

const rowsPerPage = 5;

const Inventario = () => {
  const [pageProductos, setPageProductos] = useState(1);
  const [opened, setOpened] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Estados para modal de stock por almacenes
  const [modalStockAbierto, setModalStockAbierto] = useState(false);
  const [stockPorAlmacenes, setStockPorAlmacenes] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [almacenes, setAlmacenes] = useState([]);
  
  // Estados para formulario de productos
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [tipoControl, setTipoControl] = useState('UNIDAD');
  const [esServicio, setEsServicio] = useState(false);
  const [lotes, setLotes] = useState([{ codigo: '', fechaVencimiento: '', cantidad: 0 }]);
  const [series, setSeries] = useState(['']);

  const form = useForm({
    initialValues: {
      nombre: "",
      sku: "",
      codigo_barras: "",
      categoria_id: "",
      unidad_medida_id: "",
      tipo_control_stock: "UNIDAD",
      es_servicio: false,
      precio_lista: 0,
    },
    validate: {
      nombre: value => (value.length < 2 ? "El nombre es obligatorio" : null),
      categoria_id: value => (!value ? "La categoría es obligatoria" : null),
      unidad_medida_id: value => (!value ? "La unidad de medida es obligatoria" : null),
      precio_lista: value => (value < 0 ? "El precio debe ser mayor o igual a 0" : null),
    },
  });

  // Función para obtener productos desde la API
  const fetchProductos = async () => {
    try {
      setLoading(true);
      
      // Obtener almacén seleccionado del localStorage
      let almacenId = null;
      try {
        const almacenGuardado = localStorage.getItem('almacen_seleccionado')??  null;
        if (almacenGuardado) {
          const almacen = JSON.parse(almacenGuardado);
          almacenId = almacen.id;
        }
      } catch (error) {
        console.error('Error al obtener almacén del localStorage:', error);
      }
      
      // Construir URL con parámetro de almacén
      const url = almacenId 
        ? `/api/stock/productos/inventario?almacen_id=${almacenId}`
        : '/api/stock/productos/inventario';
      
      const response = await fetch(url);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Verificar content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta no es JSON válido');
      }
      
      const data = await response.json();
      
      
      if (data.success) {
        setProductos(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error('Error al obtener productos:', data.message);
        setProductos([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProductos();
    cargarAlmacenes();
    cargarCategorias();
    cargarUnidades();
  }, []);

  // Función para cargar categorías
  const cargarCategorias = async () => {
    try {
      const response = await fetch('/api/stock/productos/categorias');
      const result = await response.json();
      if (response.ok && result.success) {
        setCategorias(result.data || []);
      } else {
        console.error('Error al cargar categorías:', result.message);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Función para cargar unidades de medida
  const cargarUnidades = async () => {
    try {
      const response = await fetch('/api/stock/productos/unidades');
      const result = await response.json();
      if (response.ok && result.success) {
        setUnidades(result.data || []);
      } else {
        console.error('Error al cargar unidades:', result.message);
      }
    } catch (error) {
      console.error('Error al cargar unidades:', error);
    }
  };

  // Efecto para manejar cambio en 'es servicio'
  useEffect(() => {
    if (esServicio) {
      setTipoControl('UNIDAD');
      form.setFieldValue('tipo_control_stock', 'UNIDAD');
    }
  }, [esServicio]);

  // Efecto para sincronizar tipo de control
  useEffect(() => {
    form.setFieldValue('tipo_control_stock', tipoControl);
  }, [tipoControl]);

  // Efecto para sincronizar es servicio
  useEffect(() => {
    form.setFieldValue('es_servicio', esServicio);
  }, [esServicio]);

  // Funciones para manejar lotes
  const agregarLote = () => {
    setLotes([...lotes, { codigo: '', fechaVencimiento: '', cantidad: 0 }]);
  };

  const eliminarLote = (index) => {
    if (lotes.length > 1) {
      setLotes(lotes.filter((_, i) => i !== index));
    }
  };

  const actualizarLote = (index, campo, valor) => {
    const nuevosLotes = [...lotes];
    nuevosLotes[index][campo] = valor;
    setLotes(nuevosLotes);
  };

  // Funciones para manejar series
  const agregarSerie = () => {
    setSeries([...series, '']);
  };

  const eliminarSerie = (index) => {
    if (series.length > 1) {
      setSeries(series.filter((_, i) => i !== index));
    }
  };

  const actualizarSerie = (index, valor) => {
    const nuevasSeries = [...series];
    nuevasSeries[index] = valor;
    setSeries(nuevasSeries);
  };
  const cargarAlmacenes = async () => {
    try {
      const response = await fetch('/api/stock/almacenes?solo_activos=0');
      const result = await response.json();
      if (response.ok && result.success) {
        setAlmacenes(result.data || []);
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
    }
  };

  // Función para obtener stock por almacenes de un producto
  const fetchStockPorAlmacenes = async (productoId) => {
    setLoadingStock(true);
    try {
      const response = await fetch(`/api/stock/productos/almacenes-stock?producto_id=${productoId}`);
      const result = await response.json();
      if (response.ok && result.success) {
        setStockPorAlmacenes(result.data || []);
      } else {
        console.error('Error al obtener stock por almacenes:', result.message);
        setStockPorAlmacenes([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setStockPorAlmacenes([]);
    } finally {
      setLoadingStock(false);
    }
  };

  // Función para manejar click en stock total
  const handleVerStockPorAlmacenes = (producto) => {
    setProductoSeleccionado(producto);
    setModalStockAbierto(true);
    fetchStockPorAlmacenes(producto.id);
  };

  // Función para obtener nombre de almacén por ID
  const getNombreAlmacen = (almacenId) => {
    const almacen = almacenes.find(a => a.id === almacenId);
    return almacen ? almacen.nombre : `Almacén ID: ${almacenId}`;
  };

  // Filtrar productos según búsqueda
  const productosFiltrados = Array.isArray(productos)
    ? productos.filter(
        producto =>
          producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.codigo_barras?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.categoria_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          String(producto.stock_total || 0).includes(busqueda)
      )
    : [];

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (!sortField) return 0;
    
    let valueA = a[sortField];
    let valueB = b[sortField];
    
    // Manejar campos específicos
    if (sortField === 'stock_total' || sortField === 'precio_lista') {
      valueA = parseFloat(valueA) || 0;
      valueB = parseFloat(valueB) || 0;
    } else if (sortField === 'nombre') {
      valueA = (valueA || '').toLowerCase();
      valueB = (valueB || '').toLowerCase();
    } else if (sortField === 'actualizado_en') {
      valueA = new Date(valueA || 0);
      valueB = new Date(valueB || 0);
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const startProductos = (pageProductos - 1) * rowsPerPage;
  const endProductos = startProductos + rowsPerPage;
  const pageRows = productosOrdenados.slice(startProductos, endProductos);

  // Función para manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPageProductos(1); // Resetear a primera página
  };

  // Función para obtener icono de ordenamiento
  const getSortIcon = (field) => {
    if (sortField !== field) return <IconSelector size={14} />;
    return sortDirection === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />;
  };

  // Función para obtener color del badge según tipo de control
  const getTipoControlBadge = (tipoControl) => {
    const tipo = tipoControl?.toUpperCase();
    switch (tipo) {
      case 'UNIDAD':
        return 'teal'; // Verde azulado - moderno y profesional
      case 'LOTE':
        return 'indigo'; // Azul profundo - confianza y estabilidad
      case 'SERIE':
        return 'orange'; // Naranja - energía y atención
      default:
        return 'gray';
    }
  };

  const handleCardClick = path => {
    window.location.href = path;
  };

  const handleVerDetalle = producto => {
    setProductoDetalle(producto);
    setModalDetalleAbierto(true);
  };

  const handleEdit = producto => {
    form.setValues({
      nombre: producto.nombre || "",
      marca: producto.marca || "",
      codigo_producto: producto.sku || "",
      descripcion: producto.descripcion || "",
      precio_lista: producto.precio_lista || 0,
    });
    setModoEdicion(true);
    setProductoEditandoId(producto.id);
    setOpened(true);
  };

  const handleSubmit = async (values) => {
    try {
      // Preparar datos del producto según el tipo de control
      const datosProducto = {
        ...values,
        es_servicio: esServicio
      };

      // Agregar datos específicos según el tipo de control de stock
      if (tipoControl === 'LOTE') {
        const lotesValidos = lotes.filter(l => l.codigo && l.cantidad > 0);
        if (lotesValidos.length === 0) {
          notifications.show({
            title: 'Error',
            message: 'Debe agregar al menos un lote válido',
            color: 'red'
          });
          return;
        }
        datosProducto.lotes = lotesValidos.map(l => ({
          codigo_lote: l.codigo,
          fecha_venc: l.fechaVencimiento || null,
          cantidad: parseFloat(l.cantidad)
        }));
        datosProducto.almacen_id = values.almacen_id;

      } else if (tipoControl === 'SERIE') {
        const seriesValidas = series.filter(s => s.trim());
        if (seriesValidas.length === 0) {
          notifications.show({
            title: 'Error',
            message: 'Debe agregar al menos una serie válida',
            color: 'red'
          });
          return;
        }
        datosProducto.series = seriesValidas;
        datosProducto.almacen_id = values.almacen_id;
      }

      console.log('Enviando datos:', datosProducto);

      // Enviar al API
      const response = await fetch('/api/stock/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosProducto),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        notifications.show({
          title: 'Éxito',
          message: 'Producto creado exitosamente',
          color: 'green'
        });
        
        limpiarFormulario();
        setOpened(false);
        fetchProductos(); // Recargar la lista
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Error al crear el producto',
          color: 'red'
        });
      }

    } catch (error) {
      console.error('Error al crear producto:', error);
      notifications.show({
        title: 'Error',
        message: 'Error de conexión al crear el producto',
        color: 'red'
      });
    }
  };

  const limpiarFormulario = () => {
    form.reset();
    setTipoControl('UNIDAD');
    setEsServicio(false);
    setLotes([{ codigo: '', fechaVencimiento: '', cantidad: 0 }]);
    setSeries(['']);
    setModoEdicion(false);
    setProductoEditandoId(null);
  };

  return (
    <ProtectedLayout>
      <Container size="lg">
        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Productos</Title>
            <Text c="dimmed" order={4}>
              Registro detallado de sus productos
            </Text>
          </Grid.Col>

          <Grid.Col mt={20} span={12}>
            <Button variant="outline" color="#EE0E0F" onClick={() => setOpened(true)}>
              Nuevo Producto
            </Button>
          </Grid.Col>

          <Grid.Col mt={30} span={12}>
            <TextInput
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={e => {
                setBusqueda(e.currentTarget.value);
                setPageProductos(1);
              }}
              leftSection={<IconSearch size={18} />}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            {loading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : (
                <Table striped highlightOnHover withRowBorders withColumnBorders mt="xl">
                  <thead>
                    <tr>
                      <th 
                        align="start" 
                        onClick={() => handleSort('nombre')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Group gap="xs">
                          Producto
                          {getSortIcon('nombre')}
                        </Group>
                      </th>
                      <th align="start">SKU</th>
                      <th align="start">Código Barras</th>
                      <th align="start">Categoría</th>
                      <th 
                        align="start"
                        onClick={() => handleSort('stock_total')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Group gap="xs">
                          Stock Total
                          {getSortIcon('stock_total')}
                        </Group>
                      </th>
                      <th align="start">Tipo Control</th>
                      <th 
                        align="start"
                        onClick={() => handleSort('precio_lista')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Group gap="xs">
                          Precio Lista
                          {getSortIcon('precio_lista')}
                        </Group>
                      </th>
                      <th 
                        align="start"
                        onClick={() => handleSort('actualizado_en')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Group gap="xs">
                          Últ. Modif.
                          {getSortIcon('actualizado_en')}
                        </Group>
                      </th>
                      <th align="start">Tipo</th>
                      <th align="start">Acciones</th>
                    </tr>
                  </thead>
                <tbody>
                  {pageRows.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.nombre || '-'}</td>
                      <td>{item.sku || '-'}</td>
                      <td>{item.codigo_barras || '-'}</td>
                      <td>{item.categoria_nombre || '-'}</td>
                      <td>
                        {item.es_servicio ? (
                          <Text c="dimmed" size="sm">—</Text>
                        ) : (
                          <Text 
                            c={parseInt(item.stock_total || 0) === 0 ? "red" : "green"}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => handleVerStockPorAlmacenes(item)}
                            title="Ver stock por almacenes"
                          >
                            {parseInt(item.stock_total || 0)}
                          </Text>
                        )}
                      </td>
                      <td>
                        {item.tipo_control_stock ? (
                          <Badge 
                            color={getTipoControlBadge(item.tipo_control_stock)} 
                            size="sm"
                            style={{ width: '80px', textAlign: 'center' }}
                          >
                            {item.tipo_control_stock}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">-</Text>
                        )}
                      </td>
                      <td>${item.precio_lista ? parseFloat(item.precio_lista).toLocaleString() : '0'}</td>
                      <td>
                        <Text size="sm">
                          {item.actualizado_en ? 
                            new Date(item.actualizado_en).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) 
                            : '-'
                          }
                        </Text>
                      </td>
                      <td>
                        <Text c={item.es_servicio ? "blue" : "gray"}>
                          {item.es_servicio ? 'Servicio' : 'Producto'}
                        </Text>
                      </td>
                      <td>
                        <Group gap="xs">
                          <Menu shadow="md" width={160} position="bottom-end" withArrow>
                            <Menu.Target>
                              <ActionIcon color="blue" variant="subtle">
                                <IconSettings size={16} />
                              </ActionIcon>
                            </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item 
                                  leftSection={<IconPlus size={14} />} 
                                  onClick={() => setOpened(true)}
                                  color="green"
                                >
                                  Agregar Producto
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleVerDetalle(item)}>
                                  Ver detalles
                                </Menu.Item>
                                {item.tipo_control_stock === 'LOTE' && (
                                  <Menu.Item leftSection={<IconPackages size={14} />} onClick={() => console.log('Ver lotes del producto', item.id)}>
                                    Ver Lotes
                                  </Menu.Item>
                                )}
                                {item.tipo_control_stock === 'SERIE' && (
                                  <Menu.Item leftSection={<IconBarcode size={14} />} onClick={() => console.log('Ver series del producto', item.id)}>
                                    Ver Series
                                  </Menu.Item>
                                )}
                                <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleEdit(item)}>
                                  Editar
                                </Menu.Item>
                              </Menu.Dropdown>
                          </Menu>
                          <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(item.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            
            <Group justify="center" mt="md">
              <Pagination
                total={Math.ceil(productosOrdenados.length / rowsPerPage)}
                value={pageProductos}
                onChange={setPageProductos}
                color="#ee0e0f"
                siblings={0}
                boundaries={1}
              />
            </Group>
          </Grid.Col>
        </Grid>

        {/* Modal para crear/editar producto */}
        <Modal
          opened={opened}
          onClose={() => {
            setOpened(false);
            limpiarFormulario();
          }}
          title={modoEdicion ? "Editar Producto" : "Crear Producto"}
          size="lg"
          transitionProps={{ transition: "fade", duration: 600, timingFunction: "linear" }}
          classNames={{
            title: "modal-title",
            header: "modal-header",
          }}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col span={12}>
                <Title order={4}>Información del Producto</Title>
              </Grid.Col>
              
              {/* Información básica */}
              <Grid.Col span={12}>
                <TextInput 
                  label="Nombre del producto" 
                  placeholder="Ingrese el nombre del producto"
                  required
                  {...form.getInputProps("nombre")} 
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput 
                  label="SKU" 
                  placeholder="Código SKU (único)"
                  {...form.getInputProps("sku")} 
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput 
                  label="Código de barras" 
                  placeholder="Código de barras (único)"
                  {...form.getInputProps("codigo_barras")} 
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Categoría"
                  placeholder="Seleccione una categoría"
                  required
                  data={categorias.map(cat => ({ 
                    value: cat.id.toString(), 
                    label: cat.nombre,
                    description: cat.descripcion
                  }))}
                  {...form.getInputProps("categoria_id")}
                  searchable
                  maxDropdownHeight={200}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Unidad de medida"
                  placeholder="Seleccione unidad"
                  required
                  data={unidades.map(unidad => ({ 
                    value: unidad.id.toString(), 
                    label: `${unidad.nombre} (${unidad.codigo})`,
                    description: `Código: ${unidad.codigo}`
                  }))}
                  {...form.getInputProps("unidad_medida_id")}
                  searchable
                  maxDropdownHeight={200}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <NumberInput
                  label="Precio de lista"
                  prefix="$"
                  min={0}
                  decimalScale={2}
                  {...form.getInputProps("precio_lista")}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Checkbox
                  label="¿Es un servicio?"
                  checked={esServicio}
                  onChange={(e) => setEsServicio(e.currentTarget.checked)}
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Select
                  label="Tipo de control de stock"
                  value={tipoControl}
                  onChange={setTipoControl}
                  disabled={esServicio}
                  data={[
                    { value: 'UNIDAD', label: 'UNIDAD' },
                    { value: 'LOTE', label: 'LOTE' },
                    { value: 'SERIE', label: 'SERIE' }
                  ]}
                />
                {esServicio && (
                  <Text size="xs" c="dimmed" mt={5}>
                    Los servicios siempre usan control por UNIDAD
                  </Text>
                )}
              </Grid.Col>
              
              {/* Campos específicos según tipo de control */}
              {(tipoControl === 'LOTE' || tipoControl === 'SERIE') && !esServicio && (
                <Grid.Col span={12}>
                  <Select
                    label="Almacén"
                    placeholder="Seleccione el almacén donde se registrará el stock inicial"
                    data={almacenes.map(a => ({ value: a.id.toString(), label: a.nombre }))}
                    required
                    {...form.getInputProps("almacen_id")}
                  />
                </Grid.Col>
              )}
              
              {tipoControl === 'LOTE' && !esServicio && (
                <Grid.Col span={12}>
                  <Title order={5} mb="md">Configuración de Lotes</Title>
                  {lotes.map((lote, index) => (
                    <Card key={index} mb="md" withBorder>
                      <Grid>
                        <Grid.Col span={4}>
                          <TextInput
                            label="Código del lote"
                            placeholder="Ej: LT001"
                            value={lote.codigo}
                            onChange={(e) => actualizarLote(index, 'codigo', e.currentTarget.value)}
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <TextInput
                            label="Fecha de vencimiento"
                            type="date"
                            value={lote.fechaVencimiento}
                            onChange={(e) => actualizarLote(index, 'fechaVencimiento', e.currentTarget.value)}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Cantidad inicial"
                            min={0}
                            value={lote.cantidad}
                            onChange={(value) => actualizarLote(index, 'cantidad', value || 0)}
                          />
                        </Grid.Col>
                        <Grid.Col span={1}>
                          <Button
                            color="red"
                            variant="subtle"
                            size="sm"
                            mt="xl"
                            onClick={() => eliminarLote(index)}
                            disabled={lotes.length === 1}
                          >
                            ×
                          </Button>
                        </Grid.Col>
                      </Grid>
                    </Card>
                  ))}
                  <Button variant="light" onClick={agregarLote} size="sm">
                    + Agregar Lote
                  </Button>
                </Grid.Col>
              )}
              
              {tipoControl === 'SERIE' && !esServicio && (
                <Grid.Col span={12}>
                  <Title order={5} mb="md">Números de Serie</Title>
                  {series.map((serie, index) => (
                    <Group key={index} mb="xs">
                      <TextInput
                        placeholder={`Serie ${index + 1}`}
                        value={serie}
                        onChange={(e) => actualizarSerie(index, e.currentTarget.value)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        color="red"
                        variant="subtle"
                        size="sm"
                        onClick={() => eliminarSerie(index)}
                        disabled={series.length === 1}
                      >
                        ×
                      </Button>
                    </Group>
                  ))}
                  <Button variant="light" onClick={agregarSerie} size="sm">
                    + Agregar Serie
                  </Button>
                </Grid.Col>
              )}
              
              <Grid.Col span={12}>
                <Button variant="outline" color="#EE0E0F" type="submit" fullWidth>
                  {modoEdicion ? "Guardar cambios" : "Crear Producto"}
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Modal>

        {/* Modal para ver detalles del producto */}
        <Modal
          opened={modalDetalleAbierto}
          onClose={() => setModalDetalleAbierto(false)}
          title="Detalle del producto"
          size="lg"
          transitionProps={{ transition: "fade", duration: 200 }}
        >
          {productoDetalle && (
            <Stack gap="sm">
              <Group justify="space-between">
                <Title order={4} c="dimmed">
                  Información general
                </Title>
                <Button
                  size="xs"
                  variant="outline"
                  color="#EE0E0F"
                  onClick={() => {
                    setModalDetalleAbierto(false);
                    handleEdit(productoDetalle);
                  }}
                >
                  Editar producto
                </Button>
              </Group>

              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Grid>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Nombre:</b> {productoDetalle.nombre}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Marca:</b> {productoDetalle.marca}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>
            </Stack>
          )}
        </Modal>

        {/* Modal para ver stock por almacenes */}
        <Modal
          opened={modalStockAbierto}
          onClose={() => setModalStockAbierto(false)}
          title={`Stock por Almacén - ${productoSeleccionado?.nombre || 'Producto'}`}
          size="lg"
          transitionProps={{ transition: "fade", duration: 200 }}
        >
          {loadingStock ? (
            <Group justify="center" py="xl">
              <Loader />
              <Text>Cargando stock por almacenes...</Text>
            </Group>
          ) : (
            <Stack gap="md">
              {stockPorAlmacenes.length > 0 ? (
                <>
                  <Text size="sm" c="dimmed">
                    Distribución de stock del producto en los diferentes almacenes
                  </Text>
                  <Table striped highlightOnHover withColumnBorders>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Almacén</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Stock Disponible</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Estado</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {stockPorAlmacenes.map((item, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>
                            <Text fw={500}>
                              {getNombreAlmacen(item.almacen_id)}
                            </Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>
                            <Text 
                              c={parseInt(item.stock || 0) === 0 ? "red" : "green"}
                              fw={500}
                            >
                              {parseInt(item.stock || 0)}
                            </Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>
                            <Badge 
                              color={parseInt(item.stock || 0) === 0 ? "red" : "green"}
                              variant="light"
                              size="sm"
                            >
                              {parseInt(item.stock || 0) === 0 ? 'Sin stock' : 'Disponible'}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  <Card withBorder p="xs" style={{ backgroundColor: '#f8f9fa' }}>
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>Total General:</Text>
                      <Text size="sm" fw={600} c="blue">
                        {stockPorAlmacenes.reduce((total, item) => total + parseInt(item.stock || 0), 0)} unidades
                      </Text>
                    </Group>
                  </Card>
                </>
              ) : (
                <Card withBorder p="xl" style={{ textAlign: 'center' }}>
                  <Text size="lg" c="dimmed">
                    📦
                  </Text>
                  <Text size="md" fw={500} mt="xs">
                    Sin stock en almacenes
                  </Text>
                  <Text size="sm" c="dimmed">
                    Este producto no tiene stock registrado en ningún almacén
                  </Text>
                </Card>
              )}
            </Stack>
          )}
        </Modal>
      </Container>
    </ProtectedLayout>
  );
};

export default Inventario;
