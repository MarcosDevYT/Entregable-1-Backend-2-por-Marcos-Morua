const { Router } = require("express");
const {
  ProductManager,
} = require("../controllers/productManager.controller.js");
const { CartManager } = require("../controllers/cartManager.controller.js");
const {
  authenticateJWT,
  checkExistingSession,
} = require("../middlewares/auth.middleware.js");

const pm = new ProductManager("./src/data/products.json");
const cm = new CartManager("./src/data/carts.json");
const viewsRouter = Router();

// Rutas públicas para login y registro
viewsRouter.get("/login", checkExistingSession, (req, res) => {
  const error = req.query.error;
  res.render("login", { error });
});

viewsRouter.get("/register", checkExistingSession, (req, res) => {
  const error = req.query.error;
  res.render("register", { error });
});

// Rutas protegidas
viewsRouter.get("/", authenticateJWT, async (req, res) => {
  res.redirect("/products"); // Redirigir a la vista de productos
});

viewsRouter.get("/products", authenticateJWT, async (req, res) => {
  const queryParams = req.query;
  const products = await pm.getProducts(queryParams);
  res.render("home", { products, user: req.user, cartId: req.user.cart });
});

viewsRouter.get("/realtimeproducts", authenticateJWT, async (req, res) => {
  const products = await pm.getProducts();
  res.render("realTimeProducts", {
    products,
    user: req.user,
    cartId: req.user.cart,
  });
});

viewsRouter.get("/products/:id", authenticateJWT, async (req, res) => {
  const productId = req.params.id;
  const product = await pm.getProductById(productId);
  res.render("product", { product, user: req.user, cartId: req.user.cart });
});

viewsRouter.get("/cart/:id", authenticateJWT, async (req, res) => {
  // obtenemos el id del carrito y el usuario
  const cartId = req.params.id;
  const user = req.user;

  // obtenemos el carrito y el id del carrito del usuario
  const cartResult = await cm.getCartById(cartId);
  const userCartId = user.cart;

  if (cartResult === userCartId) {
    const result = await pm.getProducts();
    const productsResult = result.payload;
    const products = productsResult.filter((product) =>
      cartResult.products.some((cartProduct) => cartProduct._id === product._id)
    );
    const cartProducts = products.map((product) => {
      const cartProduct = cartResult.products.find(
        (p) => p._id === product._id
      );
      return { ...product, quantity: cartProduct.quantity };
    });
    const cart = { id: cartResult._id, products: cartProducts };
    res.render("cart", { cart, user: req.user, cartId: cartId });
  } else {
    res.status(401).send("No tienes acceso a este carrito");
  }
});

viewsRouter.get("/profile", authenticateJWT, (req, res) => {
  res.render("profile", { user: req.user });
});

module.exports = viewsRouter;
