// pages/stock/proveedores/index.js

"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Grid,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Pagination,
  ActionIcon,
  Badge,
  Switch,
  Drawer,
  Divider,
  Menu,
} from "@mantine/core";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { useForm } from "@mantine/form";
import { IconSearch, IconSettings, IconTrash, IconPencil, IconEye, IconDots } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiCall, showErrorNotification, showSuccessNotification } from "@/utils/errorHandler";
import { useSafeAsync } from "@/hooks/useErrorHandler";

const rowsPerPage = 5;

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorEditandoId, setProveedorEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [loadingProveedor, setLoadingProveedor] = useState(false);
  
  // Hook para operaciones async seguras
  const { executeAsync } = useSafeAsync();

  const form = useForm({
    initialValues: {
      razon_social: "",
      cuit: "",
      email: "",
      telefono: "",
      direccion: "",
      activo: true,
    },
    validate: {
      razon_social: v => (v.length < 2 ? "Razón social requerida" : null),
      email: v => v && v.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Email inválido" : null,
    },
  });

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const url = `/api/stock/proveedores`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setProveedores(data.data || []);
      } else {
        throw new Error(data.message || 'Error cargando proveedores');
      }
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      notifications.show({
        title: "Error",
        message: "Error de conexión al cargar proveedores",
        color: "red"
      });
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async values => {
    try {
      const method = modoEdicion ? "PUT" : "POST";
      const url = modoEdicion
        ? `/api/stock/proveedores/${proveedorEditandoId}`
        : `/api/stock/proveedores`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Error en la operación');
      }

      notifications.show({
        title: modoEdicion ? "Proveedor actualizado" : "Proveedor creado",
        message: data.message || 'Operación completada exitosamente',
        color: "green",
      });

      handleCloseModal();
      fetchProveedores();
    } catch (err) {
      notifications.show({ 
        title: "Error", 
        message: err.message, 
        color: "red" 
      });
    }
  };

  const handleEdit = proveedor => {
    form.setValues(proveedor);
    setModoEdicion(true);
    setProveedorEditandoId(proveedor.id);
    setOpened(true);
  };

  const handleCreate = () => {
    form.reset();
    setModoEdicion(false);
    setProveedorEditandoId(null);
    setOpened(true);
  };

  const handleCloseModal = () => {
    form.reset();
    setModoEdicion(false);
    setProveedorEditandoId(null);
    setOpened(false);
  };

  const handleViewDetails = async (proveedorId) => {
    try {
      setLoadingProveedor(true);
      const res = await fetch(`/api/stock/proveedores/${proveedorId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error);
      }

      setProveedorSeleccionado(data.data);
      setDrawerOpened(true);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red"
      });
    } finally {
      setLoadingProveedor(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpened(false);
    setProveedorSeleccionado(null);
  };

  const handleDelete = async id => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?\n\nNota: La eliminación será permanente si el proveedor no tiene compras asociadas.")) return;
    try {
      const res = await fetch(`/api/stock/proveedores/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      notifications.show({ 
        title: "Proveedor eliminado", 
        message: data.message || 'Proveedor eliminado exitosamente', 
        color: "green" 
      });
      fetchProveedores();
    } catch (err) {
      notifications.show({ 
        title: "Error", 
        message: err.message, 
        color: "red" 
      });
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const proveedoresFiltrados = proveedores.filter(p =>
    [p.razon_social, p.cuit, p.email, p.telefono]
      .some(field => field?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const start = (page - 1) * rowsPerPage;
  const pageRows = proveedoresFiltrados.slice(start, start + rowsPerPage);

  return (
    <ProtectedLayout>
      <Container size="lg">
        

        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Proveedores</Title>
            <Text c="dimmed" order={4}>Listado y gestión de proveedores</Text>
          </Grid.Col>

          <Grid.Col span={12} mt={20}>
            <Button variant="outline" color="#EE0E0F" onClick={handleCreate}>
              Crear proveedor
            </Button>
          </Grid.Col>

          <Grid.Col span={12} mt={20}>
            <TextInput
              placeholder="Buscar proveedor..."
              value={busqueda}
              onChange={e => {
                setBusqueda(e.currentTarget.value);
                setPage(1);
              }}
              leftSection={<IconSearch size={18} />}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Table striped highlightOnHover withRowBorders withColumnBorders>
              <thead>
                <tr>
                  <th align="start">Razón Social</th>
                  <th align="start">CUIT</th>
                  <th align="start">Email</th>
                  <th align="start">Teléfono</th>
                  <th align="start">Estado</th>
                  <th align="start">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.razon_social}</td>
                    <td>{p.cuit || 'No especificado'}</td>
                    <td>{p.email || 'No especificado'}</td>
                    <td>{p.telefono || 'No especificado'}</td>
                    <td>
                      <Badge color={p.activo ? "green" : "red"}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td>
                      <Group gap="xs">
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Label>Acciones</Menu.Label>
                            <Menu.Item 
                              leftSection={<IconEye size={14} />}
                              onClick={() => handleViewDetails(p.id)}
                            >
                              Ver detalles
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<IconPencil size={14} />}
                              onClick={() => handleEdit(p)}
                            >
                              Editar
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDelete(p.id)}
                            >
                              Eliminar
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Group justify="center" mt="md">
              <Pagination
                total={Math.ceil(proveedoresFiltrados.length / rowsPerPage)}
                value={page}
                onChange={setPage}
                color="#EE0E0F"
                siblings={0}
                boundaries={1}
              />
            </Group>
          </Grid.Col>
        </Grid>

        <Modal
          opened={opened}
          onClose={handleCloseModal}
          title={modoEdicion ? "Editar proveedor" : "Crear proveedor"}
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col span={12}>
                <TextInput 
                  label="Razón Social" 
                  placeholder="Nombre de la empresa o razón social"
                  required
                  {...form.getInputProps("razon_social")} 
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput 
                  label="CUIT" 
                  placeholder="20-12345678-9"
                  {...form.getInputProps("cuit")} 
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput 
                  label="Email" 
                  placeholder="proveedor@ejemplo.com"
                  type="email"
                  {...form.getInputProps("email")} 
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput 
                  label="Teléfono" 
                  placeholder="011-1234-5678"
                  {...form.getInputProps("telefono")} 
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput 
                  label="Dirección" 
                  placeholder="Dirección del proveedor"
                  {...form.getInputProps("direccion")} 
                />
              </Grid.Col>
              {modoEdicion && (
                <Grid.Col span={12}>
                  <Switch 
                    label="Proveedor activo" 
                    description="Desactivar proveedor sin eliminarlo"
                    {...form.getInputProps("activo", { type: "checkbox" })}
                  />
                </Grid.Col>
              )}
              <Grid.Col span={12}>
                <Button variant="outline" color="#EE0E0F" type="submit" fullWidth>
                  {modoEdicion ? "Guardar cambios" : "Crear proveedor"}
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Modal>

        <Drawer
          opened={drawerOpened}
          onClose={handleCloseDrawer}
          title="Detalles del Proveedor"
          position="right"
          size="md"
        >
          {proveedorSeleccionado && (
            <Stack gap={"md"}>
              <div>
                <Text size="sm" c="dimmed">
                  Razón Social
                </Text>
                <Text size="lg" fw={600}>
                  {proveedorSeleccionado.razon_social}
                </Text>
              </div>

              <Divider />

              <div>
                <Text size="sm" c="dimmed">
                  CUIT
                </Text>
                <Text size="md">
                  {proveedorSeleccionado.cuit || "No especificado"}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Text size="md">
                  {proveedorSeleccionado.email || "No especificado"}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Teléfono
                </Text>
                <Text size="md">
                  {proveedorSeleccionado.telefono || "No especificado"}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Dirección
                </Text>
                <Text size="md">
                  {proveedorSeleccionado.direccion || "No especificada"}
                </Text>
              </div>

              <Divider />

              <div>
                <Text size="sm" c="dimmed">
                  Estado
                </Text>
                <Badge color={proveedorSeleccionado.activo ? "green" : "red"} size="lg">
                  {proveedorSeleccionado.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Fecha de Creación
                </Text>
                <Text size="md">
                  {proveedorSeleccionado.creado_en
                    ? new Date(proveedorSeleccionado.creado_en).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "No disponible"}
                </Text>
              </div>

              {proveedorSeleccionado.actualizado_en && (
                <div>
                  <Text size="sm" c="dimmed">
                    Última Actualización
                  </Text>
                  <Text size="md">
                    {new Date(proveedorSeleccionado.actualizado_en).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </div>
              )}

              <Divider />

              <Group justify="apart" mt="md">
                <Button 
                  variant="outline" 
                  color="blue" 
                  onClick={() => {
                    handleCloseDrawer();
                    handleEdit(proveedorSeleccionado);
                  }}
                >
                  Editar Proveedor
                </Button>
                <Button 
                  variant="outline" 
                  color="red" 
                  onClick={() => {
                    handleCloseDrawer();
                    handleDelete(proveedorSeleccionado.id);
                  }}
                >
                  Eliminar Proveedor
                </Button>
              </Group>
            </Stack>
          )}
        </Drawer>
      </Container>
    </ProtectedLayout>
  );
};

export default Proveedores;