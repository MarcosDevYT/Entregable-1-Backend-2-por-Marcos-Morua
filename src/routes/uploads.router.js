const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsRouter = Router();

// Configuración de Multer
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, "..", "..", "uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "imageFile-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif, webp)"));
  },
});

// Ruta para subir imágenes
uploadsRouter.post("/", (req, res) => {
  upload.single("imageFile")(req, res, function (err) {
    if (err) {
      console.error("Error Multer:", err);
      return res.status(400).json({
        error: err.message || "Error al procesar la imagen",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No se ha seleccionado ningún archivo",
      });
    }

    // Modificar esta línea para usar una ruta absoluta
    const filePath = `/uploads/${req.file.filename}`;
    res.json({
      message: "Imagen subida exitosamente",
      filePath: filePath,
    });
  });
});

// Ruta para borrar una Imagen
uploadsRouter.delete("/:filename", (req, res) => {
  const { filename } = req.params;
  console.log("Solicitud para eliminar archivo:", filename);

  if (!filename) {
    console.log("No se proporcionó nombre de archivo");
    return res.status(400).json({
      error: "No se proporcionó un nombre de archivo",
    });
  }

  const filePath = path.join(__dirname, "..", "..", "uploads", filename);
  console.log("Ruta completa del archivo:", filePath);

  // Verificar si el archivo existe antes de intentar eliminarlo
  if (!fs.existsSync(filePath)) {
    console.log("El archivo no existe en la ruta:", filePath);
    return res.status(404).json({
      error: "El archivo no existe",
    });
  }

  console.log("Eliminando archivo:", filePath);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error al eliminar el archivo:", err);
      return res.status(500).json({
        error: "Error al eliminar el archivo",
      });
    }
    res.json({
      message: "Archivo eliminado exitosamente",
    });
  });
});

module.exports = uploadsRouter;
