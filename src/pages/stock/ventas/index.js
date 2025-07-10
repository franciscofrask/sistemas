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
import { IconPencil, IconPlus, IconTrash, IconSearch } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from 'next/router';

const rowsPerPage = 5;

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPresupuestos = async () => {
    try {
      const res = await fetch("/api/stock/presupuestos/detallado");
      const data = await res.json();
      setPresupuestos(Array.isArray(data) ? data : []);
    } catch (error) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresupuestos();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/stock/presupuestos/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      notifications.show({ title: "Presupuesto eliminado", message: data.mensaje, color: "green" });
      fetchPresupuestos();
    } catch (error) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
    }
  };

  const presupuestosFiltrados = presupuestos.filter(p =>
    p.numero_presupuesto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.observaciones || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = presupuestosFiltrados.slice(start, end);

  const rows = pageRows.map((p, index) => (
    <tr key={index}>
      <td>{p.numero_presupuesto}</td>
      <td>{p.fecha}</td>
      <td>{p.cliente}</td>
     <td>{p.moneda} ${Number(p.total).toFixed(2)}</td>
      <td>{p.estado}</td>
      <td>
        <Group gap="xs">
          <ActionIcon color="blue" variant="subtle" onClick={() => router.push(`/stock/presupuestos/crearpresupuesto?id=${p.id_presupuesto}`)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(p.id_presupuesto)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <LayoutBase>
      <Container size="lg">
        <Title>Componente en desarrollo</Title>
        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Ventas</Title>
            <Text c="dimmed">Cree y administre ventas</Text>
          </Grid.Col>

          <Grid.Col span={12}>
            <Button
              variant="outline"
              color="#EE0E0F"
              onClick={() => router.push('/stock/ventas/crearventa')}
            >
              Crear Venta
            </Button>
          </Grid.Col>

          <Grid.Col mt={30} span={12}>
            <TextInput
              placeholder="Buscar por número, cliente u observaciones..."
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
                      <th>Número</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </>
            )}
          </Grid.Col>

          <Group justify="center" mt="md">
            <Pagination
              total={Math.ceil(presupuestosFiltrados.length / rowsPerPage)}
              value={page}
              onChange={setPage}
              color="#ee0e0f"
              siblings={0}
              boundaries={1}
            />
          </Group>
        </Grid>
      </Container>
    </LayoutBase>
  );
}
