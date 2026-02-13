/**
 * Modelo de carrito para la base de datos utilizando Sequelize
 * Define la estructura de la tabla "carritos" y sus relaciones con otros modelos
 * almacena información sobre los carritos de compras de los usuarios en la aplicación
 */

//importar DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

//Importar la instancia de Sequelize para definir el modelo
const sequelize = require("../config/database");
const { table, timeStamp } = require("console");

/**
 * Definir el modelo de categoría utilizando sequelize.define()
 * El primer argumento es el nombre del modelo (en singular), el segundo argumento es un objeto que define los campos y sus tipos de datos, y el tercer argumento es un objeto de opciones para configurar el modelo.
 * En este caso, se define un modelo llamado "Categoria" con los campos id (clave primaria, auto-incremental), nombre (cadena de texto, no nulo) y descripcion (cadena de texto).
 */

const Carrito = sequelize.define(
    "Carrito",
    {
        //campos de la tabla carritos
        //Id Identificador único del carrito, es la clave primaria y se auto-incrementa
        id: {
            type: DataTypes.INTEGER, //Tipo de dato entero
            primaryKey: true, //Clave primaria
            autoIncrement: true, //Auto-incremental
            allowNull: false, //No permite valores nulos
        },

        //UsuarioId ID del usuario dueño del carrito
        usuarioId: {
            type: DataTypes.INTEGER, //Tipo de dato entero
            allowNull: false, //No permite valores nulos
            references: {
                model: "Usuarios", //Referencia a la tabla de usuarios
                key: "id", //Clave foránea en la tabla de usuarios
            },
            onUpdate: "CASCADE", //Si se actualiza el ID del usuario, se actualiza el ID del carrito
            onDelete: "CASCADE", //Si se elimina el usuario, se elimina el carrito
            validate: {
                notEmpty: {
                    msg: "Debe especificar el ID del usuario del carrito", //Mensaje de error personalizado si se intenta crear un carrito sin ID de usuario
                },

            },
        },

        // ProductoID Id del producto en el carrito
        productoId: {
            type: DataTypes.INTEGER, //Tipo de dato entero
            allowNull: false, //No permite valores nulos
            references: {
                model: "Productos", //Referencia a la tabla de productos
                key: "id", //Clave foránea en la tabla de productos
            },
            onUpdate: "CASCADE", //Si se actualiza el ID del producto, se actualiza el ID del carrito
            onDelete: "CASCADE", //Se elimina el producto del carrito
            validate: {
                notEmpty: {
                    msg: "Debe especificar un producto del carrito", //Mensaje de error personalizado si se intenta crear un carrito sin ID de producto
                },

            },
        },

        // Cantidad de este producto en el carrito
        cantidad: {
            type: DataTypes.INTEGER, //Tipo de dato entero
            allowNull: false, //No permite valores nulos
            defaultValue: 1, //Valor por defecto de la cantidad
            validate: {
                isInt: {
                    msg: "La cantidad debe ser un número entero", //Mensaje de error personalizado si se intenta crear un carrito sin cantidad
                },
                min: {
                    args: [1], //Valor mínimo de la cantidad
                    msg: "La cantidad debe ser al menos 1", //Mensaje de error personalizado si se intenta crear un carrito con una cantidad menor a 1
                },
            },
        },

        /**
         * Precio unitario del producto al momento de agregarlo al carrito
         * se guarda para mantener el precio aunque el producto cambie de precio en el futuro
         */
        precioUnitario: {
            type: DataTypes.DECIMAL(10, 2), //Tipo de dato decimal con 10 dígitos en total y 2 decimales
            allowNull: false, //No permite valores nulos
            validate: {
                isDecimal: {
                    msg: "El precio unitario debe ser un número decimal", //Mensaje de error personalizado si se intenta crear un carrito sin precio unitario
                },
                min: {
                    args: [0], //Valor mínimo del precio unitario
                    msg: "El precio unitario debe ser mayor o igual a 0", //Mensaje de error personalizado si se intenta crear un carrito con un precio unitario negativo
                },
            },
        },

    }, {
    // Opciones de modelo
    tableName: 'carritos',
    timestamps: true,
    //indices para mejorar las busquedas
    indexes: [
        {
            fields: ['usuarioId'], //Índice para buscar carrito por usuario
        },

        {//Indice compuesto: Un usuario no puede tener el mismo producto duplicado
            unique: true,
            fields: ['usuarioId', 'productoId'],
            name: 'usuario_producto_unique'
        }

    ]
        /**
     * Hooks acciones automaticas que se ejecutan en ciertos momentos del ciclo de vida de un modelo, en este caso se define un hook "beforeUpdate" que se ejecuta antes de actualizar un registro de categoría, este hook verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos.
     */
    hooks: {
      /**
       * beforeCreate se ejecuta antes de crear un nuevo registro de categoría, este hook verifica si el campo "activo" está establecido en false (desactivado) y si es así, lanza un error para evitar que se creen categorías desactivadas, esto ayuda a mantener la integridad de los datos y evitar problemas con productos que pertenecen a subcategorías desactivadas.
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
       * afterUpdate se ejecuta después de actualizar un registro de categoría, este hook verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos.
       * si se desactiva una categoría, se desactivan automáticamente todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos y evitar problemas con productos que pertenecen a subcategorías desactivadas. Esto se hace en un hook "afterUpdate" para asegurarse de que la categoría ya esté actualizada antes de intentar desactivar las subcategorías asociadas.
       */
      afterUpdate: async (subcategoria, options) => {
        //Verificar si el campo "activo" ha cambiado a false (desactivado)

        //Importar modelos (aqui para evitar dependencias circulares)
        const producto = require("./producto");

        if (subcategoria.changed("activo") && !subcategoria.activo) {
          try {
            //Paso 1>Desactivar todas las subcategorías asociadas a esta categoría
            const productos = await producto.findAll({
              where: { subcategoriaId: subcategoria.id },
            });

            for (const producto of productos) {
              await producto.update(
                { activo: false },
                { transaction: options.transaction },
              );
              console.log(`producto ${producto.nombre} desactivado.`);
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
  const producto = require("./producto");
  return await producto.count({
    where: {
      subcategoriaId: this.id, //Contar solo los productos asociados a esta subcategoría
    },
  });
};

}
)