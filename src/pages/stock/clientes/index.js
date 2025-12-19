"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Grid,
  Group,
  Modal,
  Table,
  Text,
  TextInput,
  Title,
  Pagination,
  ActionIcon,
  Switch,
  Badge,
  Drawer,
  Stack,
  Divider,
  LoadingOverlay,
  Menu,
} from "@mantine/core";
import { IconSearch, IconTrash, IconPencil, IconEye, IconDots } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { apiCall, showErrorNotification, showSuccessNotification } from "@/utils/errorHandler";
import ProtectedLayout from "../../../components/Layout/ProtectedLayout";

const rowsPerPage = 5;

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [opened, setOpened] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [loadingCliente, setLoadingCliente] = useState(false);

  const form = useForm({
    initialValues: {
      nombre: "",
      cuit: "",
      email: "",
      telefono: "",
      direccion: "",
      activo: true,
    },
    validate: {
      nombre: v => (v.length < 2 ? "Nombre requerido" : null),
      email: v => v && v.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Email inválido" : null,
    },
  });

  const fetchClientes = async (incluirInactivos = false) => {
    try {
      const url = `/api/stock/clientes?incluir_inactivos=${incluirInactivos ? '1' : '0'}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setClientes(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Error al obtener clientes:", data.message);
        notifications.show({
          title: "Error",
          message: "No se pudieron cargar los clientes",
          color: "red"
        });
        setClientes([]);
      }
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      notifications.show({
        title: "Error",
        message: "Error de conexión al cargar clientes",
        color: "red"
      });
      setClientes([]);
    }
  };

  const handleSubmit = async values => {
    try {
      const method = modoEdicion ? "PUT" : "POST";
      const url = modoEdicion
        ? `/api/stock/clientes/${clienteEditandoId}`
        : `/api/stock/clientes`;

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
        title: modoEdicion ? "Cliente actualizado" : "Cliente creado",
        message: data.message || 'Operación completada exitosamente',
        color: "green",
      });

      handleCloseModal();
      fetchClientes(incluirInactivos);
    } catch (err) {
      notifications.show({ 
        title: "Error", 
        message: err.message, 
        color: "red" 
      });
    }
  };

  const handleEdit = cliente => {
    form.setValues(cliente);
    setModoEdicion(true);
    setClienteEditandoId(cliente.id);
    setOpened(true);
  };

  const handleCreate = () => {
    form.reset();
    setModoEdicion(false);
    setClienteEditandoId(null);
    setOpened(true);
  };

  const handleCloseModal = () => {
    form.reset();
    setModoEdicion(false);
    setClienteEditandoId(null);
    setOpened(false);
  };

  const handleViewDetails = async (clienteId) => {
    try {
      setLoadingCliente(true);
      const res = await fetch(`/api/stock/clientes/${clienteId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error);
      }

      setClienteSeleccionado(data.data);
      setDrawerOpened(true);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red"
      });
    } finally {
      setLoadingCliente(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpened(false);
    setClienteSeleccionado(null);
  };

  const handleDelete = async id => {
    if (!confirm("¿Estás seguro de eliminar este cliente?\n\nNota: La eliminación será permanente si el cliente no tiene ventas o presupuestos asociados.")) return;
    try {
      const res = await fetch(`/api/stock/clientes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      notifications.show({ 
        title: "Cliente eliminado", 
        message: data.message || 'Cliente eliminado exitosamente', 
        color: "green" 
      });
      fetchClientes(incluirInactivos);
    } catch (err) {
      notifications.show({ 
        title: "Error", 
        message: err.message, 
        color: "red" 
      });
    }
  };

  useEffect(() => {
    fetchClientes(incluirInactivos);
  }, [incluirInactivos]);

  const clientesFiltrados = clientes.filter(c =>
    [c.nombre, c.cuit, c.email, c.telefono, c.direccion]
      .some(field => field?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const start = (page - 1) * rowsPerPage;
  const pageRows = clientesFiltrados.slice(start, start + rowsPerPage);

  return (
    <ProtectedLayout>
      <Container size="lg">
      

        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Clientes</Title>
            <Text c="dimmed" order={4}>Listado y gestión de clientes</Text>
          </Grid.Col>

          <Grid.Col span={12} mt={20}>
            <Button variant="outline" color="#EE0E0F" onClick={handleCreate}>
              Crear cliente
            </Button>
          </Grid.Col>

          <Grid.Col span={12} mt={20}>
            <Group>
              <TextInput
                placeholder="Buscar cliente..."
                value={busqueda}
                onChange={e => {
                  setBusqueda(e.currentTarget.value);
                  setPage(1);
                }}
                leftSection={<IconSearch size={18} />}
                style={{ flex: 1 }}
              />
              <Switch
                label="Incluir inactivos"
                checked={incluirInactivos}
                onChange={(e) => setIncluirInactivos(e.currentTarget.checked)}
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={12}>
            <Table   >
              <thead>
                <tr>
                  <th align="start">Nombre</th>
                  <th  align="start">CUIT</th>
                  <th  align="start">Email</th>
                  <th  align="start">Teléfono</th>
                  <th  align="start">Dirección</th>
                  <th  align="start">Estado</th>
                  <th  align="start">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((c, idx) => (
                  <tr key={idx}>
                    <td>{c.nombre}</td>
                    <td>{c.cuit || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{c.direccion || '-'}</td>
                    <td>
                      <Badge color={c.activo ? 'green' : 'red'} size="sm">
                        {c.activo ? 'Activo' : 'Inactivo'}
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
                              onClick={() => handleViewDetails(c.id)}
                            >
                              Ver detalles
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<IconPencil size={14} />}
                              onClick={() => handleEdit(c)}
                            >
                              Editar
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDelete(c.id)}
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
                total={Math.ceil(clientesFiltrados.length / rowsPerPage)}
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
          title={modoEdicion ? "Editar cliente" : "Crear cliente"}
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col span={12}>
                <TextInput 
                  label="Nombre" 
                  placeholder="Nombre del cliente"
                  required
                  {...form.getInputProps("nombre")} 
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
                  placeholder="cliente@ejemplo.com"
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
                  placeholder="Dirección del cliente"
                  {...form.getInputProps("direccion")} 
                />
              </Grid.Col>
              {modoEdicion && (
                <Grid.Col span={12}>
                  <Switch 
                    label="Cliente activo" 
                    description="Desactivar cliente sin eliminarlo"
                    {...form.getInputProps("activo", { type: "checkbox" })}
                  />
                </Grid.Col>
              )}
              <Grid.Col span={12}>
                <Button variant="outline" color="#EE0E0F" type="submit" fullWidth>
                  {modoEdicion ? "Guardar cambios" : "Crear cliente"}
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Modal>

        <Drawer
          opened={drawerOpened}
          onClose={handleCloseDrawer}
          title="Detalles del Cliente"
          position="right"
          size="md"
        >
          {clienteSeleccionado && (
            <Stack gap={"md"}>
              <div>
                <Text size="sm" c="dimmed">
                  Nombre
                </Text>
                <Text size="lg" fw={600}>
                  {clienteSeleccionado.nombre}
                </Text>
              </div>

              <Divider />

              <div>
                <Text size="sm" c="dimmed">
                  CUIT
                </Text>
                <Text size="md">
                  {clienteSeleccionado.cuit || "No especificado"}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Text size="md">
                  {clienteSeleccionado.email || "No especificado"}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Teléfono
                </Text>
                <Text size="md">
                  {clienteSeleccionado.telefono || "No especificado"}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Dirección
                </Text>
                <Text size="md">
                  {clienteSeleccionado.direccion || "No especificada"}
                </Text>
              </div>

              <Divider />

              <div>
                <Text size="sm" c="dimmed">
                  Estado
                </Text>
                <Badge color={clienteSeleccionado.activo ? "green" : "red"} size="lg">
                  {clienteSeleccionado.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div>
                <Text size="sm" c="dimmed">
                  Fecha de Creación
                </Text>
                <Text size="md">
                  {clienteSeleccionado.creado_en
                    ? new Date(clienteSeleccionado.creado_en).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "No disponible"}
                </Text>
              </div>

              {clienteSeleccionado.actualizado_en && (
                <div>
                  <Text size="sm" c="dimmed">
                    Última Actualización
                  </Text>
                  <Text size="md">
                    {new Date(clienteSeleccionado.actualizado_en).toLocaleDateString('es-ES', {
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
                    handleEdit(clienteSeleccionado);
                  }}
                >
                  Editar Cliente
                </Button>
                <Button 
                  variant="outline" 
                  color="red" 
                  onClick={() => {
                    handleCloseDrawer();
                    handleDelete(clienteSeleccionado.id);
                  }}
                >
                  Eliminar Cliente
                </Button>
              </Group>
            </Stack>
          )}
        </Drawer>
      </Container>
    </ProtectedLayout>
  );
};

export default Clientes;
