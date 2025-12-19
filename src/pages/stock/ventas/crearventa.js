import React, { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconTrash, IconCheck, IconX, IconEdit } from "@tabler/icons-react";

/**
 * Vista: Venta en BORRADOR (UI mock)
 * - Simula cómo se ve y cómo se usa el circuito.
 * - Reemplazá los "mocks" por tus llamadas a SP vía API.
 */

// Mock: clientes
const CLIENTES = [
  { value: "1", label: "Consumidor final" },
  { value: "2", label: "Empresa X SRL" },
  { value: "3", label: "Juan Pérez" },
];

// Mock: almacenes
const ALMACENES = [
  { value: "2", label: "Sucursal Centro (id 2)" },
  { value: "1", label: "Casa Central (id 1)" },
];

// Mock: productos y su tipo de control
// tipo_control_stock: "UNIDAD" | "LOTE" | "SERIE"
const PRODUCTOS = [
  { value: "10", label: "Yerba 1kg (UNIDAD)", tipo: "UNIDAD", precioSugerido: 1800 },
  { value: "34", label: "Leche (LOTE)", tipo: "LOTE", precioSugerido: 1200 },
  { value: "33", label: "Notebook (SERIE)", tipo: "SERIE", precioSugerido: 850000 },
];

// Mock: lotes disponibles por producto+almacén
const LOTES_DISPONIBLES = {
  "34|2": [
    { value: "7", label: "Lote 0000000007 (stock 10)" },
    { value: "8", label: "Lote 0000000008 (stock 5)" },
  ],
  "34|1": [{ value: "9", label: "Lote 0000000009 (stock 3)" }],
};

// Mock: series disponibles por producto+almacén
const SERIES_DISPONIBLES = {
  "33|2": [
    { value: "21", label: "SER-ABC-00021" },
    { value: "22", label: "SER-ABC-00022" },
  ],
  "33|1": [{ value: "40", label: "SER-XYZ-00040" }],
};

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

function statusBadge(status) {
  if (status === "BORRADOR") return <Badge color="gray">BORRADOR</Badge>;
  if (status === "CONFIRMADA") return <Badge color="green">CONFIRMADA</Badge>;
  if (status === "ANULADA") return <Badge color="red">ANULADA</Badge>;
  return <Badge>DESCONOCIDO</Badge>;
}

export default function VentaBorradorView() {
  // Estado venta (mock). En real: viene de sp_get_venta o endpoint GET /ventas/:id
  const [venta, setVenta] = useState({
    id: 123, // en real: nueva_venta_id
    estado: "BORRADOR",
    clienteId: "1", // consumidor final por defecto
    almacenId: "2",
    tipoComprobante: "TICKET",
    nroComprobante: "",
    observaciones: "",
  });

  // Ítems (mock). En real: vienen de ventas_detalle (sp_get_venta)
  const [items, setItems] = useState([]);

  // Modal "Agregar ítem"
  const [opened, { open, close }] = useDisclosure(false);

  // Form modal
  const [productoId, setProductoId] = useState(null);
  const productoSeleccionado = useMemo(
    () => PRODUCTOS.find((p) => p.value === productoId) || null,
    [productoId]
  );

  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(null);
  const [loteId, setLoteId] = useState(null);
  const [serieId, setSerieId] = useState(null);

  const lotesDisponibles = useMemo(() => {
    if (!productoSeleccionado) return [];
    const key = `${productoSeleccionado.value}|${venta.almacenId}`;
    return LOTES_DISPONIBLES[key] || [];
  }, [productoSeleccionado, venta.almacenId]);

  const seriesDisponibles = useMemo(() => {
    if (!productoSeleccionado) return [];
    const key = `${productoSeleccionado.value}|${venta.almacenId}`;
    return SERIES_DISPONIBLES[key] || [];
  }, [productoSeleccionado, venta.almacenId]);

  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precioUnitario), 0);
  }, [items]);

  const editable = venta.estado === "BORRADOR";

  function resetModal() {
    setProductoId(null);
    setCantidad(1);
    setPrecioUnitario(null);
    setLoteId(null);
    setSerieId(null);
  }

  function onOpenAdd() {
    if (!editable) return;
    resetModal();
    open();
  }

  function validateAndAdd() {
    if (!productoSeleccionado) return alert("Seleccioná un producto.");

    const tipo = productoSeleccionado.tipo;

    // Defaults
    const precio = precioUnitario ?? productoSeleccionado.precioSugerido ?? 0;

    if (tipo === "SERIE") {
      // en serie, 1 por ítem
      if (!serieId) return alert("Seleccioná una serie.");
      const exists = items.some((x) => x.tipo === "SERIE" && x.serieId === serieId);
      if (exists) return alert("Esa serie ya está agregada en la venta.");
      const newItem = {
        id: crypto.randomUUID(),
        productoId: productoSeleccionado.value,
        productoNombre: productoSeleccionado.label,
        tipo,
        cantidad: 1,
        precioUnitario: precio,
        loteId: null,
        serieId,
      };
      setItems((prev) => [...prev, newItem]);
      close();
      return;
    }

    // UNIDAD / LOTE
    if (!cantidad || cantidad <= 0) return alert("Cantidad inválida.");
    if (tipo === "LOTE" && !loteId) return alert("Seleccioná un lote.");

    const newItem = {
      id: crypto.randomUUID(),
      productoId: productoSeleccionado.value,
      productoNombre: productoSeleccionado.label,
      tipo,
      cantidad: Number(cantidad),
      precioUnitario: Number(precio),
      loteId: tipo === "LOTE" ? loteId : null,
      serieId: null,
    };

    setItems((prev) => [...prev, newItem]);
    close();
  }

  function removeItem(itemId) {
    if (!editable) return;
    setItems((prev) => prev.filter((x) => x.id !== itemId));
  }

  function confirmarVenta() {
    if (!editable) return;
    if (items.length === 0) return alert("Agregá al menos 1 ítem antes de confirmar.");
    // En real: POST /ventas/:id/confirmar -> CALL sp_confirmar_venta(ventaId)
    setVenta((v) => ({ ...v, estado: "CONFIRMADA" }));
  }

  function anularVenta() {
    if (venta.estado !== "CONFIRMADA") return;
    // En real: POST /ventas/:id/anular -> CALL sp_anular_venta(ventaId)
    setVenta((v) => ({ ...v, estado: "ANULADA" }));
  }

  return (
    <Box p="md">
      <Flex justify="space-between" align="center" mb="md">
        <Stack gap={2}>
          <Title order={3}>Venta #{venta.id}</Title>
          <Group gap="sm">
            {statusBadge(venta.estado)}
            <Text size="sm" c="dimmed">
              Este documento es “venta en borrador”: se edita hasta confirmar.
            </Text>
          </Group>
        </Stack>

        <Group>
          <Button
            leftSection={<IconCheck size={16} />}
            onClick={confirmarVenta}
            disabled={!editable}
          >
            Confirmar
          </Button>
          <Button
            leftSection={<IconX size={16} />}
            color="red"
            variant="light"
            onClick={anularVenta}
            disabled={venta.estado !== "CONFIRMADA"}
          >
            Anular
          </Button>
        </Group>
      </Flex>

      <Card withBorder radius="md" mb="md">
        <Title order={5} mb="sm">
          Cabecera
        </Title>

        <Group grow align="flex-end">
          <Select
            label="Cliente"
            data={CLIENTES}
            value={venta.clienteId}
            onChange={(value) => setVenta((v) => ({ ...v, clienteId: value }))}
            disabled={!editable}
            description="Por defecto: Consumidor final"
          />
          <Select
            label="Almacén"
            data={ALMACENES}
            value={venta.almacenId}
            onChange={(value) => setVenta((v) => ({ ...v, almacenId: value }))}
            disabled={!editable || items.length > 0}
            description={items.length > 0 ? "Bloqueado si ya cargaste ítems" : "Elegilo antes de cargar ítems"}
          />
          <Select
            label="Tipo comprobante"
            data={[
              { value: "TICKET", label: "TICKET" },
              { value: "REMITO", label: "REMITO" },
              { value: "FACTURA_INTERNA", label: "FACTURA_INTERNA" },
            ]}
            value={venta.tipoComprobante}
            onChange={(value) => setVenta((v) => ({ ...v, tipoComprobante: value }))}
            disabled={!editable}
          />
          <TextInput
            label="Nro comprobante"
            value={venta.nroComprobante}
            onChange={(e) => setVenta((v) => ({ ...v, nroComprobante: e.currentTarget.value }))}
            disabled={!editable}
            placeholder="Opcional"
          />
        </Group>

        <TextInput
          mt="sm"
          label="Observaciones"
          value={venta.observaciones}
          onChange={(e) => setVenta((v) => ({ ...v, observaciones: e.currentTarget.value }))}
          disabled={!editable}
          placeholder="Opcional"
        />
      </Card>

      <Card withBorder radius="md">
        <Group justify="space-between" mb="sm">
          <Title order={5}>Ítems</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={onOpenAdd} disabled={!editable}>
            Agregar ítem
          </Button>
        </Group>

        <Divider mb="sm" />

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Producto</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Detalle</Table.Th>
              <Table.Th ta="right">Cantidad</Table.Th>
              <Table.Th ta="right">Precio</Table.Th>
              <Table.Th ta="right">Subtotal</Table.Th>
              <Table.Th ta="center">Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text c="dimmed">Sin ítems. Agregá productos para armar la venta.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              items.map((it) => (
                <Table.Tr key={it.id}>
                  <Table.Td>{it.productoNombre}</Table.Td>
                  <Table.Td>{it.tipo}</Table.Td>
                  <Table.Td>
                    {it.tipo === "LOTE" && <Text size="sm">Lote id: {it.loteId}</Text>}
                    {it.tipo === "SERIE" && <Text size="sm">Serie id: {it.serieId}</Text>}
                    {it.tipo === "UNIDAD" && <Text size="sm" c="dimmed">-</Text>}
                  </Table.Td>
                  <Table.Td ta="right">{it.cantidad}</Table.Td>
                  <Table.Td ta="right">{money(it.precioUnitario)}</Table.Td>
                  <Table.Td ta="right">{money(it.cantidad * it.precioUnitario)}</Table.Td>
                  <Table.Td ta="center">
                    <Group justify="center" gap="xs">
                      <Tooltip label="Editar (mock)">
                        <ActionIcon variant="light" disabled={!editable}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Quitar ítem">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => removeItem(it.id)}
                          disabled={!editable}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>

        <Divider my="sm" />

        <Flex justify="flex-end">
          <Stack gap={2} w={320}>
            <Group justify="space-between">
              <Text c="dimmed">Total</Text>
              <Text fw={700}>{money(total)}</Text>
            </Group>
            <Text size="xs" c="dimmed">
              En real: el total debería venir del backend (no confiar en cálculos del front).
            </Text>
          </Stack>
        </Flex>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          close();
          resetModal();
        }}
        title="Agregar ítem"
        centered
        size="lg"
      >
        <Stack>
          <Select
            label="Producto"
            data={PRODUCTOS}
            value={productoId}
            onChange={(value) => {
              setProductoId(value);
              const p = PRODUCTOS.find((x) => x.value === value);
              setPrecioUnitario(p?.precioSugerido ?? 0);
              setCantidad(1);
              setLoteId(null);
              setSerieId(null);
            }}
            searchable
            nothingFoundMessage="Sin resultados"
          />

          {productoSeleccionado && (
            <Group grow>
              {productoSeleccionado.tipo !== "SERIE" ? (
                <NumberInput
                  label="Cantidad"
                  value={cantidad}
                  onChange={setCantidad}
                  min={0}
                  decimalScale={3}
                />
              ) : (
                <TextInput label="Cantidad" value="1 (fijo por serie)" disabled />
              )}

              <NumberInput
                label="Precio unitario"
                value={precioUnitario}
                onChange={setPrecioUnitario}
                min={0}
                decimalScale={2}
              />
            </Group>
          )}

          {productoSeleccionado?.tipo === "LOTE" && (
            <Select
              label="Lote"
              data={lotesDisponibles}
              value={loteId}
              onChange={setLoteId}
              placeholder="Seleccioná lote con stock"
              searchable
              nothingFoundMessage="No hay lotes con stock"
              description="En real: lo trae un endpoint/sp de lotes disponibles por almacén"
            />
          )}

          {productoSeleccionado?.tipo === "SERIE" && (
            <Select
              label="Serie"
              data={seriesDisponibles}
              value={serieId}
              onChange={setSerieId}
              placeholder="Seleccioná serie disponible"
              searchable
              nothingFoundMessage="No hay series disponibles"
              description="En real: lo trae un endpoint/sp de series disponibles por almacén"
            />
          )}

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={close}>
              Cancelar
            </Button>
            <Button onClick={validateAndAdd}>Agregar</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
