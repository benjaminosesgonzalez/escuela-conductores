import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  subirArchivo,
  listarArchivos,
  eliminarArchivo
} from "../controllers/repositorioController.js";

const router = express.Router();

const carpetaRepositorio = "uploads/repositorio";

if (!fs.existsSync(carpetaRepositorio)) {
  fs.mkdirSync(carpetaRepositorio, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, carpetaRepositorio);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);

    const nombreSeguro = file.originalname
      .replace(extension, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    cb(null, `${Date.now()}-${nombreSeguro}${extension}`);
  }
});

const fileFilter = function (req, file, cb) {
  const tiposPermitidos = [
    "application/pdf",
    "video/mp4"
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos PDF o MP4"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

router.post("/subir", (req, res, next) => {
  upload.single("archivo")(req, res, function (error) {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    next();
  });
}, subirArchivo);

router.get("/", listarArchivos);
router.delete("/:id", eliminarArchivo);

export default router;