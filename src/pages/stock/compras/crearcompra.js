import React, { useMemo, useState, useEffect, useCallback } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
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
  Loader,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { IconPlus, IconTrash, IconCheck, IconArrowLeft, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useStableSession } from "@/hooks/useStableSession";
import { notifications } from '@mantine/notifications';

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

export default function CompraBorradorView() {
  const router = useRouter();

  // Proveedores
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);

  // Almacenes
  const [almacenes, setAlmacenes] = useState([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(true);

  // Búsqueda de productos (se reutiliza vendibles por simplicidad)
  const [itemsVendibles, setItemsVendibles] = useState([]);
  const [loadingItemsVendibles, setLoadingItemsVendibles] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [debouncedBusqueda] = useDebouncedValue(busquedaProducto, 300);

  // Tipos de comprobante desde SP
  const [tiposComprobantes, setTiposComprobantes] = useState([]);
  const [loadingTiposComprobantes, setLoadingTiposComprobantes] = useState(true);

  // Estado compra
  const [compra, setCompra] = useState({
    id: null,
    estado: "BORRADOR",
    proveedorId: "1",
    almacenId: "2",
    tipoComprobante: "", // se asignar\u00e1 desde la API de tipos_comprobantes
    nroComprobante: "",
    observaciones: "",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const almacenGuardado = localStorage.getItem('almacen_seleccionado');
      if (almacenGuardado) {
        try {
          const obj = JSON.parse(almacenGuardado);
          if (obj && obj.id) {
            setCompra(v => ({ ...v, almacenId: String(obj.id) }));
            return;
          }
        } catch (e) {}
      }
      const legacyId = localStorage.getItem('almacenId');
      if (legacyId) setCompra(v => ({ ...v, almacenId: legacyId }));
    }
  }, []);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        setLoadingProveedores(true);
        const response = await fetch('/api/stock/proveedores');
        const data = await response.json();
        if (response.ok && data.success) {
          const opts = (data.data || []).map(p => ({
            value: String(p.id || p.proveedor_id),
            label: p.razon_social || p.nombre || `Proveedor ${p.id}`,
          }));
          setProveedores(opts);
        } else {
          setProveedores([{ value: "1", label: "Proveedor por defecto" }]);
        }
      } catch (_) {
        setProveedores([{ value: "1", label: "Proveedor por defecto" }]);
      } finally {
        setLoadingProveedores(false);
      }
    };

    const fetchAlmacenes = async () => {
      try {
        setLoadingAlmacenes(true);
        const response = await fetch('/api/stock/almacenes?solo_activos=1');
        const data = await response.json();
        if (response.ok && data.success) {
          const opts = (data.data || []).map(a => ({ value: String(a.id), label: a.nombre }));
          setAlmacenes(opts);
          if (typeof window !== 'undefined') {
            const almacenActual = localStorage.getItem('almacenId');
            if (!almacenActual && opts.length > 0) {
              const primero = opts[0].value;
              localStorage.setItem('almacenId', primero);
              setCompra(v => ({ ...v, almacenId: primero }));
            }
          }
        } else {
          setAlmacenes([{ value: "2", label: "Almacén por defecto" }]);
        }
      } catch (_) {
        setAlmacenes([{ value: "2", label: "Almacén por defecto" }]);
      } finally {
        setLoadingAlmacenes(false);
      }
    };

    fetchProveedores();
    fetchAlmacenes();
  }, []);

  // Cargar tipos de comprobante desde el SP
  useEffect(() => {
    const fetchTiposComprobantes = async () => {
      try {
        setLoadingTiposComprobantes(true);
        const resp = await fetch('/api/stock/ventas/tipos-comprobantes?modulo=COMPRA');
        const data = await resp.json();

        if (resp.ok && data.success) {
          const mapped = (data.data || []).map((tc) => ({
            value: tc.codigo,        // c\u00f3digo: 'FAC', 'NCC', etc.
            label: tc.nombre,        // nombre descriptivo
          }));
          setTiposComprobantes(mapped);

          // Asegurar valor por defecto: usar el primer tipo disponible
          setCompra((v) => {
            // Si ya tiene un c\u00f3digo v\u00e1lido, mantenerlo
            if (v.tipoComprobante && mapped.some((m) => m.value === v.tipoComprobante)) {
              return v;
            }
            // Asignar el primer tipo disponible
            const fallback = mapped[0]?.value || '';
            return { ...v, tipoComprobante: fallback };
          });
        } else {
          console.error('Error cargando tipos de comprobante:', data?.message);
        }
      } catch (err) {
        console.error('Error inesperado cargando tipos de comprobante:', err);
      } finally {
        setLoadingTiposComprobantes(false);
      }
    };

    fetchTiposComprobantes();
  }, []);

  const buscarItemsVendibles = useCallback(async (query = '') => {
    let almacenIdParam = null;
    if (typeof window !== 'undefined') {
      const almacenStr = localStorage.getItem('almacen_seleccionado');
      if (almacenStr) {
        try { const obj = JSON.parse(almacenStr); if (obj && obj.id) almacenIdParam = String(obj.id); } catch (_) {}
      }
      if (!almacenIdParam) {
        const legacy = localStorage.getItem('almacenId');
        if (legacy) almacenIdParam = legacy;
      }
    }
    if (!almacenIdParam) almacenIdParam = compra.almacenId ? String(compra.almacenId) : null;
    if (!almacenIdParam || isNaN(parseInt(almacenIdParam)) || parseInt(almacenIdParam) <= 0) return;

    setLoadingItemsVendibles(true);
    try {
      const params = new URLSearchParams({ almacen_id: String(parseInt(almacenIdParam)), limite: '50' });
      if (query && query.trim()) params.set('q', query.trim());

      const response = await fetch(`/api/stock/productos/vendibles?${params}`);
      const data = await response.json();
      if (response.ok && data.success) setItemsVendibles(data.data || []);
      else setItemsVendibles([]);
    } catch (_) {
      setItemsVendibles([]);
    } finally {
      setLoadingItemsVendibles(false);
    }
  }, [compra.almacenId]);

  useEffect(() => {
    if (compra.almacenId) buscarItemsVendibles(debouncedBusqueda);
  }, [compra.almacenId, debouncedBusqueda, buscarItemsVendibles]);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [cantidadesSel, setCantidadesSel] = useState({});
  const [preciosSel, setPreciosSel] = useState({});
  const [seriesSel, setSeriesSel] = useState({}); // key -> numero_serie para SERIE

  const getItemKey = useCallback((it) => `${it.item_tipo}|${it.producto_id}|${it.lote_id || ''}|${it.serie_id || ''}`, []);

  const addSeleccion = (item) => {
    const key = getItemKey(item);
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        if (item.item_tipo !== 'SERIE') {
          setCantidadesSel((pc) => ({ ...pc, [key]: Number(pc[key] ?? 1) + 1 }));
        }
        return prev;
      }
      setSelectedItems((pi) => ({ ...pi, [key]: item }));
      setCantidadesSel((pc) => ({ ...pc, [key]: item.item_tipo === 'SERIE' ? 1 : 1 }));
      setPreciosSel((pp) => ({ ...pp, [key]: Number(item.precio_lista) || 0 }));
      if (item.item_tipo === 'SERIE') {
        setSeriesSel((ps) => ({ ...ps, [key]: item.numero_serie || '' }));
      }
      return [...prev, key];
    });
  };

  const removeSeleccion = (key) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
    setSelectedItems((pi) => { const copy = { ...pi }; delete copy[key]; return copy; });
    setCantidadesSel((pc) => { const copy = { ...pc }; delete copy[key]; return copy; });
    setPreciosSel((pp) => { const copy = { ...pp }; delete copy[key]; return copy; });
  };

  const setCantidadItem = (key, value) => setCantidadesSel((prev) => ({ ...prev, [key]: value }));
  const setPrecioItem = (key, value) => setPreciosSel((prev) => ({ ...prev, [key]: value }));
  const setSerieItem = (key, value) => setSeriesSel((prev) => ({ ...prev, [key]: value }));

  const total = useMemo(() => items.reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precioUnitario), 0), [items]);
  const editable = compra.estado === "BORRADOR";

  const handleAlmacenChange = (value) => {
    if (!value) return;
    if (typeof window !== 'undefined') localStorage.setItem('almacenId', value);
    setCompra((v) => ({ ...v, almacenId: value }));
  };

  function resetModal() {
    setSelectedKeys([]);
    setSelectedItems({});
    setCantidadesSel({});
    setPreciosSel({});
    setBusquedaProducto('');
  }

  const { data: session } = useStableSession();
  const [creandoCompra, setCreandoCompra] = useState(false);

  const loadItemsCompra = useCallback(async (compraId) => {
    try {
      if (!compraId) return;
      const resp = await fetch(`/api/stock/compras/items?compra_id=${compraId}`);
      const data = await resp.json();
      if (!resp.ok || !data.success) return;
      const mapped = (data.data || []).map((r) => ({
        id: r.compra_detalle_id || r.detalle_id || r.id,
        productoId: r.producto_id,
        productoNombre: r.producto_nombre,
        tipo: r.tipo_control_stock,
        cantidad: r.cantidad,
        precioUnitario: r.precio_unitario,
        loteId: r.lote_id,
        serieId: r.serie_id,
        codigoLote: r.codigo_lote,
        fechaVencimiento: r.fecha_vencimiento,
        numeroSerie: r.numero_serie,
      }));
      setItems(mapped);
    } catch (_) {}
  }, []);

  async function onOpenAdd() {
    if (!editable) return;
    resetModal();

    if (compra.id) { open(); return; }

    try {
      setCreandoCompra(true);

      let almacenIdEnvio = null;
      if (typeof window !== 'undefined') {
        const almacenJSON = localStorage.getItem('almacen_seleccionado');
        if (almacenJSON) {
          try { const obj = JSON.parse(almacenJSON); if (obj && obj.id) almacenIdEnvio = String(obj.id); } catch(_) {}
        }
        if (!almacenIdEnvio) {
          const legacyId = localStorage.getItem('almacenId');
          if (legacyId) almacenIdEnvio = legacyId;
        }
      }
      if (!almacenIdEnvio) almacenIdEnvio = compra.almacenId;

      const payload = {
        proveedor_id: parseInt(compra.proveedorId),
        almacen_id: parseInt(almacenIdEnvio),
        tipo_comprobante: compra.tipoComprobante,
        nro_comprobante: compra.nroComprobante || '',
        observaciones: compra.observaciones || '',
        creado_por: session?.user?.id ? parseInt(session.user.id) : null,
      };

      if (!payload.creado_por) {
        alert('No se puede crear la compra: usuario no autenticado.');
        setCreandoCompra(false);
        return;
      }

      const resp = await fetch('/api/stock/compras/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        alert(data?.message || 'No se pudo crear la compra');
        setCreandoCompra(false);
        return;
      }
      const nuevaId = data?.data?.compra_id;
      setCompra((v) => ({ ...v, id: nuevaId }));
      await loadItemsCompra(nuevaId);
      open();
    } catch (err) {
      alert('Error inesperado al crear la compra');
    } finally {
      setCreandoCompra(false);
    }
  }

  const [agregandoItems, setAgregandoItems] = useState(false);
  async function validateAndAdd() {
    if (!selectedKeys.length) return alert('Seleccioná al menos un item.');
    if (!compra.id) return alert('La compra aún no fue creada. Cierra y vuelve a intentar.');

    const payloads = [];
    for (const key of selectedKeys) {
      const it = selectedItems[key];
      if (!it) continue;
      const tipo = it.item_tipo;
      const precio = Number(preciosSel[key] ?? it.precio_lista ?? 0);
      const cantidad = tipo === 'SERIE' ? 1 : Number(cantidadesSel[key] ?? 1);

      if (!cantidad || cantidad <= 0) {
        alert(`Cantidad inválida para ${it.producto_nombre}`);
        return;
      }

      if (tipo === 'SERIE') {
        const numSerie = (seriesSel[key] || '').trim();
        if (!numSerie) {
          alert(`Falta numero_serie para el producto por SERIE: ${it.producto_nombre}`);
          return;
        }
      }

      payloads.push({
        compra_id: parseInt(compra.id),
        producto_id: parseInt(it.producto_id),
        cantidad: Number(cantidad),
        precio_unitario: Number(precio),
        // Para compras dejamos datos de lote/serie nulos por ahora
        codigo_lote: null,
        fecha_vencimiento: null,
        serie_id: null,
        numero_serie: tipo === 'SERIE' ? (seriesSel[key] || '').trim() : null,
      });
    }

    try {
      setAgregandoItems(true);
      for (const p of payloads) {
        const resp = await fetch('/api/stock/compras/items/agregar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data?.message || 'No se pudo agregar un ítem a la compra');
        }
      }
      await loadItemsCompra(compra.id);
      close();
      resetModal();
    } catch (e) {
      alert(e.message || 'Error al agregar ítems a la compra');
    } finally {
      setAgregandoItems(false);
    }
  }

  function removeItem(itemId) {
    if (!editable) return;
    setItems((prev) => prev.filter((x) => x.id !== itemId));
  }

  const [confirmando, setConfirmando] = useState(false);
  async function confirmarCompra() {
    if (!editable) return;
    if (items.length === 0) return alert("Agregá al menos 1 ítem antes de confirmar.");
    if (!compra.id) return alert('La compra aún no fue creada.');

    try {
      setConfirmando(true);
      const resp = await fetch('/api/stock/compras/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compra_id: parseInt(compra.id) }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        alert(data?.message || 'No se pudo confirmar la compra');
        return;
      }
      setCompra((v) => ({ ...v, estado: 'CONFIRMADA' }));
      
      // Mostrar alerta de éxito
      notifications.show({
        title: '¡Compra confirmada!',
        message: 'La compra ha sido confirmada exitosamente',
        color: 'green',
        autoClose: 2000,
      });
      
      // Redirigir al detalle de la compra
      setTimeout(() => {
        router.push(`/stock/compras/detalle/${compra.id}`);
      }, 2000);
    } catch (e) {
      alert(e.message || 'Error al confirmar la compra');
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <ProtectedLayout>
      <Container size="xl">
        <Grid mt={20}>
          <Grid.Col span={12}>
            <Flex justify="space-between" align="center" mb="md">
              <Stack gap={2}>
                <Group>
                  <Button 
                    variant="subtle" 
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => router.push('/stock/dashboard')}
                  >
                    Volver al Dashboard
                  </Button>
                </Group>
                <Title order={2}>Nueva Compra #{compra.id}</Title>
                <Group gap="sm">
                  {statusBadge(compra.estado)}
                  <Text size="sm" c="dimmed">Este documento es “compra en borrador”.</Text>
                </Group>
              </Stack>

              <Group>
                <Button
                  size="sm"
                  leftSection={<IconCheck size={16} />}
                  onClick={confirmarCompra}
                  disabled={!editable || confirmando}
                  loading={confirmando}
                  color="green"
                >
                  Confirmar
                </Button>
              </Group>
            </Flex>

            <Card withBorder radius="md" mb="xs" p="sm">
              <Title order={5} mb="xs">Información de la Compra</Title>
              <Grid gutter="xs">
                <Grid.Col span={6} md={3}>
                  <Select
                    size="sm"
                    label="Proveedor"
                    data={proveedores}
                    value={compra.proveedorId}
                    onChange={(value) => setCompra((v) => ({ ...v, proveedorId: value }))}
                    disabled={!editable || loadingProveedores}
                    searchable
                    placeholder={loadingProveedores ? "Cargando..." : "Buscar proveedor..."}
                    comboboxProps={{ transitionProps: { transition: 'fade', duration: 100 } }}
                  />
                </Grid.Col>
                <Grid.Col span={6} md={3}>
                  <Select
                    size="sm"
                    label="Almacén"
                    data={almacenes}
                    value={compra.almacenId}
                    onChange={handleAlmacenChange}
                    disabled={!editable || items.length > 0 || loadingAlmacenes}
                    searchable
                    placeholder={loadingAlmacenes ? "Cargando..." : "Buscar almacén..."}
                    comboboxProps={{ transitionProps: { transition: 'fade', duration: 100 } }}
                  />
                </Grid.Col>
                <Grid.Col span={6} md={3}>
                  <Select
                    size="sm"
                    label="Tipo comprobante"
                    data={tiposComprobantes}
                    value={compra.tipoComprobante}
                    onChange={(value) => setCompra((v) => ({ ...v, tipoComprobante: value }))}
                    disabled={!editable || loadingTiposComprobantes}
                    placeholder={loadingTiposComprobantes ? 'Cargando...' : 'Seleccionar tipo'}
                    comboboxProps={{ transitionProps: { transition: 'fade', duration: 100 } }}
                  />
                </Grid.Col>
                <Grid.Col span={6} md={3}>
                  <TextInput
                    size="sm"
                    label="Nro comprobante"
                    value={compra.nroComprobante}
                    onChange={(e) => setCompra((v) => ({ ...v, nroComprobante: e.currentTarget.value }))}
                    disabled={!editable}
                    placeholder="Opcional"
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    size="sm"
                    label="Observaciones"
                    value={compra.observaciones}
                    onChange={(e) => setCompra((v) => ({ ...v, observaciones: e.currentTarget.value }))}
                    disabled={!editable}
                    placeholder="Opcional"
                  />
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>

          <Grid.Col span={12}>
            <Card withBorder radius="md" p="sm">
              <Group justify="space-between" mb="xs">
                <Title order={5}>Productos</Title>
                <Button size="sm" leftSection={<IconPlus size={16} />} onClick={onOpenAdd} disabled={!editable} variant="outline" color="#EE0E0F">
                  Agregar Producto
                </Button>
              </Group>

              <Divider mb="xs" />

              <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table striped highlightOnHover fontSize="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th ta="center">Producto</Table.Th>
                    <Table.Th ta="center">Tipo</Table.Th>
                    <Table.Th ta="center">Detalle</Table.Th>
                    <Table.Th ta="center">Cantidad</Table.Th>
                    <Table.Th ta="center">Precio</Table.Th>
                    <Table.Th ta="center">Subtotal</Table.Th>
                    <Table.Th ta="center">Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7} ta="center">
                        <Text c="dimmed">Sin ítems. Agregá productos para armar la compra.</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    items.map((it) => (
                      <Table.Tr key={it.id}>
                        <Table.Td ta="center">
                          <Stack gap={2}>
                            <Text fw={500}>{it.productoNombre}</Text>
                            {it.sku && <Text size="xs" c="dimmed">SKU: {it.sku}</Text>}
                            {it.codigoBarras && <Text size="xs" c="dimmed">Código: {it.codigoBarras}</Text>}
                          </Stack>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Badge 
                            color={it.tipo === "UNIDAD" ? "blue" : it.tipo === "LOTE" ? "green" : "purple"}
                            variant="light"
                          >
                            {it.tipo}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Stack gap={2}>
                            {it.tipo === "LOTE" && (
                              <>
                                {it.codigoLote && <Text size="sm">Lote: {it.codigoLote}</Text>}
                                {it.fechaVencimiento && (
                                  <Text size="xs" c="orange">Vence: {new Date(it.fechaVencimiento).toLocaleDateString()}</Text>
                                )}
                              </>
                            )}
                            {it.tipo === "SERIE" && (
                              <Text size="sm">Serie: {it.numeroSerie}</Text>
                            )}
                          </Stack>
                        </Table.Td>
                        <Table.Td ta="center">{it.cantidad}</Table.Td>
                        <Table.Td ta="center">{money(it.precioUnitario)}</Table.Td>
                        <Table.Td ta="center">{money(it.cantidad * it.precioUnitario)}</Table.Td>
                        <Table.Td ta="center">
                          <Group justify="center" gap="xs">
                            <Tooltip label="Quitar ítem">
                              <ActionIcon variant="light" color="red" onClick={() => removeItem(it.id)} disabled={!editable}>
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
              </Box>

              <Divider my="xs" />

              <Group justify="flex-end" p="xs" bg="gray.0" style={{ borderRadius: '4px' }}>
                <Text size="sm" c="dimmed">Total:</Text>
                <Text size="lg" fw={700}>{money(total)}</Text>
              </Group>
            </Card>

            <Modal
              opened={opened}
              onClose={() => { close(); resetModal(); }}
              title="Agregar ítem a la compra"
              centered
              size="xl"
            >
              <Stack>
                <TextInput
                  label="Buscar producto"
                  placeholder="Buscar por nombre, SKU, código de barras, lote o serie..."
                  leftSection={<IconSearch size={16} />}
                  value={busquedaProducto}
                  onChange={(event) => setBusquedaProducto(event.currentTarget.value)}
                  description="Escribe para buscar productos (catálogo)"
                />

                {loadingItemsVendibles && (
                  <Group justify="center" p="md">
                    <Loader size="sm" />
                    <Text size="sm">Buscando productos...</Text>
                  </Group>
                )}

                {!loadingItemsVendibles && itemsVendibles.length > 0 && (
                  <>
                    <Text size="sm" fw={500}>Productos encontrados ({itemsVendibles.length}):</Text>
                    <Stack gap={"xs"} mah={320} style={{ overflowY: 'auto' }}>
                      {itemsVendibles.map((item) => {
                        const key = getItemKey(item);
                        return (
                          <Card key={key} withBorder padding="sm" style={{ cursor: 'pointer' }} onClick={() => addSeleccion(item)}>
                            <Grid align="center">
                              <Grid.Col span={8}>
                                <Stack gap={2}>
                                  <Group>
                                    <Text fw={500} size="sm">{item.display_text}</Text>
                                    <Badge size="xs" color={item.item_tipo === 'UNIDAD' ? 'blue' : item.item_tipo === 'LOTE' ? 'green' : 'purple'}>
                                      {item.item_tipo}
                                    </Badge>
                                  </Group>
                                  {item.sku && <Text size="xs" c="dimmed">SKU: {item.sku}</Text>}
                                  {item.codigo_barras && <Text size="xs" c="dimmed">Código: {item.codigo_barras}</Text>}
                                </Stack>
                              </Grid.Col>
                              <Grid.Col span={4}>
                                <Stack gap={2} align="flex-end">
                                  <Text size="sm" fw={500}>{money(Number(item.precio_lista) || 0)}</Text>
                                </Stack>
                              </Grid.Col>
                            </Grid>
                          </Card>
                        );
                      })}
                    </Stack>
                  </>
                )}

                {!loadingItemsVendibles && itemsVendibles.length === 0 && busquedaProducto.trim() && (
                  <Text c="dimmed" ta="center" p="md">No se encontraron productos que coincidan con "{busquedaProducto}"</Text>
                )}
                {!loadingItemsVendibles && itemsVendibles.length === 0 && !busquedaProducto.trim() && (
                  <Text c="dimmed" ta="center" p="md">Escribe algo para buscar productos disponibles</Text>
                )}

                {selectedKeys.length > 0 && (
                  <Card withBorder p="md" mt="md">
                    <Stack>
                      <Group justify="space-between" align="center">
                        <Text fw={500}>Seleccionados ({selectedKeys.length})</Text>
                        <Text size="xs" c="dimmed">Edita cantidades y precios antes de agregar</Text>
                      </Group>
                      <Stack gap="xs" mah={240} style={{ overflowY: 'auto' }}>
                        {selectedKeys.map((key) => {
                          const it = selectedItems[key];
                          if (!it) return null;
                          return (
                            <Card key={key} withBorder padding="xs">
                              <Grid align="center">
                                <Grid.Col span={7}>
                                  <Stack gap={2}>
                                    <Text size="sm" fw={500}>{it.producto_nombre}</Text>
                                    <Group gap={8}>
                                      <Badge size="xs" color={it.item_tipo === 'UNIDAD' ? 'blue' : it.item_tipo === 'LOTE' ? 'green' : 'purple'}>
                                        {it.item_tipo}
                                      </Badge>
                                    </Group>
                                  </Stack>
                                </Grid.Col>
                                <Grid.Col span={4}>
                                  <Group justify="flex-end" gap="sm" wrap="nowrap">
                                    {it.item_tipo !== 'SERIE' ? (
                                      <NumberInput
                                        label="Cant"
                                        size="xs"
                                        value={cantidadesSel[key] ?? 1}
                                        onChange={(v) => setCantidadItem(key, v)}
                                        min={0.001}
                                        decimalScale={3}
                                        styles={{ label: { marginBottom: 0 } }}
                                      />
                                    ) : (
                                      <NumberInput label="Cant" size="xs" value={1} disabled styles={{ label: { marginBottom: 0 } }} />
                                    )}
                                    <NumberInput
                                      label="Precio"
                                      size="xs"
                                      value={preciosSel[key] ?? (Number(it.precio_lista) || 0)}
                                      onChange={(v) => setPrecioItem(key, v)}
                                      min={0}
                                      decimalScale={2}
                                      styles={{ label: { marginBottom: 0 } }}
                                    />
                                  </Group>
                                </Grid.Col>
                                <Grid.Col span={1}>
                                  <Group justify="flex-end">
                                    <ActionIcon color="red" variant="subtle" onClick={() => removeSeleccion(key)}>
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Group>
                                </Grid.Col>
                              </Grid>
                              {it.item_tipo === 'SERIE' && (
                                <Grid mt={8}>
                                  <Grid.Col span={12}>
                                    <TextInput
                                      label="Número de serie"
                                      placeholder="Ingresá el número de serie"
                                      value={seriesSel[key] ?? ''}
                                      onChange={(e) => setSerieItem(key, e.currentTarget.value)}
                                    />
                                  </Grid.Col>
                                </Grid>
                              )}
                            </Card>
                          );
                        })}
                      </Stack>
                    </Stack>
                  </Card>
                )}

                <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={close}>Cancelar</Button>
                  <Button onClick={validateAndAdd} disabled={selectedKeys.length === 0 || agregandoItems} loading={agregandoItems} leftSection={<IconPlus size={16} />}>Agregar a la compra</Button>
                </Group>
              </Stack>
            </Modal>
          </Grid.Col>
        </Grid>
      </Container>
    </ProtectedLayout>
  );
}
