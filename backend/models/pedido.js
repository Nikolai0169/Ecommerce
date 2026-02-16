/**
 * Modelo de pedido
 * Define la estructura de la tabla "pedidos" y sus relaciones con otros modelos
 * almacena información sobre los pedidos realizados por los usuarios en la aplicación
 */

//importar DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

//Importar la instancia de Sequelize para definir el modelo
const sequelize = require("../config/database");

/**
 * Definir el modelo de pedido utilizando sequelize.define()
 * El primer argumento es el nombre del modelo (en singular), el segundo argumento es un objeto que define los campos y sus tipos de datos, y el tercer argumento es un objeto de opciones para configurar el modelo.
 * En este caso, se define un modelo llamado "Pedido" con los campos id (clave primaria, auto-incremental), usuarioId (clave foránea a la tabla usuarios) y estado (cadena de texto, no nulo).
 */

const pedido = sequelize.define(
  "pedido",
  {
    //campos de la tabla pedidos
    //Id Identificador único del pedido, es la clave primaria y se auto-incrementa
    id: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      primaryKey: true, //Clave primaria
      autoIncrement: true, //Auto-incremental
      allowNull: false, //No permite valores nulos
    },

    //UsuarioId ID del usuario que realizó el pedido
    usuarioId: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      allowNull: false, //No permite valores nulos
      references: {
        model: "Usuarios", //Referencia a la tabla de usuarios
        key: "id", //Clave foránea en la tabla de usuarios
      },
      onUpdate: "CASCADE", //Si se actualiza el ID del usuario, se actualiza el ID del pedido
      onDelete: "RESTRICT", //No se permite eliminar un usuario si tiene pedidos asociados
      validate: {
        notEmpty: {
          msg: "Debe especificar el ID del usuario del pedido", //Mensaje de error personalizado si se intenta crear un pedido sin ID de usuario
        },
      },
    },

    //Total del monto del pedido, se calcula a partir de los detalles del pedido (precio unitario * cantidad) y se guarda en la tabla de pedidos para mantener un registro del total pagado por el usuario al momento de realizar el pedido, esto permite tener un historial completo de los pedidos realizados por cada usuario y facilita la generación de reportes y estadísticas sobre las ventas realizadas en la aplicación.
    total: {
      type: DataTypes.DECIMAL(10, 2), //Tipo de dato decimal con 10 dígitos en total y 2 decimales
      allowNull: false, //No permite valores nulos
      validate: {
        isDecimal: {
          msg: "El total debe ser un número decimal", //Mensaje de error personalizado si se intenta crear un pedido sin total
        },
        min: {
          args: [0], //Valor mínimo del total
          msg: "El total no puede ser negativo", //Mensaje de error personalizado si se intenta crear un pedido con un total negativo
        },
      },
    },

    /**
     * Estado del pedido, puede ser "pendiente", "enviado", "entregado" o "cancelado"
     * Pendiente: El pedido ha sido creado pero aún no ha sido procesado ni enviado.
     * Pagado: El pedido ha sido pagado por el cliente pero aún no ha sido procesado ni enviado.
     * Enviado: El pedido ha sido procesado y enviado al cliente, pero aún no ha sido entregado.
     * Entregado: El pedido ha sido entregado al cliente.
     * Cancelado: El pedido ha sido cancelado por el cliente o por el administrador antes de ser enviado.
     * Este campo se utiliza para mantener un registro del estado actual del pedido, lo que permite a los usuarios y administradores de la aplicación saber si un pedido está pendiente de envío, ya ha sido enviado, ha sido entregado o ha sido cancelado, esto ayuda a mejorar la experiencia del usuario y facilita la gestión de los pedidos en la aplicación.
     */
    estado: {
      type: DataTypes.ENUM(
        "pendiente",
        "pagado",
        "enviado",
        "entregado",
        "cancelado",
      ), //Tipo de dato enumerado con los posibles estados del pedido
      allowNull: false, //No permite valores nulos
      defaultValue: "pendiente", //Valor por defecto del estado del pedido
      validate: {
        isIn: {
          args: [["pendiente", "pagado", "enviado", "entregado", "cancelado"]], //Los valores permitidos para el estado del pedido
        },
      },
    },

    //Dirección de envío del pedido, se guarda para mantener un registro de la dirección a la que se envió el pedido, esto permite tener un historial completo de los pedidos realizados por cada usuario y facilita la generación de reportes y estadísticas sobre las ventas realizadas en la aplicación.
    direccionEnvio: {
      type: DataTypes.TEXT, //Tipo de dato texto
      allowNull: false, //No permite valores nulos
      validate: {
        notEmpty: {
          msg: "Debe especificar la dirección de envío del pedido", //Mensaje de error personalizado si se intenta crear un pedido sin dirección de envío
        },
      },
    },

    //Telefono de contacto para el pedido, se guarda para mantener un registro del número de teléfono asociado al pedido, esto permite a los usuarios y administradores de la aplicación tener un medio de contacto para resolver cualquier problema o consulta relacionada con el pedido, y facilita la generación de reportes y estadísticas sobre las ventas realizadas en la aplicación.
    telefono: {
      type: DataTypes.STRING(20), //Tipo de dato cadena de texto con un máximo de 15 caracteres
      allowNull: false, //No permite valores nulos
      validate: {
        notEmpty: {
          msg: "Debe especificar el teléfono de contacto del pedido", //Mensaje de error personalizado si se intenta crear un pedido sin teléfono de contacto
        },
      },
    },

    //Notas adicionales para el pedido (opcional), se guarda para permitir a los usuarios agregar cualquier información adicional o instrucciones especiales relacionadas con el pedido, esto ayuda a mejorar la experiencia del usuario y facilita la gestión de los pedidos en la aplicación al proporcionar un espacio para que los usuarios puedan comunicar cualquier detalle relevante sobre su pedido.
    notas: {
      type: DataTypes.TEXT, //Tipo de dato texto
      allowNull: true, //Permite valores nulos
    },

    /**
     * ProductoID Id del producto en el pedido
     * Este campo se usa para mantener un registro del producto asociado al pedido, esto permite tener un historial completo de los productos pedidos por cada usuario y facilita la generación de reportes y estadísticas sobre las ventas realizadas en la aplicación.
     */
    productoId: {
      type: DataTypes.INTEGER, //Tipo de dato entero
      allowNull: false, //No permite valores nulos
      references: {
        model: "Productos", //Referencia a la tabla de productos
        key: "id", //Clave foránea en la tabla de productos
      },
      onUpdate: "CASCADE", //Si se actualiza el ID del producto, se actualiza el ID del pedido
      onDelete: "CASCADE", //Se elimina el producto del pedido
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
  },
  {
    // Opciones de modelo
    tableName: "carritos",
    timestamps: true,
    //indices para mejorar las busquedas
    indexes: [
      {
        fields: ["usuarioId"], //Índice para buscar carrito por usuario
      },

      {
        //Indice compuesto: Un usuario no puede tener el mismo producto duplicado
        unique: true,
        fields: ["usuarioId", "productoId"],
        name: "usuario_producto_unique",
      },
    ],
    /**
     * Hooks acciones automaticas que se ejecutan en ciertos momentos del ciclo de vida de un modelo, en este caso se define un hook "beforeUpdate" que se ejecuta antes de actualizar un registro de categoría, este hook verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos.
     */

    hooks: {
      /**
       * beforeCreate se ejecuta antes de crear un nuevo registro de categoría, este hook verifica si el campo "activo" está establecido en false (desactivado) y si es así, lanza un error para evitar que se creen categorías desactivadas, esto ayuda a mantener la integridad de los datos y evitar problemas con productos que pertenecen a subcategorías desactivadas.
       * verifica que la categoria no se cree con el campo "activo" establecido en false, lo que podría causar problemas de integridad de datos si se crean subcategorías o productos asociados a una categoría que ya está desactivada.
       */
      beforeCreate: async (itemcarrito) => {
        const producto = require("./producto");
        //Buscar el producto asociado a este item de carrito para verificar su estado
        const prducto = await producto.findByPk(itemcarrito.productoId);

        if (!prducto) {
          throw new Error(
            "El producto asociado a este item de carrito no existe", //Mensaje de error personalizado si se intenta crear un item de carrito con un producto que no existe
          );
        }

        if (!prducto.activo) {
          throw new Error(
            "No se puede crear un item de carrito para un producto desactivado", //Mensaje de error personalizado si se intenta crear un item de carrito para un producto que está desactivado
          );
        }

        if (!producto.hayStock(itemcarrito.cantidad)) {
          throw new Error(
            `Stock insuficiente, solo hay ${prducto.stock} unidades disponibles`, //Mensaje de error personalizado si se intenta crear un item de carrito con una cantidad que excede el stock disponible del producto
          );
        }

        //Guardar el precio unitario del producto al momento de agregarlo al carrito para mantener el precio aunque el producto cambie de precio en el futuro
        itemcarrito.precioUnitario = prducto.precio;
      },
      /**
       * beforeUpdate se ejecuta antes de actualizar un carrito, este hook verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos, esto ayuda a evitar problemas con productos que pertenecen a subcategorías desactivadas.
       * verifica si el campo "activo" ha cambiado a false (desactivado) y si es así, desactiva todas las subcategorías asociadas a esa categoría para mantener la integridad de los datos, esto ayuda a evitar problemas con productos que pertenecen a subcategorías desactivadas.
       * Si se activa una categoría (activo cambia a true), no se activan automáticamente las subcategorías o productos asociados, esto se deja a discreción del administrador para evitar activar subcategorías o productos que podrían no estar listos para ser activados.
       */
      BeforeUpdate: async (itemcarrito) => {
        //Verificar si el campo "cantidad" ha cambiado a false (desactivado)

        if (itemcarrito.changed("cantidad")) {
          const producto = require("./producto");
          const prducto = await producto.findByPk(itemcarrito.productoId);
          if (!prducto) {
            throw new Error(
              "El producto asociado a este item de carrito no existe", //Mensaje de error personalizado si se intenta actualizar un item de carrito con un producto que no existe
            );
          }

          if (!producto.hayStock(itemcarrito.cantidad)) {
            throw new Error(
              `Stock insuficiente, solo hay ${prducto.stock} unidades disponibles`, //Mensaje de error personalizado si se intenta actualizar un item de carrito con una cantidad que excede el stock disponible del producto
            );
          }
        }
      },
    },
  },
);

//METODOS DE INSTANCIA
/**
 * Método de instancia para obtener el número de subcategorías activas asociadas a esta categoría
 * @returns {number} - Subtotal de productos asociados a esta subcategoría (precio unitario * cantidad)
 */
carrito.prototype.calcularSubtotal = function () {
  return parseFloa(this.precioUnitario) * this.cantidad;
};

/**
 * Metodo para actualizar la cantidad de un item de carrito, este método verifica si el nuevo valor de cantidad es válido (un número entero mayor o igual a 1) y si hay suficiente stock disponible del producto asociado antes de actualizar la cantidad en el carrito, esto ayuda a mantener la integridad de los datos y evitar problemas con productos que podrían no tener suficiente stock para satisfacer la cantidad solicitada.
 * @param {number} nuevaCantidad - La nueva cantidad que se desea establecer para este item de carrito
 * @returns {Promise} Item actualizado con la nueva cantidad si la actualización fue exitosa, o un error si la nueva cantidad no es válida o si no hay suficiente stock disponible del producto asociado.
 */
carrito.prototype.actualizarCantidad = async function (nuevaCantidad) {
  const producto = require("./producto");

  const prducto = await producto.findByPk(this.productoId);

  if (!prducto.hayStock(nuevaCantidad)) {
    throw new Error(
      `Stock insuficiente, solo hay ${prducto.stock} unidades disponibles`,
    );
  }
  this.cantidad = nuevaCantidad;
  return await this.save();
};

/**
 * Metodo para obtener el carrito completo de un usuario, este método busca todos los items de carrito asociados al ID del usuario proporcionado, incluyendo la información del producto asociado a cada item de carrito, esto permite obtener una vista completa del carrito de compras de un usuario, incluyendo los detalles de cada producto agregado al carrito.
 * @param {number} usuarioId - El ID del usuario para el cual se desea obtener el carrito completo
 * @returns {Promise} Un array de items de carrito con la información del producto asociado a cada item, o un error si no se encuentra ningún item de carrito para el usuario proporcionado.
 */
carrito.obtenerCarritoUsuario = async function (usuarioId) {
  const producto = require("./producto");
  return await carrito.findAll({
    where: { usuarioId },
    include: [
      {
        model: producto,
        as: "producto",
      },
    ],
    order: [["createdAt", "DESC"]], //Ordenar por fecha de creación, el item más reciente primero
  });
};

/**
 * Metodo para calcular el total del carrito de un usuario, este método busca todos los items de carrito asociados al ID del usuario proporcionado, calcula el subtotal de cada item (precio unitario * cantidad) y luego suma todos los subtotales para obtener el total del carrito, esto permite obtener el monto total que el usuario tendría que pagar por los productos agregados a su carrito de compras.
 * @param {number} usuarioId - El ID del usuario para el cual se desea calcular el total del carrito
 * @returns {Promise<number>} El total del carrito calculado a partir de los items de carrito asociados al usuario, o un error si no se encuentra ningún item de carrito para el usuario proporcionado.
 */
carrito.calcularTotalCarrito = async function (usuarioId) {
  const items = await carrito.findAll({ where: { usuarioId } });

  let total = 0;
  for (const item of items) {
    total += item.calcularSubtotal(); //Suma el subtotal de cada item al total
  }
  return total;
};

/**
 * Metodo par vaciar el carrito de un usuario, este método elimina todos los items de carrito asociados al ID del usuario proporcionado, esto permite vaciar completamente el carrito de compras de un usuario, eliminando todos los productos que había agregado previamente.
 * @param {number} usuarioId - El ID del usuario para el cual se desea vaciar el carrito
 * @returns {Promise} Un mensaje de éxito si el carrito fue vaciado correctamente, o un error si no se encuentra ningún item de carrito para el usuario proporcionado.
 */
carrito.vaciarCarrito = async function (usuarioId) {
  return await carrito.destroy({ where: { usuarioId } });
};

//Exportar el modelo de carrito para ser utilizado en otras partes de la aplicación
module.exports = carrito;
