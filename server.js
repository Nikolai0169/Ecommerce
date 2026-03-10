/**
 * SERVIDOR PRIMCIPAL PARA EL BACKEND
 * este es el archivo principal del backend, se utiliza para configurar el servidor y exportarlo para ser utilizado en otras partes de la aplicacion
 * configura express y el servidor, exporta el servidor para ser utilizado en otras partes de la aplicacion
 */

//Importar express
const express = require("express");

// importar cors
const cors = require("cors");

// importar path
const path = require("path");

// Importar dotenv
require ('dotenv').config();

//importar configuración de base de datos
const dbConfig = require('./backend/config/database');

//importar modelos y asociaciones
const { initAssociations } = require("./backend/models");

//Importar seeders
const { runseeders } = require('./seeders/adminseeder');

//crear aplicacion express
const app = express();

//Obtener el puerto desde la variable de entorno
const PORT = process.env.PORT || 3000;

//MIDDLWARE GLOBALES
//cors permite peticiones desde el frontend
//configura los dominios que pueden hacer peticiones a la api
app.use(cors({
    origin: ['http://localhost:3001'], // dominios permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // metodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // cabeceras permitidas
    credentials: true// permite cookies
}))

/**
 * express.json() es un middleware que permite parsear el body de las peticiones
 * a json
 */

app.use(express.json());

/**
 * express.urlencoded() es un middleware que permite parsear el body de las peticiones
 * a urlencoded
 * las imagenes estaran disponibles en req.files
 */

app.use(express.urlencoded({ extended: true }));

/**
 * servir archivos estaticos
 * los archivos estaticos estan en la carpeta raiz
 */

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//middleware para logging de peticiones
//Muestra en consola la peticion que se esta realizando
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`ok ${req.method} ${req.path}`);
        next();
    });
}