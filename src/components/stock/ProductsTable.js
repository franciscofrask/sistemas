import React from 'react';
import {
  Table,
  Text,
  Badge,
  Group,
  ActionIcon,
  Menu,
  Loader,
  Box,
  Center,
  UnstyledButton
} from '@mantine/core';
import {
  IconSettings,
  IconEye,
  IconPackages,
  IconBarcode,
  IconPencil,
  IconTrash,
  IconPlus,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from '@tabler/icons-react';

/**
 * ProductsTable - Componente de tabla de productos con funcionalidades avanzadas
 * 
 * DESCRIPCIÓN:
 * Este componente renderiza una tabla completa de productos con capacidades de
 * ordenamiento, acciones por fila y visualización de información detallada.
 * Incluye un menú desplegable de acciones para cada producto y manejo de estados
 * de carga.
 * 
 * FUNCIONALIDADES:
 * - Tabla responsive con ordenamiento por columnas
 * - Indicadores visuales de stock (colores rojo/verde)
 * - Badges de tipo de control de stock con colores
 * - Menú de acciones por producto (ver detalles, agregar stock, editar, eliminar)
 * - Formato de fechas y precios localizados
 * - Estado de carga con spinner
 * - Click en stock para ver detalles por almacén
 * 
 * PROPS REQUERIDAS:
 * @param {array} productosOrdenados - Array completo de productos filtrados y ordenados
 * @param {array} pageRows - Array de productos para la página actual
 * @param {boolean} loading - Estado de carga de datos
 * @param {string|null} sortField - Campo actual para ordenamiento
 * @param {string} sortOrder - Dirección del ordenamiento ('asc'|'desc')
 * @param {function} handleSort - Función para manejar click en headers de tabla
 * @param {function} handleVerStockPorAlmacenes - Función para abrir modal de stock por almacén
 * @param {function} handleVerDetalle - Función para abrir modal de detalle del producto
 * @param {function} handleEdit - Función para editar producto
 * @param {function} handleDelete - Función para eliminar producto
 * @param {function} getTipoControlBadge - Función que retorna color del badge según tipo
 * @param {function} onAgregarStock - Función para abrir modal de agregar stock (recibe el producto)
 */
const ProductsTable = ({
  productosOrdenados,
  pageRows,
  loading,
  sortField,
  sortOrder,
  handleSort,
  handleVerStockPorAlmacenes,
  handleVerDetalle,
  handleEdit,
  handleDelete,
  getTipoControlBadge,
  onAgregarStock // Nueva función para abrir modal de agregar stock
}) => {

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === 'asc' ? 
        <IconChevronUp size={14} style={{ marginLeft: 4 }} /> :
        <IconChevronDown size={14} style={{ marginLeft: 4 }} />;
    }
    return <IconSelector size={14} style={{ marginLeft: 4, opacity: 0.5 }} />;
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box mt="xl">
      <Table striped highlightOnHover withRowBorders withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <UnstyledButton onClick={() => handleSort('nombre')}>
                <Group gap="xs">
                  <Text fw={500}>Producto</Text>
                  {getSortIcon('nombre')}
                </Group>
              </UnstyledButton>
            </Table.Th>
            <Table.Th>
              <UnstyledButton onClick={() => handleSort('sku')}>
                <Group gap="xs">
                  <Text fw={500}>SKU</Text>
                  {getSortIcon('sku')}
                </Group>
              </UnstyledButton>
            </Table.Th>
            <Table.Th>
              <UnstyledButton onClick={() => handleSort('codigo_barras')}>
                <Group gap="xs">
                  <Text fw={500}>Código Barras</Text>
                  {getSortIcon('codigo_barras')}
                </Group>
              </UnstyledButton>
            </Table.Th>
            <Table.Th>
              <UnstyledButton onClick={() => handleSort('categoria_nombre')}>
                <Group gap="xs">
                  <Text fw={500}>Categoría</Text>
                  {getSortIcon('categoria_nombre')}
                </Group>
              </UnstyledButton>
            </Table.Th>
            <Table.Th>
              <UnstyledButton onClick={() => handleSort('stock_total')}>
                <Group gap="xs">
                  <Text fw={500}>Stock Total</Text>
                  {getSortIcon('stock_total')}
                </Group>
              </UnstyledButton>
            </Table.Th>
            <Table.Th ta="center">
              <Text fw={500}>Tipo Control</Text>
            </Table.Th>
            <Table.Th>
              <UnstyledButton onClick={() => handleSort('precio_lista')}>
                <Group gap="xs">
                  <Text fw={500}>Precio</Text>
                  {getSortIcon('precio_lista')}
                </Group>
              </UnstyledButton>
            </Table.Th>
            <Table.Th>
              <UnstyledButton onClick={() => handleSort('actualizado_en')}>
                <Group gap="xs">
                  <Text fw={500}>Última Actualización</Text>
                  {getSortIcon('actualizado_en')}
                </Group>
              </UnstyledButton>
            </Table.Th>
            <Table.Th ta="center">
              <Text fw={500}>Tipo</Text>
            </Table.Th>
            <Table.Th ta="center" w={120}>
              <Text fw={500}>Acciones</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
        {pageRows.map((item, index) => {
          console.log('Item en ProductsTable:', item);
          return (
          <Table.Tr key={item.id || index}>
            <Table.Td>
              <Text>{item.nombre || '-'}</Text>
            </Table.Td>
            <Table.Td>
              <Text>{item.sku || '-'}</Text>
            </Table.Td>
            <Table.Td>
              <Text>{item.codigo_barras || '-'}</Text>
            </Table.Td>
            <Table.Td>
              <Text>{item.categoria_nombre || '-'}</Text>
            </Table.Td>
            <Table.Td>
              {item.es_servicio ? (
                <Text c="dimmed" size="sm">—</Text>
              ) : (
                <UnstyledButton onClick={() => handleVerStockPorAlmacenes(item)}>
                  <Text 
                    c={parseInt(item.stock_almacen_actual) === 0 ? "red" : "green"}
                    td="underline"
                    size="sm"
                    title="Ver stock por almacenes"
                  >
                    {parseInt(item.stock_almacen_actual || 0)}
                  </Text>
                </UnstyledButton>
              )}
            </Table.Td>
            <Table.Td ta="center">
              {item.tipo_control_stock ? (
                <Badge 
                  color={getTipoControlBadge(item.tipo_control_stock)} 
                  size="sm"
                  w={80}
                >
                  {item.tipo_control_stock}
                </Badge>
              ) : (
                <Text size="sm" c="dimmed">-</Text>
              )}
            </Table.Td>
            <Table.Td>
              <Text>${item.precio_lista ? parseFloat(item.precio_lista).toLocaleString() : '0'}</Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm">
                {item.actualizado_en ? 
                  new Date(item.actualizado_en).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                  : '-'
                }
              </Text>
            </Table.Td>
            <Table.Td ta="center">
              <Text c={item.es_servicio ? "blue" : "gray"}>
                {item.es_servicio ? 'Servicio' : 'Producto'}
              </Text>
            </Table.Td>
            <Table.Td>
              <Group gap="xs" justify="center">
                <Menu shadow="md" width={160} position="bottom-end" withArrow>
                  <Menu.Target>
                    <ActionIcon color="blue" variant="subtle">
                      <IconSettings size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {!item.es_servicio && (
                      <>
                        <Menu.Item 
                          leftSection={<IconPlus size={14} />} 
                          onClick={() => onAgregarStock(item)}
                          color="blue"
                        >
                          Agregar Stock
                        </Menu.Item>
                        <Menu.Divider />
                      </>
                    )}
                    <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleVerDetalle(item)}>
                      Ver detalles
                    </Menu.Item>
                    {item.tipo_control_stock === 'LOTE' && (
                      <Menu.Item leftSection={<IconPackages size={14} />} onClick={() => console.log('Ver lotes del producto', item.id)}>
                        Ver Lotes
                      </Menu.Item>
                    )}
                    {item.tipo_control_stock === 'SERIE' && (
                      <Menu.Item leftSection={<IconBarcode size={14} />} onClick={() => console.log('Ver series del producto', item.id)}>
                        Ver Series
                      </Menu.Item>
                    )}
                    <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleEdit(item)}>
                      Editar
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(item.id)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
          );
        })}
        </Table.Tbody>
      </Table>
    </Box>
  );
};

export default ProductsTable;