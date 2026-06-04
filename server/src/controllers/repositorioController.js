import fs from "fs";
import path from "path";

import { AppDataSource } from "../config/configDb.js";
import { RepositorioArchivo } from "../entities/RepositorioArchivo.js";

export const subirArchivo = async (req, res) => {
  try {
    const repositorioRepository = AppDataSource.getRepository(RepositorioArchivo);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se recibió ningún archivo"
      });
    }

    const nuevoArchivo = repositorioRepository.create({
      nombreOriginal: req.file.originalname,
      nombreArchivo: req.file.filename,
      tipoArchivo: req.file.mimetype,
      rutaArchivo: `/uploads/repositorio/${req.file.filename}`
    });

    await repositorioRepository.save(nuevoArchivo);

    return res.status(201).json({
      success: true,
      message: "Archivo subido correctamente",
      archivo: nuevoArchivo
    });

  } catch (error) {
    console.error("Error al subir archivo:", error);

    return res.status(500).json({
      success: false,
      message: "Error interno al subir archivo",
      error: error.message
    });
  }
};

export const listarArchivos = async (req, res) => {
  try {
    const repositorioRepository = AppDataSource.getRepository(RepositorioArchivo);

    const archivos = await repositorioRepository.find({
      order: {
        fechaSubida: "DESC"
      }
    });

    return res.json({
      success: true,
      archivos
    });

  } catch (error) {
    console.error("Error al listar archivos:", error);

    return res.status(500).json({
      success: false,
      message: "Error interno al listar archivos",
      error: error.message
    });
  }
};

export const eliminarArchivo = async (req, res) => {
  try {
    const repositorioRepository = AppDataSource.getRepository(RepositorioArchivo);

    const { id } = req.params;

    const archivo = await repositorioRepository.findOne({
      where: {
        id: Number(id)
      }
    });

    if (!archivo) {
      return res.status(404).json({
        success: false,
        message: "Archivo no encontrado"
      });
    }

    const rutaFisica = path.join(process.cwd(), archivo.rutaArchivo);

    if (fs.existsSync(rutaFisica)) {
      fs.unlinkSync(rutaFisica);
    }

    await repositorioRepository.delete(id);

    return res.json({
      success: true,
      message: "Archivo eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar archivo:", error);

    return res.status(500).json({
      success: false,
      message: "Error interno al eliminar archivo",
      error: error.message
    });
  }
};