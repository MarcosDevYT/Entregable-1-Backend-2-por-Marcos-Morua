# Entregable 1 para Backend 2 - Marcos Morua

Entregable 1 para Backend 2 - Coderhouse, de Marcos Morua, para este proyecto utilice mi repositorio de mi trabajo Final corregido del [Final Backend 1](https://github.com/MarcosDevYT/Final-Backend-1---Marcos-Morua) esta corregido con la mejor nota, como en el entregable en el chat de la clase se decia que utilizaramos el eccomerce del modulo anterior utilice este como base para el entregable.

Se implementa autenticacion de usuarios utilizando JWT, middlewares personalizados, y relaciones con los usuarios y carritos, se implementa handlebars para crear las vistas de los productos y el carrito, se implementa las vistas dinamicas utilizando websocket para la vista realTimeProducts, y se agrega la funcionalidad de subida de archivos con multer.
Para la persistencia de datos se utiliza MongoDB.

## Características

- Sistema de carrito de compras con gestión de productos
- Actualización en tiempo real con WebSockets
- Gestión de productos con imágenes
- Subida de archivos con Multer
- Interfaz responsive con Tailwind CSS
- Diseño mobile-first

## Estructura del Proyecto

```

Entregable-1-Backend-2-por-Marcos-Morua/
├── src/
│   ├── app.js                              # Punto de entrada de la aplicación
│   ├── config/                             # Configuración de la aplicación
│   │   ├── config.js                       # Configuración de la aplicación
│   │   ├── db.js                           # Configuración de la base de datos
│   │   └── passport.config.js              # Configuración de Passport
│   │
│   ├── controllers/                        # Controladores de la aplicación
│   │   ├── cartManager.controller.js       # Lógica de carritos
│   │   └── productManager.controller.js    # Lógica de productos
│   │
│   ├── middlewares/                        # Middleware de la aplicación
│   │   └── auth.middleware.js              # Middleware de autenticación
│   │
│   ├── models/                             # Modelos de datos
│   │   ├── cart.model.js                   # Modelo de carritos
│   │   ├── user.model.js                   # Modelo de usuarios
│   │   └── product.model.js                # Modelo de productos
│   │
│   ├── public/                             # Archivos estáticos (frontend)
│   │   ├── fetchActions.js                 # Funciones para llamadas API
│   │   ├── main.js                         # Lógica principal del frontend
│   │   ├── modalFunctions.js               # Funciones para modales
│   │   ├── menuFunctions.js                # Funciones para menu
│   │   ├── realTimeFuncionality.js         # Funcionalidad en tiempo real
│   │   ├── cartFunctions.js                # Funciones para carritos
│   │   └── style.css                       # Estilos CSS
│   │
│   ├── routes/                             # Rutas de la aplicación
│   │   ├── carts.router.js                 # Rutas de carritos
│   │   ├── products.router.js              # Rutas de productos
│   │   ├── sessions.router.js              # Rutas de sesiones
│   │   ├── uploads.router.js               # Rutas para subida de archivos
│   │   └── views.router.js                 # Rutas de vistas
│   │
│   ├── utils/                              # Funciones utilitarias
│   │   ├── bcrypt.js                       # Funciones de autenticación
│   │   ├── carts.socket.js                 # Funciones de Socket Emit para los carritos
│   │   ├── validaciones.js                 # Funciones de validación
│   │   └── productos.socket.js             # Funciones de Socket Emit para los productos
│   │
│   └── views/                              # Vistas Handlebars
│       ├── home.handlebars                 # Página de inicio
│       ├── realTimeProducts.handlebars     # Vista en tiempo real
│       ├── cart.handlebars                 # Vista del carrito
│       ├── login.handlebars                # Vista de login
│       ├── register.handlebars             # Vista de registro
│       ├── product.handlebars              # Vista del producto
│       │
│       ├── layouts/
│       │   └── main.handlebars             # Layout principal
│       │
│       └── partials/                       # Componentes reutilizables
│           ├── formProducts.handlebars     # Formulario de productos
│           ├── authComponent.handlebars    # Componente de autenticación
│           ├── cardProduct.handlebars      # Tarjeta de producto
│           ├── limitButton.handlebars      # Boton de limites
│           ├── search.handlebars           # Buscador
│           ├── pagination.handlebars       # Paginador
│           ├── header.handlebars           # Encabezado
│           ├── input.handlebars            # Componente de input
│           └── itemDropdown.handlebars     # Menú desplegable
│
├── uploads/                                # Carpeta de archivos
├── .gitignore
├── package.json                            # Configuración de dependencias y scripts
├── pnpm-lock.yaml                          # pnpm-lock
└── README.md

```

## Uso

1. Inicia el servidor:

   ```
   pnpm dev (Para iniciar con node en "src/app.js")
   ```

2. Accede a la API en `http://localhost:8080`.
