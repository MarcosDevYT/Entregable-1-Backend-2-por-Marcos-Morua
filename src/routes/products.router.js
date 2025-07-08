const { Router } = require("express");
const {
  ProductManager,
} = require("../controllers/productManager.controller.js");

const productRouter = Router();
const pm = new ProductManager();

// Obtener todos los productos
productRouter.get("/", async (req, res) => {
  try {
    const result = await pm.getProducts(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Obtener producto por ID
productRouter.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await pm.getProductById(pid);
    res.json({
      message: `Producto #${pid} obtenido correctamente`,
      product,
    });
  } catch (error) {
    if (error.message.includes("Producto no encontrado")) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(500).json({
      message: "Error al obtener el producto",
      error: error.message,
    });
  }
});

// Crear nuevo producto
productRouter.post("/", async (req, res) => {
  try {
    const product = req.body;
    await pm.addProduct(product);
    res.status(201).json({ message: "Producto agregado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al agregar el producto",
      error: error.message,
    });
  }
});

// Actualizar producto por ID
productRouter.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = req.body;
    await pm.updateProduct(pid, product);
    res
      .status(200)
      .json({ message: `Producto #${pid} actualizado correctamente` });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el producto",
      error: error.message,
    });
  }
});

// Eliminar producto por ID
productRouter.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    await pm.deleteProduct(pid);
    res
      .status(200)
      .json({ message: `Producto #${pid} eliminado correctamente` });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el producto",
      error: error.message,
    });
  }
});

module.exports = productRouter;
