const bcrypt = require("bcrypt");

/**
 * Crea un hash de la contraseña.
 */
const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Valida si la contraseña proporcionada es correcta.
 */
const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

module.exports = {
  createHash,
  isValidPassword,
};
