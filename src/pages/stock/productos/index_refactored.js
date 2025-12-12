import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import ProductForm from "@/components/stock/ProductForm";
import ProductsTable from "@/components/stock/ProductsTable";
import StockModal from "@/components/stock/StockModal";
import ProductDetailModal from "@/components/stock/ProductDetailModal";
import {
  Button,
  Container,
  Grid,
  Text,
  TextInput,
  Title,
  Pagination,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";

const rowsPerPage = 5;

const Inventario = () => {
  const [pageProductos, setPageProductos] = useState(1);
  const [opened, setOpened] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Estados para modal de stock por almacenes
  const [modalStockAbierto, setModalStockAbierto] = useState(false);
  const [stockPorAlmacenes, setStockPorAlmacenes] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [almacenes, setAlmacenes] = useState([]);
  
  // Estados para formulario de productos
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [tipoControl, setTipoControl] = useState('UNIDAD');
  const [esServicio, setEsServicio] = useState(false);
  const [lotes, setLotes] = useState([{ codigo: '', fechaVencimiento: '', cantidad: 0 }]);
  const [series, setSeries] = useState(['']);

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
        const almacenGuardado = localStorage.getItem('almacenSeleccionado');
        if (almacenGuardado) {
          const almacenData = JSON.parse(almacenGuardado);
          almacenId = almacenData.id;
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

  // Filtrar productos según búsqueda
  const productosFiltrados = Array.isArray(productos)
    ? productos.filter(
        producto =>
          producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.codigo_barras?.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.categoria_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          String(producto.stock_total || 0).includes(busqueda)
      )
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

  const handleSubmit = async (values) => {
    try {
      const datosProducto = {
        ...values,
        es_servicio: esServicio
      };

      if (tipoControl === 'LOTE') {
        const lotesValidos = lotes.filter(l => l.codigo && l.cantidad > 0);
        if (lotesValidos.length === 0) {
          notifications.show({
            title: 'Error',
            message: 'Debe agregar al menos un lote válido',
            color: 'red'
          });
          return;
        }
        datosProducto.lotes = lotesValidos.map(l => ({
          codigo_lote: l.codigo,
          fecha_venc: l.fechaVencimiento || null,
          cantidad: parseFloat(l.cantidad)
        }));
        datosProducto.almacen_id = values.almacen_id;

      } else if (tipoControl === 'SERIE') {
        const seriesValidas = series.filter(s => s.trim());
        if (seriesValidas.length === 0) {
          notifications.show({
            title: 'Error',
            message: 'Debe agregar al menos una serie válida',
            color: 'red'
          });
          return;
        }
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
          title: 'Error',
          message: result.error || 'Error al crear el producto',
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
    setModalDetalleAbierto(true);
  };

  const handleEdit = (producto) => {
    console.log('Editar producto:', producto.id);
  };

  const handleDelete = (productoId) => {
    console.log('Eliminar producto:', productoId);
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
              setOpened={setOpened}
              getTipoControlBadge={getTipoControlBadge}
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

        {/* Modal de detalle del producto */}
        <ProductDetailModal
          modalDetalleAbierto={modalDetalleAbierto}
          setModalDetalleAbierto={setModalDetalleAbierto}
          productoDetalle={productoDetalle}
          getTipoControlBadge={getTipoControlBadge}
        />
      </Container>
    </ProtectedLayout>
  );
};

export default Inventario;