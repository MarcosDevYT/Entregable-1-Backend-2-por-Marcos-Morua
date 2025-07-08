// Funcion para obtener todos los productos
const GETProducts = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/products");

    if (!response.ok) {
      throw new Error("Error al obtener los productos");
    }

    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Funcion para obtener el producto con el id
const GETProductById = async (productId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/products/${productId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener el producto");
    }

    const data = await response.json();

    return data.product;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Función para subir imagen
const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("imageFile", file);

    const response = await fetch("http://localhost:8080/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al subir la imagen");
    }

    const data = await response.json();
    return data.filePath;
  } catch (error) {
    throw error;
  }
};

// Funcion para borrar imagenes
const deleteImage = async (fileUrl) => {
  try {
    console.log("Intentando eliminar imagen:", fileUrl);

    if (!fileUrl) {
      throw new Error("No se proporcionó una URL de archivo");
    }

    // Extraer solo el nombre del archivo de la URL completa
    const url = new URL(fileUrl);
    const fileName = url.pathname.split("/").pop();

    console.log("Nombre del archivo extraído:", fileName);

    const response = await fetch(
      `http://localhost:8080/api/uploads/${fileName}`,
      {
        method: "DELETE",
      }
    );

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(responseData.error || "Error al eliminar la imagen");
    }

    return responseData;
  } catch (error) {
    console.error("Error en deleteImage:", error);
    throw error;
  }
};

// Crear un producto
const POSTProduct = async (productData) => {
  try {
    const response = await fetch("http://localhost:8080/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error("Error al agregar el producto");
    }

    await response.json();
    alert("Producto agregado con éxito");
  } catch (error) {
    console.error(error);
    alert("Error al agregar el producto: " + error.message);
  }
};

// Editar un producto con el id y los datos del formulario
const PUTProduct = async (productId, productData) => {
  try {
    // Primero obtenemos el producto actual para verificar las imágenes antiguas
    const currentProduct = await GETProductById(productId);

    if (!currentProduct) {
      throw new Error("El producto que intentas editar no existe");
    }

    // Verificar si hay imágenes antiguas que necesiten ser eliminadas
    if (currentProduct.thumbnails && currentProduct.thumbnails.length > 0) {
      // Verificar si las imágenes están siendo reemplazadas
      const hasNewImages =
        productData.thumbnails && productData.thumbnails.length > 0;

      // Si hay imágenes antiguas y se están reemplazando, eliminarlas
      if (hasNewImages) {
        for (const oldThumbnail of currentProduct.thumbnails) {
          try {
            // Solo eliminar imágenes locales
            if (
              oldThumbnail &&
              oldThumbnail.startsWith("http://localhost:8080/uploads/")
            ) {
              // Verificar si la imagen antigua no está en las nuevas imágenes
              const isStillUsed = productData.thumbnails.some(
                (newThumbnail) => newThumbnail === oldThumbnail
              );

              if (!isStillUsed) {
                await deleteImage(oldThumbnail);
              }
            }
          } catch (error) {
            console.warn(
              "No se pudo eliminar la imagen antigua:",
              error.message
            );
          }
        }
      }
    }

    // Ahora actualizamos el producto con los nuevos datos
    const response = await fetch(
      `http://localhost:8080/api/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      }
    );

    if (!response.ok) {
      throw new Error("Error al editar el producto");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en PUTProduct:", error);
    throw error;
  }
};

// Funcion para eliminar un producto
const DELETEProduct = async (productId) => {
  try {
    // Primero obtenemos el producto para ver si tiene una imagen asociada
    const product = await GETProductById(productId);

    // Si el producto no existe, lanzamos un error
    if (!product) {
      throw new Error("El producto no existe");
    }

    // Verificar si el producto tiene thumbnails y si alguno es una imagen local
    if (product.thumbnails && product.thumbnails.length > 0) {
      for (const thumbnail of product.thumbnails) {
        try {
          // Verificar si la imagen es local (comienza con http://localhost:8080/uploads/)
          if (
            thumbnail &&
            thumbnail.startsWith("http://localhost:8080/uploads/")
          ) {
            await deleteImage(thumbnail);
          } else if (thumbnail) {
            console.log("Imagen externa, no se eliminará:", thumbnail);
          }
        } catch (imageError) {
          console.warn("No se pudo eliminar la imagen:", imageError.message);
        }
      }
    }

    // Luego eliminamos el producto
    const response = await fetch(
      `http://localhost:8080/api/products/${productId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Error al eliminar el producto");
    }

    return true;
  } catch (error) {
    console.error("Error en DELETEProduct:", error);
    throw error;
  }
};

/*
  Funciones para el carrito
*/

// Funcion para obtener todos los carritos
const GETCarts = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/carts");

    if (!response.ok) {
      throw new Error("Error al obtener el carrito");
    }

    const data = await response.json();
    return data.cart;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Funcion para obtener el carrito por el id
const GETCartById = async (cartId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/carts/${cartId}`);

    if (!response.ok) {
      throw new Error("Error al obtener el carrito");
    }

    const data = await response.json();
    return data.cart;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Funcion para crear un carrito
const POSTCart = async (cartData) => {
  try {
    const response = await fetch("http://localhost:8080/api/carts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartData),
    });

    if (!response.ok) {
      throw new Error("Error al agregar el carrito");
    }

    const data = await response.json();
    return data.cart._id;
  } catch (error) {
    console.error(error);
    alert("Error al crear el carrito: " + error.message);
  }
};

// Funcion para agregar un producto al carrito
const POSTProductToCart = async (cartId, productId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/carts/${cartId}/product/${productId}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Error al agregar el producto al carrito");
    }

    await response.json();
  } catch (error) {
    console.error(error);
    alert("Error al agregar el producto al carrito: " + error.message);
  }
};

// Funcion para eliminar un producto del carrito
const DELETEProductFromCart = async (cartId, productId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/carts/${cartId}/product/${productId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Error al eliminar el producto del carrito");
    }

    await response.json();
  } catch (error) {
    console.error(error);
    alert("Error al eliminar el producto del carrito: " + error.message);
  }
};

// Funcion para vaciar el carrito
const PUTClearCart = async (cartId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/carts/${cartId}`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el carrito");
    }

    await response.json();
  } catch (error) {
    console.error(error);
    alert("Error al eliminar el carrito: " + error.message);
  }
};

// Funcion para reducir la cantidad de un producto en el carrito
const PUTReduceProductCart = async (cartId, productId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/carts/${cartId}/product/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: -1 }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Error al reducir la cantidad del producto en el carrito"
      );
    }

    await response.json();
  } catch (error) {
    console.error(error);
    alert(
      "Error al reducir la cantidad del producto en el carrito: " +
        error.message
    );
  }
};
