import { AppDataSource } from "../config/configDb.js";
import { Sede } from "../entities/sede.entity.js";

const sedeRepo = AppDataSource.getRepository(Sede);

export const createSede = async (req, res) => {
  try {
    const nuevaSede = sedeRepo.create(req.body);
    await sedeRepo.save(nuevaSede);
    res.status(201).json({ success: true, data: nuevaSede });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSede = async (req, res) => {
  try {
    const { id } = req.params;
    await sedeRepo.delete(id);
    res.json({ success: true, message: "Sede eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSedes = async (req, res) => {
  try {
    const sedes = await sedeRepo.find();
    res.json({ success: true, data: sedes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener sedes" });
  }
};

export const updateSede = async (req, res) => {
  try {
    const { id } = req.params;
    const sede = await sedeRepo.findOneBy({ id: parseInt(id) });

    if (!sede) {
      return res
        .status(404)
        .json({ success: false, message: "Sede no encontrada" });
    }

    sedeRepo.merge(sede, req.body);
    const resultado = await sedeRepo.save(sede);
    res.json({ success: true, data: resultado });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar" });
  }
};
