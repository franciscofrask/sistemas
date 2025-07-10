import React, { useState, useEffect } from 'react';
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
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications'; 
import BuscadorDeClientes from '@/components/stock/clientesBuscador';
import BuscadorDeProductos from '@/components/stock/ProductoBuscador';

const CrearPresupuesto = () => {
  const [clientes, setClientes] = useState([]);
  const form = useForm({
    initialValues: {
      id_cliente: '',
      id_vendedor: 2,
      fecha_vencimiento: '',
      items: [],
      id_producto: '',
      cantidad: 1,
      precio: 0,
      descuento: 0,
      impuestos: 0,
      forma_pago: 'A determinar',
      moneda: 'ARS',
      observaciones: '',
    },
  });

  const subtotal = form.values.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const descuentoAplicado = subtotal * (form.values.descuento / 100);
  const impuestosAplicados = subtotal * (form.values.impuestos / 100);
  const totalFinal = subtotal + impuestosAplicados - descuentoAplicado;



 const handleGuardar = async () => {
  const itemsFiltrados = form.values.items.map((item) => ({
    id_producto: item.id_producto,
    cantidad: item.cantidad,
    precio: item.precio,
  }));

  const payload = {
    id_cliente: form.values.id_cliente,
    id_vendedor: form.values.id_vendedor,
    fecha_vencimiento: form.values.fecha_vencimiento,
    items: itemsFiltrados,
    descuento: subtotal * (form.values.descuento / 100),
    impuestos: subtotal * (form.values.impuestos / 100),
    forma_pago: form.values.forma_pago,
    moneda: form.values.moneda,
    observaciones: form.values.observaciones,
  };

  try {
    const res = await fetch('/api/stock/presupuestos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al guardar presupuesto');
    }

    notifications.show({
      title: 'Éxito',
      message: 'Presupuesto creado exitosamente',
      color: 'green',
    });

    form.reset();
  } catch (error) {
    notifications.show({
      title: 'Error',
      message: error.message,
      color: 'red',
    });
  }
};


  return (
    <LayoutBase>
      <Container size="lg">
        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Crear Presupuesto</Title>
            <Text c="dimmed">Cree y envíe presupuestos personalizados a sus clientes</Text>
          </Grid.Col>

          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Información del presupuesto</Title>
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    readOnly
                    label="Estado"
                    data={["Borrador", "Pendiente", "Aprobado", "Rechazado", "Anulado"]}
                    value="Borrador"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Forma de pago"
                    data={["A determinar", "Tarjeta", "Efectivo"]}
                    {...form.getInputProps('forma_pago')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <DateInput
                    label="Fecha de vencimiento"
                    placeholder="Seleccionar fecha"
                    valueFormat="YYYY-MM-DD"
                    {...form.getInputProps('fecha_vencimiento')}
                  />
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>

          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md" td={"line"}>Información del cliente</Title>
              <Grid columns={6}>
                <Grid.Col span={6}>
                  <BuscadorDeClientes
                    onClienteSeleccionado={(cliente) =>
                      form.setFieldValue('id_cliente', cliente.id_cliente)
                    }
                  />
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>

          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Agregar producto</Title>
              <Grid align="end">
                <Grid.Col span={12}>
                  <BuscadorDeProductos
                    onProductosActualizados={(items) => form.setFieldValue('items', items)}
                  />
                </Grid.Col>
              
              </Grid>
            </Card>
          </Grid.Col>

          <Grid.Col span={12}>
            <Grid>
              <Grid.Col span={6}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Textarea
                    label="Observaciones"
                    autosize
                    minRows={12}
                    style={{ height: '100%' }}
                    {...form.getInputProps('observaciones')}
                  />
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Title order={5}>Subtotal: ${subtotal.toFixed(2)}</Title>
                  <NumberInput
                    label="Descuento (%)"
                    min={0}
                    max={100}
                    suffix="%"
                    {...form.getInputProps('descuento')}
                  />
                  <NumberInput
                    label="Impuestos (%)"
                    min={0}
                    max={100}
                    suffix="%"
                    {...form.getInputProps('impuestos')}
                  />
                  <Text>Descuento: -${descuentoAplicado.toFixed(2)}</Text>
                  <Text>Impuestos: +${impuestosAplicados.toFixed(2)}</Text>
                  <Title order={5} mt="md">Total: ${totalFinal.toFixed(2)}</Title>
                </Card>
              </Grid.Col>
            </Grid>
          </Grid.Col>

          <Grid.Col span={12}>
            <Group justify="flex-end">
              <Button variant="filled" c="white" color="#EE0E0F">Crear PDF</Button>
              <Button variant="outline" color="#EE0E0F" onClick={handleGuardar}>Guardar</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Container>
    </LayoutBase>
  );
};

export default CrearPresupuesto;
