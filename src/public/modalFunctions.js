// Funcionalidad para abrir el formulario para agregar un producto

const modalFormBtn = document.querySelectorAll("#modalFormBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalContainer = document.getElementById("modalContainer");
const modalBackground = document.getElementById("modalBackground");
const modalForm = document.getElementById("modalForm");
const submitBtn = document.getElementById("submitBtn");

// Reutilizable

const modalOpen = () => {
  modalContainer.classList.remove("hidden");
  modalContainer.classList.add("flex");
};

const modalClose = () => {
  modalContainer.classList.remove("flex");
  modalContainer.classList.add("hidden");
};

// Actions

modalFormBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    modalForm.reset();
    document.getElementById("productId").value = "";
    submitBtn.textContent = "Agregar Producto";

    modalOpen();
  });
});

modalBackground.addEventListener("click", modalClose);

closeModalBtn.addEventListener("click", modalClose);

// Manejar el Enter en el formulario asi no enviarlo
modalForm.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const formElements = Array.from(modalForm.elements);
    const currentIndex = formElements.indexOf(e.target);

    // Solo manejar Enter si es un input o textarea
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      if (currentIndex < formElements.length - 1) {
        formElements[currentIndex + 1].focus();
      }
    }
  }
});

/*
  Funcionalidad para elegir si subir una imagen o poner una url:
*/

// Mostrar/Ocultar inputs de imagen
const setupImageInputToggle = () => {
  const radioButtons = document.querySelectorAll(".image-type-radio");
  const imageInputs = document.querySelectorAll(".image-input");
  const imageUrl = document.querySelector('input[name="imageUrl"]');
  const imageFile = document.querySelector('input[name="imageFile"]');

  const toggleInputs = () => {
    const selectedValue = document.querySelector(
      'input[name="imageType"]:checked'
    ).value;

    // Ocultar todos los inputs
    imageInputs.forEach((input) => {
      input.classList.add("hidden");
    });

    // Mostrar el input seleccionado
    const targetInput = document.getElementById(`${selectedValue}Input`);
    if (targetInput) {
      targetInput.classList.remove("hidden");
    }

    // Manejar el required dinámicamente
    if (selectedValue === "url") {
      imageUrl.setAttribute("required", "");
      imageFile.removeAttribute("required");
      // Limpiar el input file
      imageFile.value = "";
    } else {
      imageFile.setAttribute("required", "");
      imageUrl.removeAttribute("required");
      // Limpiar el input url
      imageUrl.value = "";
    }
  };

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", toggleInputs);
  });

  // Ejecutar al cargar la página
  toggleInputs();
};
/*
  Funcionalidad para el dropdown de acciones
*/

document.addEventListener("click", (e) => {
  const dropdownToggle = e.target.closest(".dropdown-toggle");

  // Cerrar todos los dropdowns
  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    if (menu !== dropdownToggle?.nextElementSibling) {
      menu.classList.add("hidden");
    }
  });

  // remover el hidden al hacer click en el boton del dropdown
  if (dropdownToggle) {
    const menu = dropdownToggle.nextElementSibling;
    if (menu && menu.classList.contains("dropdown-menu")) {
      menu.classList.toggle("hidden");
    }
  }

  // Manejar clic para eliminar el producto
  if (e.target.classList.contains("delete-item")) {
    const productId = e.target.id;

    // llamar a la funcion deleteProduct
    deleteProduct(productId);
  }

  // Manejar clic para editar el producto
  if (e.target.classList.contains("edit-item")) {
    const productId = e.target.id;

    // llamar a la funcion editProduct
    editProduct(productId);
  }
});

// Cerrar el dropdown al hacer clic fuera
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".dropdown-toggle") &&
    !e.target.closest(".dropdown-menu")
  ) {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      menu.classList.add("hidden");
    });
  }
});
