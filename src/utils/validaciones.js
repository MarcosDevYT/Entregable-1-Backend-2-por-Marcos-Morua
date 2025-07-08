const camposObligatorios = [
  "title",
  "description",
  "code",
  "price",
  "status",
  "stock",
  "category",
  "thumbnails",
];

// Validamos el producto para el POST, asi tenemos el producto sin errores
const validatePostProduct = (product) => {
  // Verificar campos requeridos
  for (const camp of camposObligatorios) {
    if (!(camp in product)) {
      throw new Error(`El campo '${camp}' es obligatorio`);
    }
  }

  // Verificar tipos de datos
  if (typeof product.title !== "string")
    throw new Error("El campo 'title' debe ser string");
  if (typeof product.description !== "string")
    throw new Error("El campo 'description' debe ser string");
  if (typeof product.code !== "string")
    throw new Error("El campo 'code' debe ser string");
  if (typeof product.price !== "number")
    throw new Error("El campo 'price' debe ser number");
  if (typeof product.status !== "boolean")
    throw new Error("El campo 'status' debe ser boolean");
  if (typeof product.stock !== "number")
    throw new Error("El campo 'stock' debe ser number");
  if (typeof product.category !== "string")
    throw new Error("El campo 'category' debe ser string");
  if (
    !Array.isArray(product.thumbnails) ||
    !product.thumbnails.every((t) => typeof t === "string")
  ) {
    throw new Error("El campo 'thumbnails' debe ser un array de strings");
  }

  // Verificar que no existan campos extra
  const extraFields = Object.keys(product).filter(
    (key) => !camposObligatorios.includes(key)
  );

  if (extraFields.length > 0) {
    throw new Error(`Campos no permitidos: ${extraFields.join(", ")}`);
  }

  return true;
};

// Validamos el producto para el PUT y solo pasamos los campos que se envían
const validatePutProduct = (product) => {
  // Verificar que no existan campos extra
  const extraFields = Object.keys(product).filter(
    (key) => !camposObligatorios.includes(key)
  );
  if (extraFields.length > 0) {
    throw new Error(`Campos no permitidos: ${extraFields.join(", ")}`);
  }

  // Validar tipo de dato solo de los campos enviados
  for (const key of Object.keys(product)) {
    const value = product[key];
    switch (key) {
      case "title":
        if (typeof value !== "string")
          throw new Error(`El campo '${key}' debe ser string`);
        break;
      case "description":
        if (typeof value !== "string")
          throw new Error(`El campo '${key}' debe ser string`);
        break;
      case "code":
        if (typeof value !== "string")
          throw new Error(`El campo '${key}' debe ser string`);
        break;
      case "category":
        if (typeof value !== "string")
          throw new Error(`El campo '${key}' debe ser string`);
        break;
      case "price":
        if (typeof value !== "number")
          throw new Error(`El campo '${key}' debe ser number`);
        break;
      case "stock":
        if (typeof value !== "number")
          throw new Error(`El campo '${key}' debe ser number`);
        break;
      case "status":
        if (typeof value !== "boolean")
          throw new Error(`El campo '${key}' debe ser boolean`);
        break;
      case "thumbnails":
        if (
          !Array.isArray(value) ||
          !value.every((t) => typeof t === "string")
        ) {
          throw new Error("El campo 'thumbnails' debe ser un array de strings");
        }
        break;
    }
  }
  return true;
};

module.exports = {
  validatePostProduct,
  validatePutProduct,
};
