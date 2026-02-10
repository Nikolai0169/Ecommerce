/**CONFIGURACION DE LA BASE DE DATOS */

//Importamos Sequelize
const { Sequelize } = require("sequelize");

//Importamos dotenv para cargar las variables de entorno
require("dotenv").config();

//Creamos una instancia de Sequelize con la configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    //Configuracion de pool de conexiones
    //Mantiene
    pool: {
      max: 5, //Número máximo de conexiones en el pool
      min: 0, //Número mínimo de conexiones en el pool
      acquire: 30000, //Tiempo máximo (en ms) que el pool intentará obtener una conexión antes de lanzar un error
      idle: 10000, //Tiempo máximo (en ms) que una conexión puede estar inactiva antes de ser liberada
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false, //Solo mostrar logs en desarrollo

    //Zona horaria para evitar problemas con fechas
    timezone: "-05:00", //Ajusta esto según tu zona horaria

    //Opciones adicionales para mejorar la compatibilidad y el rendimiento
    define: {
      timestamps: true, //Agrega automáticamente campos createdAt y updatedAt
      underscored: false, //Usa snake_case para los nombres de columnas
      freezeTableName: true, //Evita que Sequelize pluralice los nombres de las tablas
    },
  },
);

/* Funcion para probar la conexión a la base de datos, esta funcion se llamara al iniciar el sv */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida correctamente.");
    return true; // Retorna true si la conexión es exitosa
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    console.error(
      "Asegúrate de que la base de datos esté en funcionamiento y que las credenciales sean correctas.",
    );
    return false; // Retorna false si la conexión falla
  }
};

/**Funcion para sincronizar los modelos con la base de datos */
/* Esta función creara las tablas automaticamente basandose en los modelos definidos */
/*@param {boolean} force - Si es true, eliminará las tablas existentes y las volverá a crear (útil para desarrollo, no recomendado para producción)*/
/*@param {boolean} alter - Si es true, intentará modificar las tablas existentes para que coincidan con los modelos (recomendado para producción)*/
const syncDatabase = async (force = false, alter = false) => {
  try {
    //sincroniza los modelos de la base de datos, si force es true, eliminará las tablas existentes y las volverá a crear, si alter es true, intentará modificar las tablas existentes para que coincidan con los modelos
    await sequelize.sync({ force, alter });
    if (force) {
      console.log("Modelos sincronizados con la base de datos correctamente.");
    } else if (alter) {
      console.log("Base de datos alterada segun los modelos");
    } else {
      console.log("Base de datos sincronizada correctamente");
    }

    return true;
  } catch (error) {
    console.error("Xerror al sincronizar la base de datos:", error.message);
    return false;
  }
};

//Exportamos la instancia de Sequelize, la función para probar la conexión y la función para sincronizar los modelos
module.exports = { sequelize, testConnection, syncDatabase };
