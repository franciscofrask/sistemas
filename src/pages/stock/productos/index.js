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

  const form = useForm({
    initialValues: {
      nombre: "",
      marca: "",
      codigo_producto: "",
      descripcion: "",
      precio_lista: 0,
    },
    validate: {
      nombre: value => (value.length < 2 ? "El nombre es obligatorio" : null),
    },
  });

  // Función para obtener productos desde la API
  const fetchProductos = async () => {
    try {
      setLoading(true);
      
      // Obtener almacén seleccionado del localStorage
      let almacenId = null;
      try {
        const almacenGuardado = localStorage.getItem('almacen_seleccionado')??  NULL;
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
  }, []);

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

  const handleSubmit = values => {
    console.log("Submit:", values);
  };

  const handleDelete = id => {
    console.log("Delete:", id);
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
                          <Text c={parseFloat(item.stock_total) === 0 ? "red" : "green"}>
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
            form.reset();
            setModoEdicion(false);
            setProductoEditandoId(null);
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
              <Grid.Col span={6}>
                <TextInput label="Nombre" {...form.getInputProps("nombre")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Marca" {...form.getInputProps("marca")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Código" {...form.getInputProps("codigo_producto")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Precio Lista"
                  prefix="$"
                  {...form.getInputProps("precio_lista")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Descripción"
                  autosize
                  minRows={3}
                  {...form.getInputProps("descripcion")}
                />
              </Grid.Col>
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
      </Container>
    </ProtectedLayout>
  );
};

export default Inventario;
