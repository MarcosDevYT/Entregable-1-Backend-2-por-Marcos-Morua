// iniciar Socket
const socket = io();

// Detectar si estamos en la vista de productos a tiempo real
const isRealTimeView = () => {
  return window.location.pathname.includes("realtimeproducts");
};

// Función para actualizar la lista de productos
const updateProductsList = (products) => {
  const productsContainer = document.getElementById("productsContainer");
  if (!productsContainer) return;

  // Extraemos la paginacion
  const pagination = {
    prevPage: products.prevPage,
    nextPage: products.nextPage,
    page: products.page,
  };

  updatePagination(pagination);

  // Si products es un objeto con propiedad 'products', extrae el array
  const productsArray = Array.isArray(products.payload)
    ? products.payload
    : products.payload || [];

  // Limpia el contenedor
  productsContainer.innerHTML = "";

  // Si no hay productos, muestra un mensaje
  if (productsArray.length === 0) {
    productsContainer.innerHTML =
      "<tr> <td colspan='8' class='text-center py-4 border-b border-black/10 text-lg'>No hay productos</td></tr>";
    return;
  }

  // Crea y agrega un producto
  productsArray.forEach((product) => {
    try {
      const row = createRow(product);
      productsContainer.appendChild(row);
    } catch (error) {
      console.error("Error al crear tarjeta de producto:", error, product);
    }
  });
};

const updatePagination = (paginationData) => {
  console.log("Pagination Data:", paginationData);

  // Destructuramos los datos de la paginacion
  const { prevPage, nextPage, page } = paginationData;

  // Obtenemos el contenedor de la paginacion
  const paginationContainer = document.getElementById("paginationContainer");

  if (!paginationContainer) return;

  // Obtenemos los botones de la paginacion
  const prevButton = paginationContainer.querySelector(".prev");
  const nextButton = paginationContainer.querySelector(".next");
  const paginationPage = paginationContainer.querySelector("#paginationPage");

  // Actualizamos los botones
  prevButton.id = prevPage;
  nextButton.id = nextPage;

  // Deshabilitamos los botones si no hay pagina anterior o siguiente
  prevButton.disabled = !prevPage;
  nextButton.disabled = !nextPage;

  // Actualizamos la pagina actual
  paginationPage.textContent = page;
};

// Crear una tarjeta de producto
const createRow = (product) => {
  if (!product) return document.createElement("div");

  const row = document.createElement("tr");
  row.className = "border-b border-black/10 text-left hover:bg-black/10";

  // Asegúrate de que los datos existan
  const title = product.title;
  const price = product.price;
  const description = product.description;
  const stock = product.stock;
  const code = product.code;
  const category = product.category;
  const thumbnails = Array.isArray(product.thumbnails)
    ? product.thumbnails
    : [];
  const thumbnail = thumbnails[0] || "https://via.placeholder.com/150";
  const id = product._id;

  row.innerHTML = `
    <td class="px-2 py-2 cursor-pointer" onclick="changeProductPage(${id})">
      <img class="w-36 h-28 object-cover rounded-md" src="${thumbnail}" alt="${title}">
    </td>
    <td class="px-6 py-2">${title}</td>
    <td class="px-6 py-2">$${price}</td>
    <td class="px-6 py-2">${description}</td>
    <td class="px-6 py-2 capitalize">${category}</td>
    <td class="px-6 py-2">${code}</td>
    <td class="px-6 py-2">${stock}</td>
    <td class="px-6 py-2 ">
      ${itemDropdown(id)}
    </td>
  `;
  return row;
};

const itemDropdown = (id) => {
  return `
    <div class="flex justify-end items-center h-full relative">
      <span class="cursor-pointer dropdown-toggle">
        <i class="ri-more-fill"></i>
      </span>

      <div
        class="absolute hidden border border-black/10 rounded-md right-5 top-1/2 transform -translate-y-[60%] bg-white z-10 dropdown-menu"
      >
        <p class="font-medium text-base p-2 px-3">Acciones</p>
        <hr class="border-black/10" />
        <span
          class="w-32 cursor-pointer p-2 px-3 text-sm hover:bg-black/10 block visit-item"
          onclick="changeProductPage(${id})"
        >Visitar</span>
        <span
          class="w-32 cursor-pointer p-2 px-3 text-sm hover:bg-black/10 block edit-item"
          id="${id}"
        >Editar</span>
        <span
          class="w-32 cursor-pointer p-2 px-3 text-sm hover:bg-black/10 block delete-item"
          id="${id}"
        >Eliminar</span>
      </div>
    </div>
  `;
};

// Funcionalidad para editar o agregar un producto
const realTimeProductAction = async (productId, productData) => {
  try {
    // Si es una edición (tiene productId)
    if (productId) {
      // Verificar si hay imágenes nuevas
      if (productData.thumbnails && productData.thumbnails.length > 0) {
        // Obtener el producto actual para verificar las imágenes antiguas
        const currentProduct = await GETProductById(productId);

        if (currentProduct && currentProduct.thumbnails) {
          // Filtrar las imágenes antiguas que no están en las nuevas
          const imagesToDelete = currentProduct.thumbnails.filter(
            (oldImg) =>
              oldImg.startsWith("http://localhost:8080/uploads/") &&
              !productData.thumbnails.includes(oldImg)
          );

          // Eliminar imágenes antiguas que ya no se usan
          for (const imgToDelete of imagesToDelete) {
            try {
              await deleteImage(imgToDelete);
            } catch (error) {
              console.warn(
                "No se pudo eliminar la imagen antigua:",
                error.message
              );
            }
          }
        }
      }

      // Enviar la actualización a través de WebSocket
      socket.emit("editProduct", { productId, productData });
    } else {
      // Si es un producto nuevo, simplemente lo enviamos
      socket.emit("newProduct", productData);
    }
  } catch (error) {
    console.error("Error en realTimeProductAction:", error);
    // Podrías querer mostrar un mensaje de error al usuario aquí
    throw error; // Propagar el error para que pueda ser manejado por el llamador
  }
};

// Funcionalidad para eliminar un producto
const realTimeDeleteProduct = async (productId) => {
  try {
    // Primero obtenemos el producto para ver si tiene imágenes
    const product = await GETProductById(productId);

    // Si el producto no existe, salimos
    if (!product) {
      console.error("No se pudo obtener el producto para eliminar");
      return;
    }

    // Si el producto tiene thumbnails, intentamos eliminar las imágenes locales
    if (product.thumbnails && product.thumbnails.length > 0) {
      for (const thumbnail of product.thumbnails) {
        try {
          // Verificar si es una imagen local (comienza con http://localhost:8080/uploads/)
          if (
            thumbnail &&
            thumbnail.startsWith("http://localhost:8080/uploads/")
          ) {
            await deleteImage(thumbnail);
          }
        } catch (imageError) {
          console.warn("No se pudo eliminar la imagen:", imageError.message);
        }
      }
    }

    // Una vez eliminadas las imágenes (o si no había), eliminamos el producto
    socket.emit("deleteProduct", productId);
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
  }
};
