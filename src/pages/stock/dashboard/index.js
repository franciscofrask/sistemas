import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import {
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Progress,
  SimpleGrid,
  Badge,
  Avatar,
  RingProgress,
  Center,
  ActionIcon,
  Menu,
  Table,
  ScrollArea,
  Loader,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconCurrencyDollar,
  IconChartBar,
  IconCalendarTime,
  IconAlertTriangle,
  IconDots,
  IconEye,
  IconEdit,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    resumenGeneral: {
      totalProductos: 0,
      valorInventario: 0,
      ventasHoy: 0,
      ventasMes: 0
    },
    productosStock: [],
    ventasRecientes: [],
    alertas: []
  });

  // Datos de ejemplo mientras no tengamos la API
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setDashboardData({
        resumenGeneral: {
          totalProductos: 1245,
          valorInventario: 2567890,
          ventasHoy: 15,
          ventasMes: 456
        },
        productosStock: [
          { id: 1, nombre: "Laptop Dell XPS", stock: 5, minimo: 10, valor: 850000 },
          { id: 2, nombre: "Mouse Logitech", stock: 25, minimo: 15, valor: 15000 },
          { id: 3, nombre: "Teclado Mecánico", stock: 2, minimo: 8, valor: 45000 },
          { id: 4, nombre: "Monitor 24\"", stock: 12, minimo: 5, valor: 180000 },
        ],
        ventasRecientes: [
          { id: 1, cliente: "Juan Pérez", total: 125000, fecha: "2025-11-26", items: 3 },
          { id: 2, cliente: "María García", total: 89000, fecha: "2025-11-26", items: 2 },
          { id: 3, cliente: "Carlos López", total: 156000, fecha: "2025-11-25", items: 4 },
          { id: 4, cliente: "Ana Martín", total: 67000, fecha: "2025-11-25", items: 1 },
        ],
        alertas: [
          { tipo: "stock", mensaje: "5 productos con stock bajo", nivel: "warning" },
          { tipo: "venta", mensaje: "Meta mensual al 78%", nivel: "info" },
          { tipo: "inventario", mensaje: "Revisión programada mañana", nivel: "info" }
        ]
      });
      setLoading(false);
    }, 1500);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "#EE0E0F" }) => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text size="sm" c="dimmed" mb={5}>
            {title}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
          {trend && (
            <Group gap={5} mt={5}>
              <Icon size={16} color={trend === 'up' ? 'green' : 'red'} />
              <Text size="sm" c={trend === 'up' ? 'green' : 'red'}>
                {trendValue}
              </Text>
            </Group>
          )}
        </div>
        <Avatar size="lg" color={color} variant="light">
          <Icon size={24} />
        </Avatar>
      </Group>
    </Card>
  );

  const AlertCard = ({ tipo, mensaje, nivel }) => {
    const getColor = (nivel) => {
      switch(nivel) {
        case 'warning': return 'yellow';
        case 'error': return 'red';
        default: return 'blue';
      }
    };

    const getIcon = (tipo) => {
      switch(tipo) {
        case 'stock': return IconAlertTriangle;
        case 'venta': return IconChartBar;
        default: return IconCalendarTime;
      }
    };

    const Icon = getIcon(tipo);

    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group>
          <Avatar size="sm" color={getColor(nivel)} variant="light">
            <Icon size={16} />
          </Avatar>
          <div>
            <Text size="sm">{mensaje}</Text>
            <Badge size="xs" color={getColor(nivel)} variant="light">
              {tipo.toUpperCase()}
            </Badge>
          </div>
        </Group>
      </Card>
    );
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <Container fluid>
          <Center style={{ height: 400 }}>
            <Stack align="center">
              <Loader size="xl" />
              <Text>Cargando dashboard...</Text>
            </Stack>
          </Center>
        </Container>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <Container fluid>
        <Grid>
          {/* Header */}
          <Grid.Col span={12}>
            <Group justify="space-between" align="flex-end">
              <div>
                <Title order={1}>Dashboard</Title>
                <Text c="dimmed" size="lg">
                  Bienvenido de vuelta, {session?.usuario?.nombre || 'Usuario'}
                </Text>
              </div>
              <Text size="sm" c="dimmed">
                Actualizado: {new Date().toLocaleString('es-AR')}
              </Text>
            </Group>
          </Grid.Col>

          {/* Estadísticas principales */}
          <Grid.Col span={12}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              <StatCard
                title="Total Productos"
                value={dashboardData.resumenGeneral.totalProductos.toLocaleString()}
                icon={IconPackage}
                trend="up"
                trendValue="+12 este mes"
              />
              <StatCard
                title="Valor Inventario"
                value={`$${dashboardData.resumenGeneral.valorInventario.toLocaleString()}`}
                icon={IconCurrencyDollar}
                trend="up"
                trendValue="+8.5%"
                color="green"
              />
              <StatCard
                title="Ventas Hoy"
                value={dashboardData.resumenGeneral.ventasHoy}
                icon={IconShoppingCart}
                trend="down"
                trendValue="-2 vs ayer"
                color="blue"
              />
              <StatCard
                title="Ventas del Mes"
                value={dashboardData.resumenGeneral.ventasMes}
                icon={IconChartBar}
                trend="up"
                trendValue="+15.3%"
                color="orange"
              />
            </SimpleGrid>
          </Grid.Col>

          {/* Contenido principal */}
          <Grid.Col span={12}>
            <Grid>
              {/* Productos con stock bajo */}
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <Title order={3}>Productos - Stock Bajo</Title>
                    <Badge color="red" variant="light">
                      {dashboardData.productosStock.filter(p => p.stock <= p.minimo).length} Alertas
                    </Badge>
                  </Group>
                  
                  <ScrollArea>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Producto</Table.Th>
                          <Table.Th>Stock Actual</Table.Th>
                          <Table.Th>Stock Mínimo</Table.Th>
                          <Table.Th>Estado</Table.Th>
                          <Table.Th>Valor</Table.Th>
                          <Table.Th>Acciones</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {dashboardData.productosStock.map((producto) => (
                          <Table.Tr key={producto.id}>
                            <Table.Td>{producto.nombre}</Table.Td>
                            <Table.Td>{producto.stock}</Table.Td>
                            <Table.Td>{producto.minimo}</Table.Td>
                            <Table.Td>
                              <Badge
                                color={producto.stock <= producto.minimo ? 'red' : 'green'}
                                variant="light"
                              >
                                {producto.stock <= producto.minimo ? 'Crítico' : 'Normal'}
                              </Badge>
                            </Table.Td>
                            <Table.Td>${producto.valor.toLocaleString()}</Table.Td>
                            <Table.Td>
                              <Menu shadow="md" width={160}>
                                <Menu.Target>
                                  <ActionIcon variant="subtle">
                                    <IconDots size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item leftSection={<IconEye size={14} />}>
                                    Ver detalle
                                  </Menu.Item>
                                  <Menu.Item leftSection={<IconEdit size={14} />}>
                                    Editar
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Card>
              </Grid.Col>

              {/* Panel lateral */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack>
                  {/* Progreso de ventas */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">Meta de Ventas</Title>
                    <Center>
                      <RingProgress
                        size={120}
                        thickness={8}
                        sections={[{ value: 78, color: '#EE0E0F' }]}
                        label={
                          <Center>
                            <div style={{ textAlign: 'center' }}>
                              <Text size="xl" fw={700}>78%</Text>
                              <Text size="sm" c="dimmed">Este mes</Text>
                            </div>
                          </Center>
                        }
                      />
                    </Center>
                    <Text ta="center" size="sm" c="dimmed" mt="sm">
                      $356,000 de $456,000
                    </Text>
                  </Card>

                  {/* Alertas del sistema */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={4} mb="md">Alertas del Sistema</Title>
                    <Stack gap="sm">
                      {dashboardData.alertas.map((alerta, index) => (
                        <AlertCard key={index} {...alerta} />
                      ))}
                    </Stack>
                  </Card>
                </Stack>
              </Grid.Col>

              {/* Ventas recientes */}
              <Grid.Col span={12}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <Title order={3}>Ventas Recientes</Title>
                    <Badge color="#EE0E0F" variant="light">
                      Últimas 24h
                    </Badge>
                  </Group>
                  
                  <ScrollArea>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Cliente</Table.Th>
                          <Table.Th>Fecha</Table.Th>
                          <Table.Th>Items</Table.Th>
                          <Table.Th>Total</Table.Th>
                          <Table.Th>Estado</Table.Th>
                          <Table.Th>Acciones</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {dashboardData.ventasRecientes.map((venta) => (
                          <Table.Tr key={venta.id}>
                            <Table.Td>
                              <Group>
                                <Avatar size="sm" color="#EE0E0F" variant="light">
                                  <IconUsers size={16} />
                                </Avatar>
                                {venta.cliente}
                              </Group>
                            </Table.Td>
                            <Table.Td>{new Date(venta.fecha).toLocaleDateString('es-AR')}</Table.Td>
                            <Table.Td>{venta.items} productos</Table.Td>
                            <Table.Td>${venta.total.toLocaleString()}</Table.Td>
                            <Table.Td>
                              <Badge color="green" variant="light">
                                Completada
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Menu shadow="md" width={160}>
                                <Menu.Target>
                                  <ActionIcon variant="subtle">
                                    <IconDots size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item leftSection={<IconEye size={14} />}>
                                    Ver detalle
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Card>
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>
      </Container>
    </ProtectedLayout>
  );
};

export default Dashboard;