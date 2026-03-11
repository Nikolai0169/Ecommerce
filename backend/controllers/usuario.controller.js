/**
 * controlador de usuarios ADMIN
 * solo accesible por el administrador
 * maneja las operaciones crud y activar y/o desactivar usuarios
 */

/**
 * Importamos modelos
 */

const Usuario = require("../models/usuario");

/**
 * obtener todas los usuarios
 * GET /api/usuarios
 * query params:
 * activo: trua/false (filtrar por estado)
 * @param {*} req
 * @param {*} res response express
 */

const getUsuarios = async (req, res) => {
  try {
    const { rol, activo, buscar, pagina = 1, limite = 10 } = req.query;

    //Construir filtros para la consulta
    const where = {};
    if (rol) where.rol = rol;
    if (activo !== undefined) where.activo = activo;
    if (buscar) {
      const { Op } = require("sequelize");
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${buscar}%` } },
        { apellido: { [Op.iLike]: `%${buscar}%` } },
        { email: { [Op.iLike]: `%${buscar}%` } },
      ];
    }

    //paginacion

    const offset = (parseInt(pagina) - 1) * limite;

    //Obtener usuarios sin password
    const { count, rows: usuarios } = await Usuario.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit: parseInt(limite),
      offset,
      order: [["createdAt", "DESC"]],
    });

    //Respuesta exitosa
    res.json({
      success: true,
      count,
      data: {
        usuarios,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: count,
          totalPaginas: Math.ceil(count / parseInt(limite)),
        },
      },
    });
  } catch (error) {
    console.error("Error en getUsuarios", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      errorr: error.message,
    });
  }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    //buscar usuarios
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    //Respuesta exitosa
    res.json({
      success: true,
      data: {
        usuario,
      },
    });
  } catch (error) {
    console.error("Error en getUsuarioById", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el usuario",
      errorr: error.message,
    });
  }
};

/**
 * Crear un nuevo usuario
 * POST /api/admin/usuarios
 * Body: { nombre, apellido, email, password, rol, telefono, direccion }
 * @param {object} req request express
 * @param {object} res response express
 */

const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol, telefono, direccion } =
      req.body;

    //Validacion 1: Campos obligatorios
    if (!nombre || !apellido || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: "El nombre, apellido, email, password y rol son obligatorios",
      });
    }

    //Validacion 2: validar rol
    if (!["cliente", "auxiliar", "administrador"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "El rol debe ser 'cliente', 'auxiliar' o 'administrador'",
      });
    }

    //Validacion 3: validar email
    const UsuarioExistente = await Usuario.findOne({ where: { email } });
    if (UsuarioExistente) {
      return res.status(400).json({
        success: false,
        message: `ya existe un usuario con el email ${email}`,
      });
    }

    //Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      rol,
      telefono: telefono || null,
      direccion: direccion || null,
    });

    //Respuesta exitosa
    res.status(201).json({
      success: true,
      message: "Usuario creado correctamente",
      data: {
        usuario: nuevoUsuario,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Error al crear el usuario",
        error: error.errors.map((e) => e.message),
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al crear el usuario",
      error: error.message,
    });
  }
};

/**
 * Actualizar un usuario
 * PUT /api/admin/usuarios/:id
 * Body: { nombre, apellido, email, password, rol, telefono, direccion }
 * @param {object} req request express
 * @param {object} res response express
 */

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol, telefono, direccion } =
      req.body;

    //buscar usuarios
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }
    //Validacion 1: validacion del rol si se proporciona
    if (rol && !["cliente", "auxiliar", "administrador"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "El rol debe ser 'cliente', 'auxiliar' o 'administrador'",
      });
    }

    //Actualizar campos
    if (nombre !== undefined) usuario.nombre = nombre;
    if (apellido !== undefined) usuario.apellido = apellido;
    if (email !== undefined) usuario.email = email;
    if (password !== undefined) usuario.password = password;
    if (rol !== undefined) usuario.rol = rol;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (direccion !== undefined) usuario.direccion = direccion;

    //Guardar cambios
    await usuario.save();

    //Respuesta exitosa
    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: {
        usuario: usuario.toJSON(),
      },
    });
  } catch (error) {
    console.error("Error en actualizarUsuario", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};

/**
 * Activar o desactivar un Usuario
 * PATCH /api/admin/usuarios/:id/estado
 * @param {object} req request express
 * @param {object} res response express
 */

const toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    //buscar Usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }
    //Gaurdar cambiamos
    await categoria.save();

    //No permitir desactivar el rol de administrador
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({
        success: false,
        message: "No puede desactivar su propia cuenta",
      });
    }

    //Guardar cambios
    usuario.activo = !usuario.activo;
    await usuario.save();

    //Respuesta exitosa
    res.json({
      success: true,
      message: `Usuario ${usuario.activo ? "activado" : "desactivado"} correctamente`,
      data: {
        usuario: usuario.toJSON(),
      },
    });
  } catch (error) {
    console.error("Error en toggleUsuario", error);
    res.status(500).json({
      success: false,
      message: "Error al activar o desactivar el usuario",
      error: error.message,
    });
  }
};
/**
 * Eliminar un usuario
 * DELETE /api/admin/usuarios/:id
 * @param {object} req request express
 * @param {object} res response express
 */

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    //buscar Usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    //No permitir eliminar el rol de administrador
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({
        success: false,
        message: "No puede eliminar su propia cuenta",
      });
    }

    //Eliminar Usuario
    await usuario.destroy();

    //Respuesta exitosa
    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en eliminarUsuario", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario",
      error: error.message,
    });
  }
};
/**
 * obtener estadisticas  de usuarios
 * GET/api/admin/usuarios/estadisticas
 * total de usuarios inactivos/activos
 * @param {object} req request express
 * @param {object} res response express
 */

const getEstadisticasUsuarios = async (req, res) => {
  try {
    //datos de usuarios
    const totalUsuarios = await Usuario.count();
    const totalClientes = await Usuario.count({ where: { rol: "cliente" } });
    const totalAdmins = await Usuario.count({
      where: { rol: "administrador" },
    });
    const usuariosActivos = await Usuario.count({ where: { activo: true } });
    const usuariosInactivos = await Usuario.count({ where: { activo: false } });

    res.json({
      success: true,
      message: "Estadisticas de usuarios obtenidas correctamente",
      data: {
        total: totalUsuarios,
        porRol: {
          clientes: totalClientes,
          admins: totalAdmins,
        },
        porEstado: {
          activos: usuariosActivos,
          inactivos: usuariosInactivos,
        },
      },
    });
  } catch (error) {
    console.error("Error en getEstadisticasUsuarios", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las estadisticas de usuarios",
      error: error.message,
    });
  }
};

//Exportar controladores
module.exports = {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  toggleUsuario,
  eliminarUsuario,
  getEstadisticasUsuarios,
};
