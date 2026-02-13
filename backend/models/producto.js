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

const Producto = sequelize.define(
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

    categoriaId: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      allowNull: false, //No permite valores nulos
      references: {
        model: "categorias", //Nombre de la tabla a la que hace referencia
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
    tableName: "subcategorias", //Nombre de la tabla en la base de datos, se especifica para evitar que Sequelize pluralice el nombre del modelo (por defecto, Sequelize pluraliza los nombres de los modelos para crear las tablas, por ejemplo, el modelo "Subcategoria" se pluralizaría a "Subcategorias")
    timestamps: true, //Agrega automáticamente campos createdAt y updatedAt para registrar la fecha de creación y actualización de cada registro

    /**
     * Indices compuestos para mejorar el rendimiento de las consultas, en este caso se define un índice único compuesto por los campos "nombre" y "categoriaId" para garantizar que no existan subcategorías con el mismo nombre dentro de la misma categoría, esto ayuda a mantener la integridad de los datos y evitar confusiones al tener subcategorías con nombres idénticos en diferentes categorías.
     */
    indexes: [
      {
        //Indice para buscar subcategorías por nombre dentro de una categoría
        fields: ["nombre", "categoriaId"], //Campos que forman el índice compuesto
      },
      {
        //Indice compesto para garantizar que no existan subcategorías con el mismo nombre dentro de la misma categoría
        //Permite que existan subcategorías con el mismo nombre en diferentes categorías, pero no permite que existan subcategorías con el mismo nombre dentro de la misma categoría
        unique: true, //El índice es único, lo que significa que no se permiten valores duplicados para la combinación de los campos "nombre" y "categoriaId"
        fields: ["nombre", "categoriaId"], //Campos que forman el índice compuesto
        name: "nombre_categoria_unique", //Nombre del índice, se especifica para facilitar su identificación en la base de datos y en los mensajes de error cuando se viola la restricción de unicidad
      },
    ],

    /**
     * Hooks acciones automaticas que se ejecutan en ciertos momentos del ciclo de vida de un modelo, en este caso se define un hook "beforeUpdate" que se ejecuta antes de actualizar un registro de categoría, este hook verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos.
     */
    hooks: {
      /**
       * BeforeCreate se ejecuta antes de crear un nuevo registro de categoría, este hook verifica si el campo "activo" está establecido en false (desactivado) y si es así, lanza un error para evitar que se creen categorías desactivadas, esto ayuda a mantener la integridad de los datos y evitar problemas con productos que pertenecen a subcategorías desactivadas.
       * verifica que la categoria no se cree con el campo "activo" establecido en false, lo que podría causar problemas de integridad de datos si se crean subcategorías o productos asociados a una categoría que ya está desactivada.
       */
      beforeCreate: async (subcategoria) => {
        const Categoria = require("./categoria");
        //Buscar la categoría asociada a esta subcategoría para verificar su estado
        const categoria = await Categoria.findByPk(subcategoria.categoriaId);

        if (!categoria) {
          throw new Error(
            "La categoría asociada a esta subcategoría no existe", //Mensaje de error personalizado si se intenta crear una subcategoría con una categoría que no existe
          );
        }

        if (!categoria.activo) {
          throw new Error(
            "No se puede crear una subcategoría para una categoría desactivada", //Mensaje de error personalizado si se intenta crear una subcategoría para una categoría que está desactivada
          );
        }
      },
      /**
       * AfterUpdate se ejecuta después de actualizar un registro de categoría, este hook verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos.
       * si se desactiva una categoría, se desactivan automáticamente todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos y evitar problemas con productos que pertenecen a subcategorías desactivadas. Esto se hace en un hook "afterUpdate" para asegurarse de que la categoría ya esté actualizada antes de intentar desactivar las subcategorías asociadas.
       */
      afterUpdate: async (subcategoria, options) => {
        //Verificar si el campo "activo" ha cambiado a false (desactivado)

        //Importar modelos (aqui para evitar dependencias circulares)
        const Producto = require("./producto");

        if (subcategoria.changed("activo") && !subcategoria.activo) {
          try {
            //Paso 1>Desactivar todas las subcategorías asociadas a esta categoría
            const productos = await Producto.findAll({
              where: { subcategoriaId: subcategoria.id },
            });

            for (const producto of productos) {
              await producto.update(
                { activo: false },
                { transaction: options.transaction },
              );
              console.log(`Producto ${producto.nombre} desactivado.`);
            }
            console.log(`Subcategoría y productos asociados desactivados.`);
          } catch (error) {
            console.error(
              `Error al desactivar productos asociados a la subcategoría:`,
              error.message,
            );
            throw error; //Re-lanzar el error para que se maneje en la capa superior (controlador)
          }
        }

        //Si se activa una categoría (activo cambia a true), no se activan automáticamente las subcategorías o productos asociados, esto se deja a discreción del administrador para evitar activar subcategorías o productos que podrían no estar listos para ser activados.
      },
    },
  },
);

//METODOS DE INSTANCIA
/**
 * Método de instancia para obtener el número de subcategorías activas asociadas a esta categoría
 * @returns {Promise<number>} El número de productos activos asociados a esta subcategoría
 */
subcategoria.prototype.contarproductos = async function () {
  const Subcategoria = require("./subcategoria");
  return await Subcategoria.count({
    where: {
      subcategoriaId: this.id, //Contar solo los productos asociados a esta subcategoría
    },
  });
};

/**
 * Metodo para obtener la categoria a la que pertenece esta subcategoría, se define como un método de instancia para facilitar su uso en otras partes de la aplicación, por ejemplo, al mostrar los detalles de una subcategoría en la interfaz de usuario.
 * @returns {Promise<Categoria>} La categoría a la que pertenece esta subcategoría
 */
subcategoria.prototype.obtenerCategoria = async function () {
  const Categoria = require("./categoria");
  return await Categoria.findByPk(this.categoriaId); //Buscar la categoría asociada a esta subcategoría utilizando su clave foránea "categoriaId"
};

//Exportar el modelo de subcategoría para que pueda ser utilizado en otras partes de la aplicación
module.exports = subcategoria;
