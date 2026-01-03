import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Table,
  Badge,
  Group,
  TextInput,
  Select,
  Paper,
  Stack,
  Flex,
  ActionIcon,
  Menu,
  Pagination,
  LoadingOverlay,
  Grid,
  Card,
  NumberFormatter,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconX,
  IconRefresh,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { showErrorNotification } from '@/utils/errorHandler';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';

export default function ComprasPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 50,
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    almacen_id: '',
    proveedor_id: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    busqueda: '',
  });

  const [almacenes, setAlmacenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const fetchCompras = async (opts = {}) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: opts.limit || pagination.pageSize,
        offset: opts.offset || ((opts.page || pagination.current) - 1) * pagination.pageSize,
        ...filtros,
      });

      // Filtrar parámetros vacíos
      Array.from(params.keys()).forEach(key => {
        if (!params.get(key)) params.delete(key);
      });

      const res = await fetch(`/api/stock/compras?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || 'No se pudo listar compras');
      
      const { total, items } = json.data;
      setCompras(items);
      setPagination(prev => ({
        ...prev,
        total,
        current: opts.page || prev.current,
      }));
    } catch (error) {
      console.error('Error al cargar compras:', error);
      showErrorNotification('Error al cargar compras', error.message || 'Error de conexión');
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (session?.user?.token) {
      fetchCompras();
      fetchAlmacenes();
      fetchProveedores();
    }
  }, [session]);

  const fetchAlmacenes = async () => {
    try {
      const res = await fetch('/api/stock/almacenes');
      const json = await res.json();
      if (json.success) {
        setAlmacenes(json.data.map(a => ({ value: a.id.toString(), label: a.nombre })));
      }
    } catch (error) {
      console.error('Error cargando almacenes:', error);
    }
  };

  const fetchProveedores = async () => {
    try {
      const res = await fetch('/api/stock/proveedores');
      const json = await res.json();
      if (json.success) {
        setProveedores(json.data.map(p => ({ value: p.id.toString(), label: p.razon_social })));
      }
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const aplicarFiltros = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchCompras({ page: 1 });
  };

  const limpiarFiltros = () => {
    setFiltros({
      almacen_id: '',
      proveedor_id: '',
      estado: '',
      fecha_desde: '',
      fecha_hasta: '',
      busqueda: '',
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(() => fetchCompras({ page: 1 }), 100);
  };

  const getBadgeEstado = (estado) => {
    const colores = {
      BORRADOR: 'blue',
      CONFIRMADA: 'green',
      ANULADA: 'red',
    };
    return <Badge color={colores[estado] || 'gray'}>{estado}</Badge>;
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    fetchCompras({ page });
  };

  return (
    <ProtectedLayout>
      <Container size="xl" py="lg">
        <LoadingOverlay visible={loading} />

        {/* Header */}
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={1}>Compras</Title>
            <Text c="dimmed">Gestione y administre compras</Text>
          </div>
        <Group>
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => fetchCompras()}
            loading={loading}
          >
            <IconRefresh size={20} />
          </ActionIcon>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push('/stock/compras/crearcompra')}
          >
            Nueva Compra
          </Button>
        </Group>
      </Group>

      {/* Filtros */}
      <Card mb="lg" withBorder>
        <Stack gap="md">
          <Text fw={500} size="sm">Filtros</Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <TextInput
                placeholder="Buscar por comprobante o proveedor..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                leftSection={<IconSearch size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                placeholder="Almacén"
                data={almacenes}
                value={filtros.almacen_id}
                onChange={(value) => handleFiltroChange('almacen_id', value || '')}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                placeholder="Proveedor"
                data={proveedores}
                value={filtros.proveedor_id}
                onChange={(value) => handleFiltroChange('proveedor_id', value || '')}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                placeholder="Estado"
                data={[
                  { value: 'BORRADOR', label: 'Borrador' },
                  { value: 'CONFIRMADA', label: 'Confirmada' },
                  { value: 'ANULADA', label: 'Anulada' },
                ]}
                value={filtros.estado}
                onChange={(value) => handleFiltroChange('estado', value || '')}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Group gap="xs">
                <Button
                  leftSection={<IconFilter size={16} />}
                  onClick={aplicarFiltros}
                  size="sm"
                >
                  Aplicar
                </Button>
                <Button
                  variant="light"
                  onClick={limpiarFiltros}
                  size="sm"
                >
                  Limpiar
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {/* Tabla */}
      <Paper withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Comprobante</Table.Th>
              <Table.Th>Proveedor</Table.Th>
              <Table.Th>Almacén</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Items</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {compras.map((compra) => (
              <Table.Tr key={compra.id}>
                <Table.Td>
                  {new Date(compra.fecha).toLocaleDateString('es-AR')}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {compra.tipo_comprobante} {compra.nro_comprobante}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{compra.proveedor_razon_social}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{compra.almacen_nombre}</Text>
                </Table.Td>
                <Table.Td>
                  {getBadgeEstado(compra.estado)}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{compra.cant_items || 0}</Text>
                </Table.Td>
                <Table.Td>
                  <NumberFormatter
                    value={compra.total || 0}
                    prefix="$"
                    thousandSeparator
                    decimalScale={2}
                  />
                </Table.Td>
                <Table.Td>
                  <Menu position="bottom-start" withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle" size="sm">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        onClick={() => router.push(`/stock/compras/detalle/${compra.id}`)}
                      >
                        Ver detalle
                      </Menu.Item>
                      {compra.estado === 'BORRADOR' && (
                        <>
                          <Menu.Item
                            leftSection={<IconPencil size={14} />}
                            onClick={() => router.push(`/stock/compras/crearcompra?id=${compra.id}`)}
                          >
                            Editar
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<IconX size={14} />}
                            onClick={() => console.log('Cancelar borrador', compra.id)}
                          >
                            Cancelar borrador
                          </Menu.Item>
                        </>
                      )}
                      {compra.estado === 'CONFIRMADA' && (
                        <Menu.Item
                          color="red"
                          leftSection={<IconX size={14} />}
                          onClick={() => console.log('Anular compra', compra.id)}
                        >
                          Anular
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {compras.length === 0 && !loading && (
          <Stack align="center" py="xl" gap="md">
            <Text c="dimmed">No hay compras que mostrar</Text>
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push('/stock/compras/crearcompra')}
            >
              Crear primera compra
            </Button>
          </Stack>
        )}

        {/* Paginación */}
        {pagination.total > pagination.pageSize && (
          <Flex justify="center" p="md">
            <Pagination
              value={pagination.current}
              onChange={handlePageChange}
              total={Math.ceil(pagination.total / pagination.pageSize)}
              size="sm"
            />
          </Flex>
        )}
      </Paper>
    </Container>
    </ProtectedLayout>
  );
}