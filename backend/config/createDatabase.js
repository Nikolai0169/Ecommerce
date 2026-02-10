/**
 * Scipt de inicialización de la base de datos, este script se encargara de crear la base de datos si no existe, y luego sincronizar los modelos con la base de datos
 * Este script se ejecutara al iniciar el servidor, y se encargara de crear la base de datos si no existe, y luego sincronizar los modelos con la base de datos
 * Si la base de datos ya existe, simplemente sincronizara los modelos con la base de datos
 * Si la base de datos no existe, la creara y luego sincronizara los modelos con la base de datos
 * Este script es util para desarrollo, ya que permite crear la base de datos y las tablas automaticamente, pero no es recomendado para produccion
 * Debe ejecutarse solo una vez, ya que si se ejecuta varias veces, puede causar problemas de rendimiento y seguridad
 */

//importar mysql2 para crear la base de datos si no existe
const mysql = require("mysql2/promise");

//importar dotenv para cargar las variables de entorno
require("dotenv").config();

//Funcion para crear la base de datos si no existe
const createDatabase = async () => {
  try {
    //Crear una conexión a MySQL sin especificar la base de datos
    console.log("Intentando conectar a MySQL para crear la base de datos...\n");

    //conectar a MySQL sin especificar la base de datos
    console.log("Conectando a MySQL sin especificar la base de datos...\n");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });
    console.log("Conexión a MySQL establecida correctamente.\n");
    //Crear la base de datos si no existe
    const dbName = process.env.DB_NAME || "Ecommerce";
    console.log(`Creando la base de datos: ${dbName} \n`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`'${dbName}'\` creada/verficada exitosamente\n`,
    );

    //cerrar exitosamente
    await connection.end();

    console.log(
      "!Proceso completado¡ Ahora puedes iniciar el servidor con: npm start.\n",
    );
  } catch (error) {
    console.error("Error al crear la base de datos:", error.message);
    console.error("\nAsegúrate de que MySQL esté en funcionamiento y que las credenciales sean correctas.");
    console.error('XVerifica que');
    console.error('1. XAMPP esta corriendo');
    console.error('2. MySQL este iniciado en XAMPP');
    console.error('3. Las credenciales en el archivo .env sean correctas');

    if (connection) {
      await connection.end();
    }

    process.exit(1); // Salir con un código de error
}
};

//Ejecutar la función para crear la base de datos
createDatabase();