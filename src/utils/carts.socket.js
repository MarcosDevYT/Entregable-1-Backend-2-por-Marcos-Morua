// Funcionalidad para carritos

const cartsSocket = (io, socket, cm) => {
  // agregar un producto al carrito
  socket.on("addProductToCart", async (cartId, productId) => {
    try {
      await cm.addProductToCart(cartId, productId);
      const updatedProducts = await cm.getCartById(cartId);
      io.emit("cart", updatedProducts);
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // reducir la cantidad de un producto
  socket.on("reduceProductQuantity", async (cartId, productId) => {
    try {
      await cm.reduceProductQuantity(cartId, productId);
      const updatedProducts = await cm.getCartById(cartId);
      io.emit("cart", updatedProducts);
    } catch (error) {
      console.error("Error al reducir la cantidad de un producto:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // eliminar un producto del carrito
  socket.on("deleteProductFromCart", async (cartId, productId) => {
    try {
      await cm.deleteProductFromCart(cartId, productId);
      const updatedProducts = await cm.getCartById(cartId);
      io.emit("cart", updatedProducts);
    } catch (error) {
      console.error("Error al eliminar un producto del carrito:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // vaciar el carrito
  socket.on("clearCart", async (cartId) => {
    try {
      await cm.clearCart(cartId);
      const updatedProducts = await cm.getCartById(cartId);
      io.emit("cart", updatedProducts);
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      socket.emit("error", { message: error.message });
    }
  });
};

module.exports = cartsSocket;
