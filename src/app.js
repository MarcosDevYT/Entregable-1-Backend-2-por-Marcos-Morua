const connectDB = require("./config/db.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const initializePassport = require("./config/passport.config.js");
const cookieParser = require("cookie-parser");
const productRouter = require("./routes/products.router.js");
const cartRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const uploadsRouter = require("./routes/uploads.router.js");
const sessionsRouter = require("./routes/sessions.router.js");
const productosSocket = require("./utils/productos.socket.js");

const {
  ProductManager,
} = require("./controllers/productManager.controller.js");

const pm = new ProductManager("./src/data/products.json");

const express = require("express");
const path = require("path");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const handlebars = require("express-handlebars");

const PORT = 8080;

//
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//
// Sessions
app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://admin:SpO0UQulIAytIHZf@backenddb.wpmjknx.mongodb.net/ecommerce?retryWrites=true&w=majority",
      ttl: 3600,
    }),
    secret: "coderSecret",
    resave: false,
    saveUninitialized: false,
  })
);

//
// Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

//
// Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

//
// Static Routes
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

//
// Socket
io.on("connection", async (socket) => {
  console.log("Cliente conectado");

  // Manejar la conexion del socket
  try {
    // Obtener productos y enviarlos al cliente
    const products = await pm.getProducts();
    socket.emit("products", products);

    // Iniciar la funcionalidad de productos
    productosSocket(io, socket, pm);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    socket.emit("error", { message: "Error al cargar los productos" });
  }
});

//
// Routers
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/sessions", sessionsRouter);

//
// Views
app.use("/", viewsRouter);

//
// Server
connectDB()
  .then(() => {
    http.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
