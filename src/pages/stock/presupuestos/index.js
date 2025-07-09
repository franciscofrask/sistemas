"use client";

import React, { useEffect, useState } from "react";
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
  Modal,
  ActionIcon,
  Pagination,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPencil, IconPlus, IconTrash, IconSearch } from "@tabler/icons-react";
import BreadcrumbsNav from "@/components/Breadcrums";
import { notifications } from "@mantine/notifications";
import { useRouter } from 'next/router';


const rowsPerPage = 5;

export default function AlmacenesPage() {
  const [almacenes, setAlmacenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [opened, setOpened] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [almacenEditando, setAlmacenEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  const form = useForm({
    initialValues: {
      nombre: "",
      ubicacion: "",
      descripcion: "",
    },
    validate: {
      nombre: value => (value.length < 2 ? "El nombre es obligatorio" : null),
      ubicacion: value => (value.length < 2 ? "La ubicación es obligatoria" : null),
    },
  });

  const fetchAlmacenes = async () => {
    try {
      const res = await fetch("/api/stock/almacenes");
      const data = await res.json();
      setAlmacenes(data);
    } catch (error) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
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
      if (!res.ok) throw new Error(data.message);

      notifications.show({
        title: modoEdicion ? "Almacén actualizado" : "Almacén creado",
        message: data.message,
        color: "green",
      });

      fetchAlmacenes();
      form.reset();
      setModoEdicion(false);
      setAlmacenEditando(null);
      setOpened(false);
    } catch (error) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
    }
  };



  const almacenesFiltrados = almacenes.filter(a =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
    (a.descripcion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = almacenesFiltrados.slice(start, end);

  const rows = pageRows.map((a, index) => (
    <tr justify={"flex-start"} align={"flex-start"} key={index}>
      <td>{a.nombre}</td>
      <td>{a.ubicacion}</td>
      <td>{a.descripcion || "-"}</td>
      <td>
        <Group gap="xs">
          <ActionIcon color="blue" variant="subtle" onClick={() => handleEdit(a)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(a.id_almacen)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <LayoutBase>
      <Container size="lg">
       

        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Presupuestos</Title>
            <Text c="dimmed" order={4}>Cree y envíe presupuestos personalizados a sus clientes  </Text>
          </Grid.Col>

        <Grid.Col span={12}>
  <Button
    variant="outline"
    color="#EE0E0F"
    onClick={() => router.push('/stock/presupuestos/crearpresupuesto')}
  >
    Crear Presupuesto
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
                      <th align="start">Ubicación</th>
                      <th align="start">Descripción</th>
                      <th align="start">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>

               
              </>
            )}
          </Grid.Col>
          
        </Grid>
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
        <Modal
          opened={opened}
          onClose={() => {
            setOpened(false);
            form.reset();
            setModoEdicion(false);
            setAlmacenEditando(null);
          }}
          title={modoEdicion ? "Editar Almacén" : "Crear Almacén"}
          size="sm"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput label="Nombre" {...form.getInputProps("nombre")} required />
              <TextInput label="Ubicación" {...form.getInputProps("ubicacion")} required />
              <TextInput label="Descripción" {...form.getInputProps("descripcion")} />
              <Button type="submit" fullWidth variant="outline" color="#EE0E0F">
                {modoEdicion ? "Guardar cambios" : "Crear Almacén"}
              </Button>
            </Stack>
          </form>
        </Modal>
      </Container>
    </LayoutBase>
  );
}
