const Cart = require("../models/cart.model");
const { ProductManager } = require("./productManager.controller.js");

const pm = new ProductManager("");

class CartManager {
  constructor(path) {
    this.Cart = Cart;
    this.path = path;
  }

  // Funcion para obtener todos los carritos
  async getCarts() {
    try {
      // Obtenemos los carritos existentes
      const carts = await this.Cart.find();

      // Si tenemos carritos, los retornamos
      return carts;
    } catch (error) {
      // Si el archivo no existe, lanzamos un error
      throw new Error("Error al buscar los carritos: ", error);
    }
  }

  // Funcion para buscar el carrito por id
  async getCartById(id) {
    try {
      // Obtenemos los carritos existentes
      const carts = await this.Cart.find();

      // Buscamos el carrito por id
      const cart = carts.find((cart) => cart._id.toString() === id);

      // Si no existe, lanzamos un error
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      return cart;
    } catch (error) {
      // Si ocurre un error en el proceso, lo lanzamos
      throw new Error("Error al obtener el carrito: " + error.message);
    }
  }

  // Funcion para crear un carrito con el array vacio de productos
  async createCart() {
    try {
      // Creamos el nuevo carrito
      const newCart = {
        products: [],
      };

      // Guardamos el nuevo carrito en el archivo
      const result = await this.Cart.create(newCart);

      return result;
    } catch (error) {
      // Si ocurre un error en el proceso, lo lanzamos
      throw new Error("Error al crear el carrito: " + error.message);
    }
  }

  // Funcion para agregar un producto al carrito
  async addProductToCart(cartId, productId) {
    try {
      console.log("ID del producto", productId);

      // Buscar el carrito por id
      const cart = await this.getCartById(cartId);

      // Verificar si el producto existe
      const product = await pm.getProductById(productId);

      console.log("Producto encontrado", product);

      // Buscar si el producto ya está en el carrito
      const prodIndex = cart.products.findIndex((p) => p._id === product.id);

      if (prodIndex !== -1) {
        // Si ya está, incrementar la cantidad
        cart.products[prodIndex].quantity += 1;
      } else {
        // Si no está, agregarlo con cantidad 1 y solo el id
        cart.products.push({ _id: product.id, quantity: 1 });
      }

      // Guardar el carrito actualizado
      await this.Cart.updateOne({ _id: cart._id }, cart);

      return cart;
    } catch (error) {
      // Si no existe el carrito, lanzamos un error
      if (error.message.includes("Carrito no encontrado")) {
        throw new Error("Carrito no encontrado");
      }

      // Si no existe el producto, lanzamos un error
      if (error.message.includes("Producto no encontrado")) {
        throw new Error("Error al encontrar el producto: " + error.message);
      }

      // Si ocurre otro error, lo lanzamos
      throw new Error(
        "Error al agregar un producto al carrito: " + error.message
      );
    }
  }

  // Funcion para eliminar un producto del carrito
  async deleteProductFromCart(cartId, productId) {
    try {
      // Buscar el carrito por id
      const cart = await this.getCartById(cartId);

      // Buscar si el producto está en el carrito
      const prodIndex = cart.products.findIndex((p) => p._id === productId);

      if (prodIndex !== -1) {
        // Si está, eliminarlo
        cart.products.splice(prodIndex, 1);
      }

      // Guardar el carrito actualizado
      await this.Cart.updateOne({ _id: cart._id }, cart);
      return cart;
    } catch (error) {
      // Si no existe el carrito, lanzamos un error
      if (error.message.includes("Carrito no encontrado")) {
        throw new Error("Carrito no encontrado");
      }

      // Si ocurre otro error, lo lanzamos
      throw new Error(
        "Error al eliminar un producto del carrito: " + error.message
      );
    }
  }

  // Funcion para reducir la cantidad de un producto
  async reduceProductQuantity(cartId, productId) {
    try {
      // Buscar el carrito por id
      const cart = await this.getCartById(cartId);

      // Buscar si el producto está en el carrito
      const prodIndex = cart.products.findIndex((p) => p._id === productId);

      if (prodIndex !== -1) {
        // Si está, reducir la cantidad
        cart.products[prodIndex].quantity -= 1;

        // Si la cantidad es 0, eliminar el producto
        if (cart.products[prodIndex].quantity <= 0) {
          await this.deleteProductFromCart(cartId, productId);
        }
      }

      // Guardar el carrito actualizado
      await this.Cart.updateOne({ _id: cart._id }, cart);
      return cart;
    } catch (error) {
      // Si no existe el carrito, lanzamos un error
      if (error.message.includes("Carrito no encontrado")) {
        throw new Error("Carrito no encontrado");
      }

      // Si ocurre otro error, lo lanzamos
      throw new Error(
        "Error al reducir la cantidad de un producto: " + error.message
      );
    }
  }

  // Funcion para vaciar todo el carrito
  async clearCart(cartId) {
    try {
      // Buscar el carrito por id
      const cart = await this.getCartById(cartId);

      // Vaciar el carrito
      cart.products = [];

      // Guardar el carrito actualizado
      await this.Cart.updateOne({ _id: cart._id }, cart);
      return cart;
    } catch (error) {
      // Si no existe el carrito, lanzamos un error
      if (error.message.includes("Carrito no encontrado")) {
        throw new Error("Carrito no encontrado");
      }

      // Si ocurre otro error, lo lanzamos
      throw new Error("Error al vaciar el carrito: " + error.message);
    }
  }

  // Funcion para eliminar un carrito
  async deleteCart(cartId) {
    try {
      // Buscar el carrito por id
      const cart = await this.getCartById(cartId);

      // Eliminar el carrito
      await this.Cart.deleteOne({ _id: cart._id });
      return cart;
    } catch (error) {
      // Si no existe el carrito, lanzamos un error
      if (error.message.includes("Carrito no encontrado")) {
        throw new Error("Carrito no encontrado");
      }

      // Si ocurre otro error, lo lanzamos
      throw new Error("Error al eliminar el carrito: " + error.message);
    }
  }
}

module.exports = { CartManager };
