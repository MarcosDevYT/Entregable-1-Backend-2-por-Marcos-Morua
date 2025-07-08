let cartId = "";
let cart;

// iniciar contador de items
const initCartCount = () => {
  const cartCount = document.getElementById("cartCount");

  // Obtener la suma de las cantidades de todos los productos
  const quantityProducts = cart.products.reduce((total, product) => {
    return total + product.quantity;
  }, 0);

  cartCount.textContent = quantityProducts.toString();
};

// Iniciar Carrito
const initCart = async () => {
  // conseguir el id del carrito del localStorage
  cartId = document.getElementById("cartId").textContent;

  console.log(cartId);

  // Si tenemos el CardId, cambiemos el Link del carrito y agregamos el contador de items
  if (cartId) {
    const cartLink = document.getElementById("cartLink");
    cartLink.href = `/cart/${cartId}`;
  }

  // conseguir el carrito
  cart = await GETCartById(cartId);

  console.log(cart);

  initCartCount();
};

const recargarCarrito = async () => {
  cart = await GETCartById(cartId);

  console.log(cart);

  initCartCount();
};

// Funcion para mostrar un modal
const ApearModal = (productTitle, action) => {
  // Animaciones para Mostrar al usuario que se agrego el Producto al carrito

  // conseguir el modal
  const modalContainer = document.getElementById("ModalContainer");

  // Limpiar cualquier modal existente
  modalContainer.innerHTML = "";

  // Crear el elemento del modal
  const popModal = document.createElement("div");
  popModal.className =
    "pop-modal transition-all duration-300 fixed bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 opacity-0 transform translate-y-4";

  // Contenido del modal
  popModal.innerHTML = `
    ${
      action === "add"
        ? `<i class="ri-checkbox-circle-line text-2xl text-green-500"></i>`
        : `<i class="ri-delete-bin-line text-2xl text-red-500"></i>`
    }
    
    <p class="text-gray-800">${productTitle}</p>
  `;

  // Agregar el modal al contenedor
  modalContainer.appendChild(popModal);

  // Forzar un reflow para que la animación funcione
  void popModal.offsetWidth;

  // Agregar clase para la animación de entrada
  popModal.classList.add("opacity-100", "translate-y-0");

  // Configurar la eliminación después de 3 segundos
  setTimeout(() => {
    // Iniciar animación de salida
    popModal.classList.remove("opacity-100", "translate-y-0");
    popModal.classList.add("opacity-0", "translate-y-4");

    // Eliminar el elemento después de la animación
    setTimeout(() => {
      if (modalContainer.contains(popModal)) {
        modalContainer.removeChild(popModal);
      }
    }, 300);
  }, 3000);
};

// Agregar un producto al carrito

const handleAddProductToCart = async (productTitle, id) => {
  if (!cartId) {
    console.log("Carrito no encontrado");
    return;
  }

  try {
    console.log("Producto agregado al carrito");

    await POSTProductToCart(cartId, id);

    ApearModal(`${productTitle} agregado al carrito`, "add");

    setProductCardFunctions();
  } catch (error) {
    console.error(error);
  } finally {
    recargarCarrito();
  }
};

// Eliminar un producto del carrito
const handleDeleteProduct = async (cartId, productId, productTitle) => {
  if (!cartId) {
    console.log("Carrito no encontrado");
    return;
  }

  try {
    console.log("Producto eliminado del carrito");

    await DELETEProductFromCart(cartId, productId);

    ApearModal(`${productTitle} eliminado del carrito`, "delete");

    // Eliminar card
    const productCard = document.getElementById(`producto-${productId}`);
    productCard.remove();
  } catch (error) {
    console.log(error);
  } finally {
    recargarCarrito();
  }
};

// Vaciar el carrito
const handleClear = async (cartId) => {
  try {
    console.log("Carrito vaciado");

    await PUTClearCart(cartId);

    ApearModal("Carrito vaciado", "delete");

    // Eliminar todas las tarjetas de producto del DOM
    const cards = document.querySelectorAll(".productCard");
    cards.forEach((card) => card.remove());
  } catch (error) {
    console.log(error);
  } finally {
    recargarCarrito();
  }
};

// Editar la cantidad de un producto en el carrito
const handleReduce = async (cartId, productId, productTitle) => {
  if (!cartId) {
    console.log("Carrito no encontrado");
    return;
  }

  try {
    console.log("Cantidad del producto editada");

    await PUTReduceProductCart(cartId, productId);

    ApearModal(`1 ${productTitle} quitado del carrito`, "delete");

    setProductCardFunctions();
  } catch (error) {
    console.log(error);
  } finally {
    recargarCarrito();
  }
};

/**
 *
 * Funciones para el Carrito
 *
 */

// Conseguir todos los productCard
const productCard = document.querySelectorAll(".productCard");

const setProductCardFunctions = () => {
  const productCards = document.querySelectorAll(".productCard");

  productCards.forEach((productCard) => {
    const cantidadProducto = productCard.querySelector(".cantidadProducto");
    const precioUnitario = productCard.querySelector(".precioUnitario");
    const precioTotal = productCard.querySelector(".precioTotal");
    const productTitle = productCard.querySelector(".productTitle");
    const btnSumarCarrito = productCard.querySelector(".btnSumarCarrito");
    const btnRestarCarrito = productCard.querySelector(".btnRestarCarrito");

    const id = productCard.id.replace("producto-", "");
    const title = productTitle.textContent;
    let cantidad = parseInt(cantidadProducto.textContent);
    const unitario = parseFloat(precioUnitario.textContent);

    const setCantidad = () => {
      cantidadProducto.textContent = cantidad;
    };

    const setPriceTotal = () => {
      const total = unitario * cantidad;
      precioTotal.textContent = total.toFixed(2);
    };

    setPriceTotal();

    btnSumarCarrito.onclick = async () => {
      btnSumarCarrito.disabled = true;

      try {
        await POSTProductToCart(cartId, id);
        cantidad++;
        setCantidad();
        setPriceTotal();
        ApearModal(`${title} agregado al carrito`, "add");
      } catch (error) {
        console.error(error);
      } finally {
        btnSumarCarrito.disabled = false;
      }
    };

    btnRestarCarrito.onclick = async () => {
      btnRestarCarrito.disabled = true;

      try {
        await PUTReduceProductCart(cartId, id);
        if (cantidad > 1) {
          cantidad--;
          setCantidad();
          setPriceTotal();
          ApearModal(`${title} quitado del carrito`, "delete");

          await DELETEProductFromCart(cartId, id);
        } else {
          const card = document.getElementById(`producto-${id}`);
          if (card) card.remove();
          ApearModal(`${title} eliminado del carrito`, "delete");
        }
      } catch (error) {
        console.error(error);
      } finally {
        btnRestarCarrito.disabled = false;
      }
    };
  });
};

/*
Iniciar eventos
*/

document.addEventListener("DOMContentLoaded", () => {
  initCart();

  setProductCardFunctions();
});
