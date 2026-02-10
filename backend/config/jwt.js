/**
 * CONFIGURACION DE JWT
 * Este archivo se encarga de configurar el manejo de JSON Web Tokens (JWT) para la autenticación en la aplicación.
 * Aquí se define la clave secreta para firmar los tokens, así como las opciones de expiración y algoritmos de firma.
 * Esta configuración es crucial para garantizar la seguridad de la autenticación basada en tokens en la aplicación.
 * Los JWT se utilizan para autenticar a los usuarios y proteger las rutas que requieren autenticación, permitiendo un acceso seguro a los recursos de la aplicación.
 */

//Importtar jsonwebtoken para manejar los JWT
const jwt = require("jsonwebtoken");

//Importar dotenv para acceder las variables de entorno
require("dotenv").config();

/**
 * Generar un token JWT para un usuario autenticado
 * @param {Object} Payload - Datos que se incluirán en el token (id, email, rol)
 * @returns {string} - El token JWT generado
 */

const generateToken = (payload) => {
  try {
    //jwt.sign() para generar el token, usando la clave secreta y las opciones de expiración
    //parametros:
    //1. payload: los datos que se incluirán en el token (id, email, rol)
    //2. secret: la clave secreta para firmar el token, se obtiene de las variables de entorno (desde .env)
    //3. options: opciones adicionales para el token, como la expiración (expiresIn) y el algoritmo de firma (algorithm)
    const token = jwt.sign(
      payload, //datos de usuario (id, email, rol)
      process.env.JWT_SECRET, //clave secreta para firmar el token, se obtiene de las variables de entorno desde .env
      {
        expiresIn: process.env.JWT_EXPIRES_IN, //el token expirará en 1 hora, puedes ajustar esto según tus necesidades
      },
    );

    return token; //retorna el token generado
  } catch (error) {
    console.error("Error al generar el token JWT:", error.message);
    throw new Error("Error al generar el token JWT"); //lanzar un error si ocurre un problema al generar el token
  }
};

/**Verificar si un token es valido
 * @param {string} token - El token JWT a verificar
 * @returns {Object} - El payload decodificado si el token es válido, o null si no lo es
 * @throws {Error} - Lanza un error si el token es inválido o ha expirado
 */

const verifyToken = (token) => {
  try {
    //jwt.verify() para verificar el token, usando la clave secreta
    //parametros:
    //1. token: el token JWT a verificar
    //2. secret: la clave secreta para verificar el token, se obtiene de las variables de entorno (desde .env)
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //verificar el token usando la clave secreta
    return decoded; //retorna el payload decodificado si el token es válido
  } catch (error) {
    //Diferentes tipos de errores
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expirado"); //lanzar un error si el token ha expirado
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Token inválido"); //lanzar un error si el token es inválido
    } else {
      console.error("Error al verificar el token JWT:", error.message);
      throw new Error("Error al verificar el token JWT"); //lanzar un error genérico si ocurre un problema al verificar el token
    }
  }
};

/**
 * Extraer el token JWT del header de autorización
 * El token viene en forma de "Bearer <token>", por lo que se debe extraer solo la parte del token
 * @param {String} authHeader -> El header de autorización que contiene el token JWT
 * @returns  {String|null} -> El token JWT extraído del header, o null si el header no es válido
 */

const extractTokenData = (authHeader) => {
  //verficar que el header del token exista y empieza con "Bearer "
  if (authHeader && authHeader.startsWith("Bearer ")) {
    //extraer solo el token del header (remover "Bearer1 " del inicio)
    return authHeader.substring(7); //retorna el token extraído
  }
    return null; //retorna null si el header no es válido
};


//Exportar las funciones para usarlas en otras partes de la aplicación
module.exports = {
  generateToken,
  verifyToken,
  extractTokenData,
};