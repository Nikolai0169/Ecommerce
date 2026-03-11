/**
 * Script de inicialización de la base de datos.
 *
 * Este archivo se ejecuta al iniciar el servidor y se encarga de:
 *  1) Conectarse al servidor MySQL sin seleccionar una base de datos.
 *  2) Crear la base de datos especificada en el archivo .env (si no existe).
 *
 * Este comportamiento es útil en desarrollo, pero no se recomienda para producción
 * porque hace cambios automáticos en la infraestructura de la base de datos.
 */

// Importar mysql2 (promises) para poder usar async/await con las conexiones a MySQL.
const mysql = require("mysql2/promise");

// Cargar las variables de entorno desde el archivo .env (DB_HOST, DB_USER, etc.).
require("dotenv").config();

// Función asíncrona que crea la base de datos si no existe.
const createDatabase = async () => {
  // Se declara la variable de conexión en el ámbito superior para poder cerrarla en el bloque catch.
  let connection;

  try {
    // Mensaje informativo para saber que el proceso ha comenzado.
    console.log("Intentando conectar a MySQL para crear la base de datos...\n");

    // Crear una conexión a MySQL sin especificar la base de datos.
    // Esto permite ejecutar el comando CREATE DATABASE.
    console.log("Conectando a MySQL sin especificar la base de datos...\n");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost", // Host de la base de datos.
      port: process.env.DB_PORT || 3306, // Puerto de MySQL (por defecto 3306).
      user: process.env.DB_USER || "root", // Usuario de MySQL.
      password: process.env.DB_PASSWORD || "", // Contraseña de MySQL.
    });

    // Confirmación de que la conexión se estableció correctamente.
    console.log("Conexión a MySQL establecida correctamente.\n");
    //Crear la base de datos si no existe
    const dbName = process.env.DB_NAME || "Ecommerce";
    console.log(`Creando la base de datos: ${dbName} \n`);

    // Ejecutar la consulta SQL para crear la base de datos si no existe.
    // NOTA: El nombre de la base de datos se delimita con backticks (`) para soportar nombres con caracteres especiales.
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

    // Cerrar la conexión a MySQL cuando ya no se necesite.
    await connection.end();

    // Mensaje final indicando que el proceso se completó con éxito.
    console.log(
      "¡Proceso completado! Ahora puedes iniciar el servidor con: npm start.\n",
    );
  } catch (error) {
    // Mostrar el mensaje de error para facilitar la depuración.
    console.error("Error al crear la base de datos:", error.message);

    // Mensajes adicionales con posibles causas y pasos de verificación.
    console.error(
      "\nAsegúrate de que MySQL esté en funcionamiento y que las credenciales sean correctas.",
    );
    console.error("Verifica que:");
    console.error("1. XAMPP esté corriendo.");
    console.error("2. MySQL esté iniciado en XAMPP.");
    console.error("3. Las credenciales en el archivo .env sean correctas.");

    // Cerrar la conexión si se estableció antes del error.
    if (connection) {
      await connection.end();
    }

    // Salir del proceso con código 1 para indicar que hubo un error.
    process.exit(1);
  }
};

// Ejecutar la función principal de creación de la base de datos.
createDatabase();
