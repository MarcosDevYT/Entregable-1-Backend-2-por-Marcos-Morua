/*
  Funcionalidades para el formulario y eliminar los productos
*/

// Validar los datos que se envian al formulario
const validateForm = (form) => {
  const requiredFields = form.querySelectorAll("[required]");
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      isValid = false;
    }
  });

  // Validar que al menos una imagen esté presente
  const imageType = form.querySelector('input[name="imageType"]:checked').value;
  const imageUrl = form.querySelector('input[name="imageUrl"]');
  const imageFile = form.querySelector('input[name="imageFile"]');

  if (imageType === "url" && !imageUrl.value.trim()) {
    alert("Por favor ingresa una URL de imagen válida");
    return false;
  }

  if (
    imageType === "file" &&
    (!imageFile.files || imageFile.files.length === 0)
  ) {
    alert("Por favor selecciona una imagen para subir");
    return false;
  }

  return isValid;
};

// Validar que el codigo no se repita
const validateCode = async (productId, code) => {
  try {
    const products = await GETProducts();
    if (!products) {
      console.error("Error al obtener los productos");
      return true;
    }

    const codeExists = products.some((product) => {
      // Convertir ambos IDs a string para comparación consistente
      const currentProductId = String(product._id);
      const editingProductId = String(productId);

      // Si es el mismo producto, lo ignoramos
      if (currentProductId === editingProductId) {
        return false;
      }

      return product.code === code;
    });

    if (codeExists) {
      console.log(
        `El código "${code}" ya está siendo utilizado por otro producto`
      );
      alert(`El código "${code}" ya está siendo utilizado por otro producto`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error en validateCode:", error);
    alert("Error al validar el código del producto");
    return false;
  }
};

// Manejar el envío del formulario
const handleSubmit = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!validateForm(e.target)) {
    alert("Por favor completa todos los campos obligatorios");
    return;
  }

  const formData = new FormData(e.target);

  // Obtenemos los datos del formulario
  const productData = {
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    code: formData.get("code").trim(),
    price: parseFloat(formData.get("price")),
    status: true,
    stock: parseInt(formData.get("stock"), 10),
    category: formData.get("category").trim().toLowerCase(),
    thumbnails: [],
  };

  const productId = formData.get("id")?.trim();
  const imageUrl = formData.get("imageUrl");
  const imageFile = formData.get("imageFile");

  try {
    // Manejar la imagen
    if (imageUrl) {
      productData.thumbnails.push(imageUrl);
    } else if (imageFile && imageFile.size > 0) {
      // Subir la imagen y obtener la URL
      const imagePath = await uploadImage(imageFile);
      productData.thumbnails.push(`http://localhost:8080${imagePath}`);
    }

    // Validar el código antes de continuar
    const isCodeValid = await validateCode(productId, productData.code);
    if (!isCodeValid) {
      return; // No continuar si hay un código duplicado
    }

    if (isRealTimeView()) {
      // Para la vista en tiempo real
      realTimeProductAction(productId, productData);
      e.target.reset();
      modalClose();
    } else {
      // Para la vista normal (HTTP)
      if (!productId) {
        await POSTProduct(productData);
      } else {
        await PUTProduct(productId, productData);
      }

      // Recargar la página después de guardar
      window.location.reload();
    }
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    alert(
      `Error al ${productId ? "actualizar" : "crear"} el producto: ${
        error.message
      }`
    );
  }
};

/*
  Funcionalidad para eliminar productos
*/

const deleteProduct = async (productId) => {
  console.log("Eliminar producto ID:", productId);

  if (isRealTimeView()) {
    realTimeDeleteProduct(productId);
    return;
  }

  const deleted = await DELETEProduct(productId);

  if (!deleted) {
    alert("Error al eliminar el producto");
    return;
  }

  alert("Producto eliminado con éxito");
  window.location.reload();
};

/*
  Funcionalidad para editar productos
*/

const editProduct = async (productId) => {
  console.log("Editar producto ID:", productId);

  const product = await GETProductById(productId);

  // Comenzamos el try catch para manejar el formulario asi editarlo
  try {
    if (!product) return;

    // Llenamos el formulario con los datos del producto
    const form = document.getElementById("modalForm");
    form.elements["title"].value = product.title || "";
    form.elements["description"].value = product.description || "";
    form.elements["code"].value = product.code || "";
    form.elements["price"].value = product.price || "";
    form.elements["stock"].value = product.stock || "";
    form.elements["category"].value = product.category || "";

    // Establecer el ID del producto
    form.elements["id"].value = product._id;

    // Manejar la imagen - solo si es una URL
    if (product.thumbnails && product.thumbnails.length > 0) {
      const isUrl = product.thumbnails[0].startsWith("http");

      // Mostrar el input correspondiente
      if (isUrl) {
        form.elements["imageType"].value = "url";
        form.elements["imageUrl"].value = product.thumbnails[0];
        document.getElementById("urlInput").classList.remove("hidden");
        document.getElementById("fileInput").classList.add("hidden");
      } else {
        // No podemos establecer el valor de un input file por seguridad
        // Solo mostramos el nombre del archivo como texto
        form.elements["imageType"].value = "file";
        document.getElementById("urlInput").classList.add("hidden");
        document.getElementById("fileInput").classList.remove("hidden");
        // Mostrar el nombre del archivo como texto informativo
        const fileInfo = document.createElement("div");
        fileInfo.textContent = `Archivo actual: ${product.thumbnails[0]}`;
        fileInfo.className = "text-sm text-gray-500 mt-1";
        const fileInputContainer = document.getElementById("fileInput");
        fileInputContainer.appendChild(fileInfo);
      }
    }

    // Cambiar el texto del botón de submit
    submitBtn.textContent = "Actualizar Producto";

    modalOpen();
  } catch (error) {
    console.error("Error al cargar el producto:", error);
  }
};

/*
  Funcionalidad para cambiar a la pagina del producto
*/

const changeProductPage = (productId) => {
  window.location.href = `/products/${productId}`;
};

/*
  Funcionalidad para manejar los filtros de productos
*/

const params = new URLSearchParams(window.location.search);

let pageParams = 1;
let limitParams = 10;
let queryParams = "";

if (isRealTimeView() && socket) {
} else {
  pageParams = params.get("page");
  limitParams = params.get("limit");
  queryParams = params.get("query");
}

// Funcionalidad para cambiar a la pagina de la tabla
const btnChangePage = document.querySelectorAll(".btn-change-page");

const changeTablePage = (page) => {
  if (!page) return;

  if (isRealTimeView() && socket) {
    pageParams = page;
    limitParams = limitParams;
    queryParams = queryParams;

    socket.emit("paginate", page, limitParams, queryParams);

    return;
  }

  let TablePageUrl = `/?page=${page}`;

  if (limitParams) TablePageUrl += `&limit=${limitParams}`;
  if (queryParams) TablePageUrl += `&query=${queryParams}`;

  window.location.href = TablePageUrl;
};

btnChangePage.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const page = e.currentTarget.id;
    changeTablePage(page);
  });
});

// Funcionalidad para buscar productos

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const updateFormValue = (value) => {
  searchInput.value = value;
};

const handleSearch = (e) => {
  e.preventDefault();

  const query = e.target.query.value.trim().toLowerCase();

  clearBtn.classList.remove("hidden");

  if (!query) {
    alert("Por favor ingresa un término de búsqueda");
    return;
  }

  if (isRealTimeView() && socket) {
    queryParams = query;

    socket.emit("search", query);
    return;
  }

  window.location.href = `/?query=${query}`;
};

const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");

if (queryParams === "") {
  clearBtn.classList.add("hidden");
} else {
  clearBtn.classList.remove("hidden");
}

searchBtn.addEventListener("click", () => {
  handleSearch();
});

clearBtn.addEventListener("click", () => {
  clearBtn.classList.add("hidden");
  searchInput.value = "";
  queryParams = "";

  if (isRealTimeView() && socket) {
    queryParams = "";

    socket.emit("search", queryParams);
    return;
  }

  window.location.href = `/?query=${queryParams}`;
});

// Funcionalidad para cambiar el limite de productos

const limitForm = document.getElementById("limitForm");
const limitInput = document.getElementById("limitInput");

const handleLimit = (e) => {
  e.preventDefault();

  const limit = e.target.limit.value.trim();

  if (!limit) {
    alert("Por favor ingresa un límite válido");
    return;
  }

  if (isRealTimeView() && socket) {
    limitParams = limit;
    queryParams = queryParams;

    limitInput.value = limit;

    socket.emit("limit", limit, queryParams);
    return;
  }

  let LimitUrl = `/?limit=${limit}`;

  if (queryParams) LimitUrl += `&query=${queryParams}`;

  window.location.href = LimitUrl;
};

limitForm.addEventListener("submit", handleLimit);

/*
  Iniciar eventos
*/

// Agregar el event listener para cargar al inicio del documento
document.addEventListener("DOMContentLoaded", () => {
  setupImageInputToggle();

  modalForm.addEventListener("submit", handleSubmit);

  searchForm.addEventListener("submit", handleSearch);

  updateFormValue(queryParams);

  // Si estamos en la url de realTimeProducts, iniciamos los eventos
  if (isRealTimeView() && socket) {
    socket.on("products", (products) => {
      console.log("Productos Cargados:", products);
      updateProductsList(products);
    });
  }
});
