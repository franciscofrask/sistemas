import React, { useState } from "react";
import { LayoutBase } from "@/layouts";
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
  Pagination,
  ScrollArea,
  ActionIcon,
} from "@mantine/core";
import BreadcrumbsNav from "@/components/Breadcrums";
import {
  IconStackMiddle,
  IconCoins,
  IconSearch,
  IconPremiumRights,
  IconTimeline,
  IconPencil,
  IconTrash,
  IconTimeDuration0,
} from "@tabler/icons-react";

const productos = [
  {
    nombre: "HTN",
    descripcion: "PROTEINA",
    marca: "Optimum",
    proveedor: "Natural Sp",
    stock: 10,
    compra: "$300",
    venta: "$1000",
    fecha: "21-08-2024",
  },
  {
    nombre: "NUTRILAB",
    descripcion: "PRE ENTRENO",
    marca: "Dymatize",
    proveedor: "Lebron",
    stock: 45,
    compra: "$300",
    venta: "$1000",
    fecha: "21-08-2024",
  },
  {
    nombre: "Producto 4",
    descripcion: "Descripción 4",
    marca: "MuscleTech",
    proveedor: "Capsule",
    stock: 34,
    compra: "$300",
    venta: "$1000",
    fecha: "21-08-2024",
  },
  {
    nombre: "Producto 5",
    descripcion: "Descripción 5",
    marca: "BSN",
    proveedor: "GenTech",
    stock: 23,
    compra: "$300",
    venta: "$1000",
    fecha: "21-08-2024",
  },
];

const rowsPerPage = 2;

const items = [
  {
    label: "En Stock",
    icon: IconStackMiddle,
    description: "$234",
    path: "/stock/dashboard",
  },
  {
    label: "Costo de Stock",
    icon: IconCoins,
    description: "$4343",
    path: "/stock/inventario",
  },
  {
    label: "Valor del stock",
    icon: IconPremiumRights,
    description: "$5435",
    path: "/stock/clientes",
  },
  {
    label: "Gancia estimada",
    icon: IconTimeline,
    description: "$43545",
    path: "/stock/proveedores",
  },
];

const index = () => {
  const [page, setPage] = useState(1);

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = productos.slice(start, end);

  const handleCardClick = (path) => {
    window.location.href = path;
  };

  const rows = pageRows.map((item, index) => (
    <tr ta="center" key={index}>
      <td ta="center" style={{ minWidth: 120 }}>{item.nombre}</td>
      <td ta="center" style={{ minWidth: 150 }}>{item.descripcion}</td>
      <td ta="center" style={{ minWidth: 120 }}>{item.marca}</td>
      <td ta="center" style={{ minWidth: 120 }}>{item.proveedor}</td>
      <td ta="center" style={{ minWidth: 80, textAlign: "center" }}>{item.stock}</td>
      <td ta="center" style={{ minWidth: 100, textAlign: "right" }}>{item.compra}</td>
      <td ta="center" style={{ minWidth: 100, textAlign: "right" }}>{item.venta}</td>
      <td ta="center" style={{ minWidth: 130, textAlign: "center" }}>{item.fecha}</td>
      <td ta="center" style={{ minWidth: 100 }}>
        <Group gap="xs" justify="center">
          <ActionIcon color="blue" variant="subtle">
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon color="red" variant="subtle">
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <LayoutBase>
      <Container size="lg" py="xl">
        <BreadcrumbsNav
          items={[
            { title: "Inicio", href: "/" },
            { title: "Stock", href: "/stock" },
          ]}
          separator="/"
          separatorColor="#EE0E0F"
          currentColor="#EE0E0F"
        />

        <Grid mt={30}>
          <Grid.Col span={12}>
            <Title order={1}>Inventario</Title>
            <Text c="dimmed" order={4}>
              Registro detallado de sus productos
            </Text>
          </Grid.Col>

          <Grid.Col mt={30} span={12}>
            <Button variant="outline" color="#EE0E0F">
              Agregar Producto
            </Button>
          </Grid.Col>

          {items.map((item) => (
            <Grid.Col key={item.label} span={{ base: 12, sm: 3, md: 3 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ height: "100%", cursor: "pointer" }}
                onClick={() => handleCardClick(item.path)}
              >
                <Stack spacing="xs">
                  <Group>
                    <item.icon size={24} />
                    <Title order={4}>{item.label}</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {item.description}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}

          <Grid.Col mt={30} span={12}>
            <TextInput
              placeholder="Buscar producto..."
              leftSection={<IconSearch size={18} />}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <ScrollArea h={400}>
              <Table
                highlightOnHover
                withTableBorder
                striped
                withColumnBorders
              >
                <thead>
                  <tr>
                    <th style={{ minWidth: 120 }}>Producto</th>
                    <th style={{ minWidth: 150 }}>Descripción</th>
                    <th style={{ minWidth: 120 }}>Marca</th>
                    <th style={{ minWidth: 120 }}>Proveedor</th>
                    <th style={{ minWidth: 80, textAlign: "center" }}>
                      Stock
                    </th>
                    <th style={{ minWidth: 100, textAlign: "right" }}>
                      Compra
                    </th>
                    <th style={{ minWidth: 100, textAlign: "right" }}>
                      Venta
                    </th>
                    <th style={{ minWidth: 130, textAlign: "center" }}>
                      Ult. Modif.
                    </th>
                    <th style={{ minWidth: 100, textAlign: "center" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </Table>

              <Group justify="center" mt="md">
                <Pagination
                  total={Math.ceil(productos.length / rowsPerPage)}
                  value={page}
                  onChange={setPage}
                  color="dark"
                />
              </Group>
            </ScrollArea>
          </Grid.Col>
        </Grid>
      </Container>
    </LayoutBase>
  );
};

export default index;
