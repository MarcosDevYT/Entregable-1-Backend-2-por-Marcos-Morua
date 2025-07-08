// Funcionalidad para productos

const productosSocket = (io, socket, pm) => {
  // Manejar la creación de nuevos productos
  socket.on("newProduct", async (product) => {
    try {
      await pm.addProduct(product);
      const updatedProducts = await pm.getProducts();
      io.emit("products", updatedProducts);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // Manejar la edicion de productos
  socket.on("editProduct", async (product) => {
    try {
      await pm.updateProduct(product.productId, product.productData);
      const updatedProducts = await pm.getProducts();
      io.emit("products", updatedProducts);
    } catch (error) {
      console.error("Error al editar producto:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // Manejar la eliminacion de productos
  socket.on("deleteProduct", async (productId) => {
    try {
      await pm.deleteProduct(productId);
      const updatedProducts = await pm.getProducts();
      io.emit("products", updatedProducts);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // Manejar la busqueda de productos
  socket.on("search", async (query) => {
    try {
      const products = await pm.getProducts({ query });
      io.emit("products", products);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // Manejar la paginacion de productos
  socket.on("paginate", async (page, limit, query) => {
    try {
      // Verificar si hay query
      if (query) {
        // Verificar si hay limit
        if (limit) {
          // Si hay query y limit pedimos para devolver los productos con los filtros
          const products = await pm.getProducts({ page, limit, query });
          io.emit("products", products);
          return;
        }

        // Si no hay limit pedimos para devolver los productos con page y query
        const products = await pm.getProducts({ page, query });
        io.emit("products", products);
        return;
      }

      // Verificar si hay limit
      if (limit) {
        const products = await pm.getProducts({ page, limit });
        io.emit("products", products);
        return;
      }

      // Si no hay query ni limit pedimos para devolver los productos con page
      const products = await pm.getProducts({ page });
      io.emit("products", products);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // Manejar el limite de productos
  socket.on("limit", async (limit, query) => {
    try {
      // Verificar si hay query
      if (query) {
        // Si hay query pedimos para devolver los productos con los filtros
        const products = await pm.getProducts({ limit, query });
        io.emit("products", products);
        return;
      }

      // Si no hay query pedimos para devolver los productos con limit
      const products = await pm.getProducts({ limit });
      io.emit("products", products);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      socket.emit("error", { message: error.message });
    }
  });
};

module.exports = productosSocket;
