const { Router } = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");

const router = Router();

// Estrategia de registro
router.post("/register", (req, res, next) => {
  passport.authenticate("register", (err, user, info) => {
    if (err) {
      return res.redirect(
        `/register?error=${encodeURIComponent("Internal error")}`
      );
    }

    if (!user) {
      return res.redirect(
        `/register?error=${encodeURIComponent(
          info.message || "Registration failed"
        )}`
      );
    }

    req.login(user, (err) => {
      if (err) {
        return res.redirect(
          `/register?error=${encodeURIComponent("Login after register failed")}`
        );
      }

      return res.redirect("/login");
    });
  })(req, res, next);
});

// Estrategia de login
router.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) {
      return res.redirect(
        `/login?error=${encodeURIComponent("Internal error")}`
      );
    }

    if (!user) {
      return res.redirect(`/login?error=${encodeURIComponent(info.message)}`);
    }

    req.login(user, (err) => {
      if (err) {
        return res.redirect(
          `/login?error=${encodeURIComponent("Login failed")}`
        );
      }

      // Generar el token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 3600000, // 1 hora
      });

      return res.redirect("/products");
    });
  })(req, res, next);
});

// Estrategia "current" para validar el usuario logueado
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Si el token es válido, req.user contendrá los datos del usuario
    if (!req.user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    // Devolvemos los datos del usuario sin la contraseña
    const { first_name, last_name, email, age, role } = req.user;
    res.send({ first_name, last_name, email, age, role });
  }
);

// Estrategia de logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

module.exports = router;
