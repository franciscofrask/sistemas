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
} from "@mantine/core";
import { LayoutBase } from "@/layouts";
import { useForm } from "@mantine/form";
import { IconSearch, IconTrash, IconPencil } from "@tabler/icons-react";
import BreadcrumbsNav from "@/components/Breadcrums";
import { notifications } from "@mantine/notifications";

const rowsPerPage = 5;

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [opened, setOpened] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);

  const form = useForm({
    initialValues: {
      nombre: "",
      apellido: "",
      dni:"",
      email: "",
      telefono: "",
      direccion: "",
    },
    validate: {
      nombre: v => (v.length < 2 ? "Nombre requerido" : null),
      apellido: v => (v.length < 2 ? "Apellido requerido" : null),
      email: v =>
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Email inválido" : null,
    },
  });

  const fetchClientes = async () => {
    try {
      const res = await fetch("/api/stock/clientes");
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
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
      if (!res.ok) throw new Error(data.message);

      notifications.show({
        title: modoEdicion ? "Cliente actualizado" : "Cliente creado",
        message: data.message,
        color: "green",
      });

      setOpened(false);
      setModoEdicion(false);
      setClienteEditandoId(null);
      form.reset();
      fetchClientes();
    } catch (err) {
      notifications.show({ title: "Error", message: err.message, color: "red" });
    }
  };

  const handleEdit = cliente => {
    form.setValues(cliente);
    setModoEdicion(true);
    setClienteEditandoId(cliente.id_cliente);
    setOpened(true);
  };

  const handleDelete = async id => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      const res = await fetch(`/api/stock/clientes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      notifications.show({ title: "Cliente eliminado", message: data.message, color: "green" });
      fetchClientes();
    } catch (err) {
      notifications.show({ title: "Error", message: err.message, color: "red" });
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c =>
    [c.nombre, c.apellido, c.email, c.telefono, c.direccion]
      .some(field => field?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const start = (page - 1) * rowsPerPage;
  const pageRows = clientesFiltrados.slice(start, start + rowsPerPage);

  return (
    <LayoutBase>
      <Container size="lg">
      

        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Clientes</Title>
            <Text c="dimmed" order={4}>Listado y gestión de clientes</Text>
          </Grid.Col>

          <Grid.Col span={12} mt={20}>
            <Button variant="outline" color="#EE0E0F" onClick={() => setOpened(true)}>
              Crear cliente
            </Button>
          </Grid.Col>

          <Grid.Col span={12} mt={20}>
            <TextInput
              placeholder="Buscar cliente..."
              value={busqueda}
              onChange={e => {
                setBusqueda(e.currentTarget.value);
                setPage(1);
              }}
              leftSection={<IconSearch size={18} />}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Table   >
              <thead>
                <tr>
                  <th align="start">Nombre</th>
                  <th  align="start">Apellido</th>
                   <th  align="start">DNI</th>
                  <th  align="start">Email</th>
                  <th  align="start">Teléfono</th>
                  <th  align="start">Dirección</th>
                  <th  align="start">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((c, idx) => (
                  <tr key={idx}>
                    <td>{c.nombre}</td>
                    <td>{c.apellido}</td>
                    <td>{c.dni}</td>
                    <td>{c.email}</td>
                    <td>{c.telefono}</td>
                    <td>{c.direccion}</td>
                    <td>
                      <Group gap="xs">
                        <ActionIcon color="blue" variant="subtle" onClick={() => handleEdit(c)}>
                          <IconPencil size={16} />
                        </ActionIcon>
                        <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(c.id_cliente)}>
                          <IconTrash size={16} />
                        </ActionIcon>
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
          onClose={() => {
            setOpened(false);
            form.reset();
            setModoEdicion(false);
            setClienteEditandoId(null);
          }}
          title={modoEdicion ? "Editar cliente" : "Crear cliente"}
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col span={6}>
                <TextInput label="Nombre" {...form.getInputProps("nombre")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Apellido" {...form.getInputProps("apellido")} />
              </Grid.Col>
            
                <Grid.Col span={6}>
                <TextInput label="DNI" {...form.getInputProps("dni")} />
              </Grid.Col>
                <Grid.Col span={6}>
                <TextInput label="Email" {...form.getInputProps("email")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Teléfono" {...form.getInputProps("telefono")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Dirección" {...form.getInputProps("direccion")} />
              </Grid.Col>
              <Grid.Col span={12}>
                <Button variant="outline" color="#EE0E0F" type="submit" fullWidth>
                  {modoEdicion ? "Guardar cambios" : "Crear cliente"}
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Modal>
      </Container>
    </LayoutBase>
  );
};

export default Clientes;
