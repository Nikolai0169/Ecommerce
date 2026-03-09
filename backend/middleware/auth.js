/**
 * middleware para verificar si el usuario esta autenticado
 * se utiliza en las rutas que requieren autenticacion
 * este archivo verifica si el usuario esta autenticado y si no lo esta redirecciona al login
 * @param {Object} req request express con req.usuario del middleware de autenticacion
 * @param {Object} res response express
 * @param {Function} next
 */

const jwt = ({ verifyToken, extractToken } = require("../config/jwt"));

//importar modelo de usuario
const Usuario = require("../models/usuario");

//middleware para verificar si el usuario esta autenticado
const verificarAuth = async (req, res, next) => {
  try {
    //obtener token del header
    const authHeader = (req.header = req.headers.authorization);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    //Extraer el token del header
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    //Paso 2 verificar que el token sea valido
    let decoded; // funcion para decodificar el token
    try {
      decoded = verificarToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    //buscar el usuario en la base de datos
    const usuario = await Usuario.findById(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    //Paso 4 verificar que el usuario este activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Usuario desactivado contacte al administrador",
      });
    }

    //paso 5 agregar el usuario al request para uso posterior
    //ahora en los controladores podemos accder al usuario con req.usuario

    //continuar en el siguiente
    next();
  } catch (error) {
    console.error("Error en middleware de autenticacion", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar el token",
      errorr: error.message,
    });
  }
};

/**
 * middleware opcional de autenticacion
 * similar a verificarAuth pero no retorna error si no hay token
 * es para rutas que no requieren autenticacion
 */

const verificarAuthOpcional = async (req, res, next) => {
  try {
    //obtener token del header
    const authHeader = (req.header = req.headers.authorization);

    if (!authHeader) {
      return next();
    }

    //Extraer el token del header
    const token = extractToken(authHeader);

    if (!token) {
      req.usuario = null;
      return next();
    }

    // funcion para decodificar el token
    try {
      const decoded = verificarToken(token);
      const usuario = await Usuario.findById(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (usuario && usuario.activo) {
        req.usuario = usuario;
      } else {
        req.usuario = null;
      }
    } catch (error) {
      //token invalido o expirado continuar sin usuario
      req.usuario = null;
    }

    next();
  } catch (error) {
    console.error("Error en middleware de autenticacion opcional", error);
    ((req.usuario = null), next());
  }
};

//exportar middleware
module.exports = { verificarAuth, verificarAuthOpcional };
