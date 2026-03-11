/**
 * Configuración de la conexión a la base de datos usando Sequelize.
 *
 * Este archivo exporta:
 *  - `sequelize`: instancia de Sequelize configurada.
 *  - `testConnection()`: método para verificar que se pueda conectar al servidor de base de datos.
 *  - `syncDatabase()`: método para sincronizar los modelos con la base de datos.
 */

// Importamos Sequelize (ORM) para trabajar con la base de datos de forma orientada a objetos.
const { Sequelize } = require("sequelize");

// Cargar variables de entorno desde el archivo .env (DB_NAME, DB_USER, DB_PASSWORD, etc.).
require("dotenv").config();

// Crear una instancia de Sequelize con la configuración de la base de datos.
// Sequelize usará estas opciones para conectarse a MySQL y manejar el pool de conexiones.
const sequelize = new Sequelize(
  process.env.DB_NAME, // Nombre de la base de datos.
  process.env.DB_USER, // Usuario de la base de datos.
  process.env.DB_PASSWORD, // Contraseña del usuario de la base de datos.
  {
    host: process.env.DB_HOST, // Host donde está corriendo MySQL.
    port: process.env.DB_PORT, // Puerto en el que MySQL está escuchando.
    dialect: "mysql", // Tipo de base de datos (MySQL en este proyecto).

    // Configuración del pool de conexiones
    pool: {
      max: 5, // Número máximo de conexiones simultáneas en el pool.
      min: 0, // Número mínimo de conexiones mantenidas abiertas en el pool.
      acquire: 30000, // Tiempo máximo (ms) que el pool intentará obtener una conexión antes de fallar.
      idle: 10000, // Tiempo máximo (ms) que una conexión puede estar inactiva antes de ser cerrada.
    },

    // Mostrar logs SQL solo en desarrollo (evita ruido en producción).
    logging: process.env.NODE_ENV === "development" ? console.log : false,

    // Ajustar la zona horaria para evitar problemas de fechas/hora entre la aplicación y la BD.
    timezone: "-05:00", // Cambia esto según tu zona horaria.

    // Opciones globales para todos los modelos de Sequelize.
    define: {
      timestamps: true, // Agrega automáticamente columnas `createdAt` y `updatedAt`.
      underscored: false, // Usa camelCase en lugar de snake_case para los nombres de columnas.
      freezeTableName: true, // Evita que Sequelize pluralice los nombres de las tablas.
    },
  },
);

/**
 * Verifica que la aplicación pueda conectarse al servidor de base de datos.
 *
 * @returns {Promise<boolean>} true si la conexión es exitosa, false en caso de error.
 */
const testConnection = async () => {
  try {
    // Intenta autenticar la conexión con la base de datos.
    await sequelize.authenticate();

    console.log("Conexión a la base de datos establecida correctamente.");
    return true;
  } catch (error) {
    // Mostrar el error completo para facilitar la depuración.
    console.error("Error al conectar a la base de datos:", error);
    console.error(
      "Asegúrate de que la base de datos esté en funcionamiento y que las credenciales sean correctas.",
    );
    return false;
  }
};

/**
 * Sincroniza los modelos de Sequelize con la base de datos.
 *
 * @param {boolean} [force=false] - Si es true, eliminará las tablas existentes y las volverá a crear.
 * @param {boolean} [alter=false] - Si es true, intentará modificar las tablas existentes para que coincidan con los modelos.
 *
 * Nota: `force` se usa típicamente en desarrollo; `alter` es más seguro para producción.
 */
const syncDatabase = async (force = false, alter = false) => {
  try {
    // Ejecuta la sincronización de los modelos contra la base de datos.
    // - `force: true` elimina y vuelve a crear las tablas.
    // - `alter: true` intenta ajustar las tablas existentes sin perder datos.
    await sequelize.sync({ force, alter });

    // Mostrar un mensaje diferente según la opción seleccionada.
    if (force) {
      // Se usó force: se recrearon las tablas.
      console.log("Modelos sincronizados con la base de datos correctamente.");
    } else if (alter) {
      // Se usó alter: se modificaron las tablas existentes para que coincidan con los modelos.
      console.log("Base de datos alterada según los modelos.");
    } else {
      // Sin force ni alter: solo se asegura que las tablas existan.
      console.log("Base de datos sincronizada correctamente.");
    }

    // La función retorna true cuando la sincronización se completa sin errores.
    return true;
  } catch (error) {
    // En caso de error, mostrar el mensaje y retornar false.
    console.error("Error al sincronizar la base de datos:", error.message);
    return false;
  }
};

// Exportar la instancia de Sequelize y las funciones de utilidad para uso en el resto de la aplicación.
module.exports = { sequelize, testConnection, syncDatabase };
