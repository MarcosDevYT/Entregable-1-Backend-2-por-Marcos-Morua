const cm = require("../controllers/cartManager.controller.js");
const passport = require("passport");
const local = require("passport-local");
const jwt = require("passport-jwt");
const userModel = require("../models/user.model");
const { createHash, isValidPassword } = require("../utils/bcrypt.js");
const { JWT_SECRET } = require("./config");

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

const initializePassport = () => {
  // Estrategia de registro
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          const user = await userModel.findOne({ email: username });
          if (user) {
            console.log("El usuario ya existe");
            return done(null, false, { message: "Usuario ya existe" });
          }

          // Crear un nuevo carrito para el usuario
          const cartManager = new cm.CartManager();
          const newCart = await cartManager.createCart();

          console.log("Carrito creado", newCart);

          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: newCart._id,
            role: "user",
          };

          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done("Error al registrar el usuario: " + error);
        }
      }
    )
  );

  // Estrategia de login
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });
          if (!user) {
            console.log("No existe el usuario");
            return done(null, false, { message: "Usuario no encontrado" });
          }

          if (!isValidPassword(user, password)) {
            return done(null, false, { message: "Contraseña incorrecta" });
          }

          return done(null, user);
        } catch (error) {
          return done("Error al iniciar sesión: " + error);
        }
      }
    )
  );

  // Estrategia JWT
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          // Extraemos el usuario del payload del token
          const user = await userModel.findById(jwt_payload.id).lean();
          if (!user) {
            return done(null, false, { message: "Usuario no encontrado" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

module.exports = initializePassport;
