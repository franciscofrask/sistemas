import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Badge,
  LoadingOverlay,
  Grid,
  NumberFormatter,
  Divider,
  Alert,
  Paper,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconTruck,
  IconBuilding,
  IconUser,
  IconCalendar,
  IconFileText,
  IconAlertCircle,
  IconPackage,
  IconHistory,
  IconPencil,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { showErrorNotification } from '@/utils/errorHandler';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';

export default function DetalleCompra() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.token && id) {
      fetchDetalleCompra();
    }
  }, [session, id]);

  const fetchDetalleCompra = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stock/compras/detalle?compra_id=${id}`);
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json?.message || 'No se pudo cargar el detalle de la compra');
      }

      setCompra(json.data);
    } catch (error) {
      console.error('Error al cargar detalle de compra:', error);
      showErrorNotification('Error al cargar detalle de compra', error.message || 'Error de conexión');
      router.push('/stock/compras');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeEstado = (estado) => {
    const colores = {
      BORRADOR: 'blue',
      CONFIRMADA: 'green',
      ANULADA: 'red',
    };
    return <Badge color={colores[estado] || 'gray'}>{estado}</Badge>;
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <Container size="xl" py="lg">
          <LoadingOverlay visible />
        </Container>
      </ProtectedLayout>
    );
  }

  if (!compra) {
    return (
      <ProtectedLayout>
        <Container size="xl" py="lg">
          <Alert color="red" icon={<IconAlertCircle />}>
            No se pudo cargar la información de la compra
          </Alert>
        </Container>
      </ProtectedLayout>
    );
  }

  const { cabecera, items, movimientos } = compra;

  return (
    <ProtectedLayout>
      <Container size="xl" py="lg">
        <LoadingOverlay visible={loading} />

        {/* Header */}
        <Group justify="space-between" mb="lg">
          <div>
            <Group gap="md" mb="xs">
              <Title order={1}>
                {cabecera.tipo_comprobante} {cabecera.nro_comprobante}
              </Title>
              {getBadgeEstado(cabecera.estado)}
            </Group>
            <Text c="dimmed">Detalle de compra</Text>
          </div>
          <Group>
            {cabecera.estado === 'BORRADOR' && (
              <Button
                leftSection={<IconPencil size={16} />}
                color="blue"
                onClick={() => router.push(`/stock/compras/editar/${id}`)}
              >
                Editar
              </Button>
            )}
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="outline"
              onClick={() => router.push('/stock/compras')}
            >
              Volver a Compras
            </Button>
          </Group>
        </Group>

        <Grid>
          {/* Información general */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder mb="lg">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Información General</Title>
                  {getBadgeEstado(cabecera.estado)}
                </Group>
                <Divider />
                
                <Grid>
                  <Grid.Col span={6}>
                    <Group gap="xs">
                      <IconCalendar size={16} color="gray" />
                      <div>
                        <Text size="xs" c="dimmed">Fecha</Text>
                        <Text size="sm" fw={500}>
                          {new Date(cabecera.fecha).toLocaleDateString('es-AR')}
                        </Text>
                      </div>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group gap="xs">
                      <IconFileText size={16} color="gray" />
                      <div>
                        <Text size="xs" c="dimmed">Comprobante</Text>
                        <Text size="sm" fw={500}>
                          {cabecera.tipo_comprobante} {cabecera.nro_comprobante}
                        </Text>
                      </div>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group gap="xs">
                      <IconTruck size={16} color="gray" />
                      <div>
                        <Text size="xs" c="dimmed">Proveedor</Text>
                        <Text size="sm" fw={500}>{cabecera.proveedor_razon_social}</Text>
                        {cabecera.proveedor_cuit && (
                          <Text size="xs" c="dimmed">CUIT: {cabecera.proveedor_cuit}</Text>
                        )}
                      </div>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group gap="xs">
                      <IconBuilding size={16} color="gray" />
                      <div>
                        <Text size="xs" c="dimmed">Almacén</Text>
                        <Text size="sm" fw={500}>{cabecera.almacen_nombre}</Text>
                      </div>
                    </Group>
                  </Grid.Col>
                  {cabecera.creado_por_nombre && (
                    <Grid.Col span={6}>
                      <Group gap="xs">
                        <IconUser size={16} color="gray" />
                        <div>
                          <Text size="xs" c="dimmed">Creado por</Text>
                          <Text size="sm" fw={500}>{cabecera.creado_por_nombre}</Text>
                          <Text size="xs" c="dimmed">
                            {new Date(cabecera.creado_en).toLocaleString('es-AR')}
                          </Text>
                        </div>
                      </Group>
                    </Grid.Col>
                  )}
                </Grid>

                {cabecera.observaciones && (
                  <>
                    <Divider />
                    <div>
                      <Text size="xs" c="dimmed" mb="xs">Observaciones</Text>
                      <Text size="sm">{cabecera.observaciones}</Text>
                    </div>
                  </>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Resumen */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder mb="lg">
              <Stack gap="md">
                <Title order={4}>Resumen</Title>
                <Divider />
                
                <Group justify="space-between">
                  <Text size="sm">Items:</Text>
                  <Text size="sm" fw={500}>{items.length}</Text>
                </Group>
                
                <Group justify="space-between">
                  <Text size="sm">Cantidad total:</Text>
                  <Text size="sm" fw={500}>
                    {items.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0)}
                  </Text>
                </Group>
                
                <Divider />
                
                <Group justify="space-between">
                  <Text size="lg" fw={700}>Total:</Text>
                  <NumberFormatter
                    value={cabecera.total || 0}
                    prefix="$"
                    thousandSeparator
                    decimalScale={2}
                    style={{ fontSize: '1.2rem', fontWeight: 700 }}
                  />
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Items de la compra */}
        <Card withBorder mb="lg">
          <Stack gap="md">
            <Group gap="xs">
              <IconPackage size={20} />
              <Title order={3}>Items de la Compra</Title>
            </Group>
            <Divider />

            {items.length > 0 ? (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Cantidad</Table.Th>
                    <Table.Th>Precio Unit.</Table.Th>
                    <Table.Th>Subtotal</Table.Th>
                    <Table.Th>Lote</Table.Th>
                    <Table.Th>Serie</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => (
                    <Table.Tr key={item.compra_detalle_id}>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500}>{item.producto_nombre}</Text>
                          {item.es_servicio == 1 ?? (
                            <Badge size="xs" color="blue">Servicio</Badge>
                          )}
                        </div>
                      </Table.Td>
                      <Table.Td>{item.sku}</Table.Td>
                      <Table.Td>{item.cantidad}</Table.Td>
                      <Table.Td>
                        <NumberFormatter
                          value={item.precio_unitario}
                          prefix="$"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </Table.Td>
                      <Table.Td>
                        <NumberFormatter
                          value={item.subtotal}
                          prefix="$"
                          thousandSeparator
                          decimalScale={2}
                        />
                      </Table.Td>
                      <Table.Td>
                        {item.codigo_lote && (
                          <div>
                            <Text size="xs">{item.codigo_lote}</Text>
                            {item.fecha_vencimiento && (
                              <Text size="xs" c="dimmed">
                                Vence: {new Date(item.fecha_vencimiento).toLocaleDateString('es-AR')}
                              </Text>
                            )}
                          </div>
                        )}
                      </Table.Td>
                      <Table.Td>{item.numero_serie}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                No hay items en esta compra
              </Text>
            )}
          </Stack>
        </Card>

        {/* Movimientos de stock (solo si hay) */}
        {movimientos.length > 0 && (
          <Card withBorder>
            <Stack gap="md">
              <Group gap="xs">
                <IconHistory size={20} />
                <Title order={3}>Movimientos de Stock</Title>
              </Group>
              <Divider />

              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Tipo</Table.Th>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th>Almacén</Table.Th>
                    <Table.Th>Cantidad</Table.Th>
                    <Table.Th>Lote/Serie</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {movimientos.map((mov) => (
                    <Table.Tr key={mov.movimiento_id}>
                      <Table.Td>
                        {new Date(mov.fecha).toLocaleString('es-AR')}
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={mov.tipo_movimiento === 'ENTRADA' ? 'green' : 'red'}
                          size="sm"
                        >
                          {mov.tipo_movimiento}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{mov.producto_nombre}</Table.Td>
                      <Table.Td>{mov.almacen_nombre}</Table.Td>
                      <Table.Td>{mov.cantidad}</Table.Td>
                      <Table.Td>
                        {mov.codigo_lote && (
                          <Text size="xs">Lote: {mov.codigo_lote}</Text>
                        )}
                        {mov.numero_serie && (
                          <Text size="xs">Serie: {mov.numero_serie}</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        )}
      </Container>
    </ProtectedLayout>
  );
}