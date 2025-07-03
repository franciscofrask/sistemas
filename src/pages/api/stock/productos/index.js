import { db } from '@/lib/db'; // o '../lib/db' si no usás alias


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      nombre, descripcion, marca, modelo, categoria,
      precio_venta, precio_compra,
      codigo_producto, tipo_envio, plazo_entrega, garantia,
      proveedores // 👈 nuevo campo
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Crear producto
      await connection.query('CALL AgregarProducto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        nombre,
        descripcion || null,
        marca || null,
        modelo || null,
        categoria || null,
        precio_venta || 0,
        precio_compra || 0,
        codigo_producto || null,
        tipo_envio || null,
        plazo_entrega || null,
        garantia || null,
      ]);

      // Obtener el id del nuevo producto
      const [result] = await connection.query('SELECT LAST_INSERT_ID() AS id_producto');
      const id_producto = result[0].id_producto;

      // Asociar proveedores si vienen
      if (Array.isArray(proveedores)) {
        for (const id_proveedor of proveedores) {
          await connection.query(
            'INSERT INTO producto_proveedor (id_producto, id_proveedor, precio_compra) VALUES (?, ?, ?)',
            [id_producto, id_proveedor, precio_compra || 0]
          );
        }
      }

      await connection.commit();
      return res.status(201).json({ message: 'Producto creado correctamente' });

    } catch (error) {
      await connection.rollback();
      return res.status(400).json({ message: error.message });
    } finally {
      connection.release();
    }
  }

  if (req.method === 'GET') {
    const [rows] = await db.query('SELECT * FROM vista_productos_con_stock');
    return res.status(200).json(rows);
  }

  res.status(405).json({ message: 'Método no permitido' });
}
