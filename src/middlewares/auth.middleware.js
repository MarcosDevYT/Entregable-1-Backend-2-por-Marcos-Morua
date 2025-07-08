const passport = require("passport");

/**
 * Middleware para autenticar al usuario usando la estrategia JWT.
 * No inicia una sesión, solo autentica.
 */
const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Si no hay usuario, redirige a la página de login
      return res.redirect("/login");
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware para verificar si el usuario ya está logueado.
 * Si lo está, lo redirige a la página de productos.
 */
const checkExistingSession = (req, res, next) => {
  if (req.cookies.jwt) {
    // Si existe la cookie del token, asumimos que hay una sesión activa
    return res.redirect("/products");
  }
  next();
};

module.exports = {
  authenticateJWT,
  checkExistingSession,
};
