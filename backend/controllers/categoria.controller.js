/**
 * controlador de categorias
 * maneja las operaciones crud y activar y/o desactivar categorias
 * solo accesible por el administrador
 */

/**
 * Importamos modelos
 */
const categoria = require("../models/categoria");
const subcategoria = require("../models/subcategoria");
const producto = require("../models/producto");


/**
 * obtener todas las categorias
 * query params:
 * activo: trua/false (filtrar por estado)
 * incluirsubcategorias: true/false (incluir subcategorias)
 * incluirproductos: true/false (incluir productos)
 * @param {*} req
 * @param {*} res response express
 *
 */

const getCategorias = async (req, res) => {
  try {
    const { activo, incluirSubcategorias, incluirProductos } = req.query;

    //Opciones de consulta
    const opciones = {
      order: ["nombre", "ASC"], //Ordenar por nombre de forma ascendente
      where: {},
    };

    //filtrar por estado activo si es especificado
    if (activo !== undefined) {
      opciones.where = { activo: activo === "true" }; //convertir a booleano
    }

    //incluir subcategorias si se solicita
    if (incluirSubcategorias === "true") {
      opciones.include = [
        {
          model: subcategoria,
          as: "subcategorias",
          attributes: ["id", "nombre", "descripcion", "activo"],
        },
      ];
    }

    //obtener categorias
    const categorias = await categoria.findAll(opciones);
    //Respuesta exitosa
    res.json({
      success: true,
      count: categoria.length,
      data: {
        categorias,
      },
    });
  } catch (error) {
    console.error("Error en getCategorias", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las categorias",
      error: error.message,
    });
  }
};

/**
 * obtener todas las categorias por id
 * GET /api/categorias/:id
 * @param {*} req request express
 * @param {*} res response express
 *
 */

const getCategoriasById = async (req, res) => {
  try {
    const { id } = req.params;

    //buscar categoris con subcategorias y contar productos
    const categoria = await categoria.findByPk(id, {
      include: [
        {
          model: subcategoria,
          as: "subcategorias",
          attributes: ["id", "nombre", "descripcion", "activo"],
        },
        {
          model: prodcuto,
          as: "productos",
          attributes: ["id"],
        },
      ],
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoria no encontrada",
      });
    }
    //Contador de productos
    const categoriaJSON = categoria.toJSON();
    categoriaJSON.totalProductos = categoriaJSON.productos.length;
    delete categoriaJSON.productos; // no enviar la lista completa de productos solo el contador

    //Respuesta exitosa
    res.json({
      success: true,
      data: {
        categoria: categoriaJSON,
      },
    });

    //incluir subcategorias si se solicita
    if (incluirSubcategorias === "true") {
      opciones.include = [
        {
          model: subcategoria,
          as: "subcategorias",
          attributes: ["id", "nombre", "descripcion", "activo"],
        },
      ];
    }

    //obtener categorias
    const categorias = await categoria.findAll(opciones);
    //Respuesta exitosa
    res.json({
      success: true,
      count: categoria.length,
      data: {
        categorias,
      },
    });
  } catch (error) {
    console.error("Error en getCategoriabyId", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la categoria",
      error: error.message,
    });
  }
};

/**
 * Crear una nueva categoria
 * POST /api/admin/categorias
 * Body: { nombre, descripcion }
 * @param {object} req request express
 * @param {object} res response express
 */

const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    //Validacion 1: Campos obligatorios
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre es obligatorio",
      });
    }

    //Validacion 2: Categoria duplicada
    const categoriaExistente = await categoria.findOne({ where: { nombre } });
    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una categoria con el nombre "${nombre}"`,
      });
    }
    //Crear nueva categoria
    const nuevaCategoria = await categoria.create({
      nombre,
      descripcion: descripcion || null, // Si no se proporciona descripcion, se establece como null
      activo: true,
    });

    //Respuesta exitosa
    res.status(201).json({
      success: true,
      message: "Categoria creada correctamente",
      data: {
        categoria: nuevaCategoria,
      },
    }); // 201 Created json
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error al crear la categoria",
        error: error.errors.map((e) => e.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al crear la categoria",
      error: error.message,
    });
  }
};

/**
 * Actualizar una categoria
 * PUT /api/admin/categorias/:id
 * Body: { nombre, descripcion }
 * @param {object} req request express
 * @param {object} res response express
 */

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    //buscar categoria
    const categoria = await categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoria no encontrada",
      });
    }

    //validacion 1: si se cambia el nombre verificar que no exista otra categoria con el mismo nombre
    if (nombre && nombre !== categoria.nombre) {
      const categoriaConMismoNombre = await categoria.findOne({
        where: { nombre },
      });
      if (categoriaConMismoNombre) {
        return res.status(400).json({
          success: false,
          message: `Ya existe una categoria con el nombre "${nombre}"`,
        });
      }
    }

    //actualizar campos
    if (nombre !== undefined) categoria.nombre = nombre;
    if (descripcion !== undefined) categoria.descripcion = descripcion;
    if (activo !== undefined) categoria.activo = activo;

    //guardar cambios
    await categoria.save();

    //Respuesta exitosa
    res.json({
      success: true,
      message: "Categoria actualizada correctamente",
      data: {
        categoria,
      },
    });
  } catch (error) {
    console.error("Error en actualizarCategoria", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error al actualizar la categoria",
        errors: error.errors.map(e => e.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al actualizar la categoria",
      error: error.message,
    });
  }
};

/**
 * Activar o desactivar una categoria
 * PUT /api/admin/categorias/:id/estado
 * Al desactivar una categoria, se desactivan tambien sus subcategorias y productos asociados
 * Al desactivar una subcategoria, se desactivan tambien sus productos asociados
 * @param {object} req request express
 * @param {object} res response express
 */

const toggleCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    //buscar categoria
    const categoria = await categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoria no encontrada",
      });
    }

    //Alternar estado
    const nuevoEstado = !categoria.activo;
    categoria.activo = nuevoEstado;

    //Gaurdar cambiamos
    await categoria.save();

    //contar cuantos registros se afectaron
    const subcategoriasAfectadas = await subcategoria.count({
      where: {
        categoriaId: id,
      },
    });

    const productosAfectados = await producto.count({
      where: {
        categoriaId: id,
      },
    });

    //Respuesta exitosa
    res.json({
      success: true,
      message: `Categoria ${nuevoEstado ? "activada" : "desactivada"} correctamente`,
      data: {
        subcategoria:
        subcategoriasAfectadas,
        producto: productosAfectados
      },
    });
}
}
