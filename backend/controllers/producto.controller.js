/**
 * Controlador de productos
 * Maneja las operaciones CRUD y activar/desactivar productos
 * Solo accesible por el administrador
 */

/**
 * Importamos modelos
 */
const Producto = require("../models/producto");
const Subcategoria = require("../models/subcategoria");
const Categoria = require("../models/categoria");
const DetallePedido = require("../models/detallePedido");

/**
 * Obtener todos los productos
 * Query params:
 * subcategoriaId: ID de la subcategoría a la que pertenecen los productos
 * categoriaId: ID de la categoría a la que pertenecen los productos (a través de subcategoría)
 * activo: true/false (filtrar por estado)
 * @param {*} req
 * @param {*} res
 */
const getProductos = async (req, res) => {
  try {
    const { subcategoriaId, categoriaId, activo } = req.query;

    //Opciones de consulta
    const opciones = {
      order: [["nombre", "ASC"]],
      where: {},
    };

    //filtros
    if (subcategoriaId) opciones.where.subcategoriaId = subcategoriaId;
    if (activo !== undefined) opciones.where.activo = activo === "true";

    //incluir subcategoria y categoria
    opciones.include = [
      {
        model: Subcategoria,
        as: "subcategoria",
        where: categoriaId ? { categoriaId } : undefined,
        attributes: ["id", "nombre", "activo"],
        include: [
          {
            model: Categoria,
            as: "categoria",
            attributes: ["id", "nombre", "activo"],
          },
        ],
      },
    ];

    //obtener productos
    const productos = await Producto.findAll(opciones);

    res.json({
      success: true,
      count: productos.length,
      data: { productos },
    });
  } catch (error) {
    console.error("Error en getProductos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los productos",
      error: error.message,
    });
  }
};

/**
 * Obtener un producto por ID
 * GET /api/productos/:id
 * @param {*} req
 * @param {*} res
 */
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    //buscar producto
    const producto = await Producto.findByPk(id, {
      include: [
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre", "activo"],
          include: [
            {
              model: Categoria,
              as: "categoria",
              attributes: ["id", "nombre", "activo"],
            },
          ],
        },
      ],
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      data: { producto },
    });
  } catch (error) {
    console.error("Error en getProductoById:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el producto",
      error: error.message,
    });
  }
};

/**
 * Crear un nuevo producto
 * POST /api/admin/productos
 * Body: { nombre, descripcion, precio, stock, subcategoriaId }
 * @param {*} req
 * @param {*} res
 */
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, subcategoriaId } = req.body;

    //Validacion 1: Campos obligatorios
    if (!nombre || precio == null || stock == null || !subcategoriaId) {
      return res.status(400).json({
        success: false,
        message: "Nombre, precio, stock y subcategoriaId son obligatorios",
      });
    }

    //Validar precio y stock
    if (precio <= 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Precio debe ser mayor a 0 y stock no negativo",
      });
    }

    //Validar 2: Verificar que la subcategoria exista
    const subcategoria = await Subcategoria.findByPk(subcategoriaId);
    if (!subcategoria) {
      return res.status(400).json({
        success: false,
        message: "La subcategoría no existe",
      });
    }

    //Validar 3: Verificar que la subcategoria este activa
    if (!subcategoria.activo) {
      return res.status(400).json({
        success: false,
        message: `La subcategoría "${subcategoria.nombre}" está desactivada`,
      });
    }

    //Validacion 4: verificar que no exista otro producto con el mismo nombre en la misma subcategoria
    const productoExistente = await Producto.findOne({
      where: { nombre, subcategoriaId },
    });
    if (productoExistente) {
      return res.status(400).json({
        success: false,
        message: `Ya existe un producto con el nombre "${nombre}" en esta subcategoría`,
      });
    }

    //Crear nuevo producto
    const nuevoProducto = await Producto.create({
      nombre,
      descripcion: descripcion || null,
      precio,
      stock,
      subcategoriaId,
      activo: true,
    });

    //Obtener producto con los datos de la subcategoria
    const productoConRelaciones = await Producto.findByPk(nuevoProducto.id, {
      include: [
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
          include: [
            {
              model: Categoria,
              as: "categoria",
              attributes: ["id", "nombre"],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: { producto: productoConRelaciones },
    });
  } catch (error) {
    console.error("Error en crearProducto:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.errors.map((e) => e.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al crear el producto",
      error: error.message,
    });
  }
};

/**
 * Actualizar un producto
 * PUT /api/admin/productos/:id
 * Body: { nombre, descripcion, precio, stock, subcategoriaId, activo }
 * @param {*} req
 * @param {*} res
 */
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, subcategoriaId, activo } =
      req.body;

    // Buscar producto
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Actualizar subcategoria a la que pertenece el producto a modificar
    if (subcategoriaId && subcategoriaId !== producto.subcategoriaId) {
      const NuevaSubcategoria = await Subcategoria.findByPk(subcategoriaId);
      if (!NuevaSubcategoria) {
        return res.status(400).json({
          success: false,
          message: `La subcategoría con ID ${subcategoriaId} no existe`,
        });
      }

      if (!NuevaSubcategoria.activo) {
        return res.status(400).json({
          success: false,
          message: `La subcategoría "${NuevaSubcategoria.nombre}" está desactivada`,
        });
      }
    }

    //Validacion 3: si se cambia el nombre verificar que no exista otro producto con el mismo nombre
    if (nombre && nombre !== producto.nombre) {
      const subcategoriaFinal = subcategoriaId || producto.subcategoriaId; // Verificar la subcategoría final para la validación

      const productoConMismoNombre = await Producto.findOne({
        where: { nombre, subcategoriaId: subcategoriaFinal },
      });
      if (productoConMismoNombre) {
        return res.status(400).json({
          success: false,
          message: `Ya existe un producto con el nombre "${nombre}" en esta subcategoría`,
        });
      }
    }

    //Validar precio y stock
    if (precio !== undefined && precio <= 0) {
      return res.status(400).json({
        success: false,
        message: "El precio debe ser mayor a 0",
      });
    }
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: "El stock no puede ser negativo",
      });
    }

    //Validar 4: Verificar que la subcategoria final este activa
    const subcategoriaFinalId = subcategoriaId || producto.subcategoriaId;
    const subcategoriaObj = await Subcategoria.findByPk(subcategoriaFinalId);
    if (!subcategoriaObj.activo) {
      return res.status(400).json({
        success: false,
        message: `La subcategoría "${subcategoriaObj.nombre}" está desactivada`,
      });
    }

    // Actualizar campos
    if (nombre !== undefined) producto.nombre = nombre;
    if (descripcion !== undefined) producto.descripcion = descripcion;
    if (precio !== undefined) producto.precio = precio;
    if (stock !== undefined) producto.stock = stock;
    if (subcategoriaId !== undefined) producto.subcategoriaId = subcategoriaId;
    if (activo !== undefined) producto.activo = activo;

    // Guardar cambios
    await producto.save();

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: { producto },
    });
  } catch (error) {
    console.error("Error en actualizarProducto:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.errors.map((e) => e.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al actualizar el producto",
      error: error.message,
    });
  }
};

/**
 * Activar o desactivar un producto
 * PUT /api/admin/productos/:id/estado
 * @param {*} req
 * @param {*} res
 */
const toggleProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    //buscar producto
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    //actualizar producto
    producto.activo = activo;
    await producto.save();

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
      data: { producto },
    });
  } catch (error) {
    console.error("Error en toggleProducto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el producto",
      error: error.message,
    });
  }
};

/**
 * Eliminar un producto
 * DELETE /api/admin/productos/:id
 * Solo permite eliminar si no tiene pedidos asociados
 * @param {*} req
 * @param {*} res
 */
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    //buscar producto
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    //Validacion de que no tenga pedidos asociados
    const detallesAfectados = await DetallePedido.findAll({
      where: {
        productoId: id,
      },
    });

    if (detallesAfectados.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar el producto porque tiene pedidos asociados",
      });
    }

    //eliminar producto
    await producto.destroy();

    res.json({
      success: true,
      message: "Producto eliminado correctamente",
      data: { producto },
    });
  } catch (error) {
    console.error("Error en eliminarProducto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el producto",
      error: error.message,
    });
  }
};

/**
 * Obtener estadísticas de un producto
 * GET /api/admin/productos/:id/estadisticas
 * Valor total de inventario (precio * stock), stock total
 * @param {*} req
 * @param {*} res
 */
const getEstadisticasProducto = async (req, res) => {
  try {
    const { id } = req.params;

    //buscar producto
    const producto = await Producto.findByPk(id, {
      include: [
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
          include: [
            {
              model: Categoria,
              as: "categoria",
              attributes: ["id", "nombre"],
            },
          ],
        },
      ],
    });
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    //Calcular estadisticas
    const valorTotalDeInventario = producto.precio * producto.stock;

    res.json({
      success: true,
      message: "Estadísticas del producto obtenidas correctamente",
      data: {
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          stock: producto.stock,
          activo: producto.activo,
          subcategoriaId: producto.subcategoriaId,
        },
        estadisticas: {
          inventario: {
            valorTotal: valorTotalDeInventario.toFixed(2),
            stockTotal: producto.stock,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error en getEstadisticasProducto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las estadísticas del producto",
      error: error.message,
    });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  toggleProducto,
  eliminarProducto,
  getEstadisticasProducto,
};
