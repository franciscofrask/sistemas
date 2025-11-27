"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import {
  Button,
  Card,
  Container,
  Grid,
  Group,
  Text,
  TextInput,
  Title,
  Table,
  Modal,
  ActionIcon,
  Pagination,
  Loader,
  Stack,
  Divider,
} from "@mantine/core";
import { IconEye, IconTrash, IconSearch } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from 'next/router';

const rowsPerPage = 5;

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
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

  const fetchDetallePresupuesto = async (id) => {
    try {
      const res = await fetch(`/api/stock/presupuestos/${id}`);
      const data = await res.json();
      setDetalle(data);
      setModalAbierto(true);
    } catch (error) {
      notifications.show({ title: "Error", message: "No se pudo cargar el detalle", color: "red" });
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
          <ActionIcon color="blue" variant="subtle" onClick={() => fetchDetallePresupuesto(p.id_presupuesto)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(p.id_presupuesto)}>
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
            <Title order={1}>Presupuestos</Title>
            <Text c="dimmed">Cree y administre presupuestos para sus clientes</Text>
          </Grid.Col>

          <Grid.Col span={12}>
            <Button
              variant="outline"
              color="#EE0E0F"
              onClick={() => router.push('/stock/ventas/crearventa')}
            >
              Crear Presupuesto
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
                      <th align="start">Número</th>
                      <th align="start">Fecha</th>
                      <th align="start">Cliente</th>
                      <th align="start">Total</th>
                      <th align="start">Estado</th>
                      <th align="start">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
                 <Group  justify="center" mt="md">
            <Pagination
              total={Math.ceil(presupuestosFiltrados.length / rowsPerPage)}
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
          opened={modalAbierto}
          onClose={() => setModalAbierto(false)}
          title={`Detalle del Presupuesto Nº ${detalle?.numero_presupuesto || ''}`}
          size="lg"
          centered
          scrollArea="inside"
        >
          {detalle ? (
            <Stack>
              <Card withBorder shadow="sm">
                <Title order={4}>Información General</Title>
                <Text>Fecha: {detalle.fecha}</Text>
                <Text>Vencimiento: {detalle.fecha_vencimiento}</Text>
                <Text>Estado: {detalle.estado}</Text>
                <Text>Forma de Pago: {detalle.forma_pago}</Text>
                <Text>Moneda: {detalle.moneda}</Text>
              </Card>

              <Card withBorder shadow="sm">
                <Title order={4}>Cliente</Title>
                <Text>Nombre: {detalle.cliente.nombre}</Text>
                <Text>Teléfono: {detalle.cliente.telefono}</Text>
              </Card>

              <Card withBorder shadow="sm">
                <Title order={4}>Vendedor</Title>
                <Text>{detalle.vendedor.nombre}</Text>
              </Card>

              <Card withBorder shadow="sm">
                <Title order={4}>Productos</Title>
                <Table withBorder withColumnBorders>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                 <tbody>
  {detalle.productos.map((prod, idx) => (
    <tr key={idx}>
      <td>{prod.nombre}</td>
      <td>{prod.marca}</td>
      <td>{prod.modelo}</td>
      <td>{prod.cantidad}</td>
      <td>${Number(prod.precio_unitario).toFixed(2)}</td>
      <td>${Number(prod.subtotal).toFixed(2)}</td>
    </tr>
  ))}
</tbody>
                </Table>
              </Card>

              <Card withBorder shadow="sm">
                <Title order={4}>Resumen</Title>
                <Text>Descuento: -${Number(detalle.descuento).toFixed(2)}</Text>
                <Text>Impuestos: +${Number(detalle.impuestos).toFixed(2)}</Text>
                <Text fw={700}>Total: ${Number(detalle.total).toFixed(2)}</Text>
              </Card>
            </Stack>
          ) : (
            <Text>Cargando datos...</Text>
          )}
        </Modal>

      </Container>
    </ProtectedLayout>
  );
}