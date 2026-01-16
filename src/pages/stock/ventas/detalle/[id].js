"use client";

import React, { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import { useRouter } from 'next/router';
import { useStableSession } from '@/hooks/useStableSession';
import { notifications } from '@mantine/notifications';
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
  Button,
  Modal,
  NumberInput,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCash, IconX } from '@tabler/icons-react';

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}

export default function VentaDetallePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useStableSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [venta, setVenta] = useState(null);
  const [items, setItems] = useState([]);
  const [movs, setMovs] = useState([]);
  
  // Estados para modal de pago
  const [opened, { open, close }] = useDisclosure(false);
  const [importe, setImporte] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [registrandoPago, setRegistrandoPago] = useState(false);

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

  const registrarPago = async () => {
    const importeNumero = parseFloat(importe);
    if (!importe || isNaN(importeNumero) || importeNumero <= 0) {
      notifications.show({
        title: 'Error',
        message: 'Debe ingresar un importe válido',
        color: 'red',
      });
      return;
    }

    console.log('Estado de sesión:', {
      session,
      sessionStatus,
      userId: session?.user?.id,
      hasSession: !!session,
      hasUser: !!session?.user
    });

    if (sessionStatus === 'loading') {
      notifications.show({
        title: 'Error',
        message: 'Esperando autenticación...',
        color: 'orange',
      });
      return;
    }

    if (!session?.user?.id) {
      notifications.show({
        title: 'Error',
        message: 'Debe estar autenticado para registrar pagos',
        color: 'red',
      });
      return;
    }

    try {
      setRegistrandoPago(true);
      
      console.log('Iniciando registro de pago...', {
        cliente_id: venta.cliente_id,
        venta_id: venta.id,
        importe: importeNumero,
        observaciones: observaciones,
        creado_por: session.user.id,
      });
      
      const resp = await fetch('/api/stock/ventas/registrar-cobranza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: venta.cliente_id,
          venta_id: venta.id,
          importe: importeNumero,
          observaciones: observaciones,
          creado_por: session.user.id,
        }),
      });
      
      console.log('Respuesta recibida:', resp.status, resp.ok);
      
      const data = await resp.json();
      
      console.log('Datos de respuesta:', data);
      
      if (!resp.ok || !data.success) {
        throw new Error(data?.message || 'No se pudo registrar el pago');
      }
      
      notifications.show({
        title: 'Pago registrado',
        message: 'El pago se registró correctamente',
        color: 'green',
      });
      
      // Cerrar modal y limpiar campos
      close();
      setImporte('');
      setObservaciones('');
      
      // Recargar datos de la venta
      const id = router.query?.id ? parseInt(router.query.id) : null;
      if (id) {
        const respVenta = await fetch(`/api/stock/ventas/detalle?venta_id=${id}`);
        const dataVenta = await respVenta.json();
        if (respVenta.ok && dataVenta.success) {
          setVenta(dataVenta.data.venta);
        }
      }
    } catch (error) {
      console.error('Error completo en registrarPago:', error);
      notifications.show({
        title: 'Error al registrar pago',
        message: error.message || 'Error desconocido',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setRegistrandoPago(false);
    }
  };

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
                    <Group>
                      <Badge color={venta.estado === 'CONFIRMADA' ? 'green' : venta.estado === 'ANULADA' ? 'red' : 'gray'}>{venta.estado}</Badge>
                      {venta.estado_pago && (
                        <Badge color={venta.estado_pago === 'PAGADA' ? 'green' : venta.estado_pago === 'PARCIAL' ? 'yellow' : 'red'}>
                          {venta.estado_pago}
                        </Badge>
                      )}
                    </Group>
                    <Text fw={700}>{money(venta.total)}</Text>
                    {venta.saldo_pendiente != null && venta.saldo_pendiente > 0 && (
                      <Text size="sm" c="orange">Saldo pendiente: {money(venta.saldo_pendiente)}</Text>
                    )}
                    {venta.estado === 'CONFIRMADA' && venta.estado_pago !== 'PAGADA' && (
                      <Button
                        leftSection={<IconCash size={16} />}
                        onClick={open}
                        color="green"
                        variant="outline"
                        size="sm"
                      >
                        Registrar Pago
                      </Button>
                    )}
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
      
      <Modal
        opened={opened}
        onClose={close}
        title="Registrar Pago"
        size="md"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Venta #{venta?.id} - Total: {venta ? money(venta.total) : ''}
          </Text>
          {venta?.saldo_pendiente != null && (
            <Text size="sm" c="orange">
              Saldo pendiente: {money(venta.saldo_pendiente)}
            </Text>
          )}
          
          <TextInput
            label="Importe a pagar"
            placeholder="0.00"
            value={importe}
            onChange={(e) => setImporte(e.currentTarget.value)}
            type="number"
            step="0.01"
            min="0.01"
            max={venta?.saldo_pendiente || 0}
            required
          />
          
          <Textarea
            label="Observaciones"
            placeholder="Observaciones del pago (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.currentTarget.value)}
            rows={3}
          />
          
          <Group justify="flex-end">
            <Button
              variant="outline"
              onClick={close}
              disabled={registrandoPago}
            >
              Cancelar
            </Button>
            <Button
              onClick={registrarPago}
              loading={registrandoPago}
              disabled={!importe || isNaN(parseFloat(importe)) || parseFloat(importe) <= 0}
            >
              Registrar Pago
            </Button>
          </Group>
        </Stack>
      </Modal>
    </ProtectedLayout>
  );
}
