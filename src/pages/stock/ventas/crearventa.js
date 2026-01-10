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
  Autocomplete,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { IconPlus, IconTrash, IconCheck, IconX, IconEdit, IconArrowLeft, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useStableSession } from "@/hooks/useStableSession";
import { notifications } from '@mantine/notifications';

/**
 * Vista: Venta en BORRADOR (UI mock)
 * - Simula cómo se ve y cómo se usa el circuito.
 * - Reemplazá los "mocks" por tus llamadas a SP vía API.
 */



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
  const router = useRouter();
  
  // Estado para clientes cargados desde la API
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  // Estado para almacenes cargados desde la API
  const [almacenes, setAlmacenes] = useState([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(true);

  // Estado para búsqueda de items vendibles
  const [itemsVendibles, setItemsVendibles] = useState([]);
  const [loadingItemsVendibles, setLoadingItemsVendibles] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [debouncedBusqueda] = useDebouncedValue(busquedaProducto, 300);

  // Tipos de comprobante desde SP
  const [tiposComprobantes, setTiposComprobantes] = useState([]);
  const [loadingTiposComprobantes, setLoadingTiposComprobantes] = useState(true);

  // Estado venta (mock). En real: viene de sp_get_venta o endpoint GET /ventas/:id
  const [venta, setVenta] = useState({
    id: null, // se crea al presionar "Agregar Producto"
    estado: "BORRADOR",
    clienteId: "2", // cliente con ID 2 por defecto
    almacenId: "2", // se actualizará desde localStorage en useEffect
    tipoComprobante: "", // se asignará desde la API de tipos_comprobantes
    nroComprobante: "",
    observaciones: "",
  });

  // Ítems (mock). En real: vienen de ventas_detalle (sp_get_venta)
  const [items, setItems] = useState([]);

  // Cargar almacén desde localStorage (solo en el cliente)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const almacenGuardado = localStorage.getItem('almacen_seleccionado');
      if (almacenGuardado) {
        try {
          const obj = JSON.parse(almacenGuardado);
          if (obj && obj.id) {
            setVenta(v => ({ ...v, almacenId: String(obj.id) }));
            return;
          }
        } catch (e) {
          console.warn('No se pudo parsear almacen_seleccionado:', e);
        }
      }

      // Fallback legacy: si existe clave antigua con el ID como string
      const legacyId = localStorage.getItem('almacenId');
      if (legacyId) {
        setVenta(v => ({ ...v, almacenId: legacyId }));
      }
    }
  }, []);

  // Cargar clientes desde la API
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoadingClientes(true);
        const response = await fetch('/api/stock/clientes');
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Formatear clientes para el Select
          const clientesFormateados = data.data.map(cliente => ({
            value: cliente.id.toString(),
            label: cliente.nombre
          }));
          setClientes(clientesFormateados);
        } else {
          console.error('Error cargando clientes:', data.message);
          // Fallback a mock en caso de error
          setClientes([
            { value: "1", label: "Consumidor final" },
            { value: "2", label: "Cliente por defecto" },
          ]);
        }
      } catch (error) {
        console.error('Error en fetch clientes:', error);
        // Fallback a mock en caso de error
        setClientes([
          { value: "1", label: "Consumidor final" },
          { value: "2", label: "Cliente por defecto" },
        ]);
      } finally {
        setLoadingClientes(false);
      }
    };

    const fetchAlmacenes = async () => {
      try {
        setLoadingAlmacenes(true);
        const response = await fetch('/api/stock/almacenes?solo_activos=1');
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Formatear almacenes para el Select
          const almacenesFormateados = data.data.map(almacen => ({
            value: almacen.id.toString(),
            label: almacen.nombre
          }));
          setAlmacenes(almacenesFormateados);
          
          // Si no hay almacén en localStorage y hay almacenes, usar el primero
          if (typeof window !== 'undefined') {
            const almacenActual = localStorage.getItem('almacenId');
            if (!almacenActual && almacenesFormateados.length > 0) {
              const primerAlmacen = almacenesFormateados[0].value;
              localStorage.setItem('almacenId', primerAlmacen);
              setVenta(v => ({ ...v, almacenId: primerAlmacen }));
            }
          }
        } else {
          console.error('Error cargando almacenes:', data.message);
          // Fallback a mock en caso de error
          setAlmacenes([
            { value: "2", label: "Almacén por defecto" },
            { value: "1", label: "Casa Central" },
          ]);
        }
      } catch (error) {
        console.error('Error en fetch almacenes:', error);
        // Fallback a mock en caso de error
        setAlmacenes([
          { value: "2", label: "Almacén por defecto" },
          { value: "1", label: "Casa Central" },
        ]);
      } finally {
        setLoadingAlmacenes(false);
      }
    };

    fetchClientes();
    fetchAlmacenes();
  }, []);

  // Cargar tipos de comprobante desde el SP
  useEffect(() => {
    const fetchTiposComprobantes = async () => {
      try {
        setLoadingTiposComprobantes(true);
        const resp = await fetch('/api/stock/ventas/tipos-comprobantes?modulo=VENTA');
        const data = await resp.json();

        if (resp.ok && data.success) {
          const mapped = (data.data || []).map((tc) => ({
            value: tc.codigo,        // código: 'FA', 'NC', 'TICKET', etc.
            label: tc.nombre,        // nombre descriptivo
          }));
          setTiposComprobantes(mapped);

          // Asegurar valor por defecto: usar el primer tipo disponible
          setVenta((v) => {
            // Si ya tiene un código válido, mantenerlo
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

  // Función para buscar items vendibles
  const buscarItemsVendibles = useCallback(async (query = '') => {
    // Resolver almacen_id desde localStorage (objeto almacen_seleccionado) o fallbacks
    let almacenIdParam = null;
    if (typeof window !== 'undefined') {
      const almacenStr = localStorage.getItem('almacen_seleccionado');
      if (almacenStr) {
        try {
          const obj = JSON.parse(almacenStr);
          if (obj && obj.id) almacenIdParam = String(obj.id);
        } catch (_) {}
      }
      if (!almacenIdParam) {
        const legacy = localStorage.getItem('almacenId');
        if (legacy) almacenIdParam = legacy;
      }
    }
    if (!almacenIdParam) almacenIdParam = venta.almacenId ? String(venta.almacenId) : null;
    if (!almacenIdParam || isNaN(parseInt(almacenIdParam)) || parseInt(almacenIdParam) <= 0) {
      console.warn('almacen_id inválido para búsqueda de vendibles:', almacenIdParam);
      return;
    }

    setLoadingItemsVendibles(true);
    try {
      const params = new URLSearchParams({
        almacen_id: String(parseInt(almacenIdParam)),
        limite: '50'
      });
      if (query && query.trim()) params.set('q', query.trim());

      const response = await fetch(`/api/stock/productos/vendibles?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setItemsVendibles(data.data || []);
      } else {
        console.error('Error buscando items vendibles:', data.message);
        setItemsVendibles([]);
      }
    } catch (error) {
      console.error('Error en búsqueda de items vendibles:', error);
      setItemsVendibles([]);
    } finally {
      setLoadingItemsVendibles(false);
    }
  }, [venta.almacenId]);
  
  // Buscar items cuando cambia el almacén o la búsqueda
  useEffect(() => {
    if (venta.almacenId) {
      buscarItemsVendibles(debouncedBusqueda);
    }
  }, [venta.almacenId, debouncedBusqueda, buscarItemsVendibles]);

  // Modal "Agregar ítem"
  const [opened, { open, close }] = useDisclosure(false);

  // Form modal - selección múltiple de items vendibles
  const [selectedKeys, setSelectedKeys] = useState([]); // array de keys
  const [selectedItems, setSelectedItems] = useState({}); // key -> item
  const [cantidadesSel, setCantidadesSel] = useState({}); // key -> cantidad
  const [preciosSel, setPreciosSel] = useState({}); // key -> precio unitario

  const getItemKey = useCallback((it) => `${it.item_tipo}|${it.producto_id}|${it.lote_id || ''}|${it.serie_id || ''}`, []);

  const addSeleccion = (item) => {
    const key = getItemKey(item);
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        // Si ya está seleccionado: para UNIDAD/LOTE incrementa cantidad en 1, para SERIE ignora
        if (item.item_tipo !== 'SERIE') {
          setCantidadesSel((pc) => {
            const actual = Number(pc[key] ?? 1);
            const max = Number(item.stock_disponible) || Infinity;
            const nuevo = Math.min(actual + 1, max);
            return { ...pc, [key]: nuevo };
          });
        }
        return prev;
      }
      // Nuevo seleccionado
      setSelectedItems((pi) => ({ ...pi, [key]: item }));
      setCantidadesSel((pc) => ({ ...pc, [key]: item.item_tipo === 'SERIE' ? 1 : 1 }));
      setPreciosSel((pp) => ({ ...pp, [key]: Number(item.precio_lista) || 0 }));
      return [...prev, key];
    });
  };

  const removeSeleccion = (key) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
    setSelectedItems((pi) => { const copy = { ...pi }; delete copy[key]; return copy; });
    setCantidadesSel((pc) => { const copy = { ...pc }; delete copy[key]; return copy; });
    setPreciosSel((pp) => { const copy = { ...pp }; delete copy[key]; return copy; });
  };

  const setCantidadItem = (key, value) => {
    setCantidadesSel((prev) => ({ ...prev, [key]: value }));
  };

  const setPrecioItem = (key, value) => {
    setPreciosSel((prev) => ({ ...prev, [key]: value }));
  };

  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precioUnitario), 0);
  }, [items]);

  const editable = venta.estado === "BORRADOR";

  // Función para manejar cambio de almacén y guardarlo en localStorage
  const handleAlmacenChange = (value) => {
    if (value) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('almacenId', value);
      }
      setVenta((v) => ({ ...v, almacenId: value }));
    }
  };

  function resetModal() {
    setSelectedKeys([]);
    setSelectedItems({});
    setCantidadesSel({});
    setPreciosSel({});
    setBusquedaProducto('');
  }

  const { data: session, status: sessionStatus } = useStableSession();
  const [creandoVenta, setCreandoVenta] = useState(false);
  const loadItemsVenta = useCallback(async (ventaId) => {
    try {
      if (!ventaId) return;
      const resp = await fetch(`/api/stock/ventas/items?venta_id=${ventaId}`);
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        console.error('Error cargando ítems de la venta:', data?.message);
        return;
      }
      const mapped = (data.data || []).map((r) => ({
        id: r.venta_detalle_id,
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
    } catch (e) {
      console.error('Error inesperado cargando ítems de la venta:', e);
    }
  }, []);

  // Cargar venta existente para edición si viene query.id
  useEffect(() => {
    const loadVentaEdicion = async () => {
      try {
        if (!router?.query?.id) return;
        const ventaId = parseInt(router.query.id);
        if (!ventaId) return;
        const resp = await fetch(`/api/stock/ventas/edicion?venta_id=${ventaId}`);
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          alert(data?.message || 'No se pudo cargar la venta para edición');
          return;
        }
        const v = data.data.venta;
        setVenta((prev) => ({
          ...prev,
          id: v.id,
          estado: v.estado,
          clienteId: String(v.cliente_id),
          almacenId: String(v.almacen_id),
          tipoComprobante: v.tipo_comprobante,
          nroComprobante: v.nro_comprobante || '',
          observaciones: v.observaciones || '',
        }));
        const mapped = (data.data.items || []).map((r) => ({
          id: r.venta_detalle_id,
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
      } catch (e) {
        console.error('Error cargando venta para edición:', e);
      }
    };
    loadVentaEdicion();
  }, [router.query?.id]);

  async function onOpenAdd() {
    if (!editable) return;
    resetModal();

    // Si la venta ya tiene id, solo abrir modal
    if (venta.id) {
      open();
      return;
    }

    // Crear venta en BORRADOR antes de abrir el modal
    try {
      setCreandoVenta(true);

      // Obtener almacen_id preferentemente de localStorage (objeto almacen_seleccionado)
      let almacenIdEnvio = null;
      if (typeof window !== 'undefined') {
        const almacenJSON = localStorage.getItem('almacen_seleccionado');
        if (almacenJSON) {
          try {
            const obj = JSON.parse(almacenJSON);
            if (obj && obj.id) {
              almacenIdEnvio = String(obj.id);
            }
          } catch(e) {
            // ignorar parse error
          }
        }
        if (!almacenIdEnvio) {
          const legacyId = localStorage.getItem('almacenId');
          if (legacyId) almacenIdEnvio = legacyId;
        }
      }
      if (!almacenIdEnvio) almacenIdEnvio = venta.almacenId;

      const payload = {
        cliente_id: parseInt(venta.clienteId),
        almacen_id: parseInt(almacenIdEnvio),
        tipo_comprobante: venta.tipoComprobante,
        nro_comprobante: venta.nroComprobante || '',
        observaciones: venta.observaciones || '',
        creado_por: session?.user?.id ? parseInt(session.user.id) : null,
        presupuesto_id: null,
      };

      if (!payload.creado_por) {
        alert('No se puede crear la venta: usuario no autenticado.');
        setCreandoVenta(false);
        return;
      }

      const resp = await fetch('/api/stock/ventas/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();

      if (!resp.ok || !data.success) {
        console.error('Error creando venta:', data);
        alert(data?.message || 'No se pudo crear la venta');
        setCreandoVenta(false);
        return;
      }

      const nuevaId = data?.data?.venta_id;
      setVenta((v) => ({ ...v, id: nuevaId }));
      await loadItemsVenta(nuevaId);
      open();
    } catch (err) {
      console.error('Error inesperado creando venta:', err);
      alert('Error inesperado al crear la venta');
    } finally {
      setCreandoVenta(false);
    }
  }

  const [agregandoItems, setAgregandoItems] = useState(false);

  async function validateAndAdd() {
    if (!selectedKeys.length) return alert('Seleccioná al menos un item.');
    if (!venta.id) return alert('La venta aún no fue creada. Cierra y vuelve a intentar.');

    const nuevos = [];
    // Validaciones previas y construcción de payloads
    const payloads = [];
    for (const key of selectedKeys) {
      const it = selectedItems[key];
      if (!it) continue;
      const tipo = it.item_tipo;
      const precio = Number(preciosSel[key] ?? it.precio_lista ?? 0);
      const cantidad = tipo === 'SERIE' ? 1 : Number(cantidadesSel[key] ?? 1);

      if (tipo !== 'SERIE') {
        if (!cantidad || cantidad <= 0) {
          alert(`Cantidad inválida para ${it.producto_nombre}`);
          return;
        }
        if (Number(it.stock_disponible) && cantidad > Number(it.stock_disponible)) {
          alert(`Stock insuficiente para ${it.producto_nombre}. Disponible: ${it.stock_disponible}`);
          return;
        }
      }

      if (tipo === 'SERIE') {
        const exists = items.some((x) => x.tipo === 'SERIE' && x.serieId === it.serie_id);
        if (exists) {
          alert(`La serie ${it.numero_serie} ya está agregada.`);
          return;
        }
      }

      payloads.push({
        venta_id: parseInt(venta.id),
        producto_id: parseInt(it.producto_id),
        cantidad: Number(cantidad),
        precio_unitario: Number(precio),
        lote_id: tipo === 'LOTE' ? parseInt(it.lote_id) : null,
        serie_id: tipo === 'SERIE' ? parseInt(it.serie_id) : null,
      });

      const newItem = {
        id: crypto.randomUUID(),
        productoId: it.producto_id,
        productoNombre: it.producto_nombre,
        tipo,
        cantidad: cantidad,
        precioUnitario: precio,
        loteId: tipo === 'LOTE' ? it.lote_id : null,
        serieId: tipo === 'SERIE' ? it.serie_id : null,
        sku: it.sku,
        codigoBarras: it.codigo_barras,
        codigoLote: tipo === 'LOTE' ? it.codigo_lote : null,
        fechaVencimiento: tipo === 'LOTE' ? it.fecha_vencimiento : null,
        numeroSerie: tipo === 'SERIE' ? it.numero_serie : null,
        stockDisponible: it.stock_disponible,
      };
      nuevos.push(newItem);
    }

    // Persistir cada item con el SP vía API
    try {
      setAgregandoItems(true);
      for (const p of payloads) {
        const resp = await fetch('/api/stock/ventas/items/agregar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
        const data = await resp.json();
        if (!resp.ok || !data.success) {
          throw new Error(data?.message || 'No se pudo agregar un ítem a la venta');
        }
      }
      await loadItemsVenta(venta.id);
      close();
      resetModal();
    } catch (e) {
      console.error('Error agregando ítems a la venta:', e);
      alert(e.message || 'Error al agregar ítems a la venta');
    } finally {
      setAgregandoItems(false);
    }
  }

  function removeItem(itemId) {
    if (!editable) return;
    setItems((prev) => prev.filter((x) => x.id !== itemId));
  }

  const [confirmando, setConfirmando] = useState(false);
  async function confirmarVenta() {
    if (!editable) return;
    if (items.length === 0) return alert("Agregá al menos 1 ítem antes de confirmar.");
    if (!venta.id) return alert('La venta aún no fue creada.');

    try {
      setConfirmando(true);
      const resp = await fetch('/api/stock/ventas/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venta_id: parseInt(venta.id) }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        alert(data?.message || 'No se pudo confirmar la venta');
        return;
      }
      setVenta((v) => ({ ...v, estado: 'CONFIRMADA' }));
      
      // Mostrar alerta de éxito
      notifications.show({
        title: '¡Venta confirmada!',
        message: 'La venta ha sido confirmada exitosamente',
        color: 'green',
        autoClose: 2000,
      });
      
      // Redirigir al detalle de la venta
      setTimeout(() => {
        router.push(`/stock/ventas/detalle/${venta.id}`);
      }, 2000);
    } catch (e) {
      console.error('Error confirmando venta:', e);
      alert(e.message || 'Error al confirmar la venta');
    } finally {
      setConfirmando(false);
    }
  }

  const [anulando, setAnulando] = useState(false);
  async function anularVenta() {
    if (venta.estado !== "CONFIRMADA") return;
    if (!venta.id) return alert('La venta aún no fue creada.');
    if (!confirm('¿Seguro que deseas anular esta venta? Esta acción revertirá los movimientos de stock.')) return;
    try {
      setAnulando(true);
      const resp = await fetch('/api/stock/ventas/anular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venta_id: parseInt(venta.id) }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        alert(data?.message || 'No se pudo anular la venta');
        return;
      }
      setVenta((v) => ({ ...v, estado: 'ANULADA' }));
    } catch (e) {
      console.error('Error anulando venta:', e);
      alert(e.message || 'Error al anular la venta');
    } finally {
      setAnulando(false);
    }
  }

  return (
    <ProtectedLayout>
      <Container size="xl" py="xs">
        <Stack gap="sm">
          <Grid>
          <Grid.Col span={12}>
            <Flex justify="space-between" align="center" mb="md">
              <Stack gap={2}>
                <Group>
                  <Button 
                    variant="subtle" 
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => router.push('/stock/ventas')}
                  >
                    Volver a Ventas
                  </Button>
                </Group>
                <Title order={2}>Nueva Venta #{venta.id}</Title>
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
                  disabled={!editable || confirmando}
                  loading={confirmando}
                  color="green"
                >
                  Confirmar
                </Button>
                <Button
                  leftSection={<IconX size={16} />}
                  color="red"
                  variant="light"
                  onClick={anularVenta}
                  disabled={venta.estado !== "CONFIRMADA" || anulando}
                  loading={anulando}
                >
                  Anular
                </Button>
              </Group>
            </Flex>
          </Grid.Col>

          <Grid.Col span={12}>

      <Card withBorder radius="md" mb="xs" p="sm">
        <Title order={5} mb="xs">
          Información de la Venta
        </Title>

        <Grid gutter="xs">
          <Grid.Col span={6} md={3}>
            <Select
              size="sm"
              label="Cliente"
              data={clientes}
              value={venta.clienteId}
              onChange={(value) => setVenta((v) => ({ ...v, clienteId: value }))}
              disabled={!editable || loadingClientes}
              description={loadingClientes ? "Cargando clientes..." : "Por defecto: Cliente ID 2"}
              searchable
              placeholder={loadingClientes ? "Cargando..." : "Buscar cliente..."}
              comboboxProps={{ transitionProps: { transition: 'fade', duration: 100 } }}
            />
          </Grid.Col>
          <Grid.Col span={6} md={3}>
            <Select
              size="sm"
              label="Almacén"
              data={almacenes}
              value={venta.almacenId}
              onChange={handleAlmacenChange}
              disabled={!editable || items.length > 0 || loadingAlmacenes}
              description={
                loadingAlmacenes 
                  ? "Cargando almacenes..." 
                  : items.length > 0 
                    ? "Bloqueado si ya cargaste ítems" 
                    : "Almacén desde localStorage"
              }
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
              value={venta.tipoComprobante}
              onChange={(value) => setVenta((v) => ({ ...v, tipoComprobante: value }))}
              disabled={!editable || loadingTiposComprobantes}
              placeholder={loadingTiposComprobantes ? 'Cargando...' : 'Seleccionar tipo'}
              description={loadingTiposComprobantes ? 'Cargando tipos de comprobante...' : undefined}
              comboboxProps={{ transitionProps: { transition: 'fade', duration: 100 } }}
            />
          </Grid.Col>
          <Grid.Col span={6} md={3}>
            <TextInput
              size="sm"
              label="Nro comprobante"
              value={venta.nroComprobante}
              onChange={(e) => setVenta((v) => ({ ...v, nroComprobante: e.currentTarget.value }))}
              disabled={!editable}
              placeholder="Opcional"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              size="sm"
              label="Observaciones"
              value={venta.observaciones}
              onChange={(e) => setVenta((v) => ({ ...v, observaciones: e.currentTarget.value }))}
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
                  <Text c="dimmed">Sin ítems. Agregá productos para armar la venta.</Text>
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
                      color={
                        it.tipo === "UNIDAD" ? "blue" : 
                        it.tipo === "LOTE" ? "green" : 
                        "purple"
                      }
                      variant="light"
                    >
                      {it.tipo}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Stack gap={2}>
                      {it.tipo === "LOTE" && (
                        <>
                          <Text size="sm">Lote: {it.codigoLote}</Text>
                          {it.fechaVencimiento && (
                            <Text size="xs" c="orange">
                              Vence: {new Date(it.fechaVencimiento).toLocaleDateString()}
                            </Text>
                          )}
                        </>
                      )}
                      {it.tipo === "SERIE" && (
                        <Text size="sm">Serie: {it.numeroSerie}</Text>
                      )}
                      {it.tipo === "UNIDAD" && (
                        it.stockDisponible != null && <Text size="sm" c="dimmed">Stock: {it.stockDisponible}</Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td ta="center">{it.cantidad}</Table.Td>
                  <Table.Td ta="center">{money(it.precioUnitario)}</Table.Td>
                  <Table.Td ta="center">{money(it.cantidad * it.precioUnitario)}</Table.Td>
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
        </Box>

        <Divider my="xs" />

        <Group justify="flex-end" p="xs" bg="gray.0" style={{ borderRadius: '4px' }}>
          <Text size="sm" c="dimmed">Total:</Text>
          <Text size="lg" fw={700}>{money(total)}</Text>
        </Group>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          close();
          resetModal();
        }}
        title="Agregar ítem a la venta"
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
            description="Escribe para buscar productos disponibles en el almacén seleccionado"
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
                    <Card
                      key={key}
                      withBorder
                      padding="sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => addSeleccion(item)}
                    >
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
                            <Text size="xs" c="green">Stock: {item.stock_disponible}</Text>
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
            <Text c="dimmed" ta="center" p="md">
              No se encontraron productos que coincidan con "{busquedaProducto}"
            </Text>
          )}
          
          {!loadingItemsVendibles && itemsVendibles.length === 0 && !busquedaProducto.trim() && (
            <Text c="dimmed" ta="center" p="md">
              Escribe algo para buscar productos disponibles
            </Text>
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
                                {it.codigo_lote && <Text size="xs" c="dimmed">Lote: {it.codigo_lote}</Text>}
                                {it.numero_serie && <Text size="xs" c="dimmed">Serie: {it.numero_serie}</Text>}
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
                                  max={Number(it.stock_disponible) || undefined}
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
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            </Card>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>
              Cancelar
            </Button>
            <Button 
              onClick={validateAndAdd}
              disabled={selectedKeys.length === 0 || agregandoItems}
              loading={agregandoItems}
              leftSection={<IconPlus size={16} />}
            >
              Agregar a la venta
            </Button>
          </Group>
        </Stack>
      </Modal>
          </Grid.Col>
        </Grid>
        </Stack>
      </Container>
    </ProtectedLayout>
  );
}
