import React from 'react';
import {
  Modal,
  Grid,
  Title,
  TextInput,
  Select,
  NumberInput,
  Checkbox,
  Button,
  Card,
  Group,
  Text
} from '@mantine/core';

/**
 * ProductForm - Componente de formulario modal para crear/editar productos
 * 
 * DESCRIPCIÓN:
 * Este componente renderiza un modal con un formulario completo para la creación
 * y edición de productos. Maneja diferentes tipos de control de stock (UNIDAD, LOTE, SERIE)
 * y permite configurar lotes con fechas de vencimiento y cantidades, así como números
 * de serie para productos que los requieran.
 * 
 * FUNCIONALIDADES:
 * - Formulario dinámico que cambia según el tipo de control de stock
 * - Validación de campos requeridos
 * - Manejo de productos tipo servicio (sin control de stock)
 * - Gestión de lotes con código, fecha de vencimiento y cantidad
 * - Gestión de series con números únicos
 * - Selección de almacén para stock inicial (LOTE/SERIE)
 * 
 * PROPS REQUERIDAS:
 * @param {boolean} opened - Estado del modal (abierto/cerrado)
 * @param {function} onClose - Función para cerrar el modal
 * @param {object} form - Objeto de formulario de Mantine con validaciones
 * @param {function} onSubmit - Función que se ejecuta al enviar el formulario
 * @param {boolean} modoEdicion - Indica si está en modo edición o creación
 * @param {array} categorias - Array de categorías [{id, nombre, descripcion}]
 * @param {array} unidades - Array de unidades de medida [{id, nombre, codigo}]
 * @param {array} almacenes - Array de almacenes [{id, nombre}]
 * @param {boolean} esServicio - Estado que indica si es un servicio
 * @param {function} setEsServicio - Función para cambiar el estado de servicio
 * @param {string} tipoControl - Tipo de control actual ('UNIDAD'|'LOTE'|'SERIE')
 * @param {function} setTipoControl - Función para cambiar tipo de control
 * @param {array} lotes - Array de lotes [{codigo, fechaVencimiento, cantidad}]
 * @param {function} setLotes - Función para actualizar array de lotes
 * @param {array} series - Array de strings con números de serie
 * @param {function} setSeries - Función para actualizar array de series
 * @param {function} limpiarFormulario - Función para resetear el formulario
 */
const ProductForm = ({
  opened,
  onClose,
  form,
  onSubmit,
  modoEdicion,
  categorias,
  unidades,
  almacenes,
  esServicio,
  setEsServicio,
  tipoControl,
  setTipoControl,
  lotes,
  setLotes,
  series,
  setSeries,
  limpiarFormulario
}) => {

  // Funciones para manejar lotes
  const agregarLote = () => {
    setLotes([...lotes, { codigo: '', fechaVencimiento: '', cantidad: 0 }]);
  };

  const eliminarLote = (index) => {
    if (lotes.length > 1) {
      setLotes(lotes.filter((_, i) => i !== index));
    }
  };

  const actualizarLote = (index, campo, valor) => {
    const nuevosLotes = [...lotes];
    nuevosLotes[index][campo] = valor;
    setLotes(nuevosLotes);
  };

  // Funciones para manejar series
  const agregarSerie = () => {
    setSeries([...series, '']);
  };

  const eliminarSerie = (index) => {
    if (series.length > 1) {
      setSeries(series.filter((_, i) => i !== index));
    }
  };

  const actualizarSerie = (index, valor) => {
    const nuevasSeries = [...series];
    nuevasSeries[index] = valor;
    setSeries(nuevasSeries);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        limpiarFormulario();
      }}
      title={modoEdicion ? "Editar Producto" : "Crear Producto"}
      size="lg"
      transitionProps={{ transition: "fade", duration: 600, timingFunction: "linear" }}
      classNames={{
        title: "modal-title",
        header: "modal-header",
      }}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Grid>
          <Grid.Col span={12}>
            <Title order={4}>Información del Producto</Title>
          </Grid.Col>
          
          {/* Información básica */}
          <Grid.Col span={12}>
            <TextInput 
              label="Nombre del producto" 
              placeholder="Ingrese el nombre del producto"
              required
              {...form.getInputProps("nombre")} 
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <TextInput 
              label="SKU" 
              placeholder="Código SKU (único)"
              {...form.getInputProps("sku")} 
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <TextInput 
              label="Código de barras" 
              placeholder="Código de barras (único)"
              {...form.getInputProps("codigo_barras")} 
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Select
              label="Categoría"
              placeholder="Seleccione una categoría"
              required
              data={categorias.map(cat => ({ 
                value: cat.id.toString(), 
                label: cat.nombre,
                description: cat.descripcion
              }))}
              {...form.getInputProps("categoria_id")}
              searchable
              maxDropdownHeight={200}
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Select
              label="Unidad de medida"
              placeholder="Seleccione unidad"
              required
              data={unidades.map(unidad => ({ 
                value: unidad.id.toString(), 
                label: `${unidad.nombre} (${unidad.codigo})`,
                description: `Código: ${unidad.codigo}`
              }))}
              {...form.getInputProps("unidad_medida_id")}
              searchable
              maxDropdownHeight={200}
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <NumberInput
              label="Precio de lista"
              prefix="$"
              min={0}
              decimalScale={2}
              {...form.getInputProps("precio_lista")}
            />
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Checkbox
              label="¿Es un servicio?"
              checked={esServicio}
              onChange={(e) => setEsServicio(e.currentTarget.checked)}
            />
          </Grid.Col>
          
          <Grid.Col span={12}>
            <Select
              label="Tipo de control de stock"
              value={tipoControl}
              onChange={setTipoControl}
              disabled={esServicio}
              data={[
                { value: 'UNIDAD', label: 'UNIDAD' },
                { value: 'LOTE', label: 'LOTE' },
                { value: 'SERIE', label: 'SERIE' }
              ]}
            />
            {esServicio && (
              <Text size="sm" c="dimmed" mt="xs">
                Los servicios solo pueden usar control por UNIDAD
              </Text>
            )}
          </Grid.Col>
          
          {/* Campos específicos según tipo de control */}
          {(tipoControl === 'LOTE' || tipoControl === 'SERIE') && !esServicio && (
            <Grid.Col span={12}>
              <Select
                label="Almacén"
                placeholder="Seleccione el almacén donde se registrará el stock inicial"
                data={almacenes.map(a => ({ value: a.id.toString(), label: a.nombre }))}
                required
                {...form.getInputProps("almacen_id")}
              />
            </Grid.Col>
          )}
          
          {tipoControl === 'LOTE' && !esServicio && (
            <Grid.Col span={12}>
              <Title order={5} mb="md">Configuración de Lotes</Title>
              {lotes.map((lote, index) => (
                <Card key={index} mb="md" withBorder>
                  <Grid>
                    <Grid.Col span={4}>
                      <TextInput
                        label="Código del lote"
                        placeholder="Ej: LT001"
                        value={lote.codigo}
                        onChange={(e) => actualizarLote(index, 'codigo', e.currentTarget.value)}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput
                        label="Fecha de vencimiento"
                        type="date"
                        value={lote.fechaVencimiento}
                        onChange={(e) => actualizarLote(index, 'fechaVencimiento', e.currentTarget.value)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <NumberInput
                        label="Cantidad inicial"
                        min={0}
                        value={lote.cantidad}
                        onChange={(value) => actualizarLote(index, 'cantidad', value || 0)}
                      />
                    </Grid.Col>
                    <Grid.Col span={1}>
                      <Button
                        color="red"
                        variant="subtle"
                        size="sm"
                        mt="xl"
                        onClick={() => eliminarLote(index)}
                        disabled={lotes.length === 1}
                      >
                        ×
                      </Button>
                    </Grid.Col>
                  </Grid>
                </Card>
              ))}
              <Button variant="light" onClick={agregarLote} size="sm">
                + Agregar Lote
              </Button>
            </Grid.Col>
          )}
          
          {tipoControl === 'SERIE' && !esServicio && (
            <Grid.Col span={12}>
              <Title order={5} mb="md">Números de Serie (Opcional)</Title>
              {series.map((serie, index) => (
                <Group key={index} mb="xs">
                  <TextInput
                    placeholder={`Solo ingrese el número de serie si desea cargar una unidad con serie`}
                    value={serie}
                    onChange={(e) => actualizarSerie(index, e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    color="red"
                    variant="subtle"
                    size="sm"
                    onClick={() => eliminarSerie(index)}
                    disabled={series.length === 1}
                  >
                    ×
                  </Button>
                </Group>
              ))}
              <Button variant="light" onClick={agregarSerie} size="sm">
                + Agregar Serie
              </Button>
            </Grid.Col>
          )}
          
          <Grid.Col span={12}>
            <Button variant="outline" color="#EE0E0F" type="submit" fullWidth>
              {modoEdicion ? "Guardar cambios" : "Crear Producto"}
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Modal>
  );
};

export default ProductForm;