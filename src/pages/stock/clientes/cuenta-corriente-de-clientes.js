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
  Loader,
  Badge,
  Select,
  ActionIcon,
  Collapse,
  Divider,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconSearch, IconFilter, IconEye, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export default function CuentaCorrienteClientesPage() {
  const [loading, setLoading] = useState(true);
  const [movimientos, setMovimientos] = useState([]);
  const [totales, setTotales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  
  // Filtros
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [filtrosVisible, { toggle: toggleFiltros }] = useDisclosure(true);
  
  // Estados para expandir/contraer movimientos por cliente
  const [clientesExpandidos, setClientesExpandidos] = useState({});

  // Cargar lista de clientes para el filtro
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setLoadingClientes(true);
        const resp = await fetch('/api/stock/clientes');
        const data = await resp.json();
        if (resp.ok && data.success) {
          const clientesFormateados = data.data.map(cliente => ({
            value: cliente.id.toString(),
            label: cliente.nombre
          }));
          setClientes(clientesFormateados);
        }
      } catch (error) {
        console.error('Error cargando clientes:', error);
        notifications.show({
          title: "Error",
          message: "No se pudieron cargar los clientes",
          color: "red"
        });
      } finally {
        setLoadingClientes(false);
      }
    };
    cargarClientes();
  }, []);

  // Cargar datos de cuenta corriente
  const cargarCuentaCorriente = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (clienteSeleccionado) params.set('cliente_id', clienteSeleccionado);
      if (fechaDesde) params.set('fecha_desde', fechaDesde.toISOString().split('T')[0] + ' 00:00:00');
      if (fechaHasta) params.set('fecha_hasta', fechaHasta.toISOString().split('T')[0] + ' 23:59:59');
      
      const resp = await fetch(`/api/stock/clientes/cuenta-corriente?${params.toString()}`);
      const data = await resp.json();
      
      if (!resp.ok || !data.success) {
        throw new Error(data?.message || 'Error al cargar cuenta corriente');
      }
      
      // Procesar y limpiar los datos
      const movimientosLimpios = (data.data.movimientos || []).map(mov => ({
        cliente_id: mov.cliente_id,
        cliente_nombre: mov.cliente_nombre,
        fecha: mov.fecha,
        documento: mov.documento,
        vendedor: mov.vendedor,
        debe: parseFloat(mov.debe) || 0,
        haber: parseFloat(mov.haber) || 0,
        saldo: parseFloat(mov.saldo) || 0
      }));
      
      const totalesLimpios = (data.data.totales || []).map(total => ({
        cliente_id: total.cliente_id,
        total_debe: parseFloat(total.total_debe) || 0,
        total_haber: parseFloat(total.total_haber) || 0,
        saldo_final: parseFloat(total.saldo_final) || 0
      }));
      
      setMovimientos(movimientosLimpios);
      setTotales(totalesLimpios);
      
    } catch (error) {
      console.error('Error cargando cuenta corriente:', error);
      notifications.show({
        title: "Error",
        message: error.message || "No se pudo cargar la cuenta corriente",
        color: "red"
      });
      setMovimientos([]);
      setTotales([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarCuentaCorriente();
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    cargarCuentaCorriente();
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setClienteSeleccionado(null);
    setFechaDesde(null);
    setFechaHasta(null);
    // Recargar sin filtros
    setTimeout(() => {
      cargarCuentaCorriente();
    }, 100);
  };

  // Agrupar movimientos por cliente
  const movimientosPorCliente = movimientos.reduce((acc, mov) => {
    if (!acc[mov.cliente_id]) {
      acc[mov.cliente_id] = {
        cliente_nombre: mov.cliente_nombre,
        movimientos: []
      };
    }
    acc[mov.cliente_id].movimientos.push(mov);
    return acc;
  }, {});

  const toggleClienteExpandido = (clienteId) => {
    setClientesExpandidos(prev => ({
      ...prev,
      [clienteId]: !prev[clienteId]
    }));
  };

  return (
    <ProtectedLayout>
      <Container size="xxl">
        <Title order={1} mb="lg">Cuenta Corriente de Clientes</Title>
        
        {/* Panel de filtros */}
        <Card withBorder radius="md" mb="md">
          <Group justify="space-between" mb="sm">
            <Text fw={500}>Filtros</Text>
            <ActionIcon 
              variant="subtle" 
              onClick={toggleFiltros}
            >
              {filtrosVisible ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          
          <Collapse in={filtrosVisible}>
            <Grid>
              <Grid.Col span={6} md={3}>
                <Select
                  label="Cliente"
                  placeholder="Todos los clientes"
                  data={clientes}
                  value={clienteSeleccionado}
                  onChange={setClienteSeleccionado}
                  disabled={loadingClientes}
                  searchable
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={6} md={3}>
                <DatePickerInput
                  label="Fecha desde"
                  placeholder="Seleccionar fecha"
                  value={fechaDesde}
                  onChange={setFechaDesde}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={6} md={3}>
                <DatePickerInput
                  label="Fecha hasta"
                  placeholder="Seleccionar fecha"
                  value={fechaHasta}
                  onChange={setFechaHasta}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={6} md={3}>
                <Group mt="xl">
                  <Button
                    leftSection={<IconFilter size={16} />}
                    onClick={aplicarFiltros}
                    loading={loading}
                  >
                    Aplicar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={limpiarFiltros}
                    disabled={loading}
                  >
                    Limpiar
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </Collapse>
        </Card>

        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <Stack gap="md">
            {/* Resumen de totales */}
            {totales.length > 0 && (
              <Card withBorder radius="md">
                <Title order={4} mb="md">Resumen por Cliente</Title>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Cliente</Table.Th>
                      <Table.Th ta="right">Total Debe</Table.Th>
                      <Table.Th ta="right">Total Haber</Table.Th>
                      <Table.Th ta="right">Saldo Final</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {totales.map((total) => {
                      const cliente = Object.values(movimientosPorCliente).find(
                        c => movimientos.some(m => m.cliente_id === total.cliente_id)
                      );
                      return (
                        <Table.Tr key={total.cliente_id}>
                          <Table.Td>{cliente?.cliente_nombre || `Cliente ${total.cliente_id}`}</Table.Td>
                          <Table.Td ta="right">{money(total.total_debe)}</Table.Td>
                          <Table.Td ta="right">{money(total.total_haber)}</Table.Td>
                          <Table.Td ta="right">
                            <Badge 
                              color={total.saldo_final > 0 ? 'red' : total.saldo_final < 0 ? 'green' : 'gray'}
                            >
                              {money(Math.abs(total.saldo_final))}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Card>
            )}

            {/* Detalle de movimientos por cliente */}
            {Object.keys(movimientosPorCliente).length > 0 ? (
              Object.entries(movimientosPorCliente).map(([clienteId, clienteData]) => (
                <Card key={clienteId} withBorder radius="md">
                  <Group justify="space-between" mb="sm">
                    <Title order={5}>{clienteData.cliente_nombre}</Title>
                    <ActionIcon 
                      variant="subtle" 
                      onClick={() => toggleClienteExpandido(clienteId)}
                    >
                      {clientesExpandidos[clienteId] ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </ActionIcon>
                  </Group>
                  
                  <Collapse in={clientesExpandidos[clienteId]}>
                    <Table striped highlightOnHover fontSize="sm">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Fecha</Table.Th>
                          <Table.Th>Documento</Table.Th>
                          <Table.Th>Vendedor</Table.Th>
                          <Table.Th ta="right">Debe</Table.Th>
                          <Table.Th ta="right">Haber</Table.Th>
                          <Table.Th ta="right">Saldo</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {clienteData.movimientos.map((mov, index) => (
                          <Table.Tr key={`${mov.cliente_id}-${index}`}>
                            <Table.Td>
                              {new Date(mov.fecha).toLocaleDateString()}
                            </Table.Td>
                            <Table.Td>{mov.documento}</Table.Td>
                            <Table.Td>{mov.vendedor || '-'}</Table.Td>
                            <Table.Td ta="right">
                              {mov.debe > 0 ? money(mov.debe) : '-'}
                            </Table.Td>
                            <Table.Td ta="right">
                              {mov.haber > 0 ? money(mov.haber) : '-'}
                            </Table.Td>
                            <Table.Td ta="right">
                              <Badge 
                                color={mov.saldo > 0 ? 'red' : mov.saldo < 0 ? 'green' : 'gray'}
                                variant="light"
                              >
                                {money(Math.abs(mov.saldo))}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Collapse>
                </Card>
              ))
            ) : (
              <Card withBorder radius="md">
                <Text ta="center" py="xl" c="dimmed">
                  No hay movimientos de cuenta corriente para mostrar
                </Text>
              </Card>
            )}
          </Stack>
        )}
      </Container>
    </ProtectedLayout>
  );
}