/**
 * Asociaciones entre modelos
 * este archivo define todas las relaciones entre los modelos de sequelize
 * debe ejecutarse despies de importar los modelos
 */

//importar todos los modelos

const usuario = require("./usuario.js");
const categoria = requiere("./categoria.js");
const carrito = require("./carrito.js");
const subcategoria = require("./subcategoria.js");
const producto = require("./producto.js");
const pedido = require("./pedido.js");
const detallePedido = require("./detallePedido.js");

/**
 * definir asocioaciones
 * tipos de relaciones sequeelize
 * hasone 1 - 1
 * belongsto 1 - 1
 * hasmany 1 - N
 * belongstomany N - N
 */

/**
 * categoria - subcategoria
 * una categoria tiene muchas subcategorias
 */

categoria.hasMany(subcategoria, {
  foreignKey: "categoriaId", // campo que conecta las tablas
  as: "subcategorias", // alias para la relacion
  onDelete: "CASCADE", //si se elimina la categoria eliminar la subcategoria
  onUpdate: "CASCADE",
});

/**
 * subcategoria - categoria
 * una subcategoria pertenece a una categoria
 */
subcategoria.belongsTo(categoria, {
  foreignKey: "categoriaId", // campo que conecta las tablas
  as: "categoria", // alias para la relacion
  onDelete: "CASCADE", //si se elimina la subcategoria eliminar la categoria
  onUpdate: "CASCADE",
});

/**
 * categoria - producto
 * una categoria tiene muchos productos
 */

categoria.hasMany(producto, {
  foreignKey: "categoriaId", // campo que conecta las tablas
  as: "productos", // alias para la relacion
  onDelete: "CASCADE", //si se elimina la categoria eliminar el producto
  onUpdate: "CASCADE",
});

/**
 * producto - categoria
 * un producto pertenece a una categoria
 */

producto.belongsTo(categoria, {
  foreignKey: "categoriaId", // campo que conecta las tablas
  as: "categoria", // alias para la relacion
  onDelete: "CASCADE", //si se elimina la categoria eliminar la subcategoria
  onUpdate: "CASCADE", // si se actualiza la categoria se actualiza la subcategoria
});

/**
 * subcategoria - producto
 * una subcategoria tiene muchos productos
 */

subcategoria.hasMany(producto, {
  foreignKey: "subcategoriaId", // campo que conecta las tablas
  as: "productos", // alias para la relacion
  onDelete: "CASCADE", //si se elimina la subcategoria eliminar el producto
  onUpdate: "CASCADE", // si se actualiza la subcategoria se actualiza el producto
});

producto.belongsTo(subcategoria, {
  foreignKey: "subcategoriaId", // campo que conecta las tablas
  as: "subcategoria", // alias para la relacion
  onDelete: "CASCADE", //si se elimina la subcategoria eliminar el producto
  onUpdate: "CASCADE", // si se actualiza la subcategoria se actualiza el producto
});

/**
 * usuario - carrito
 * un usuario tiene muchos carritos
 * un carrito pertenece a un usuario
 */
usuario.hasMany(carrito, {
  foreignKey: "usuarioId", // campo que conecta las tablas
  as: "carrito", // alias para la relacion
  onDelete: "CASCADE", //si se elimina el usuario eliminar el carrito
  onUpdate: "CASCADE", // si se actualiza el usuario se actualiza el carrito
});
