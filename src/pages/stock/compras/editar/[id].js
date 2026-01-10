import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  Alert,
  Loader,
  Grid,
  Stack,
  Badge,
  Table,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconPencil, 
  IconTrash,
  IconCheck,
  IconAlertTriangle 
} from "@tabler/icons-react";

function money(n) {
  if (isNaN(n)) return "0,00";
  return Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EditarCompra() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [compra, setCompra] = useState(null);
  const [error, setError] = useState(null);

  // Cargar datos de la compra para edición
  useEffect(() => {
    if (!id) return;

    const cargarCompra = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/stock/compras/edicion?id=${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Error al cargar compra');
        }

        setCompra(result.data);
      } catch (err) {
        console.error('Error al cargar compra:', err);
        setError(err.message);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarCompra();
  }, [id]);

  const handleConfirmarCompra = async () => {
    if (!compra?.cabecera?.id) {
      alert('ID de compra no válido');
      return;
    }

    if (!compra?.items || compra.items.length === 0) {
      alert('Agregá al menos 1 ítem antes de confirmar.');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/stock/compras/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compra_id: parseInt(compra.cabecera.id) }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result?.message || 'No se pudo confirmar la compra');
        return;
      }

      // Actualizar estado local
      setCompra(prev => ({
        ...prev,
        cabecera: { ...prev.cabecera, estado: 'CONFIRMADA' }
      }));

      alert('Compra confirmada correctamente');
    } catch (err) {
      console.error('Error al confirmar compra:', err);
      alert(err.message || 'Error al confirmar la compra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout requiredPermissions={["compras"]}>
        <Container size="xxl" py="xl">
          <Group>
            <Loader size="sm" />
            <Text>Cargando compra para edición...</Text>
          </Group>
        </Container>
      </ProtectedLayout>
    );
  }

  if (error) {
    return (
      <ProtectedLayout requiredPermissions={["compras"]}>
        <Container size="xxl" py="xl">
          <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Error al cargar compra">
            {error}
          </Alert>
          <Group mt="md">
            <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
              Volver
            </Button>
          </Group>
        </Container>
      </ProtectedLayout>
    );
  }

  if (!compra) {
    return (
      <ProtectedLayout requiredPermissions={["compras"]}>
        <Container size="xxl" py="xl">
          <Alert color="yellow" icon={<IconAlertTriangle size={16} />} title="Compra no encontrada">
            No se encontró la compra o no está en estado BORRADOR para editar.
          </Alert>
          <Group mt="md">
            <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
              Volver
            </Button>
          </Group>
        </Container>
      </ProtectedLayout>
    );
  }

  const { cabecera, items } = compra;
  const subtotal = items.reduce((sum, item) => sum + (Number(item.cantidad) * Number(item.precio_unitario)), 0);

  return (
    <ProtectedLayout requiredPermissions={["compras"]}>
      <Container size="xxl" py="xl">
        {/* Header */}
        <Group justify="space-between" mb="lg">
          <Group>
           
            <Title order={2}>Editar Compra #{cabecera.compra_id}</Title>
            <Badge color="blue" variant="filled">
              {cabecera.estado}
            </Badge>
          </Group>
          <Group>
            <Button 
              color="green" 
              leftSection={<IconCheck size={16} />}
              onClick={handleConfirmarCompra}
              loading={saving}
              disabled={items.length === 0 || saving || cabecera.estado !== 'BORRADOR'}
            >
              Confirmar
            </Button>
          </Group>
        </Group>

        <Grid>
          {/* Información de la compra */}
          <Grid.Col span={12}>
            <Card shadow="sm" p="md">
              <Text fw={500} size="lg" mb="md">Información de la Compra</Text>
              
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="xs">
                    <Group>
                      <Text fw={500}>Proveedor:</Text>
                      <Text>{cabecera.proveedor_razon_social}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Almacén:</Text>
                      <Text>{cabecera.almacen_nombre}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Tipo:</Text>
                      <Text>{cabecera.tipo_comprobante}</Text>
                    </Group>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap="xs">
                    <Group>
                      <Text fw={500}>Nº Comprobante:</Text>
                      <Text>{cabecera.nro_comprobante || 'Sin número'}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Fecha:</Text>
                      <Text>{new Date(cabecera.fecha_compra).toLocaleDateString('es-AR')}</Text>
                    </Group>
                    <Group>
                      <Text fw={500}>Creado por:</Text>
                      <Text>{cabecera.creado_por_nombre}</Text>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
              
              {cabecera.observaciones && (
                <div style={{ marginTop: '1rem' }}>
                  <Text fw={500}>Observaciones:</Text>
                  <Text c="dimmed">{cabecera.observaciones}</Text>
                </div>
              )}
            </Card>
          </Grid.Col>

          {/* Items de la compra */}
          <Grid.Col span={12}>
            <Card shadow="sm" p="md">
              <Group justify="space-between" mb="md">
                <Text fw={500} size="lg">Items de la Compra</Text>
                <Button size="sm" leftSection={<IconPencil size={16} />}>
                  Agregar Item
                </Button>
              </Group>

              {items.length === 0 ? (
                <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
                  La compra no tiene items cargados. Agregue al menos un item para poder confirmar la compra.
                </Alert>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Producto</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Cantidad</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Precio Unit.</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Subtotal</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {items.map((item, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <div>
                            <Text fw={500}>{item.producto_nombre}</Text>
                            <Text size="sm" c="dimmed">Cod: {item.producto_codigo}</Text>
                            {item.codigo_lote && (
                              <Badge size="xs" variant="outline">
                                Lote: {item.codigo_lote}
                              </Badge>
                            )}
                            {item.numero_serie && (
                              <Badge size="xs" variant="outline" color="blue">
                                Serie: {item.numero_serie}
                              </Badge>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          {money(item.cantidad)} {item.producto_unidad_medida}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          $ {money(item.precio_unitario)}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          $ {money(Number(item.cantidad) * Number(item.precio_unitario))}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Group gap="xs" justify="center">
                            <Tooltip label="Editar item">
                              <ActionIcon size="sm" variant="subtle">
                                <IconPencil size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Eliminar item">
                              <ActionIcon size="sm" variant="subtle" color="red">
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}

              {items.length > 0 && (
                <Group justify="flex-end" mt="md" p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <Text fw={500} size="lg">
                    Total: $ {money(subtotal)}
                  </Text>
                </Group>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </ProtectedLayout>
  );
}