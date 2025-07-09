import React from 'react';
import { LayoutBase } from "@/layouts";
import {
  Card,
  Container,
  Grid,
  Text,
  Title,
  Select,
  Textarea,
  Input,
  Button,
  Group,
  NumberInput,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';

const CrearPresupuesto = () => {
  const form = useForm({
    initialValues: {
      estado: 'Borrador',
      formaPago: 'A determinar',
      cliente: '',
      producto: '',
      cantidad: 1,
      precio: 0,
      descuento: 0,
      impuesto: 0,
      notas: '',
      descuentoGlobal: 0,
      impuestoGlobal: 0,
    },
  });

  const subtotal = form.values.cantidad * form.values.precio * (1 - form.values.descuento / 100);
  const totalFinal = subtotal + (form.values.impuesto / 100) * subtotal;

  return (
    <LayoutBase>
      <Container size="lg">
        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Crear Presupuesto</Title>
            <Text c="dimmed">Cree y envíe presupuestos personalizados a sus clientes</Text>
          </Grid.Col>

          {/* Información del presupuesto */}
          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Información del presupuesto</Title>
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="Estado"
                    data={["Borrador", "Pendiente", "Aprobado", "Rechazado", "Anulado"]}
                    {...form.getInputProps('estado')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Forma de pago"
                    data={["A determinar", "Tarjeta", "Efectivo"]}
                    {...form.getInputProps('formaPago')}
                  />
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>

          {/* Información del cliente */}
          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Información del cliente</Title>
              <Grid columns={6}>
                {/* Aquí puedes agregar campos del cliente */}
              </Grid>
              <Group mt="md" justify="flex-end">
                <Button variant="outline" color="#EE0E0F">Cargar Cliente</Button>
              </Group>
            </Card>
          </Grid.Col>

          {/* Producto */}
          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Agregar producto</Title>
              <Grid align="end">
                <Grid.Col span={3}>
                  <Input.Wrapper label="Producto">
                    <Input
                      placeholder="Buscar producto"
                      {...form.getInputProps('producto')}
                    />
                  </Input.Wrapper>
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Cantidad"
                    min={1}
                    {...form.getInputProps('cantidad')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Precio"
                    precision={2}
                    {...form.getInputProps('precio')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Descuento %"
                    min={0}
                    max={100}
                    {...form.getInputProps('descuento')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    label="Impuesto %"
                    min={0}
                    max={100}
                    {...form.getInputProps('impuesto')}
                  />
                </Grid.Col>
                <Grid.Col span={1}>
                  <Text fw={700}>
                    ${totalFinal.toFixed(2)}
                  </Text>
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>

          {/* Notas y resumen */}
          <Grid.Col span={12}>
            <Grid>
              <Grid.Col span={6}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Textarea
                    label="Notas"
                    autosize
                    minRows={12}
                    style={{ height: '100%' }}
                    {...form.getInputProps('notas')}
                  />
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Title order={5}>Subtotal: ${subtotal.toFixed(2)}</Title>
                  <NumberInput
                    label="Descuento Global %"
                    {...form.getInputProps('descuentoGlobal')}
                  />
                  <Text mt="xs">Subtotal: ${(subtotal * (1 - form.values.descuentoGlobal / 100)).toFixed(2)}</Text>
                  <NumberInput
                    label="Impuesto Global %"
                    {...form.getInputProps('impuestoGlobal')}
                  />
                  <Title order={5} mt="md">
                    Total: ${(
                      subtotal *
                      (1 - form.values.descuentoGlobal / 100) *
                      (1 + form.values.impuestoGlobal / 100)
                    ).toFixed(2)}
                  </Title>
                </Card>
              </Grid.Col>
            </Grid>
          </Grid.Col>

          {/* Botones finales */}
          <Grid.Col span={12}>
            <Group justify="flex-end">
              <Button variant="filled" c={"white"} color="#EE0E0F">Crear PDF</Button>
              <Button variant="outline" color="#EE0E0F">Guardar</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Container>
    </LayoutBase>
  );
};

export default CrearPresupuesto;