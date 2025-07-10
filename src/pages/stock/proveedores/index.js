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
} from "@mantine/core";
import { LayoutBase } from "@/layouts";
import { useForm } from "@mantine/form";
import { IconSearch, IconSettings, IconTrash, IconPencil } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const rowsPerPage = 5;

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorEditandoId, setProveedorEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);

  const form = useForm({
    initialValues: {
      razon_social: "",
      cuit_cuil: "",
      telefono: "",
      email: "",
      direccion: "",
      condiciones_pago:""
    },
    validate: {
      razon_social: v => (v.length < 2 ? "Razón social requerida" : null),
    },
  });

  const fetchProveedores = async () => {
    try {
      const res = await fetch("/api/stock/proveedores");
      const data = await res.json();
      setProveedores(data);
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
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
      if (!res.ok) throw new Error(data.message);

      notifications.show({
        title: modoEdicion ? "Proveedor actualizado" : "Proveedor creado",
        message: data.message,
        color: "green",
      });

      setOpened(false);
      setModoEdicion(false);
      setProveedorEditandoId(null);
      form.reset();
      fetchProveedores();
    } catch (err) {
      notifications.show({ title: "Error", message: err.message, color: "red" });
    }
  };

  const handleEdit = proveedor => {
    form.setValues(proveedor);
    setModoEdicion(true);
    setProveedorEditandoId(proveedor.id_proveedor);
    setOpened(true);
  };

  const handleDelete = async id => {
    if (!confirm("Estás seguro de eliminar este proveedor?")) return;
    try {
      const res = await fetch(`/api/stock/proveedores/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      notifications.show({ title: "Proveedor eliminado", message: data.message, color: "green" });
      fetchProveedores();
    } catch (err) {
      notifications.show({ title: "Error", message: err.message, color: "red" });
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const proveedoresFiltrados = proveedores.filter(p =>
    [p.razon_social, p.cuit, p.email, p.telefono, p.direccion]
      .some(field => field?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const start = (page - 1) * rowsPerPage;
  const pageRows = proveedoresFiltrados.slice(start, start + rowsPerPage);

  return (
    <LayoutBase>
      <Container size="lg">
        

        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Proveedores</Title>
            <Text c="dimmed" order={4}>Listado y gestión de proveedores</Text>
          </Grid.Col>

          <Grid.Col span={12} mt={20}>
            <Button variant="outline" color="#EE0E0F" onClick={() => setOpened(true)}>
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
                  <th align="start">Razón social</th>
                  <th align="start">CUIT</th>
                  <th align="start">Teléfono</th>
                  <th align="start">Email</th>
                  <th align="start">Dirección</th>
                   <th align="start">Condicion de pago</th>
                  <th align="start">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.razon_social}</td>
                    <td>{p.cuit_cuil}</td>
                    <td>{p.telefono}</td>
                    <td>{p.email}</td>
                    <td>{p.direccion}</td>
                    <td>{p.condiciones_pago}</td>
                    <td>
                      <Group gap="xs">
                        <ActionIcon color="blue" variant="subtle" onClick={() => handleEdit(p)}>
                          <IconPencil size={16} />
                        </ActionIcon>
                        <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(p.id_proveedor)}>
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
          onClose={() => {
            setOpened(false);
            form.reset();
            setModoEdicion(false);
            setProveedorEditandoId(null);
          }}
          title={modoEdicion ? "Editar proveedor" : "Crear proveedor"}
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col span={6}>
                <TextInput label="Razón social" {...form.getInputProps("razon_social")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="CUIT" {...form.getInputProps("cuit_cuil")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Teléfono" {...form.getInputProps("telefono")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Email" {...form.getInputProps("email")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Condición de pago" {...form.getInputProps("condiciones_pago")} />
              </Grid.Col>
               <Grid.Col span={6}>
                <TextInput label="Dirección" {...form.getInputProps("direccion")} />
              </Grid.Col>
              <Grid.Col span={12}>
                <Button variant="outline" color="#EE0E0F" type="submit" fullWidth>
                  {modoEdicion ? "Guardar cambios" : "Crear proveedor"}
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Modal>
      </Container>
    </LayoutBase>
  );
};

export default Proveedores;