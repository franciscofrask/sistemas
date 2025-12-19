"use client";

import React, { useEffect, useState } from "react";
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
  Modal,
  ActionIcon,
  Pagination,
  Loader,
  Badge,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPencil, IconPlus, IconTrash, IconSearch } from "@tabler/icons-react";

import { notifications } from "@mantine/notifications";

const rowsPerPage = 5;

export default function AlmacenesPage() {
  const [almacenes, setAlmacenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [opened, setOpened] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [almacenEditando, setAlmacenEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  const form = useForm({
    initialValues: {
      nombre: "",
      codigo: "",
      direccion: "",
      descripcion: "",      activo: true,    },
    validate: {
      nombre: value => (value.length < 2 ? "El nombre es obligatorio" : null),
    },
  });

  const fetchAlmacenes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stock/almacenes");
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAlmacenes(data.data || []);
      } else {
        throw new Error(data.message || 'Error cargando almacenes');
      }
    } catch (error) {
      console.error('Error cargando almacenes:', error);
      notifications.show({ 
        title: "Error", 
        message: "Error de conexión al cargar almacenes", 
        color: "red" 
      });
      setAlmacenes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlmacenes();
  }, []);

  const handleSubmit = async values => {
    try {
      const method = modoEdicion ? "PUT" : "POST";
      const url = modoEdicion ? `/api/stock/almacenes/${almacenEditando}` : "/api/stock/almacenes";

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
        title: modoEdicion ? "Almacén actualizado" : "Almacén creado",
        message: data.message || 'Operación completada exitosamente',
        color: "green",
      });

      handleCloseModal();
      fetchAlmacenes();
    } catch (err) {
      notifications.show({ 
        title: "Error", 
        message: err.message, 
        color: "red" 
      });
    }
  };

  const handleCloseModal = () => {
    form.reset();
    setModoEdicion(false);
    setAlmacenEditando(null);
    setOpened(false);
  };

  const handleCreate = () => {
    form.reset();
    setModoEdicion(false);
    setAlmacenEditando(null);
    setOpened(true);
  };

  const handleDelete = async id => {
    if (!confirm("¿Estás seguro que deseas eliminar este almacén?")) return;
    try {
      const res = await fetch(`/api/stock/almacenes/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        // Manejar diferentes tipos de errores
        if (res.status === 409) {
          // Error de integridad referencial
          throw new Error(data.message || 'No se puede borrar el almacén debido a registros relacionados');
        } else if (res.status === 404) {
          // Almacén no encontrado
          throw new Error(data.message || 'El almacén no existe');
        } else {
          // Otros errores
          throw new Error(data.message || 'Error eliminando almacén');
        }
      }

      notifications.show({ 
        title: "Almacén eliminado", 
        message: data.message || 'Almacén eliminado exitosamente', 
        color: "green" 
      });
      fetchAlmacenes();
    } catch (error) {
      notifications.show({ 
        title: "Error", 
        message: error.message, 
        color: "red",
        autoClose: 8000 // Más tiempo para leer mensajes de error largos
      });
    }
  };

  const handleEdit = almacen => {
    form.setValues({
      nombre: almacen.nombre,
      codigo: almacen.codigo || '',
      direccion: almacen.direccion || '',
      descripcion: almacen.descripcion || '',
      activo: almacen.activo === 1 || almacen.activo === true
    });
    setModoEdicion(true);
    setAlmacenEditando(almacen.id);
    setOpened(true);
  };

  const almacenesFiltrados = almacenes.filter(a =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (a.codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (a.direccion || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (a.descripcion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = almacenesFiltrados.slice(start, end);

  const rows = pageRows.map((a, index) => (
    <tr justify={"flex-start"} align={"flex-start"} key={index}>
      <td>{a.nombre}</td>
      <td>{a.codigo || "-"}</td>
      <td>{a.direccion || "-"}</td>
      <td>{a.descripcion || "-"}</td>
      <td>
        <Badge color={a.activo ? "green" : "red"}>
          {a.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </td>
      <td>
        <Group gap="xs">
          <ActionIcon color="blue" variant="subtle" onClick={() => handleEdit(a)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(a.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ProtectedLayout>
      <Container size="lg">
       

        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Almacenes</Title>
            <Text c="dimmed" order={4}>Gestión de almacenes físicos disponibles</Text>
          </Grid.Col>

          <Grid.Col span={12}>
            <Button variant="outline" color="#EE0E0F" onClick={handleCreate} >
              Crear Almacén
            </Button>
          </Grid.Col>

          <Grid.Col mt={30} span={12}>
            <TextInput
              placeholder="Buscar por nombre, ubicación o descripción..."
              value={busqueda}
              onChange={e => {
                setBusqueda(e.currentTarget.value);
                setPage(1);
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
                <Table striped highlightOnHover withRowBorders withColumnBorders>
                  <thead>
                    <tr>
                      <th align="start">Nombre</th>
                      <th align="start">Código</th>
                      <th align="start">Dirección</th>
                      <th align="start">Descripción</th>
                      <th align="start">Estado</th>
                      <th align="start">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>

                <Group justify="center" mt="md">
                  <Pagination
                    total={Math.ceil(almacenesFiltrados.length / rowsPerPage)}
                    value={page}
                    onChange={setPage}
                    color="#ee0e0f"
                    siblings={0}
                    boundaries={1}
                  />
                </Group>
              </>
            )}
          </Grid.Col>
        </Grid>

        <Modal
          opened={opened}
          onClose={handleCloseModal}
          title={modoEdicion ? "Editar Almacén" : "Crear Almacén"}
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <Grid.Col span={12}>
                <TextInput 
                  label="Nombre" 
                  placeholder="Nombre del almacén"
                  required
                  {...form.getInputProps("nombre")} 
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput 
                  label="Código" 
                  placeholder="Código del almacén"
                  {...form.getInputProps("codigo")} 
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput 
                  label="Dirección" 
                  placeholder="Dirección del almacén"
                  {...form.getInputProps("direccion")} 
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput 
                  label="Descripción" 
                  placeholder="Descripción del almacén"
                  {...form.getInputProps("descripcion")} 
                />
              </Grid.Col>
              {modoEdicion && (
                <Grid.Col span={12}>
                  <Switch
                    label="Almacén activo"
                    {...form.getInputProps("activo", { type: "checkbox" })}
                  />
                </Grid.Col>
              )}
              <Grid.Col span={12}>
                <Button type="submit" fullWidth variant="outline" color="#EE0E0F">
                  {modoEdicion ? "Guardar cambios" : "Crear Almacén"}
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Modal>
      </Container>
    </ProtectedLayout>
  );
}
