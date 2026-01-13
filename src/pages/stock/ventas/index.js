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
  Menu,
} from "@mantine/core";
import { IconPlus, IconSearch, IconPencil, IconX, IconEye } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from 'next/router';

const rowsPerPage = 10;

export default function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const router = useRouter();

  const fetchVentas = async (opts = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const limit = rowsPerPage;
      const offset = (page - 1) * rowsPerPage;
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      if (busqueda && busqueda.trim()) params.set('q', busqueda.trim());
      const res = await fetch(`/api/stock/ventas?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || 'No se pudo listar ventas');
      
      console.log('Respuesta del API ventas:', json);
      
      const items = Array.isArray(json.data?.items) ? json.data.items : [];
      setVentas(items);
      setTotal(Number(json.data?.total || items.length));
    } catch (error) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
      setVentas([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = async (ventaId) => {
    try {
      if (!ventaId) return;
      if (!confirm('¿Confirmar anulación de la venta?')) return;
      const resp = await fetch('/api/stock/ventas/anular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venta_id: parseInt(ventaId) }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data?.message || 'No se pudo anular la venta');
      notifications.show({ title: 'Venta anulada', message: data.message || 'Se anuló la venta correctamente', color: 'green' });
      fetchVentas();
    } catch (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' });
    }
  };

  const handleCancelarBorrador = async (ventaId) => {
    try {
      if (!ventaId) return;
      if (!confirm('¿Cancelar esta venta en borrador?')) return;
      const resp = await fetch('/api/stock/ventas/cancelar-borrador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venta_id: parseInt(ventaId) }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data?.message || 'No se pudo cancelar la venta');
      notifications.show({ title: 'Venta cancelada', message: data.message || 'Se canceló la venta correctamente', color: 'green' });
      fetchVentas();
    } catch (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' });
    }
  };

  useEffect(() => {
    fetchVentas();
  }, [page, busqueda]);

  // Acciones futuras: ver/editar ventas

  const rows = Array.isArray(ventas) ? ventas.map((v) => (
    <tr key={v.id}>
      <td>{v.nro_comprobante || '-'}</td>
      <td>{new Date(v.fecha).toLocaleString()}</td>
      <td>{v.cliente_nombre}</td>
      <td>${Number(v.total || 0).toFixed(2)}</td>
      <td>{v.estado}</td>
      <td>
        <Group gap="xs">
          <Menu position="bottom-start" withinPortal>
            <Menu.Target>
              <Button size="xs" variant="light" color="gray">Acciones</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEye size={14} />} onClick={() => router.push(`/stock/ventas/detalle/${v.id}`)}>
                Ver detalle
              </Menu.Item>
              {v.estado === 'BORRADOR' && (
                <>
                  <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => router.push(`/stock/ventas/crearventa?id=${v.id}`)}>
                    Editar
                  </Menu.Item>
                  <Menu.Item color="red" leftSection={<IconX size={14} />} onClick={() => handleCancelarBorrador(v.id)}>
                    Cancelar borrador
                  </Menu.Item>
                </>
              )}
              {v.estado === 'CONFIRMADA' && (
                <Menu.Item color="red" leftSection={<IconX size={14} />} onClick={() => handleAnular(v.id)}>
                  Anular venta
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </td>
    </tr>
  )) : [];

  return (
    <ProtectedLayout>
      <Container size="xxl">
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
              leftSection={<IconPlus size={16} />}
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
                      <th style={{ textAlign: 'center' }}>Número</th>
                      <th style={{ textAlign: 'center' }}>Fecha</th>
                      <th style={{ textAlign: 'center' }}>Cliente</th>
                      <th style={{ textAlign: 'center' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>Estado</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!Array.isArray(ventas) || ventas.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          No hay ventas para mostrar
                        </td>
                      </tr>
                    ) : ventas.map((v) => (
                      <tr key={v.id}>
                        <td style={{ textAlign: 'center' }}>{v.nro_comprobante || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{new Date(v.fecha).toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>{v.cliente_nombre}</td>
                        <td style={{ textAlign: 'center' }}>${Number(v.total || 0).toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>{v.estado}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Group gap="xs" justify="center">
                            <Menu position="bottom-start" withinPortal>
                              <Menu.Target>
                                <Button size="xs" variant="light" color="gray">Acciones</Button>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item leftSection={<IconEye size={14} />} onClick={() => router.push(`/stock/ventas/detalle/${v.id}`)}>
                                  Ver detalle
                                </Menu.Item>
                                {v.estado === 'BORRADOR' && (
                                  <>
                                    <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => router.push(`/stock/ventas/crearventa?id=${v.id}`)}>
                                      Editar
                                    </Menu.Item>
                                    <Menu.Item color="red" leftSection={<IconX size={14} />} onClick={() => handleCancelarBorrador(v.id)}>
                                      Cancelar borrador
                                    </Menu.Item>
                                  </>
                                )}
                                {v.estado === 'CONFIRMADA' && (
                                  <Menu.Item color="red" leftSection={<IconX size={14} />} onClick={() => handleAnular(v.id)}>
                                    Anular venta
                                  </Menu.Item>
                                )}
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </Grid.Col>

          <Group justify="center" mt="md">
            <Pagination
              total={Math.ceil((total || 0) / rowsPerPage) || 1}
              value={page}
              onChange={setPage}
              color="#ee0e0f"
              siblings={0}
              boundaries={1}
            />
          </Group>
        </Grid>
      </Container>
    </ProtectedLayout>
  );
}
