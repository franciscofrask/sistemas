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
  ScrollArea,
  ActionIcon,
  Modal,
  Select,
  NumberInput,
  Checkbox,
  Loader,
  Menu,
  Textarea,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { apiCall, showErrorNotification, showSuccessNotification } from "@/utils/errorHandler";
import { useSafeAsync } from "@/hooks/useErrorHandler";

import { useForm } from "@mantine/form";
import {
  IconStackMiddle,
  IconCoins,
  IconSearch,
  IconPremiumRights,
  IconTimeline,
  IconPencil,
  IconTrash,
  IconSettings,
  IconEye,
  IconLibraryPlus,
  IconDots,
} from "@tabler/icons-react";

const rowsPerPage = 5;

const items = [
  {
    label: "En Stock",
    icon: IconStackMiddle,
    description: "$234",
    path: "/stock/dashboard",
  },
  {
    label: "Costo de Stock",
    icon: IconCoins,
    description: "$4343",
    path: "/stock/inventario",
  },
  {
    label: "Valor del stock",
    icon: IconPremiumRights,
    description: "$5435",
    path: "/stock/clientes",
  },
  {
    label: "Ganancia estimada",
    icon: IconTimeline,
    description: "$43545",
    path: "/stock/proveedores",
  },
];

const Inventario = () => {
  const [pageProductos, setPageProductos] = useState(1);
  const [pageUnidades, setPageUnidades] = useState(1);
  const [opened, setOpened] = useState(false);
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usarPorcentaje, setUsarPorcentaje] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [openedUnidad, setOpenedUnidad] = useState(false);
  const [unidadProductoId, setUnidadProductoId] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [activeTab, setActiveTab] = useState("productos");
  const [unidades, setUnidades] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Hook para operaciones async seguras
  const { executeAsync } = useSafeAsync();

  const formUnidad = useForm({
    initialValues: {
      numero_serie: "",
      id_almacen: "",
      observaciones: "",
      cantidad: 1,
    },
    validate: {
      id_almacen: v => (v.trim().length > 0 ? null : "ID de almacén requerido"),
    },

    transformValues: values => ({
      ...values,

      id_almacen: Number(values.id_almacen),

      cantidad: Number(values.cantidad),
    }),
  });

  const form = useForm({
    initialValues: {
      nombre: "",
      proveedor: "",
      marca: "",
      codigo_producto: "",
      descripcion: "",
      plazo_entrega: "",
      tipo_envio: "",
      garantia: "",
      modelo: "",
      categoria: "",
      precio_compra: 0,
      precio_venta: 0,
      proveedores: [],
    },
    validate: {
      nombre: value => (value.length < 2 ? "El nombre es obligatorio" : null),
    },
  });

  const fetchUnidades = async () => {
    const response = await executeAsync(
      async () => {
        const result = await apiCall("/api/stock/productos/unidad");
        return result.success ? (Array.isArray(result.data) ? result.data : result) : [];
      }
    );
    
    setUnidades(Array.isArray(response) ? response : []);
  };

  const handleAgregarUnidades = async values => {
    try {
      const data = await apiCall("/api/stock/productos/unidad", {
        method: "POST",
        body: JSON.stringify({
          id_producto: unidadProductoId,
          ...values,
        }),
      });

      showSuccessNotification(
        data.message || "Unidades agregadas correctamente",
        "Unidades agregadas"
      );

      setOpenedUnidad(false);
      formUnidad.reset();
      fetchProductos();
    } catch (error) {
      console.error("Error al agregar unidades:", error);
      showErrorNotification(error, "Error al agregar unidades");
    }
  };

  const fetchProductos = async () => {
    const response = await executeAsync(
      async () => {
        const result = await apiCall("/api/stock/productos");
        return result.success ? (Array.isArray(result.data) ? result.data : result) : [];
      }
    );
    
    setProductos(Array.isArray(response) ? response : []);
    setLoading(false);
  };

  useEffect(() => {
    if (usarPorcentaje) {
      const { precio_compra, porcentaje } = form.values;
      const precio_venta = precio_compra + (precio_compra * porcentaje) / 100;
      form.setFieldValue("precio_venta", Math.round(precio_venta * 100) / 100);
    }
  }, [form.values.precio_compra, form.values.porcentaje, usarPorcentaje]);

  const handleSubmit = async values => {
    try {
      const method = modoEdicion ? "PUT" : "POST";
      const url = modoEdicion
        ? `/api/stock/productos/${productoEditandoId}`
        : `/api/stock/productos`;

      const data = await apiCall(url, {
        method,
        body: JSON.stringify(values),
      });

      showSuccessNotification(
        modoEdicion
          ? "Se actualizó el producto correctamente"
          : "Se creó el producto correctamente",
        modoEdicion ? "Producto actualizado" : "Producto creado"
      );

      setOpened(false);
      form.reset();
      fetchProductos();
      setModoEdicion(false);
      setProductoEditandoId(null);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      showErrorNotification(error, "Error al guardar producto");
    }
  };

  const handleDelete = async id => {
    if (!confirm("¿Estás seguro que deseas eliminar este producto?")) return;
    try {
      const data = await apiCall(`/api/stock/productos/${id}`, {
        method: "DELETE",
      });

      showSuccessNotification(
        data.message || "Se eliminó el producto correctamente",
        "Producto eliminado"
      );

      fetchProductos(); // Recargar lista
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      showErrorNotification(error, "Error al eliminar producto");
    }
  };

  const handleObtenerAlmacenes = async () => {
    const response = await executeAsync(
      async () => {
        const result = await apiCall("/api/stock/almacenes");
        return result.success ? (Array.isArray(result.data) ? result.data : result) : [];
      }
    );
    
    setAlmacenes(Array.isArray(response) ? response : []);
  };

  const handleEdit = producto => {
    form.setValues({
      ...producto,
      proveedores: producto.proveedores || [],
    });
    setModoEdicion(true);
    setProductoEditandoId(producto.id_producto);
    setOpened(true);
  };

  useEffect(() => {
    fetchProductos();
    handleObtenerAlmacenes();
    fetchUnidades();
  }, []);

  // Filtrar productos según búsqueda
 const productosFiltrados = Array.isArray(productos)
  ? productos.filter(
      producto =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.codigo_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(producto.cantidad).includes(busqueda)
    )
  : [];

  const startProductos = (pageProductos - 1) * rowsPerPage;
  const endProductos = startProductos + rowsPerPage;
  const pageRows = productosFiltrados.slice(startProductos, endProductos);

  // Filtrar unidades según búsqueda
  const unidadesFiltradas = unidades.filter(
    unidad =>
      unidad.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      unidad.numero_serie?.toLowerCase().includes(busqueda.toLowerCase()) ||
      unidad.nombre_almacen.toLowerCase().includes(busqueda.toLowerCase())
  );

  const startUnidades = (pageUnidades - 1) * rowsPerPage;
  const endUnidades = startUnidades + rowsPerPage;
  const unidadRows = unidadesFiltradas.slice(startUnidades, endUnidades).map((unidad, index) => (
    <tr key={index}>
      <td>{unidad.nombre_producto}</td>
      <td>{unidad.numero_serie}</td>
      <td>{unidad.nombre_almacen}</td>
      <td>{unidad.estado}</td>
      <td>{unidad.observaciones || "-"}</td>
      <td>{new Date(unidad.fecha_movimiento).toLocaleDateString()}</td>
    </tr>
  ));

  const handleCardClick = path => {
    window.location.href = path;
  };

  const handleVerDetalle = producto => {
    setProductoDetalle(producto);
    setModalDetalleAbierto(true);
  };

  console.log("Unidades:", unidades);

  const rows = pageRows.map((item, index) => (
    <tr align="start" key={index}>
      <td>{item.nombre}</td>
      <td>{item.codigo_producto}</td>
      <td>{item.marca}</td>
      <td>{item.proveedores || "-"}</td>
      <td>{item.cantidad}</td>
      <td>${parseFloat(item.precio_compra).toLocaleString()}</td>
      <td>${parseFloat(item.precio_venta).toLocaleString()}</td>
      <td>{new Date(item.ultima_modificacion).toLocaleDateString()}</td>
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
              <Menu.Item
                leftSection={<IconLibraryPlus size={14} />}
                onClick={() => {
                  setUnidadProductoId(item.id_producto);
                  setOpenedUnidad(true);
                }}
              >
                Agregar unidades
              </Menu.Item>
              <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleEdit(item)}>
                Editar
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(item.id_producto)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ProtectedLayout>
      <Container size="lg" >
       
        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Inventario</Title>
            <Text c="dimmed" order={4}>
              Registro detallado de sus productos
            </Text>
          </Grid.Col>

          <Grid.Col mt={20} span={12}>
            <Button variant="outline" color="#EE0E0F" onClick={() => setOpened(true)}>
              Crear un Producto
            </Button>
          </Grid.Col>

          {items.map(item => (
            <Grid.Col key={item.label} span={{ base: 12, sm: 3, md: 3 }}>
              <Card
                shadow="xs"
                radius="md"
                withBorder
                style={{ height: "100%", cursor: "pointer" }}
                onClick={() => handleCardClick(item.path)}
              >
                <Stack>
                  <Group>
                    <Grid justify="flex-end" align="center">
                      <Grid.Col span={4}>
                        <item.icon size={50} />
                      </Grid.Col>
                      <Grid.Col span={8}>
                        <Title order={4}>{item.label}</Title>{" "}
                      </Grid.Col>
                      <Grid.Col span={7}>
                        <Text size="sm" c="dimmed">
                          {item.description}
                        </Text>
                      </Grid.Col>
                    </Grid>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}

          <Grid.Col mt={30} span={12}>
            <TextInput
              placeholder={`Buscar en ${activeTab === "productos" ? "productos" : "unidades"}...`}
              value={busqueda}
              onChange={e => {
                setBusqueda(e.currentTarget.value);
                if (activeTab === "productos") setPageProductos(1);
                if (activeTab === "unidades") setPageUnidades(1);
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
              <>
                <Tabs
                  value={activeTab}
                  onChange={(value) => {
    setActiveTab(value);
    setBusqueda(""); // limpiar búsqueda al cambiar de tab
    if (value === "productos") setPageProductos(1);
    if (value === "unidades") setPageUnidades(1);
  }}
                  mt="xl"
                  color="#EE0E0F"
                >
                  <Tabs.List>
                    <Tabs.Tab value="productos">Productos</Tabs.Tab>
                    <Tabs.Tab value="unidades">Unidades</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="productos" pt="md">
                    <Table striped highlightOnHover withRowBorders withColumnBorders>
                      <thead>
                        <tr>
                          <th align="start">Producto</th>
                          <th align="start">Código</th>
                          <th align="start">Marca</th>
                          <th align="start">Proveedor</th>
                          <th align="start">Stock</th>
                          <th align="start">Compra</th>
                          <th align="start">Venta</th>
                          <th align="start">Ult. Modif.</th>
                          <th align="start">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>{rows}</tbody>
                    </Table>
                    <Group justify="center" mt="md">
                      <Pagination
                        total={Math.ceil(productosFiltrados.length / rowsPerPage)}
                        value={pageProductos}
                        onChange={setPageProductos}
                        color="#ee0e0f"
                        siblings={0}
                        boundaries={1}
                      />
                    </Group>
                  </Tabs.Panel>

                  <Tabs.Panel value="unidades" pt="md">
                    <Table striped highlightOnHover withRowBorders withColumnBorders>
                      <thead>
                        <tr>
                          <th align="start">Producto</th>
                          <th align="start">N° Serie</th>
                          <th align="start">Almacén</th>
                          <th align="start">Estado</th>
                          <th align="start">Observaciones</th>
                          <th align="start">Fecha movimiento</th>
                        </tr>
                      </thead>
                      <tbody>{unidadRows}</tbody>
                    </Table>
                    <Group justify="center" mt="md">
                      <Pagination
                        total={Math.ceil(unidadesFiltradas.length / rowsPerPage)}
                        defaultValue={pageUnidades}
                        onChange={setPageUnidades}
                        color="#ee0e0f"
                       siblings={0}
                        boundaries={1}
                      />
                    </Group>
                  </Tabs.Panel>
                </Tabs>
              </>
            )}
          </Grid.Col>
        </Grid>
        {
          // Modal para crear/editar producto
        }
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
                <Title order={4}>Información Importante</Title>
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Nombre" {...form.getInputProps("nombre")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Marca" {...form.getInputProps("marca")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Proveedor"
                  data={["1", "2", "3"]}
                  multiple
                  {...form.getInputProps("proveedores")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Title order={4}>Información del producto</Title>
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Código" {...form.getInputProps("codigo_producto")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Plazo de entrega" {...form.getInputProps("plazo_entrega")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Tipo de envío" {...form.getInputProps("tipo_envio")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Garantía" {...form.getInputProps("garantia")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Modelo" {...form.getInputProps("modelo")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Categoría" {...form.getInputProps("categoria")} />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Descripción"
                  multiline
                  minRows={2}
                  {...form.getInputProps("descripcion")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Title order={4}>Información de venta</Title>
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Precio de compra"
                  prefix="$"
                  {...form.getInputProps("precio_compra")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Precio de venta"
                  prefix="$"
                  {...form.getInputProps("precio_venta")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Checkbox
                  label="Utilizar porcentaje"
                  checked={usarPorcentaje}
                  onChange={event => setUsarPorcentaje(event.currentTarget.checked)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Porcentaje de ganancia"
                  suffix="%"
                  disabled={!usarPorcentaje}
                  {...form.getInputProps("porcentaje")}
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
     
        <Modal
          opened={openedUnidad}
          onClose={() => {
            setOpenedUnidad(false);
            formUnidad.reset();
          }}
          title="Agregar unidades"
          size="sm"
        >
          <form onSubmit={formUnidad.onSubmit(handleAgregarUnidades)}>
            <Stack>
              <TextInput
                label="Número de serie"
                required
                {...formUnidad.getInputProps("numero_serie")}
              />
              <Select
  label="Almacén"
  placeholder="Seleccione un almacén"
  data={
    Array.isArray(almacenes)
      ? almacenes.map(almacen => ({
          value: String(almacen.id_almacen),
          label: almacen.nombre,
        }))
      : []
  }
  {...formUnidad.getInputProps("id_almacen")}
/>
              <Textarea
                label="Observaciones"
                autosize
                minRows={2}
                {...formUnidad.getInputProps("observaciones")}
              />
              <NumberInput label="Cantidad" min={1} {...formUnidad.getInputProps("cantidad")} />
              <Button type="submit" fullWidth variant="outline" color="#EE0E0F">
                Agregar unidades
              </Button>
            </Stack>
          </form>
        </Modal>

        {
          // Modal para ver detalles del producto
        }
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
                  <Grid.Col span={6}>
                    <Text>
                      <b>Modelo:</b> {productoDetalle.modelo || "-"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Código:</b> {productoDetalle.codigo_producto || "-"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Text>
                      <b>Descripción:</b> {productoDetalle.descripcion || "-"}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>

              <Title order={4} c="dimmed" mt="md">
                Datos comerciales
              </Title>
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Grid>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Categoría:</b> {productoDetalle.categoria}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Tipo envío:</b> {productoDetalle.tipo_envio || "-"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Plazo de entrega:</b> {productoDetalle.plazo_entrega || "-"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Garantía:</b> {productoDetalle.garantia || "-"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Precio de compra:</b> $
                      {parseFloat(productoDetalle.precio_compra).toLocaleString()}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Precio de venta:</b> $
                      {parseFloat(productoDetalle.precio_venta).toLocaleString()}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>

              <Title order={4} c="dimmed" mt="md">
                Otros datos
              </Title>
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Grid>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Stock actual:</b> {productoDetalle.cantidad}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text>
                      <b>Proveedores:</b> {productoDetalle.proveedores || "-"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Text>
                      <b>Última modificación:</b>{" "}
                      {new Date(productoDetalle.ultima_modificacion).toLocaleDateString()}
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
