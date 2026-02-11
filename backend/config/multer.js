/**
 * Cfiguracion de subida de archivos con multer
 * Multer es un middleware de Node.js para manejar la subida de archivos en aplicaciones Express.
 * Permite procesar archivos enviados a través de formularios HTML y almacenarlos en el servidor.
 * En este archivo se configura multer para almacenar los archivos subidos en una carpeta específica
 * y se exporta la configuración para ser utilizada en otras partes de la aplicación.
 * Este archivo configura como y donde se guardan las imagenes subidas por el usuario, en este caso se guardan en la carpeta 'uploads' y se les asigna un nombre unico utilizando la fecha actual y el nombre original del archivo.
 */

//Importar multer para manejar la subida de archivos
const multer = require("multer");

//Importar path para manejar rutas de archivos
const path = require("path");

//Importar fs para verificar / crear directorios
const fs = require("fs");

//Importar dotenv para cargar variables de entorno
require("dotenv").config();

//Obtener la ruta de almacenamiento de archivos donde se guardan los archivos subidos, se obtiene de la variable de entorno UPLOADS_FOLDER o se asigna un valor por defecto 'uploads'
const uploadPath = process.env.UPLOADS_FOLDER || "./uploads";

//Verificar si la carpeta de uploads existe, si no existe se crea
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(`Carpeta de uploads creada en: ${uploadPath}`);
}

/**
 * Configurar el almacenamiento de multer
 * Define donde y como se guardarán los archivos subidos
 * El destino es la carpeta definida en uploadPath
 * El nombre del archivo se genera utilizando la fecha actual y el nombre original del archivo para asegurar que sea único
 */

const storage = multer.diskStorage({
  /**
   * DEstination: Define la carpeta donde se guardarán los archivos subidos
   * @param {Object} req - Obejeto de la solicitud HTTP
   * @param {Object} file - Archivo que esta subiendo
   * @param {Function} cb - Función de callback que se llama con (error, destination) para indicar el destino del archivo
   */
  destination: function (req, file, cb) {
    // cb(null, ruta (uploads) -> sin error, ruta de destino = uploadPath (carpeta de destino))
    cb(null, uploadPath);
  },

  /**
   * Filename: Define el nombre del archivo que se guardará en el servidor
   * formato: fechaActual-nombreOriginal.ext
   * @param {Object} req - Obejeto de la solicitud HTTP
   * @param {Object} file - Archivo que esta subiendo
   * @param {Function} cb - Función de callback que se llama con (error, filename) para indicar el nombre del archivo
   */
  filename: function (req, file, cb) {
    //Generar un nombre unico utilizando la fecha actual y el nombre original del archivo
    //Date.now() devuelve el número de milisegundos transcurridos desde el 1 de enero de 1970, lo que garantiza que cada archivo tenga un nombre único basado en el momento en que se sube.
    //path.extname() extrae la extensión del archivo original para mantener el formato correcto (por ejemplo, .jpg, .png, etc.)
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

/**
 * Filtro para validar el tipo de archivo que se está subiendo
 * Solo se permiten archivos de imagen (jpg, jpeg, png, gif)
 * @param {Object} req - Obejeto de la solicitud HTTP
 * @param {Object} file - Archivo que esta subiendo
 * @param {Function} cb - Función de callback que se llama con (error, boolean) para indicar si el archivo es válido o no
 */
const fileFilter = (req, file, cb) => {
  //Tipo mime permitidos para imagenes
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image.gif",
  ];

  //verificar si el tipo de atchivo esta en la lista permitida
  if (allowedMimeTypes.incluides(file.allowedMimeTypes)) {
    //cb (null, true) -> aceptar archivo
    cb(null, true);
  } else {
    //cb(error) -> rechazar archivo
    cb(new Error("Solo se permiten imagenes (jpg, jpeg, png, gif"), false);
  }
};

/**
 * configurar multer con las opciones defniidas
 */

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    //Limite del tamaño del archivo en bytes
    //por defecto 5MB (5 * 1024) 5242800 bytes
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242800,
  },
});

/**
 * Funcion para eliminar archivos del servidor
 * Util cuando se elimina un producto o se actualiza la imagen de un producto, es necesario eliminar la imagen anterior del servidor para evitar acumular archivos innecesarios
 * @param {String} filePath - Ruta del archivo a eliminar
 * @returns {boolean} - Retorna true si el archivo se eliminó correctamente, false si hubo un error
 */

const deleteFile = (filePath) => {
  try {
    //Constreuir la ruta completa del archivo a eliminar
    const filePath = path.join(uploadPath, filename);

    //verificar si el archivo existe antes de intentar eliminarlo
    if (fs.existsSync(filePath)) {
      //Eliminar el archivo utilizando fs.unlinkSync() que elimina el archivo de forma síncrona
      fs.unlinkSync(filePath);
      console.log(`Archivo eliminado: ${filePath}`);
      return true;
    } else {
      console.warn(`Archivo no encontrado para eliminar: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error("Error al eliminar el archivo:", error.message);
    return false;
  }
};

//Exportar la configuración de multer y la función de eliminación de archivos para ser utilizada en otras partes de la aplicación
module.exports = {
  upload,
  deleteFile,
};
