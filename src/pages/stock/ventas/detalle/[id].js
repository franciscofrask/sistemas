"use client";

import React, { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import { useRouter } from 'next/router';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Table,
  Loader,
  Badge,
} from '@mantine/core';

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

export default function VentaDetallePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [venta, setVenta] = useState(null);
  const [items, setItems] = useState([]);
  const [movs, setMovs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const id = router.query?.id ? parseInt(router.query.id) : null;
        if (!id) return;
        setLoading(true);
        const resp = await fetch(`/api/stock/ventas/detalle?venta_id=${id}`);
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          console.error('Error en API detalle venta:', data);
          setError(data?.message || 'No se pudo obtener el detalle');
          return;
        }
        
        console.log('Datos recibidos del API:', data.data);
        setVenta(data.data.venta);
        setItems(Array.isArray(data.data.items) ? data.data.items : []);
        setMovs(Array.isArray(data.data.movimientos) ? data.data.movimientos : []);
      } catch (e) {
        setError(e.message || 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router.query?.id]);

  return (
    <ProtectedLayout>
      <Container size="lg">
        <Title order={2}>Detalle de Venta #{router.query?.id}</Title>
        {loading ? (
          <Group justify="center" py="xl"><Loader /></Group>
        ) : error ? (
          <Text c="red">{error}</Text>
        ) : venta ? (
          <Grid mt="md">
            <Grid.Col span={12}>
              <Card withBorder radius="md">
                <Group justify="space-between">
                  <Stack gap={2}>
                    <Text size="sm" c="dimmed">Fecha: {new Date(venta.fecha).toLocaleString()}</Text>
                    <Text size="sm" c="dimmed">Cliente: {venta.cliente_nombre}</Text>
                    <Text size="sm" c="dimmed">Almacén: {venta.almacen_nombre}</Text>
                    <Text size="sm" c="dimmed">Comprobante: {venta.tipo_comprobante} {venta.nro_comprobante || ''}</Text>
                  </Stack>
                  <Stack align="flex-end">
                    <Badge color={venta.estado === 'CONFIRMADA' ? 'green' : venta.estado === 'ANULADA' ? 'red' : 'gray'}>{venta.estado}</Badge>
                    <Text fw={700}>{money(venta.total)}</Text>
                  </Stack>
                </Group>
                {venta.observaciones && (
                  <Text size="sm" mt="sm">Obs.: {venta.observaciones}</Text>
                )}
              </Card>
            </Grid.Col>

            <Grid.Col span={12}>
              <Card withBorder radius="md" mt="md">
                <Title order={4}>Ítems</Title>
                <Table striped highlightOnHover mt="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th ta="center">Producto</Table.Th>
                      <Table.Th ta="center">Tipo</Table.Th>
                      <Table.Th ta="center">Detalle</Table.Th>
                      <Table.Th ta="center">Cantidad</Table.Th>
                      <Table.Th ta="center">Precio</Table.Th>
                      <Table.Th ta="center">Subtotal</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {!Array.isArray(items) || items.length === 0 ? (
                      <Table.Tr><Table.Td colSpan={6} ta="center"><Text c="dimmed">Sin ítems</Text></Table.Td></Table.Tr>
                    ) : items.map((it) => (
                      <Table.Tr key={it.venta_detalle_id}>
                        <Table.Td ta="center">
                          <Stack gap={2}>
                            <Text fw={500}>{it.producto_nombre}</Text>
                            {it.sku && <Text size="xs" c="dimmed">SKU: {it.sku}</Text>}
                          </Stack>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Badge variant="light" color={it.tipo_control_stock === 'UNIDAD' ? 'blue' : it.tipo_control_stock === 'LOTE' ? 'green' : 'purple'}>
                            {it.tipo_control_stock}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Stack gap={2}>
                            {it.tipo_control_stock === 'LOTE' && (
                              <>
                                <Text size="sm">Lote: {it.codigo_lote}</Text>
                                {it.fecha_vencimiento && <Text size="xs" c="orange">Vence: {new Date(it.fecha_vencimiento).toLocaleDateString()}</Text>}
                              </>
                            )}
                            {it.tipo_control_stock === 'SERIE' && (
                              <Text size="sm">Serie: {it.numero_serie}</Text>
                            )}
                          </Stack>
                        </Table.Td>
                        <Table.Td ta="center">{it.cantidad}</Table.Td>
                        <Table.Td ta="center">{money(it.precio_unitario)}</Table.Td>
                        <Table.Td ta="center">{money(it.subtotal)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>

            <Grid.Col span={12}>
              <Card withBorder radius="md" mt="md">
                <Title order={4}>Movimientos (si aplica)</Title>
                <Table striped highlightOnHover mt="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th ta="center">Fecha</Table.Th>
                      <Table.Th ta="center">Tipo</Table.Th>
                      <Table.Th ta="center">Producto</Table.Th>
                      <Table.Th ta="center">Almacén</Table.Th>
                      <Table.Th ta="center">Detalle</Table.Th>
                      <Table.Th ta="center">Cantidad</Table.Th>
                      <Table.Th ta="center">Origen</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {!Array.isArray(movs) || movs.length === 0 ? (
                      <Table.Tr><Table.Td colSpan={7} ta="center"><Text c="dimmed">Sin movimientos</Text></Table.Td></Table.Tr>
                    ) : movs.map((m) => (
                      <Table.Tr key={m.movimiento_id}>
                        <Table.Td ta="center">{new Date(m.fecha).toLocaleString()}</Table.Td>
                        <Table.Td ta="center">{m.tipo_movimiento}</Table.Td>
                        <Table.Td ta="center">{m.producto_nombre}</Table.Td>
                        <Table.Td ta="center">{m.almacen_nombre}</Table.Td>
                        <Table.Td ta="center">
                          <Stack gap={2}>
                            {m.lote_id && <Text size="sm">Lote: {m.codigo_lote}</Text>}
                            {m.serie_id && <Text size="sm">Serie: {m.numero_serie}</Text>}
                          </Stack>
                        </Table.Td>
                        <Table.Td ta="center">{m.tipo_movimiento === 'AJUSTE' ? m.cantidad : Number(m.cantidad).toFixed(3)}</Table.Td>
                        <Table.Td ta="center">{m.origen}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        ) : null}
      </Container>
    </ProtectedLayout>
  );
}
