// Archivo: components/stock/InventarioCompleto.js
import React, { useState, useEffect } from "react";
import {
  Table,
  TextInput,
  Loader,
  Group,
  Pagination,
  ActionIcon,
  Menu,
  Modal,
  Button,
  Stack,
  Select,
  Textarea,
  NumberInput,
  Title,
  Grid,
  Text,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconSearch,
  IconSettings,
  IconEye,
  IconLibraryPlus,
  IconTrash,
  IconPencil,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const rowsPerPage = 5;

const InventarioCompleto = ({ tabla = 2}) => {
  const [productos, setProductos] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [paginaProductos, setPaginaProductos] = useState(1);
  const [paginaUnidades, setPaginaUnidades] = useState(1);
  const [loading, setLoading] = useState(true);

  const [productoUnidadId, setProductoUnidadId] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);


  const formUnidades = useForm({
    initialValues: {
      numero_serie: "",
      id_almacen: "",
      observaciones: "",
      cantidad: 1,
    },
    validate: {
      id_almacen: v => (v ? null : "Debe seleccionar un almacén"),
    },
    transformValues: values => ({
      ...values,
      id_almacen: Number(values.id_almacen),
      cantidad: Number(values.cantidad),
    })
  });

  const formEditar = useForm({
    initialValues: {
      nombre: "",
      codigo_producto: "",
      marca: "",
      modelo: "",
      descripcion: "",
      categoria: "",
      tipo_envio: "",
      plazo_entrega: "",
      garantia: "",
      precio_compra: 0,
      precio_venta: 0,
    }
  });

  const fetchProductos = async () => {
    const res = await fetch("/api/stock/productos");
    const data = await res.json();
    setProductos(data);
  };

  const fetchUnidades = async () => {
    const res = await fetch("/api/stock/productos/unidad");
    const data = await res.json();
    setUnidades(data);
  };



  useEffect(() => {
    if (tabla === 1) fetchProductos();
    if (tabla === 2) fetchUnidades();
    
    setLoading(false);
  }, [tabla]);

 
  const handleVerDetalle = producto => {
    setProductoDetalle(producto);
    setModalDetalleAbierto(true);
  };

  const handleEditarProducto = producto => {
    setProductoEditando(producto);
    formEditar.setValues(producto);
    setModalEditarAbierto(true);
  };



  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.toLowerCase())
  );

  const unidadesFiltradas = unidades.filter(u =>
    u.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.numero_serie?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.nombre_almacen.toLowerCase().includes(busqueda.toLowerCase())
  );

  const rowsProductos = productosFiltrados
    .slice((paginaProductos - 1) * rowsPerPage, paginaProductos * rowsPerPage)
    .map(p => (
      <tr key={p.id_producto}>
        <td>{p.nombre}</td>
        <td>{p.codigo_producto}</td>
        <td>{p.marca}</td>
        <td>{p.proveedores || '-'}</td>
        <td>{p.cantidad}</td>
        <td>${parseFloat(p.precio_compra).toLocaleString()}</td>
        <td>${parseFloat(p.precio_venta).toLocaleString()}</td>
        <td>{new Date(p.ultima_modificacion).toLocaleDateString()}</td>
   
      </tr>
    ));

  const rowsUnidades = unidadesFiltradas
    .slice((paginaUnidades - 1) * rowsPerPage, paginaUnidades * rowsPerPage)
    .map((u, i) => (
      <tr key={i}>
        <td>{u.nombre_producto}</td>
        <td>{u.numero_serie}</td>
        <td>{u.nombre_almacen}</td>
        <td>{u.estado}</td>
        <td>{u.observaciones || '-'}</td>
        <td>{new Date(u.fecha_movimiento).toLocaleDateString()}</td>
      </tr>
    ));

  return (
    <>
      <TextInput
        placeholder={`Buscar en ${tabla === 1 ? 'productos' : 'unidades'}...`}
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.currentTarget.value);
          setPaginaProductos(1);
          setPaginaUnidades(1);
        }}
        leftSection={<IconSearch size={18} />}
        mb="md"
      />

      {loading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : (
        <>
          {tabla === 1 && (
            <>
              <Table striped highlightOnHover withColumnBorders withRowBorders>
                <thead justify="flex-start" align="flex-start">
                  <tr justify="start" align="start" ta="start">
                    <th align="start">Producto</th>
                    <th align="start">Código</th>
                    <th align="start">Marca</th>
                    <th align="start">Proveedor</th>
                    <th align="start">Stock</th>
                    <th align="start">Compra</th>
                    <th align="start">Venta</th>
                    <th align="start">Modificado</th>
  
                  </tr>
                </thead>
                <tbody>{rowsProductos}</tbody>
              </Table>
              <Group justify="center" mt="md">
                <Pagination total={Math.ceil(productosFiltrados.length / rowsPerPage)} value={paginaProductos} onChange={setPaginaProductos} color="#ee0e0f" siblings={0} boundaries={1} />
              </Group>
            </>
          )}

          {tabla === 2 && (
            <>
              <Table striped highlightOnHover withColumnBorders withRowBorders>
                <thead>
                  <tr>
                    <th align="start">Producto</th>
                    <th align="start">N° Serie</th>
                    <th align="start">Almacén</th>
                    <th align="start">Estado</th>
                    <th align="start">Observaciones</th>
                    <th align="start">Fecha movimiento</th>
                  </tr>
                </thead>
                <tbody>{rowsUnidades}</tbody>
              </Table>
              <Group justify="center" mt="md">
                <Pagination total={Math.ceil(unidadesFiltradas.length / rowsPerPage)} value={paginaUnidades} onChange={setPaginaUnidades} color="#ee0e0f" siblings={0} boundaries={1} />
              </Group>
            </>
          )}
        </>
      )}

     
      
     
    </>
  );
};

export default InventarioCompleto;
