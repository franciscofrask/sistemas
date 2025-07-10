import React, { useState, useEffect } from 'react';
import {
  TextInput,
  Paper,
  Text,
  Loader,
  Box,
  List,
  Button,
  Modal,
  Grid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

const BuscadorDeClientes = ({ onClienteSeleccionado }) => {
  const [query, setQuery] = useState('');
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      direccion: '',
    },
  });

  useEffect(() => {
    const fetchClientes = async () => {
      if (!query) return setClientes([]);
      setLoading(true);
      try {
        const res = await fetch(`/api/stock/clientes?nombre=${encodeURIComponent(query)}`);
        const data = await res.json();
        setClientes(data);
      } catch (err) {
        console.error("Error al obtener clientes:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchClientes, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSeleccion = (cliente) => {
    setSeleccionado(cliente);
    setQuery(cliente.nombre);
    setClientes([]);
    onClienteSeleccionado?.(cliente);
  };

  const handleSubmit = async (values) => {
    try {
      const res = await fetch('/api/stock/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const nuevoCliente = await res.json();
        onClienteSeleccionado?.({ id: nuevoCliente.id, ...values });
        close();
        setQuery(values.nombre);
        setSeleccionado({ id: nuevoCliente.id, ...values });
        form.reset();
      }
    } catch (err) {
      console.error("Error al crear cliente:", err);
    }
  };

  return (
    <Box>
      <TextInput
        label="Buscar cliente"
        placeholder="Escriba el nombre del cliente"
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
          setSeleccionado(null);
        }}
        rightSection={loading ? <Loader size="xs" /> : null}
        
      />

      {!seleccionado && clientes.length > 0 && (
        <Paper withBorder shadow="sm" mt="xs" radius="md">
          {clientes.map((cliente) => (
            <Box
              key={cliente.id}
              px="md"
              py={8}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f1f3f5' } }}
              onClick={() => handleSeleccion(cliente)}
            >
              <Text>{[cliente.nombre, cliente.apellido].filter(Boolean).join(' ')}</Text>

            </Box>
          ))}
        </Paper>
      )}

      {!seleccionado && query.length > 0 && clientes.length === 0 && !loading && (
        <Box mt="xs">
          <Text c="dimmed">No se encontró ningún cliente con ese nombre.</Text>
          <Button mt="xs" variant="outline" color="#EE0E0F" onClick={open}>
            Cargar nuevo cliente
          </Button>
        </Box>
      )}

      {seleccionado && (
        <Box mt="md">
          <Text fw={700}>Datos del cliente:</Text>
          <List >
            <List.Item>Nombre: {seleccionado.nombre + " " + seleccionado.apellido}</List.Item>
            <List.Item>Email: {seleccionado.email}</List.Item>
            <List.Item>Teléfono: {seleccionado.telefono}</List.Item>
            <List.Item>DNI: {seleccionado.dni}</List.Item>
          </List>
        </Box>
      )}

      <Modal opened={opened} onClose={close} title="Crear cliente" size="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput label="Nombre" {...form.getInputProps("nombre" )} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Apellido" {...form.getInputProps("apellido")} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="DNI" {...form.getInputProps("dni")} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Email" {...form.getInputProps("email")} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Teléfono" {...form.getInputProps("telefono")} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Dirección" {...form.getInputProps("direccion")} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Button variant="outline" color="#EE0E0F" type="submit" fullWidth>
                Crear cliente
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>
    </Box>
  );
};

export default BuscadorDeClientes;