/**
 * Modelo de subcategoría para la base de datos utilizando Sequelize
 * Define la estructura de la tabla "subcategorias" y sus relaciones con otros modelos
 * almacena información sobre las subcategorías de productos en la aplicación
 */

//importar DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

//Importar la instancia de Sequelize para definir el modelo
const sequelize = require("../config/database");

/**
 * Definir el modelo de subcategoría utilizando sequelize.define()
 * El primer argumento es el nombre del modelo (en singular), el segundo argumento es un objeto que define los campos y sus tipos de datos, y el tercer argumento es un objeto de opciones para configurar el modelo.
 * En este caso, se define un modelo llamado "Subcategoria" con los campos id (clave primaria, auto-incremental), nombre (cadena de texto, no nulo) y descripcion (cadena de texto).
 */

const Subcategoria = sequelize.define(
  "Subcategoria",
  {
    //campos de la tabla subcategorias
    //Id Identificador único de la subcategoría, es la clave primaria y se auto-incrementa
    id: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      primaryKey: true, //Clave primaria
      autoIncrement: true, //Auto-incremental
      allowNull: false, //No permite valores nulos
    },

    //Nombre de la subcategoría, es una cadena de texto y no puede ser nulo
    nombre: {
      type: DataTypes.STRING(100), //Tipo de dato cadena de texto
      allowNull: false, //No permite valores nulos
      unique: {
        msg: "Ya existe una subcategoría con ese nombre", //Mensaje de error personalizado si se intenta crear una subcategoría con un nombre que ya existe
      },
      validate: {
        notEmpty: {
          msg: "El nombre de la subcategoría no puede estar vacío", //Mensaje de error personalizado si se intenta crear una subcategoría con un nombre vacío
        },
        len: {
          args: [2, 100], //El nombre debe tener entre 3 y 100 caracteres
          msg: "El nombre de la subcategoría debe tener entre 2 y 100 caracteres", //Mensaje de error personalizado si se intenta crear una subcategoría con un nombre que no cumple con la longitud requerida
        },
      },
    },

    //descripción de la subcategoría, es una cadena de texto y puede ser nula
    descripcion: {
      type: DataTypes.TEXT, //Tipo de dato cadena de texto
      allowNull: true, //Permite valores nulos
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
        const Producto = require("./Producto");

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
