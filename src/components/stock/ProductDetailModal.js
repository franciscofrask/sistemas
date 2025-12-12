import React from 'react';
import { Modal, Grid, Text, Badge } from '@mantine/core';

/**
 * ProductDetailModal - Componente modal para mostrar información detallada de un producto
 * 
 * DESCRIPCIÓN:
 * Este componente renderiza un modal con toda la información detallada de un producto
 * específico en un formato de vista de solo lectura. Organiza los datos en una grilla
 * de dos columnas con etiquetas y valores claramente diferenciados.
 * 
 * FUNCIONALIDADES:
 * - Modal de solo lectura con información completa del producto
 * - Layout en grilla responsive de 2 columnas
 * - Formato localizado de fechas, precios y números
 * - Badge coloreado para tipo de control de stock
 * - Indicadores visuales de stock (colores rojo/verde)
 * - Diferenciación visual entre productos y servicios
 * - Manejo de valores nulos con fallbacks apropiados
 * 
 * PROPS REQUERIDAS:
 * @param {boolean} modalDetalleAbierto - Estado del modal (abierto/cerrado)
 * @param {function} setModalDetalleAbierto - Función para cambiar estado del modal
 * @param {object|null} productoDetalle - Objeto completo del producto {id, nombre, sku, codigo_barras, categoria_nombre, tipo_control_stock, precio_lista, stock_total, es_servicio, actualizado_en, ...}
 * @param {function} getTipoControlBadge - Función que retorna color del badge según tipo de control
 */
const ProductDetailModal = ({
  modalDetalleAbierto,
  setModalDetalleAbierto,
  productoDetalle,
  getTipoControlBadge
}) => {
  return (
    <Modal
      opened={modalDetalleAbierto}
      onClose={() => setModalDetalleAbierto(false)}
      title="Detalle del producto"
      size="lg"
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      {productoDetalle && (
        <Grid>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Nombre:</Text>
            <Text fw="bold">{productoDetalle.nombre}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">SKU:</Text>
            <Text fw="bold">{productoDetalle.sku || 'Sin SKU'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Código de barras:</Text>
            <Text fw="bold">{productoDetalle.codigo_barras || 'Sin código'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Categoría:</Text>
            <Text fw="bold">{productoDetalle.categoria_nombre}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Tipo de control:</Text>
            <Badge color={getTipoControlBadge(productoDetalle.tipo_control_stock)}>
              {productoDetalle.tipo_control_stock}
            </Badge>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Precio de lista:</Text>
            <Text fw="bold">${parseFloat(productoDetalle.precio_lista || 0).toLocaleString()}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Stock total:</Text>
            <Text 
              fw="bold"
              c={parseInt(productoDetalle.stock_total || 0) === 0 ? "red" : "green"}
            >
              {parseInt(productoDetalle.stock_total || 0)}
            </Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Tipo:</Text>
            <Text fw="bold" c={productoDetalle.es_servicio ? "blue" : "gray"}>
              {productoDetalle.es_servicio ? 'Servicio' : 'Producto'}
            </Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">Última actualización:</Text>
            <Text fw="bold">
              {productoDetalle.actualizado_en ? 
                new Date(productoDetalle.actualizado_en).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                : 'Sin fecha'
              }
            </Text>
          </Grid.Col>
        </Grid>
      )}
    </Modal>
  );
};

export default ProductDetailModal;