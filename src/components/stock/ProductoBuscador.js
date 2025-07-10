import React, { useState, useEffect } from 'react';
import {
  TextInput,
  Paper,
  Text,
  Loader,
  Box,
  List,
  Card,
  Grid,
  NumberInput,
  Button,
  Title
} from '@mantine/core';

const BuscadorDeProductos = ({ onProductosActualizados }) => {
  const [query, setQuery] = useState('');
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      if (!query) return setProductos([]);
      setLoading(true);
      try {
        const res = await fetch(`/api/stock/productos?nombre=${encodeURIComponent(query)}`);
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        console.error("Error al obtener productos:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchProductos, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSeleccion = (producto) => {
    const nuevo = {
      ...producto,
      cantidad: 1,
      precio: producto.precio_venta || 0,
    };

    const yaExiste = seleccionados.some(p => p.id_producto === producto.id_producto);
    if (!yaExiste) {
      const actualizados = [...seleccionados, nuevo];
      setSeleccionados(actualizados);
      onProductosActualizados?.(actualizados);
    }

    setQuery('');
    setProductos([]);
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevos = [...seleccionados];
    nuevos[index][campo] = valor;
    setSeleccionados(nuevos);
    onProductosActualizados?.(nuevos);
  };

  const eliminarItem = (index) => {
    const nuevos = seleccionados.filter((_, i) => i !== index);
    setSeleccionados(nuevos);
    onProductosActualizados?.(nuevos);
  };

  return (
    <Box>
      <TextInput
        label="Buscar producto"
        placeholder="Escriba el nombre del producto"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        rightSection={loading ? <Loader size="xs" /> : null}
      />

      {query.length > 0 && productos.length > 0 && (
        <Paper withBorder shadow="sm" mt="xs" radius="md">
          {productos.map((producto) => (
            <Box
              key={producto.id_individual}
              px="md"
              py={8}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f1f3f5' } }}
              onClick={() => handleSeleccion(producto)}
            >
              <Text>{producto.nombre} {producto.descripcion}</Text>
            </Box>
          ))}
        </Paper>
      )}

      {query.length > 0 && productos.length === 0 && !loading && (
        <Box mt="xs">
          <Text c="dimmed">No se encontró ningún producto con ese nombre.</Text>
        </Box>
      )}

      {seleccionados.length > 0 && (
        <Box mt="md">
          <Title order={5}>Productos seleccionados:</Title>
          {seleccionados.map((producto, index) => (
            <Card key={producto.id_producto} withBorder shadow="xs" mt="xs">
             
              <Grid mt="xs">
                <Grid.Col  span={2.1}>
                  <Text>{producto.nombre}</Text>
                 
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text c="dimmed" size="sm">{producto.descripcion}</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    label="Cantidad"
                    value={producto.cantidad}
                    min={1}
                    onChange={(value) => actualizarItem(index, 'cantidad', value)}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    label="Precio"
                    value={producto.precio}
                    precision={2}
                    onChange={(value) => actualizarItem(index, 'precio', value)}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Button color="#EE0E0F" variant="outline" mt={22} onClick={() => eliminarItem(index)}>
                    Eliminar
                  </Button>
                </Grid.Col>
              </Grid>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BuscadorDeProductos;