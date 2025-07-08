const Product = require("../models/product.model");
const {
  validatePostProduct,
  validatePutProduct,
} = require("../utils/validaciones.js");

class ProductManager {
  constructor(path) {
    this.Product = Product;
    this.path = path;
    this.id = 0;
  }

  // Function para generar un id autoincremental
  async generateId() {
    try {
      // Obtener todos los productos ordenados por _id numéricamente
      const products = await this.Product.find().sort({ _id: 1 });

      // Si no hay productos, empezamos con "0"
      if (products.length === 0) {
        return "0";
      }

      // Buscar el primer ID faltante en la secuencia
      for (let i = 0; i <= products.length; i++) {
        const idExists = products.some((p) => p._id === i.toString());
        if (!idExists) {
          return i.toString();
        }
      }

      // Si por alguna razón no encontramos hueco, usamos un timestamp
      return Date.now().toString();
    } catch (error) {
      console.error("Error generando ID:", error);
      // En caso de error, devolver un ID basado en timestamp
      return Date.now().toString();
    }
  }

  // Function para obtener todos los productos
  async getProducts(queryParams = {}) {
    const { limit = 10, page = 1, sort, query } = queryParams;

    // Filtro dinámico: si hay `query`, lo usamos como filtro genérico
    const filter = query
      ? {
          $or: [
            { category: query },
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { code: query },
          ],
        }
      : {};

    const sortOptions = sort ? { price: sort === "asc" ? 1 : -1 } : {};

    const result = await this.Product.paginate(filter, {
      limit,
      page,
      sort: sortOptions,
      lean: true,
    });

    const baseUrl = "/api/products";
    const buildLink = (targetPage) =>
      `${baseUrl}?page=${targetPage}&limit=${limit}${
        query ? `&query=${query}` : ""
      }${sort ? `&sort=${sort}` : ""}`;

    return {
      status: "success",
      payload: result.docs,
      limit: limit,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
    };
  }

  // Funcion para buscar el producto por id
  async getProductById(id) {
    try {
      const product = await this.Product.findById(id);

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      return product;
    } catch (error) {
      // Si hay error, lo lanzamos
      throw new Error("Error al buscar el producto: " + error.message);
    }
  }

  // Function para agregar un producto
  async addProduct(product) {
    try {
      // Verificar si ya existe un producto con el mismo código
      const existingProduct = await this.Product.findOne({
        code: product.code,
      });
      if (existingProduct) {
        throw new Error("El código del producto ya existe");
      }

      // Validar el producto
      validatePostProduct(product);

      // Generar un id autoincremental
      const id = await this.generateId();
      product._id = id;

      // Crear y guardar el nuevo producto
      const newProduct = new this.Product(product);
      await newProduct.save();

      return newProduct;
    } catch (error) {
      throw new Error("Error al agregar el producto: " + error.message);
    }
  }

  // Function para actualizar un producto
  async updateProduct(id, product) {
    try {
      // validar los campos a actualizar
      const validateTrue = validatePutProduct(product);

      if (validateTrue) {
        // Actualizamos el producto en el array
        await this.Product.updateOne({ _id: id }, product);
        // Guardamos el array actualizado en el archivo
        console.log("Producto actualizado correctamente: ", product);
      }
    } catch (error) {
      // Si hay error, lo lanzamos
      throw new Error("Error al actualizar el producto: " + error.message);
    }
  }

  // Function para eliminar un producto
  async deleteProduct(id) {
    try {
      // Guardamos el array actualizado en el archivo
      await this.Product.deleteOne({ _id: id });
    } catch (error) {
      // Si hay error, lo lanzamos
      throw new Error("Error al eliminar el producto: " + error.message);
    }
  }
}

module.exports = { ProductManager };
