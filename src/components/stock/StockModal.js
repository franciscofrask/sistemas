import React from 'react';
import { Modal, Table, Text, Loader, Group } from '@mantine/core';

/**
 * StockModal - Componente modal para visualizar stock de un producto por almacenes
 * 
 * DESCRIPCIÓN:
 * Este componente muestra un modal con una tabla detallada del stock de un producto
 * específico distribuido por todos los almacenes donde tiene existencias. Incluye
 * manejo de estados de carga y casos donde no hay stock registrado.
 * 
 * FUNCIONALIDADES:
 * - Modal responsive con tabla de stock por almacén
 * - Indicadores visuales de stock (colores rojo/verde según cantidad)
 * - Estado de carga con spinner mientras obtiene datos
 * - Mensaje cuando no hay stock en ningún almacén
 * - Resolución automática de nombres de almacén por ID
 * 
 * PROPS REQUERIDAS:
 * @param {boolean} modalStockAbierto - Estado del modal (abierto/cerrado)
 * @param {function} setModalStockAbierto - Función para cambiar estado del modal
 * @param {object|null} productoSeleccionado - Objeto del producto seleccionado {id, nombre, ...}
 * @param {array} stockPorAlmacenes - Array con stock por almacén [{almacen_id, stock, ...}]
 * @param {boolean} loadingStock - Estado de carga de datos de stock
 * @param {function} getNombreAlmacen - Función que retorna nombre del almacén por ID
 */
const StockModal = ({
  modalStockAbierto,
  setModalStockAbierto,
  productoSeleccionado,
  stockPorAlmacenes,
  loadingStock,
  getNombreAlmacen
}) => {
  return (
    <Modal
      opened={modalStockAbierto}
      onClose={() => setModalStockAbierto(false)}
      title={`Stock por Almacén - ${productoSeleccionado?.nombre || 'Producto'}`}
      size="md"
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      {loadingStock ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : stockPorAlmacenes && stockPorAlmacenes.length > 0 ? (
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Almacén</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Stock</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {stockPorAlmacenes.map((item, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  {getNombreAlmacen(item.almacen_id)}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Text 
                    c={parseInt(item.stock || 0) === 0 ? "red" : "green"}
                    fw="bold"
                  >
                    {parseInt(item.stock || 0)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Group justify="center" py="xl">
          <Text c="dimmed" ta="center">
            Este producto no tiene stock registrado en ningún almacén
          </Text>
        </Group>
      )}
    </Modal>
  );
};

export default StockModal;