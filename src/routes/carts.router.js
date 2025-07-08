const { Router } = require("express");
const { CartManager } = require("../controllers/cartManager.controller.js");

const cartRouter = Router();
const cm = new CartManager("./src/data/cart.json");

// Ruta para obtener todos los carritos
cartRouter.get("/", async (req, res) => {
  try {
    const carts = await cm.getCarts();
    res.json({
      message: "Carritos obtenidos correctamente",
      carts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los carritos",
      error: error.message,
    });
  }
});

// Ruta para obtener el carrito por el id
cartRouter.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cm.getCartById(cid);
    res.json({
      message: `Carrito #${cid} obtenido correctamente`,
      cart,
    });
  } catch (error) {
    if (error.message.includes("Carrito no encontrado")) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.status(500).json({
      message: "Error al obtener el carrito",
      error: error.message,
    });
  }
});

// Ruta para crear un carrito
cartRouter.post("/", async (req, res) => {
  try {
    const newCart = await cm.createCart();
    res.status(201).json({
      message: `Carrito creado con el id:${newCart.id}`,
      cart: newCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el carrito",
      error: error.message,
    });
  }
});

// Ruta para agregar un producto al carrito
cartRouter.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    await cm.addProductToCart(cid, pid);
    res
      .status(201)
      .json({ message: `Producto #${pid} agregado al carrito #${cid}` });
  } catch (error) {
    if (error.message.includes("Carrito no encontrado")) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    } else if (error.message.includes("Producto no encontrado")) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(500).json({
      message: "Error al agregar el producto al carrito",
      error: error.message,
    });
  }
});

// Ruta para eliminar un producto del carrito
cartRouter.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    await cm.deleteProductFromCart(cid, pid);
    res
      .status(201)
      .json({ message: `Producto #${pid} eliminado del carrito #${cid}` });
  } catch (error) {
    if (error.message.includes("Carrito no encontrado")) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    } else if (error.message.includes("Producto no encontrado")) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(500).json({
      message: "Error al eliminar el producto del carrito",
      error: error.message,
    });
  }
});

// Ruta para reducir la cantidad de un producto
cartRouter.put("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    await cm.reduceProductQuantity(cid, pid);
    res.status(201).json({
      message: `Cantidad del producto #${pid} reducida en el carrito #${cid}`,
    });
  } catch (error) {
    if (error.message.includes("Carrito no encontrado")) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    } else if (error.message.includes("Producto no encontrado")) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(500).json({
      message: "Error al reducir la cantidad del producto",
      error: error.message,
    });
  }
});

// Ruta para vaciar todo el carrito
cartRouter.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    await cm.clearCart(cid);
    res.status(201).json({ message: `Carrito #${cid} vaciado correctamente` });
  } catch (error) {
    if (error.message.includes("Carrito no encontrado")) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.status(500).json({
      message: "Error al vaciar el carrito",
      error: error.message,
    });
  }
});

// Ruta para Eliminar
cartRouter.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    await cm.deleteCart(cid);
    res
      .status(201)
      .json({ message: `Carrito #${cid} eliminado correctamente` });
  } catch (error) {
    if (error.message.includes("Carrito no encontrado")) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.status(500).json({
      message: "Error al eliminar el carrito",
      error: error.message,
    });
  }
});

module.exports = cartRouter;
