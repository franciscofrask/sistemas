import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import ProductForm from "@/components/stock/ProductForm";
import ProductsTable from "@/components/stock/ProductsTable";
import StockModal from "@/components/stock/StockModal";
import ProductDetailModal from "@/components/stock/ProductDetailModal";
import AddStockModal from "@/components/stock/AddStockModal";
import ProductDetailDrawer from "@/components/stock/ProductDetailDrawer";
import {
  Button,
  Container,
  Grid,
  Text,
  TextInput,
  Title,
  Pagination,
  Select,
  Group,
  Paper,
  ActionIcon,
  Modal,
  Stack,
  Loader,
  Center,
  Switch,
  NumberInput
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconFilter, IconFilterOff, IconAlertTriangle, IconEdit, IconCheck } from "@tabler/icons-react";

const rowsPerPage = 5;

const Inventario = () => {
  const [pageProductos, setPageProductos] = useState(1);
  const [opened, setOpened] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [drawerDetalleAbierto, setDrawerDetalleAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Estados para filtros
  const [filtroTipoControl, setFiltroTipoControl] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroTipo, setFiltroTipo] = useState(""); // Producto o Servicio
  const [filtroStock, setFiltroStock] = useState(""); // Sin stock, Con stock, Todos
  
  // Estados para modal de stock por almacenes
  const [modalStockAbierto, setModalStockAbierto] = useState(false);
  const [stockPorAlmacenes, setStockPorAlmacenes] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [almacenes, setAlmacenes] = useState([]);
  const [almacenActual, setAlmacenActual] = useState(null);
  
  // Estados para formulario de productos
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [tipoControl, setTipoControl] = useState('UNIDAD');
  const [esServicio, setEsServicio] = useState(false);
  const [lotes, setLotes] = useState([{ codigo: '', fechaVencimiento: '', cantidad: 0 }]);
  const [series, setSeries] = useState(['']);

  // Estados para modal de agregar stock
  const [modalAgregarStock, setModalAgregarStock] = useState(false);
  const [productoParaStock, setProductoParaStock] = useState(null);

  // Estados para modal de confirmación de borrado
  const [modalBorrarAbierto, setModalBorrarAbierto] = useState(false);
  const [productoParaBorrar, setProductoParaBorrar] = useState(null);
  const [loadingBorrar, setLoadingBorrar] = useState(false);

  // Estados para modal de edición
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [productoParaEditar, setProductoParaEditar] = useState(null);
  const [loadingEditar, setLoadingEditar] = useState(false);
  const [formEditar, setFormEditar] = useState({
    nombre: '',
    sku: '',
    codigo_barras: '',
    categoria_id: '',
    unidad_medida_id: '',
    tipo_control_stock: 'UNIDAD',
    es_servicio: false,
    precio_lista: 0,
    activo: true
  });

  const form = useForm({
    initialValues: {
      nombre: "",
      sku: "",
      codigo_barras: "",
      categoria_id: "",
      unidad_medida_id: "",
      tipo_control_stock: "UNIDAD",
      es_servicio: false,
      precio_lista: 0,
    },
    validate: {
      nombre: value => (value.length < 2 ? "El nombre es obligatorio" : null),
      categoria_id: value => (!value ? "La categoría es obligatoria" : null),
      unidad_medida_id: value => (!value ? "La unidad de medida es obligatoria" : null),
      precio_lista: value => (value < 0 ? "El precio debe ser mayor o igual a 0" : null),
    },
  });

  // Función para obtener productos desde la API
  const fetchProductos = async () => {
    try {
      setLoading(true);
      
      let almacenId = null;
      try {
        const almacenGuardado = localStorage.getItem('almacen_seleccionado');
        if (almacenGuardado) {
          const almacenData = JSON.parse(almacenGuardado);
          almacenId = almacenData.id;
          setAlmacenActual(almacenData.id);
        }
      } catch (error) {
        console.error('Error al obtener almacén del localStorage:', error);
      }
      
      const url = almacenId 
        ? `/api/stock/productos/inventario?almacen_id=${almacenId}`
        : '/api/stock/productos/inventario';
        
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProductos(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error('Error al obtener productos:', data.message);
        setProductos([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchProductos();
    cargarAlmacenes();
    cargarCategorias();
    cargarUnidades();
  }, []);

  // Función para cargar categorías
  const cargarCategorias = async () => {
    try {
      const response = await fetch('/api/stock/productos/categorias');
      const result = await response.json();
      if (response.ok && result.success) {
        setCategorias(result.data || []);
      } else {
        console.error('Error al cargar categorías:', result.message);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Función para cargar unidades de medida
  const cargarUnidades = async () => {
    try {
      const response = await fetch('/api/stock/productos/unidades');
      const result = await response.json();
      if (response.ok && result.success) {
        setUnidades(result.data || []);
      } else {
        console.error('Error al cargar unidades:', result.message);
      }
    } catch (error) {
      console.error('Error al cargar unidades:', error);
    }
  };

  const cargarAlmacenes = async () => {
    try {
      const response = await fetch('/api/stock/almacenes?solo_activos=0');
      const result = await response.json();
      if (response.ok && result.success) {
        setAlmacenes(result.data || []);
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
    }
  };

  // Efecto para manejar cambio en 'es servicio'
  useEffect(() => {
    if (esServicio) {
      setTipoControl('UNIDAD');
      form.setFieldValue('tipo_control_stock', 'UNIDAD');
    }
  }, [esServicio]);

  // Efecto para sincronizar tipo de control
  useEffect(() => {
    form.setFieldValue('tipo_control_stock', tipoControl);
  }, [tipoControl]);

  // Efecto para sincronizar es servicio
  useEffect(() => {
    form.setFieldValue('es_servicio', esServicio);
  }, [esServicio]);

  // Función para obtener stock por almacenes de un producto
  const fetchStockPorAlmacenes = async (productoId) => {
    setLoadingStock(true);
    try {
      const response = await fetch(`/api/stock/productos/almacenes-stock?producto_id=${productoId}`);
      const result = await response.json();
      if (response.ok && result.success) {
        setStockPorAlmacenes(result.data || []);
      } else {
        console.error('Error al obtener stock por almacenes:', result.message);
        setStockPorAlmacenes([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setStockPorAlmacenes([]);
    } finally {
      setLoadingStock(false);
    }
  };

  // Función para manejar click en stock total
  const handleVerStockPorAlmacenes = (producto) => {
    setProductoSeleccionado(producto);
    setModalStockAbierto(true);
    fetchStockPorAlmacenes(producto.id);
  };

  // Función para obtener nombre de almacén por ID
  const getNombreAlmacen = (almacenId) => {
    const almacen = almacenes.find(a => a.id === almacenId);
    return almacen ? almacen.nombre : `Almacén ID: ${almacenId}`;
  };

  // Filtrar productos según búsqueda y filtros
  const productosFiltrados = Array.isArray(productos)
    ? productos.filter(producto => {
        // Filtro por búsqueda
        const coincideBusqueda = !busqueda || 
          producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.codigo_barras?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.categoria_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          String(producto.stock_total || 0).includes(busqueda);
        
        // Filtro por tipo de control de stock
        const coincideTipoControl = !filtroTipoControl || producto.tipo_control_stock === filtroTipoControl;
        
        // Filtro por categoría
        const coincideCategoria = !filtroCategoria || String(producto.categoria_id) === filtroCategoria;
        
        // Filtro por tipo (Producto/Servicio)
        const coincideTipo = !filtroTipo || 
          (filtroTipo === "producto" && !producto.es_servicio) ||
          (filtroTipo === "servicio" && producto.es_servicio);
        
        // Filtro por stock
        const coincideStock = !filtroStock ||
          (filtroStock === "sin_stock" && parseInt(producto.stock_total || 0) === 0) ||
          (filtroStock === "con_stock" && parseInt(producto.stock_total || 0) > 0);
        
        return coincideBusqueda && coincideTipoControl && coincideCategoria && coincideTipo && coincideStock;
      })
    : [];

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (!sortField) return 0;
    
    let valueA = a[sortField];
    let valueB = b[sortField];

    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Paginación
  const startIndex = (pageProductos - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageRows = productosOrdenados.slice(startIndex, endIndex);

  // Función para manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Función para obtener color del badge de tipo de control
  const getTipoControlBadge = (tipo) => {
    switch(tipo) {
      case 'UNIDAD': return 'blue';
      case 'LOTE': return 'orange';
      case 'SERIE': return 'green';
      default: return 'gray';
    }
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroTipoControl("");
    setFiltroCategoria("");
    setFiltroTipo("");
    setFiltroStock("");
    setPageProductos(1);
  };

  const handleSubmit = async (values) => {
    try {
      const datosProducto = {
        ...values,
        es_servicio: esServicio
      };

      if (tipoControl === 'LOTE') {
        const lotesValidos = lotes.filter(l => l.codigo && l.cantidad > 0);
       
        datosProducto.lotes = lotesValidos.map(l => ({
          codigo_lote: l.codigo,
          fecha_venc: l.fechaVencimiento || null,
          cantidad: parseFloat(l.cantidad)
        }));
        datosProducto.almacen_id = values.almacen_id;

      } else if (tipoControl === 'SERIE') {
        const seriesValidas = series.filter(s => s.trim());
       
        datosProducto.series = seriesValidas;
        datosProducto.almacen_id = values.almacen_id;
      }

      const response = await fetch('/api/stock/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosProducto),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        notifications.show({
          title: 'Éxito',
          message: 'Producto creado exitosamente',
          color: 'green'
        });
        
        limpiarFormulario();
        setOpened(false);
        fetchProductos();
      } else {
        notifications.show({
          title: result.error || 'Error',
          message: result.message || result.details || 'Error al crear el producto',
          color: 'red'
        });
      }

    } catch (error) {
      console.error('Error al crear producto:', error);
      notifications.show({
        title: 'Error',
        message: 'Error de conexión al crear el producto',
        color: 'red'
      });
    }
  };

  const limpiarFormulario = () => {
    form.reset();
    setTipoControl('UNIDAD');
    setEsServicio(false);
    setLotes([{ codigo: '', fechaVencimiento: '', cantidad: 0 }]);
    setSeries(['']);
    setModoEdicion(false);
    setProductoEditandoId(null);
  };

  const handleVerDetalle = (producto) => {
    setProductoDetalle(producto);
    setDrawerDetalleAbierto(true);
  };

  const handleEdit = (producto) => {
    setProductoParaEditar(producto);
    
    // Precargar datos en el formulario
    setFormEditar({
      nombre: producto.nombre || '',
      sku: producto.sku || '',
      codigo_barras: producto.codigo_barras || '',
      categoria_id: producto.categoria_id || '',
      unidad_medida_id: producto.unidad_medida_id || '',
      tipo_control_stock: producto.tipo_control_stock || 'UNIDAD',
      es_servicio: producto.es_servicio || false,
      precio_lista: producto.precio_lista || 0,
      activo: producto.activo !== undefined ? producto.activo : true
    });
    
    setModalEditarAbierto(true);
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setProductoParaEditar(null);
    setFormEditar({
      nombre: '',
      sku: '',
      codigo_barras: '',
      categoria_id: '',
      unidad_medida_id: '',
      tipo_control_stock: 'UNIDAD',
      es_servicio: false,
      precio_lista: 0,
      activo: true
    });
  };

  const manejarCambioFormEditar = (campo, valor) => {
    setFormEditar(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const guardarEdicionProducto = async () => {
    if (!productoParaEditar) return;
    
    // Validaciones básicas
    if (!formEditar.nombre.trim()) {
      notifications.show({
        title: 'Error de validación',
        message: 'El nombre del producto es requerido',
        color: 'red'
      });
      return;
    }

    if (!formEditar.unidad_medida_id) {
      notifications.show({
        title: 'Error de validación',
        message: 'La unidad de medida es requerida',
        color: 'red'
      });
      return;
    }

    setLoadingEditar(true);

    try {
      const response = await fetch(`/api/stock/productos/editar?id=${productoParaEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formEditar)
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Éxito',
          message: `Producto "${formEditar.nombre}" editado exitosamente`,
          color: 'green'
        });
        
        // Recargar la lista de productos
        await fetchProductos();
        
        // Cerrar modal
        cerrarModalEditar();
        
      } else if (response.status === 409) {
        // Error de regla de negocio (cambio de tipo de control con historial)
        notifications.show({
          title: 'No se puede editar',
          message: data.message || 'No se puede cambiar el tipo de control de stock',
          color: 'orange'
        });
        
      } else {
        throw new Error(data.message || 'Error al editar el producto');
      }

    } catch (error) {
      console.error('Error editando producto:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo editar el producto',
        color: 'red'
      });
    } finally {
      setLoadingEditar(false);
    }
  };

  const handleDelete = (productoId) => {
    // Buscar el producto en la lista para obtener sus datos
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
      notifications.show({
        title: 'Error',
        message: 'Producto no encontrado',
        color: 'red'
      });
      return;
    }
    
    // Verificar si el producto tiene stock
    if (producto.stock_total > 0) {
      notifications.show({
        title: 'No se puede borrar',
        message: `El producto "${producto.nombre}" tiene stock (${parseInt(producto.stock_total)} unidades). No se puede borrar un producto con stock.`,
        color: 'orange'
      });
      return;
    }
    
    // Si no tiene stock, mostrar modal de confirmación
    setProductoParaBorrar(producto);
    setModalBorrarAbierto(true);
  };

  const confirmarBorrado = async () => {
    if (!productoParaBorrar) return;
    
    setLoadingBorrar(true);
    
    try {
      const response = await fetch(`/api/stock/productos/borrar?id=${productoParaBorrar.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        notifications.show({
          title: 'Éxito',
          message: `Producto "${productoParaBorrar.nombre}" borrado exitosamente`,
          color: 'green'
        });
        
        // Recargar la lista de productos
        await cargarProductos();
        
        // Cerrar modal
        setModalBorrarAbierto(false);
        setProductoParaBorrar(null);
        
      } else if (response.status === 409) {
        // Error de regla de negocio (producto tiene stock, no existe, etc.)
        notifications.show({
          title: 'No se puede borrar',
          message: data.message || 'No se puede borrar el producto',
          color: 'orange'
        });
        
        // Cerrar modal ya que es un error de validación
        setModalBorrarAbierto(false);
        setProductoParaBorrar(null);
        
      } else {
        // Otros errores del servidor
        notifications.show({
          title: 'Error del servidor',
          message: data.message || `Error del servidor (${response.status})`,
          color: 'red'
        });
      }
      
    } catch (error) {
      console.error('Error de red borrando producto:', error);
      notifications.show({
        title: 'Error de conexión',
        message: 'No se pudo conectar al servidor. Verifique su conexión.',
        color: 'red'
      });
    } finally {
      setLoadingBorrar(false);
    }
  };

  const cancelarBorrado = () => {
    setModalBorrarAbierto(false);
    setProductoParaBorrar(null);
  };

  const handleAgregarStock = (producto) => {
    setProductoParaStock(producto);
    setModalAgregarStock(true);
  };

  const onStockAdded = () => {
    // Recargar productos después de agregar stock
    fetchProductos();
  };

  return (
    <ProtectedLayout>
      <Container size="lg">
        <Grid mt={20}>
          <Grid.Col span={12}>
            <Title order={1}>Productos</Title>
            <Text c="dimmed" order={4}>
              Registro detallado de sus productos
            </Text>
          </Grid.Col>

          <Grid.Col mt={20} span={12}>
            <Button variant="outline" color="#EE0E0F" onClick={() => setOpened(true)}>
              Nuevo Producto
            </Button>
          </Grid.Col>

          <Grid.Col mt={30} span={12}>
            <Paper p="md" withBorder>
              <Group mb="md">
                <Text fw={500} size="md">Filtros</Text>
                <ActionIcon 
                  variant="light" 
                  color="gray" 
                  onClick={limpiarFiltros}
                  title="Limpiar filtros"
                >
                  <IconFilterOff size={16} />
                </ActionIcon>
              </Group>
              
              <Grid>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                  <TextInput
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={e => {
                      setBusqueda(e.currentTarget.value);
                      setPageProductos(1);
                    }}
                    leftSection={<IconSearch size={18} />}
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6, lg: 2 }}>
                  <Select
                    placeholder="Tipo de Control"
                    data={[
                      { value: "", label: "Todos" },
                      { value: "UNIDAD", label: "Unidad" },
                      { value: "LOTE", label: "Lote" },
                      { value: "SERIE", label: "Serie" }
                    ]}
                    value={filtroTipoControl}
                    onChange={(value) => {
                      setFiltroTipoControl(value || "");
                      setPageProductos(1);
                    }}
                    clearable
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6, lg: 2 }}>
                  <Select
                    placeholder="Categoría"
                    data={[
                      { value: "", label: "Todas" },
                      ...categorias.map(cat => ({
                        value: String(cat.id),
                        label: cat.nombre
                      }))
                    ]}
                    value={filtroCategoria}
                    onChange={(value) => {
                      setFiltroCategoria(value || "");
                      setPageProductos(1);
                    }}
                    clearable
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6, lg: 2 }}>
                  <Select
                    placeholder="Tipo"
                    data={[
                      { value: "", label: "Todos" },
                      { value: "producto", label: "Producto" },
                      { value: "servicio", label: "Servicio" }
                    ]}
                    value={filtroTipo}
                    onChange={(value) => {
                      setFiltroTipo(value || "");
                      setPageProductos(1);
                    }}
                    clearable
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6, lg: 2 }}>
                  <Select
                    placeholder="Stock"
                    data={[
                      { value: "", label: "Todos" },
                      { value: "con_stock", label: "Con Stock" },
                      { value: "sin_stock", label: "Sin Stock" }
                    ]}
                    value={filtroStock}
                    onChange={(value) => {
                      setFiltroStock(value || "");
                      setPageProductos(1);
                    }}
                    clearable
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <ProductsTable
              productosOrdenados={productosOrdenados}
              pageRows={pageRows}
              loading={loading}
              sortField={sortField}
              sortOrder={sortOrder}
              handleSort={handleSort}
              handleVerStockPorAlmacenes={handleVerStockPorAlmacenes}
              handleVerDetalle={handleVerDetalle}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              getTipoControlBadge={getTipoControlBadge}
              onAgregarStock={handleAgregarStock}
            />
            
            <Pagination
              total={Math.ceil(productosOrdenados.length / rowsPerPage)}
              value={pageProductos}
              onChange={setPageProductos}
              color="#ee0e0f"
              siblings={0}
              boundaries={1}
              mt="md"
              style={{ display: 'flex', justifyContent: 'center' }}
            />
          </Grid.Col>
        </Grid>

        {/* Formulario de producto */}
        <ProductForm
          opened={opened}
          onClose={() => setOpened(false)}
          form={form}
          onSubmit={handleSubmit}
          modoEdicion={modoEdicion}
          categorias={categorias}
          unidades={unidades}
          almacenes={almacenes}
          esServicio={esServicio}
          setEsServicio={setEsServicio}
          tipoControl={tipoControl}
          setTipoControl={setTipoControl}
          lotes={lotes}
          setLotes={setLotes}
          series={series}
          setSeries={setSeries}
          limpiarFormulario={limpiarFormulario}
        />

        {/* Modal de stock por almacenes */}
        <StockModal
          modalStockAbierto={modalStockAbierto}
          setModalStockAbierto={setModalStockAbierto}
          productoSeleccionado={productoSeleccionado}
          stockPorAlmacenes={stockPorAlmacenes}
          loadingStock={loadingStock}
          getNombreAlmacen={getNombreAlmacen}
        />

        {/* Modal de detalle del producto (mantener para compatibilidad si es necesario) */}
        <ProductDetailModal
          modalDetalleAbierto={modalDetalleAbierto}
          setModalDetalleAbierto={setModalDetalleAbierto}
          productoDetalle={productoDetalle}
          getTipoControlBadge={getTipoControlBadge}
        />

        {/* Drawer de detalle del producto */}
        <ProductDetailDrawer
          opened={drawerDetalleAbierto}
          onClose={() => setDrawerDetalleAbierto(false)}
          producto={productoDetalle}
          almacenId={almacenActual}
        />

        {/* Modal para agregar stock */}
        <AddStockModal
          opened={modalAgregarStock}
          onClose={() => setModalAgregarStock(false)}
          producto={productoParaStock}
          almacenes={almacenes}
          onStockAdded={onStockAdded}
        />

        {/* Modal de confirmación de borrado */}
        <Modal
          opened={modalBorrarAbierto}
          onClose={cancelarBorrado}
          title="Confirmar eliminación"
          centered
          closeOnClickOutside={false}
          closeOnEscape={false}
        >
          <Stack gap="md">
            <Group>
              <IconAlertTriangle size={24} color="orange" />
              <Text size="lg" fw={600}>
                ¿Está seguro que desea eliminar este producto?
              </Text>
            </Group>
            
            {productoParaBorrar && (
              <>
                <Text size="sm" c="dimmed">
                  Producto: <Text component="span" fw={500}>{productoParaBorrar.nombre}</Text>
                </Text>
                <Text size="sm" c="dimmed">
                  SKU: <Text component="span" fw={500}>{productoParaBorrar.sku || 'N/A'}</Text>
                </Text>
                <Text size="sm" c="dimmed">
                  Stock actual: <Text component="span" fw={500}>{parseInt(productoParaBorrar.stock_total_global || 0)} unidades</Text>
                </Text>
              </>
            )}
            
            <Text size="sm" c="red" style={{ backgroundColor: '#ffebee', padding: '8px', borderRadius: '4px' }}>
              <Text fw={500} component="span">⚠️ Advertencia:</Text> Esta acción eliminará permanentemente el producto
              y todos sus datos asociados (lotes, series, etc.). Esta acción no se puede deshacer.
            </Text>
            
            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={cancelarBorrado}
                disabled={loadingBorrar}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                onClick={confirmarBorrado}
                loading={loadingBorrar}
                leftSection={loadingBorrar ? <Loader size="xs" /> : undefined}
              >
                {loadingBorrar ? 'Eliminando...' : 'Eliminar producto'}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Modal de edición de producto */}
        <Modal
          opened={modalEditarAbierto}
          onClose={cerrarModalEditar}
          title={`Editar producto: ${productoParaEditar?.nombre}`}
          centered
          size="lg"
          closeOnClickOutside={false}
          closeOnEscape={false}
        >
          <Stack gap="md">
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Nombre del producto"
                  placeholder="Ingrese el nombre"
                  value={formEditar.nombre}
                  onChange={(e) => manejarCambioFormEditar('nombre', e.target.value)}
                  required
                  withAsterisk
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="SKU"
                  placeholder="Código SKU"
                  value={formEditar.sku}
                  onChange={(e) => manejarCambioFormEditar('sku', e.target.value)}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <TextInput
                  label="Código de barras"
                  placeholder="Código de barras"
                  value={formEditar.codigo_barras}
                  onChange={(e) => manejarCambioFormEditar('codigo_barras', e.target.value)}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Categoría"
                  placeholder="Seleccione categoría"
                  data={categorias.map(cat => ({
                    value: cat.id.toString(),
                    label: cat.nombre
                  }))}
                  value={formEditar.categoria_id.toString()}
                  onChange={(value) => manejarCambioFormEditar('categoria_id', value)}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Unidad de medida"
                  placeholder="Seleccione unidad"
                  data={unidades.map(unidad => ({
                    value: unidad.id.toString(),
                    label: unidad.nombre
                  }))}
                  value={formEditar.unidad_medida_id.toString()}
                  onChange={(value) => manejarCambioFormEditar('unidad_medida_id', value)}
                  required
                  withAsterisk
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Select
                  label="Tipo de control de stock"
                  data={[
                    { value: 'UNIDAD', label: 'Por unidad' },
                    { value: 'LOTE', label: 'Por lote' },
                    { value: 'SERIE', label: 'Por serie' }
                  ]}
                  value={formEditar.tipo_control_stock}
                  onChange={(value) => manejarCambioFormEditar('tipo_control_stock', value)}
                  disabled={true}
                  description="No se puede cambiar el tipo de control una vez creado el producto"
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <NumberInput
                  label="Precio de lista"
                  placeholder="0.00"
                  value={formEditar.precio_lista}
                  onChange={(value) => manejarCambioFormEditar('precio_lista', value || 0)}
                  decimalScale={2}
                  fixedDecimalScale
                  min={0}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Switch
                  label="Es servicio"
                  description="Marque si es un servicio en lugar de un producto físico"
                  checked={formEditar.es_servicio}
                  onChange={(e) => manejarCambioFormEditar('es_servicio', e.currentTarget.checked)}
                />
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Switch
                  label="Activo"
                  description="Marque para mantener el producto activo"
                  checked={formEditar.activo}
                  onChange={(e) => manejarCambioFormEditar('activo', e.currentTarget.checked)}
                />
              </Grid.Col>
            </Grid>
            
            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={cerrarModalEditar}
                disabled={loadingEditar}
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarEdicionProducto}
                loading={loadingEditar}
                leftSection={loadingEditar ? undefined : <IconCheck size={16} />}
              >
                {loadingEditar ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </ProtectedLayout>
  );
};

export default Inventario;