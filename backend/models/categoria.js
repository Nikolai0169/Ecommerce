/**
 * Modelo de categoría para la base de datos utilizando Sequelize
 * Define la estructura de la tabla "categorias" y sus relaciones con otros modelos
 * almacena información sobre las categorías de productos en la aplicación
 */

//importar DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

//Importar la instancia de Sequelize para definir el modelo
const sequelize = require("../config/database");

/**
 * Definir el modelo de categoría utilizando sequelize.define()
 * El primer argumento es el nombre del modelo (en singular), el segundo argumento es un objeto que define los campos y sus tipos de datos, y el tercer argumento es un objeto de opciones para configurar el modelo.
 * En este caso, se define un modelo llamado "Categoria" con los campos id (clave primaria, auto-incremental), nombre (cadena de texto, no nulo) y descripcion (cadena de texto).
 */

const Categoria = sequelize.define(
  "Categoria",
  {
    //campos de la tabla categorias
    //Id Identificador único de la categoría, es la clave primaria y se auto-incrementa
    id: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      primaryKey: true, //Clave primaria
      autoIncrement: true, //Auto-incremental
      allowNull: false, //No permite valores nulos
    },

    //Nombre de la categoría, es una cadena de texto y no puede ser nulo
    nombre: {
      type: DataTypes.STRING(100), //Tipo de dato cadena de texto
      allowNull: false, //No permite valores nulos
      unique: {
        msg: "Ya existe una categoría con ese nombre", //Mensaje de error personalizado si se intenta crear una categoría con un nombre que ya existe
      },
      validate: {
        notEmpty: {
          msg: "El nombre de la categoría no puede estar vacío", //Mensaje de error personalizado si se intenta crear una categoría con un nombre vacío
        },
        len: {
          args: [2, 100], //El nombre debe tener entre 3 y 100 caracteres
          msg: "El nombre de la categoría debe tener entre 2 y 100 caracteres", //Mensaje de error personalizado si se intenta crear una categoría con un nombre que no cumple con la longitud requerida
        },
      },
    },

    //descripción de la categoría, es una cadena de texto y puede ser nula
    descripcion: {
      type: DataTypes.TEXT, //Tipo de dato cadena de texto
      allowNull: true, //Permite valores nulos
    },
    /**
     * Activo estado de la categoría, es un booleano que indica si la categoría está activa o no, por defecto es true
     * Este campo es útil para permitir a los administradores desactivar categorías sin eliminarlas de la base de datos, lo que puede ser útil para mantener la integridad de los datos y evitar problemas con productos que pertenecen a categorías desactivadas.
     * al igual que con las subcategorías, esto permite mantener la integridad de los datos y evitar problemas con productos que pertenecen a categorías desactivadas.
     */
    activo: {
      type: DataTypes.BOOLEAN, //Tipo de dato booleano
      allowNull: false, //No permite valores nulos
      defaultValue: true, //Valor por defecto es true (activa)
    },
  },
  {
    //Opciones del modelo
    tableName: "categorias", //Nombre de la tabla en la base de datos, se especifica para evitar que Sequelize pluralice el nombre del modelo (por defecto, Sequelize pluraliza los nombres de los modelos para crear las tablas, por ejemplo, el modelo "Categoria" se pluralizaría a "Categorias")
    timestamps: true, //Agrega automáticamente campos createdAt y updatedAt para registrar la fecha de creación y actualización de cada registro

    /**
     * Hooks acciones automaticas que se ejecutan en ciertos momentos del ciclo de vida de un modelo, en este caso se define un hook "beforeUpdate" que se ejecuta antes de actualizar un registro de categoría, este hook verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos.
     */
    hooks: {
      /**
       * AfterUpdate: Hook que se ejecuta después de actualizar un registro de categoría
       * si se desactiva una categoría (activo cambia a false), se desactivan todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos y evitar problemas con productos que pertenecen a subcategorías desactivadas.
       */
      afterUpdate: async (categoria, options) => {
        //Verificar si el campo "activo" ha cambiado a false (desactivado)
        if (categoria.changed("activo") && !categoria.activo) {
          try {
            console.log(
              `Categoría ${categoria.nombre} desactivada, desactivando subcategorías asociadas...`,
            );
            //Importar modelos (aqui para evitar dependencias circulares)
            const Subcategoria = require("./subcategoria");
            const Producto = require("./producto");
            //Paso 1>Desactivar todas las subcategorías asociadas a esta categoría
            const subcategorias = await Subcategoria.findAll({
              where: { categoriaId: categoria.id },
            });

            for (const subcategoria of subcategorias) {
              await subcategoria.update(
                { activo: false },
                { transaction: options.transaction },
              );
              console.log(`Subcategoría ${subcategoria.nombre} desactivada.`);
              //Paso 2 Desactivar todos los productos asociados a estas subcategorías
              const productos = await Producto.findAll({
                where: { categoriaId: categoria.id },
              });

              for (const producto of productos) {
                await producto.update(
                  { activo: false },
                  { transaction: options.transaction },
                );
                console.log(`Producto ${producto.nombre} desactivado.`);
              }
              console.log(
                `categoria ${categoria.nombre} desactivada, subcategorías y productos asociados desactivados.`,
              );
            }
          } catch (error) {
            console.error(
              `Error al desactivar subcategorías o productos asociados a la categoría ${categoria.nombre}:`,
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
 * Este método se puede utilizar para mostrar información adicional sobre la categoría en la interfaz de usuario, como el número de subcategorías activas que tiene cada categoría.
 * El método utiliza la función count de Sequelize para contar el número de subcategorías que tienen el campo "activo" establecido en true y que están asociadas a esta categoría a través del campo "categoriaId".
 * @returns {Promise<number>} El número de subcategorías activas asociadas a esta categoría
 */
Categoria.prototype.getNumeroSubcategoriasActivas = async function () {
    const Subcategoria = require("./subcategoria");
    return await Subcategoria.count({
        where: {
            categoriaId: this.id, //Contar solo las subcategorías asociadas a esta categoría
        }});
};

//Metodo para contar el número de productos activos asociados a esta categoría
/**
 * @returns {Promise<number>} El número de productos activos asociados a esta categoría
 */
Categoria.prototype.getNumeroSubcategoriasActivas = async function () {
    const Subcategoria = require("./subcategoria");
    return await Subcategoria.count({
        where: {
            categoriaId: this.id, //Contar solo los productos asociados a esta categoría
        }});
};