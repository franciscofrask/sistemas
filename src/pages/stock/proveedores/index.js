import React, { useState, useEffect } from "react";
import { LayoutBase } from "@/layouts";
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
  Pagination,
  ScrollArea,
  ActionIcon,
  Modal,
  Select,
  NumberInput,
  Checkbox,
  Loader,
  
} from "@mantine/core";
import BreadcrumbsNav from "@/components/Breadcrums";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import {
  IconStackMiddle,
  IconCoins,
  IconSearch,
  IconPremiumRights,
  IconTimeline,
  IconPencil,
  IconTrash,
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
    label: "Gancia estimada",
    icon: IconTimeline,
    description: "$43545",
    path: "/stock/proveedores",
  },
];

const Index = () => {
  const [page, setPage] = useState(1);
  const [opened, setOpened] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
   const [usarPorcentaje, setUsarPorcentaje] = useState(false);
   const [modoEdicion, setModoEdicion] = useState(false);
const [productoEditandoId, setProductoEditandoId] = useState(null);


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

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/stock/productos");
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error al obtener productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

   useEffect(() => {
    if (usarPorcentaje) {
      const { precio_compra, porcentaje } = form.values;
      const precio_venta = precio_compra + (precio_compra * porcentaje / 100);
      form.setFieldValue("precio_venta", Math.round(precio_venta * 100) / 100);
    }
  }, [form.values.precio_compra, form.values.porcentaje, usarPorcentaje]);



  const handleSubmit = async (values) => {
  try {
    const method = modoEdicion ? "PUT" : "POST";
    const url = modoEdicion
      ? `/api/stock/productos/${productoEditandoId}`
      : `/api/stock/productos`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    notifications.show({
      title: modoEdicion ? "Producto actualizado" : "Producto creado",
      message: modoEdicion
        ? "Se actualizó el producto correctamente"
        : "Se creó el producto correctamente",
      color: "green",
    });

    setOpened(false);
    form.reset();
    fetchProductos();
    setModoEdicion(false);
    setProductoEditandoId(null);
  } catch (error) {
    notifications.show({
      title: "Error",
      message: error.message,
      color: "red",
    });
  }
};


  const handleDelete = async (id) => {
  if (!confirm("¿Estás seguro que deseas eliminar este producto?")) return;
  try {
    const res = await fetch(`/api/stock/productos/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    notifications.show({
      title: "Producto eliminado",
      message: "Se eliminó el producto correctamente",
      color: "green",
    });

    fetchProductos(); // Recargar lista
  } catch (error) {
    notifications.show({
      title: "Error",
      message: error.message,
      color: "red",
    });
  }
};

const handleEdit = (producto) => {
  form.setValues({
    ...producto,
    proveedores: producto.proveedores || [],
  });
  setModoEdicion(true);
  setProductoEditandoId(producto.id_producto);
  setOpened(true);
};

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = productos.slice(start, end);

  const handleCardClick = path => {
    window.location.href = path;
  };

  const rows = pageRows.map((item, index) => (
    <tr align="start"  key={index}>
      <td >{item.nombre}</td>
      <td>{item.descripcion}</td>
      <td >{item.marca}</td>
      <td >{item.proveedores || "-"}</td>
      <td >{item.cantidad}</td>
      <td >${parseFloat(item.precio_compra).toLocaleString()}</td>
      <td >${parseFloat(item.precio_venta).toLocaleString()}</td>
      <td >{new Date(item.ultima_modificacion).toLocaleDateString()}</td>
      <td  >
        <Group gap="xs" >
        <ActionIcon color="blue" variant="subtle" onClick={() => handleEdit(item)}>
          <IconPencil size={16} />
        </ActionIcon>
        <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(item.id_producto)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
      </td>
    </tr>
  ));

  return (
    <LayoutBase>
      <Container size="lg" py="xl">
        <BreadcrumbsNav
          items={[{ title: "Inicio", href: "/" }, { title: "Stock", href: "/stock" }]}
          separator="/"
          separatorColor="#EE0E0F"
          currentColor="#EE0E0F"
        />

        <Grid mt={30}>
          <Grid.Col span={12}>
            <Title order={1}>Proveedores</Title>
            <Text c="dimmed" order={4}>Registro detallado de sus proveedores</Text>
          </Grid.Col>

          <Grid.Col mt={30} span={3}>
            <Button variant="outline" color="#EE0E0F" onClick={() => setOpened(true)}>
              Crear un Producto
            </Button>
          </Grid.Col>
          <Grid.Col mt={30} span={9}>
            <Button variant="outline" color="#EE0E0F" onClick={() => setOpened(true)}>
              Agregar unidades
            </Button>
          </Grid.Col>

          {items.map(item => (
            <Grid.Col key={item.label} span={{ base: 12, sm: 3, md: 3 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ height: "100%", cursor: "pointer" }}
                onClick={() => handleCardClick(item.path)}
              >
                <Stack spacing="xs">
                  <Group>
                    <item.icon size={24} />
                    <Title order={4}>{item.label}</Title>
                  </Group>
                  <Text size="sm" c="dimmed">{item.description}</Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}

          <Grid.Col mt={30} span={12}>
            <TextInput placeholder="Buscar producto..." leftSection={<IconSearch size={18} />} />
          </Grid.Col>

          <Grid.Col span={12}>
            <ScrollArea h={400}>
              {loading ? (
                <Group justify="center" py="xl">
                  <Loader />
                </Group>
              ) : (
                <>
                  <Table withTableBorder withColumnBorders highlightOnHover>
                    <thead>
                      <tr >
                        <th align="start">Producto</th>
                        <th align="start">Descripción</th>
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
                      total={Math.ceil(productos.length / rowsPerPage)}
                      value={page}
                      onChange={setPage}
                      color="dark"
                    />
                  </Group>
                </>
              )}
            </ScrollArea>
          </Grid.Col>
        </Grid>

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
>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col  span={12}><Title order={4}>Información Importante</Title></Grid.Col>
              <Grid.Col span={6}><TextInput label="Nombre" {...form.getInputProps("nombre")} /></Grid.Col>
              <Grid.Col span={6}><TextInput label="Marca" {...form.getInputProps("marca")} /></Grid.Col>
              <Grid.Col span={6}><Select label="Proveedor" data={["1", "2", "3"]} multiple {...form.getInputProps("proveedores")} /></Grid.Col>
              <Grid.Col span={12}><Title order={4}>Información del producto</Title></Grid.Col>
              <Grid.Col span={6}><TextInput label="Código" {...form.getInputProps("codigo_producto")} /></Grid.Col>
              <Grid.Col span={6}><TextInput label="Plazo de entrega" {...form.getInputProps("plazo_entrega")} /></Grid.Col>
              <Grid.Col span={6}><TextInput label="Tipo de envío" {...form.getInputProps("tipo_envio")} /></Grid.Col>
              <Grid.Col span={6}><TextInput label="Garantía" {...form.getInputProps("garantia")} /></Grid.Col>
              <Grid.Col span={6}><TextInput label="Modelo" {...form.getInputProps("modelo")} /></Grid.Col>
              <Grid.Col span={6}><TextInput label="Categoría" {...form.getInputProps("categoria")} /></Grid.Col>
              <Grid.Col span={12}><TextInput label="Descripción" multiline minRows={2} {...form.getInputProps("descripcion")} /></Grid.Col>
              <Grid.Col span={12}><Title order={4}>Información de venta</Title></Grid.Col>
              <Grid.Col span={6}><NumberInput label="Precio de compra" prefix="$" {...form.getInputProps("precio_compra")} /></Grid.Col>
              <Grid.Col span={6}><NumberInput label="Precio de venta" prefix="$" {...form.getInputProps("precio_venta")} /></Grid.Col>
               <Grid.Col span={12}><Checkbox label="Utilizar porcentaje" checked={usarPorcentaje} onChange={(event) => setUsarPorcentaje(event.currentTarget.checked)} /></Grid.Col>
              <Grid.Col span={6}><NumberInput label="Porcentaje de ganancia" suffix="%" disabled={!usarPorcentaje} {...form.getInputProps("porcentaje")} /></Grid.Col>
              <Grid.Col span={12}><Button variant="outline" color="#EE0E0F" type="submit" fullWidth >Crear Producto</Button></Grid.Col>
            </Grid>
          </form>
        </Modal>
      </Container>
    </LayoutBase>
  );
};

export default Index;
