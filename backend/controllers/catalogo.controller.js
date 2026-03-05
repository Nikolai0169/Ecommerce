/**
 * Controlador de productos
 * Maneja las operaciones CRUD y activar/desactivar productos
 * Solo accesible por el administrador
 */

/**
 * Importamos modelos
 */
const Producto = require("../models/producto");
const Categoria = require("../models/categoria");
const Subcategoria = require("../models/subcategoria");

/**
 * Obtener todos los productos al publico
 * GET /api/catalogo/productos
 * query params:
 * categoriaId: ID de la categoría a la que pertenecen los productos (a través de subcategoría)
 * subcategoriaId: ID de la subcategoría a la que pertenecen los productos
 * preciomin, preciomax, rango de precios, nombre reciente
 * @param {object} req request express
 * @param {object} res response express
 * solo muestra productos activos y con stock
 */
const getProductos = async (req, res) => {
  try {
    const {
      categoriaId,
      subcategoriaId,
      buscar,
      preciomin,
      preciomax,
      orden = "reciente",
      pagina = 1,
      limite = 12,
    } = req.query;
    const { Op } = require("sequelize");

    //filtros base solo para mostrar productos activos y con stock
    const where = {
      activo: true,
      stock: { [Op.gt]: 0 },
    };

    // filtros opcionales
    if (categoriaId) where.categoriaId = categoriaId;
    if (subcategoriaId) where.subcategoriaId = subcategoriaId;

    //Busqueda de texto
    if (buscar) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${buscar}%` } },
        { descripcion: { [Op.iLike]: `%${buscar}%` } },
        //permite buscar por nombre o descripcion
      ];
    }

    //filtro por rango de precios
    if (preciomin && preciomax) {
      where.precio = {};
      if (preciomin) where.precio[Op.gte] = parseFloat(preciomin);
      if (preciomax) where.precio[Op.lte] = parseFloat(preciomax);
    }

    //ordenamiento
    let order;
    switch (orden) {
      case "precio_asc":
        order = [["precio", "ASC"]]; //precio ascendente
        break;
      case "precio_desc":
        order = [["precio", "DESC"]]; //precio descendente
        break;
      case "nombre_asc":
        order = [["nombre", "ASC"]]; //nombre ascendente
        break;
      case "nombre_desc":
        order = [["nombre", "DESC"]]; //nombre descendente
        break;
      case "reciente":
        order = [["createdAt", "DESC"]]; //reciente
        break;
      default:
        order = [["createdAt", "DESC"]]; //reciente
        break;
    }

    //Paginacion
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    //Consultar productos

    const opciones = ({ count, rows: productos } =
      await Producto.findAndCountAll({
        where,
        include: [
          {
            model: Categoria,
            as: "categoria",
            attributes: ["id", "nombre"],
            where: { activo: true }, //solo mostrar categorias activas
          },
          {
            model: Subcategoria,
            as: "subcategoria",
            attributes: ["id", "nombre"],
            where: { activo: true }, //solo mostrar subcategorias activas
          },
        ],
        limit: parseInt(limite),
        offset,
        order: [["nombre", "ASC"]],
      }));

    //Respuesta exitosa
    res.status(200).json({
      success: true,
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

    //buscar producto con activo y stock
    const producto = await Producto.findOne(id, {
      where: {
        id,
        activo: true,
      },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre"],
          where: { activo: true }, //solo mostrar categorias activas
        },
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
          where: { activo: true }, //solo mostrar subcategorias activas
        },
      ],
    });

    // Validacion 1: Producto no encontrado
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado o no disponible",
      });
    }

    //Respuesta exitosa
    res.status(200).json({
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
 * Obtener todas las categorias
 * GET /api/categorias
 * @param {*} req
 * @param {*} res
 */
const getCategorias = async (req, res) => {
  try {
    const { Op } = require("sequelize");

    //Buscar categorias con activo
    const categorias = await Categoria.findAll({
      where: { activo: true },
      attributes: ["id", "nombre", "descripcion"],
      order: [["nombre", "ASC"]],
    });

    //Para cada categoria contar productos con stock > 0
    const categoriasConConteo = await Promise.all(
      categorias.map(async (categoria) => {
        const totalProductos = await Producto.count({
          where: {
            categoriaId: categoria.id,
            activo: true,
            stock: { [Op.gt]: 0 },
          },
        });
        return {
          ...categoria.toJSON(),
          totalProductos,
        };
      }),
    );

    //Respuesta exitosa
    res.status(200).json({
      success: true,
      data: { categorias: categoriasConConteo },
    });
  } catch (error) {
    console.error("Error en getCategorias:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las categorias",
      error: error.message,
    });
  }
};

/**
 * Obtener subcategorias por categoria
 * GET /api/subcategorias
 * @param {*} req
 * @param {*} res
 */

const getSubcategoriasPorCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { Op } = require("sequelize");

    //verificar que la categoria exista y este activa
    const categoria = await Categoria.findOne({
      where: { id, activo: true },
    });
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoria no encontrada",
      });
    }

    //Buscar subcategorias activas
    const subcategorias = await Subcategoria.findAll({
      where: { categoriaId: id, activo: true },
      attributes: ["id", "nombre", "descripcion"],
      order: [["nombre", "ASC"]],
    });

    //contar productos activos con stock > 0 para cada subcategoria
    const subcategoriasConConteo = await Promise.all(
      subcategorias.map(async (subcategoria) => {
        const totalProductos = await Producto.count({
          where: {
            subcategoriaId: subcategoria.id,
            activo: true,
            stock: { [Op.gt]: 0 },
          },
        });
        return {
          ...subcategoria.toJSON(),
          totalProductos,
        };
      }),
    );

    //Respuesta exitosa
    res.status(200).json({
      success: true,
      data: {
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre,
        },
        subcategorias: subcategoriasConConteo,
      },
    });
  } catch (error) {
    console.error("Error en getSubcategoriasPorCategoria:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las subcategorias",
      error: error.message,
    });
  }
};

/**
 * Obtener productos destacados
 * GET /api/subcategorias
 * @param {*} req
 * @param {*} res
 */

const getProductosDestacados = async (req, res) => {
  try {
    const { limite = 8 } = req.params;
    const { Op } = require("sequelize");

    //Obtener productos mas recientes
    const productos = await Producto.findAll({
      where: { activo: true, stock: { [Op.gt]: 0 } },
      include: [
        {
          model: Categoria,
          as: "categoria",
          attributes: ["id", "nombre"],
          where: { activo: true }, //solo mostrar categorias activas
        },
        {
          model: Subcategoria,
          as: "subcategoria",
          attributes: ["id", "nombre"],
          where: { activo: true }, //solo mostrar subcategorias activas
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limite),
    });

    //Respuesta exitosa
    res.status(200).json({
      success: true,
      data: { productos },
    });
  } catch (error) {
    console.error("Error en getProductosDestacados:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los productos destacados",
      error: error.message,
    });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  getCategorias,
  getSubcategoriasPorCategoria,
  getProductosDestacados,
};
