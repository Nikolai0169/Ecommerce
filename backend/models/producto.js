/**
 * Modelo de producto para la base de datos utilizando Sequelize
 * Define la estructura de la tabla "productos" y sus relaciones con otros modelos
 * almacena información sobre los productos en la aplicación
 */

//importar DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

//Importar la instancia de Sequelize para definir el modelo
const sequelize = require("../config/database");

/**
 * Definir el modelo de producto utilizando sequelize.define()
 * El primer argumento es el nombre del modelo (en singular), el segundo argumento es un objeto que define los campos y sus tipos de datos, y el tercer argumento es un objeto de opciones para configurar el modelo.
 * En este caso, se define un modelo llamado "Producto" con los campos id (clave primaria, auto-incremental), nombre (cadena de texto, no nulo) y descripcion (cadena de texto).
 */

const producto = sequelize.define(
  "Producto",
  {
    //campos de la tabla productos
    //Id Identificador único del producto, es la clave primaria y se auto-incrementa
    id: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      primaryKey: true, //Clave primaria
      autoIncrement: true, //Auto-incremental
      allowNull: false, //No permite valores nulos
    },

    //Nombre de la subcategoría, es una cadena de texto y no puede ser nulo
    nombre: {
      type: DataTypes.STRING(200), //Tipo de dato cadena de texto
      allowNull: false, //No permite valores nulos
      validate: {
        notEmpty: {
          msg: "El nombre del producto no puede estar vacío", //Mensaje de error personalizado si se intenta crear un producto con un nombre vacío
        },
        len: {
          args: [2, 200], //El nombre debe tener entre 2 y 200 caracteres
          msg: "El nombre del producto debe tener entre 2 y 200 caracteres", //Mensaje de error personalizado si se intenta crear un producto con un nombre que no cumple con la longitud requerida
        },
      },
    },

    //descripción del producto, es una cadena de texto y puede ser nula
    descripcion: {
      type: DataTypes.TEXT, //Tipo de dato cadena de texto
      allowNull: true, //Permite valores nulos
    },

    //Precio del producto, es un número decimal con dos decimales y no puede ser nulo
    precio: {
      type: DataTypes.DECIMAL(10, 2), //Tipo de dato decimal con 10 dígitos en total y 2 decimales
      allowNull: false, //No permite valores nulos
      validate: {
        isDecimal: {
          msg: "El precio del producto debe ser un número decimal válido", //Mensaje de error personalizado si se intenta crear un producto con un precio que no es un número decimal válido
        },
        min: {
          args: [0], //El precio debe ser mayor o igual a 0
          msg: "El precio del producto no puede ser negativo", //Mensaje de error personalizado si se intenta crear un producto con un precio negativo
        },
      },
    },

    //Stock del producto, es la cantidad de productos disponibles en inventario, en numeros enteros
    stock: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      allowNull: false, //No permite valores nulos
      defaultValue: 0, //Valor por defecto es 0 (sin stock)
      validate: {
        isInt: {
          msg: "El stock del producto debe ser un número entero válido", //Mensaje de error personalizado si se intenta crear un producto con un stock que no es un número entero válido
        },
        min: {
          args: [0], //El precio debe ser mayor o igual a 0
          msg: "El stock del producto no puede ser negativo", //Mensaje de error personalizado si se intenta crear un producto con un stock negativo
        },
      },
    },

    /**
     * imagen: Nombre del archivo de imagen del producto, es una cadena de texto que puede ser nula, se utiliza para almacenar el nombre del archivo de la imagen del producto que se sube a través de la API, esta información es útil para mostrar la imagen del producto en la interfaz de usuario y para gestionar las imágenes en el servidor.
     * Almacenar solo el nombre del archivo en la base de datos en lugar de la ruta completa o la URL de la imagen tiene varias ventajas, como facilitar la gestión de las imágenes en el servidor, permitir cambios en la estructura de almacenamiento sin afectar a la base de datos, mejorar la seguridad al no exponer rutas completas o URLs, y simplificar las consultas a la base de datos al almacenar solo el nombre del archivo.
     * ejemplo: producto-12345.jpg
     * la ruta seria uploads/producto-12345.jpg, pero solo se almacena producto-12345.jpg en la base de datos, esto permite cambiar la estructura de almacenamiento de las imágenes sin afectar a la base de datos, por ejemplo, si se decide almacenar las imágenes en una carpeta diferente o en un servicio de almacenamiento en la nube, no sería necesario actualizar la base de datos para reflejar estos cambios.
     */
    imagen: {
      type: DataTypes.STRING(255), //Tipo de dato cadena de texto con un máximo de 255 caracteres
      allowNull: true, //Permite valores nulos, ya que no todos los productos pueden tener una imagen asociada
      validate: {
        is: {
          args: /\.(jpg|jpeg|png|gif)$/i, //Expresión regular para validar que el nombre del archivo tenga una extensión de imagen válida (jpg, jpeg, png o gif)
          msg: "El nombre del archivo de imagen debe tener una extensión válida (jpg, jpeg, png o gif)", //Mensaje de error personalizado si se intenta crear un producto con un nombre de archivo de imagen que no tiene una extensión válida
        },
      },
    },

    /**
     * CategoriaId es una clave foránea que hace referencia a la categoría a la que pertenece esta subcategoría, es un entero que no puede ser nulo
     * Esta relación es importante para mantener la integridad de los datos y permitir consultas eficientes para obtener las subcategorías asociadas a una categoría específica.
     */

    subcategoriaId: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      allowNull: false, //No permite valores nulos
      references: {
        model: "subcategorias", //Nombre de la tabla a la que hace referencia
        key: "id", //Nombre de la clave primaria de la tabla a la que hace referencia
      },
      onUpdate: "CASCADE", //Si se actualiza el id de la categoría, se actualiza automáticamente en esta tabla
      onDelete: "CASCADE", //Si se elimina la categoría, se eliminan automáticamente las subcategorías asociadas a esa categoría
      validate: {
        notNull: {
          msg: "La subcategoría debe pertenecer a una categoría", //Mensaje de error personalizado si se intenta crear una subcategoría sin especificar una categoría
        },
      },
    },

    /**
     * Activo estado de la subcategoría, es un booleano que indica si la subcategoría está activa o no, por defecto es true
     * Este campo es útil para permitir a los administradores desactivar subcategorías sin eliminarlas de la base de datos, lo que puede ser útil para mantener la integridad de los datos y evitar problemas con productos que pertenecen a subcategorías desactivadas.
     */
    activo: {
      type: DataTypes.BOOLEAN, //Tipo de dato booleano
      allowNull: false, //No permite valores nulos
      defaultValue: true, //Valor por defecto es true (activa)
    },
  },

  {
    //Opciones del modelo
    tableName: "productos", //Nombre de la tabla en la base de datos, se especifica para evitar que Sequelize pluralice el nombre del modelo (por defecto, Sequelize pluraliza los nombres de los modelos para crear las tablas, por ejemplo, el modelo "subcategoria" se pluralizaría a "subcategorias")
    timestamps: true, //Agrega automáticamente campos createdAt y updatedAt para registrar la fecha de creación y actualización de cada registro

    /**
     * Indices compuestos para mejorar el rendimiento de las consultas, en este caso se define un índice único compuesto por los campos "nombre" y "categoriaId" para garantizar que no existan subcategorías con el mismo nombre dentro de la misma categoría, esto ayuda a mantener la integridad de los datos y evitar confusiones al tener subcategorías con nombres idénticos en diferentes categorías.
     */
    indexes: [
      {
        //Indice para buscar productos por nombre dentro de una subcategoría
        fields: ["subcategoriaId"], //Campos que forman el índice compuesto
      },
      {
        //Indice compesto para garantizar que no existan productos con el mismo nombre dentro de la misma subcategoría
        //Permite que existan productos con el mismo nombre en diferentes subcategorías, pero no permite que existan productos con el mismo nombre dentro de la misma subcategoría

        unique: true, //El índice es único, lo que significa que no se permiten valores duplicados para la combinación de los campos "nombre" y "subcategoriaId"
        fields: ["categoriaId"], //Campos que forman el índice compuesto
      },
      {
        //indice para buscar productos activos dentro de una subcategoría
        fields: ["activo"], //Campos que forman el índice compuesto
      },
      {
        //Indice para buscar productos por nombre
        fields: ["nombre"], //Campos que forman el índice compuesto
      },
    ],

    /**
     * Hooks acciones automaticas que se ejecutan en ciertos momentos del ciclo de vida de un modelo, en este caso se define un hook "beforeUpdate" que se ejecuta antes de actualizar un registro de categoría, este hook verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos.
     */
    hooks: {
      /**
       * BeforeCreate se ejecuta antes de crear un nuevo registro de producto, este hook verifica que la subcategoría a la que pertenece el producto esté activa antes de permitir la creación del producto, esto ayuda a mantener la integridad de los datos y evitar problemas con productos asociados a subcategorías desactivadas.
       * Si la subcategoría está desactivada, se lanza un error y no se permite crear el producto, esto es importante para evitar problemas de integridad de datos y garantizar que los productos solo se asocien a subcategorías activas.
       * Este hook también verifica que la categoría a la que pertenece la subcategoría esté activa, para evitar problemas de integridad de datos con productos asociados a categorías desactivadas.
       * verifica que la categoria no se cree con el campo "activo" establecido en false, lo que podría causar problemas de integridad de datos si se crean subcategorías o productos asociados a una categoría que ya está desactivada.
       */
      beforeCreate: async (producto) => {
        const categoria = require("./categoria");
        const subcategoria = require("./subcategoria");

        //Buscar la categoría asociada a esta subcategoría para verificar su estado
        const categoria = await Categoria.findByPk(producto.categoriaId);

        if (!categoria) {
          throw new Error(
            "La categoría asociada a este producto no existe", //Mensaje de error personalizado si se intenta crear un producto con una categoría que no existe
          );
        }

        if (!categoria.activo) {
          throw new Error(
            "No se puede crear un producto para una categoría desactivada", //Mensaje de error personalizado si se intenta crear un producto para una categoría que está desactivada
          );
        }

        //Buscar la subcategoría padre
        const subcategoria = await subcategoria.findByPk(
          producto.subcategoriaId,
        );

        if (!subcategoria) {
          throw new Error(
            "La subcategoría asociada a este producto no existe", //Mensaje de error personalizado si se intenta crear un producto con una subcategoría que no existe
          );
        }

        if (!subcategoria.activo) {
          throw new Error(
            "No se puede crear un producto para una subcategoría desactivada", //Mensaje de error personalizado si se intenta crear un producto para una subcategoría que está desactivada
          );
        }

        //validar que la subcategoria pertenece a una categoria activa
        if (subcategoria.categoriaId !== categoria.id) {
          throw new Error(
            "La subcategoría asociada a este producto no pertenece a la categoría especificada", //Mensaje de error personalizado si se intenta crear un producto con una subcategoría que no pertenece a la categoría especificada
          );
        }
      },

      /**
       * BeforeDestroy se ejecuta antes de eliminar un registro de producto, este hook verifica que la subcategoría a la que pertenece el producto esté activa antes de permitir la eliminación del producto, esto ayuda a mantener la integridad de los datos y evitar problemas con productos asociados a subcategorías desactivadas.
       * Si la subcategoría está desactivada, se lanza un error y no se permite eliminar el producto, esto es importante para evitar problemas de integridad de datos y garantizar que los productos solo se eliminen cuando estén asociados a subcategorías activas.
       * Este hook también verifica que la categoría a la que pertenece la subcategoría esté activa, para evitar problemas de integridad de datos con productos asociados a categorías desactivadas.
       * elimina la imagen del producto del servidor si el producto se elimina, esto es importante para evitar acumular archivos de imagen huérfanos en el servidor que ya no están asociados a ningún producto.
       */
      beforeDestroy: async (producto) => {
        if (producto.imagen) {
          const { deleteFile } = require("../config/multer");
          //intenta eliminar la imagen del producto del servidor, si ocurre un error durante la eliminación, se captura y se muestra un mensaje de error en la consola, pero no se lanza un error para evitar interrumpir el proceso de eliminación del producto
          const eliminado = await deleteFile(producto.imagen);
          if (!eliminado) {
            console.log(`Imagen eliminada: ${producto.imagen}`);
          }
        }
      },
    },
  },
);

//METODOS DE INSTANCIA
/**
 * Método de instancia para obtener la url completa de la imagen del producto, este método construye la URL completa de la imagen del producto utilizando el nombre del archivo almacenado en la base de datos y la ruta de almacenamiento de las imágenes en el servidor, esto es útil para mostrar la imagen del producto en la interfaz de usuario sin tener que almacenar la URL completa en la base de datos.
 * @returns {string|null} La URL completa de la imagen del producto o null si no tiene imagen
 */

producto.prototype.obtenerUrlImagen = function () {
  if (this.imagen) {
    return null; //Construir la URL completa de la imagen utilizando la ruta de almacenamiento y el nombre del archivo, por ejemplo: http://localhost:3000/uploads/producto-12345.jpg
  }

  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5000"; //Obtener la URL base del servidor desde las variables de entorno o usar un valor por defecto
  return `${baseUrl}/uploads/${this.imagen}`; //Construir la URL completa de la imagen utilizando la URL base, la ruta de almacenamiento y el nombre del archivo, por ejemplo: http://localhost:5000/uploads/producto-12345.jpg
};

/**
 * metodo para verificar si el producto está en stock, este método devuelve true si el stock del producto es mayor que 0, lo que indica que el producto está disponible para la venta, y devuelve false si el stock es 0 o menor, lo que indica que el producto no está disponible para la venta.
 * Este método es útil para mostrar información sobre la disponibilidad del producto en la interfaz de usuario y para gestionar el inventario de productos en la aplicación.
 * @param {number} cantidad - La cantidad que se desea verificar si está en stock suficiente
 * @returns {boolean} true si el producto está en stock, false si no lo está
 */
producto.prototype.HayStock = function (cantidad = 3) {
  return this.stock >= cantidad; //Devuelve true si el stock del producto es mayor o igual a la cantidad especificada, lo que indica que el producto está disponible para la venta, y devuelve false si el stock es menor que la cantidad especificada, lo que indica que el producto no está disponible para la venta.
};

/**
 * Metodo para reducir el stock del producto, este método se utiliza para reducir la cantidad de stock disponible de un producto después de realizar una venta, por ejemplo, si se vende una cantidad de 3 unidades de un producto, este método se puede llamar para reducir el stock del producto en 3 unidades, lo que ayuda a mantener el inventario actualizado y evitar vender productos que no están disponibles.
 * util para gestionar el inventario de productos en la aplicación y garantizar que el stock de los productos se mantenga actualizado después de cada venta.
 * @param {number} cantidad - La cantidad que se desea reducir del stock del producto
 * @returns {Promise<producto>} El producto actualizado con el nuevo stock reducido
 */
producto.prototype.reducirStock = async function (cantidad) {
    if (this.HayStock(cantidad)) {
        throw new Error(`No hay suficiente stock para reducir la cantidad de ${cantidad} unidades del producto ${this.nombre}`); //Mensaje de error personalizado si se intenta reducir el stock en una cantidad mayor a la disponible
    }
    this.stock -= cantidad; //Reducir el stock del producto en la cantidad especificada
    await this.save(); //Guardar los cambios en la base de datos
};

/**
 * Metodo para aumentar el stock del producto, este método se utiliza para aumentar la cantidad de stock disponible de un producto después de recibir una nueva entrega o devolución, por ejemplo, si se recibe una nueva entrega de 10 unidades de un producto, este método se puede llamar para aumentar el stock del producto en 10 unidades, lo que ayuda a mantener el inventario actualizado y garantizar que los productos estén disponibles para la venta.
 * util para gestionar el inventario de productos en la aplicación y garantizar que el stock de los productos se mantenga actualizado después de cada entrega o devolución.
 * @param {number} cantidad - La cantidad que se desea aumentar del stock del producto
 * @return {Promise<producto>} El producto actualizado con el nuevo stock aumentado
 */

/**
 * Metodo para obtener la categoria a la que pertenece esta subcategoría, se define como un método de instancia para facilitar su uso en otras partes de la aplicación, por ejemplo, al mostrar los detalles de una subcategoría en la interfaz de usuario.
 * @returns {Promise<Categoria>} La categoría a la que pertenece esta subcategoría
 */
subcategoria.prototype.obtenerCategoria = async function () {
  const Categoria = require("./categoria");
  return await Categoria.findByPk(this.categoriaId); //Buscar la categoría asociada a esta subcategoría utilizando su clave foránea "categoriaId"
};

//Exportar el modelo de subcategoría para que pueda ser utilizado en otras partes de la aplicación
module.exports = producto;
