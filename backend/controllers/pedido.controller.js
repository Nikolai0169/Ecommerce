/**
 * Controlador de pedidos
 * gestion de pedidos
 * requiere autenticacion
 */

//importar el modelo de carrito
const Pedido = require("../models/pedido");
const DetallePedido = require("../models/detallePedido");
const Carrito = require("../models/carrito");
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");
const Categoria = require("../models/categoria");
const Subcategoria = require("../models/subcategoria");

/**
 * Crear pedido desde el carrito
 * POST /api/cliente/pedidos
 * @param {Object} req request express con req.usuario del middleware de autenticacion
 * @param res
 * @returns
 */

const crearPedido = async (req, res) => {
    const { sequelize } = require("../config/database");
    const t = await sequelize.transaction();

    try {
        const { direccionEnvio, telefono, metodoPago = 'efectivo', notasAdicionales } = req.body;
    
        //Validacion 1: direccion requerida
        if (!direccionEnvio || direccionEnvio.trim() === '') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "La direccion de envio es obligatoria",
            });
        }

        //Validacion 2: telefono requerido
        if (!telefono || telefono.trim() === '') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "El telefono es obligatorio",
            });
        }

        //Validacion 3: metodo de pago requerido
        const metodosValidos = ['efectivo', 'tarjeta', 'transferencia'];
        if (!metodosValidos.includes(metodoPago)) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `metodo de pago invalido. Los metodos validos son: ${metodosValidos.join(', ')} `,
            });
        }

        //obtener items del carrito
        const carritoItems = await Carrito.findAll({
            where: { usuarioId: req.usuario.id },
            include: [
                {
                    model: Producto,
                    as: 'producto',
                    attributes: ['id', 'nombre', 'precio', 'stock', 'activo'],
                },
            ],
            transaction: t,
        });

        if (itemsCarrito.length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "El carrito esta vacio",
            });
        }
} catch (error) {
    await t.rollback();
    console.error("Error al crear el pedido", error);
    res.status(500).json({
        success: false,
        message: "Error al crear el pedido",
        error: error.message,
    });
}
};