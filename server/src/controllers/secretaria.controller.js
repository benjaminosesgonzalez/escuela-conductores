import * as secretariaService from "../services/secretaria.service.js";
import { asignarSedeMasivaPorIdsService } from "../services/alumno.service.js";
import { asignarSedesMasivaProfesoresService } from "../services/profesor.service.js";

export const getSecretarias = async (req, res) => {
  try {
    //llamamos al service para obtener todas las secretarias desde la bdd
    const data = await secretariaService.getSecretariasService();
    
    return res.status(200).json({ success: true, data });
  } catch (error) {
    //si falla algo en bdd o servidor se atrapa el error y arroja un 500 con el mensaje de error
    return res.status(500).json({ success: false, message: error.message }); 
  }
};

export const updateSecretaria = async (req, res) => {
  try {
    const updated = await secretariaService.updateSecretariaService(req.params.id,req.body,);
    //si el servicio devuelve null, significa que la secretaria no existe en la bdd
    if (!updated){
      return res
        .status(404)
        .json({ success: false, message: "Secretaria no encontrada" });
    }

    //si todo sale bien, devolvemos los datos al front
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSecretaria = async (req, res) => {
  try {
    //ejecutamos el servicio que eliminara el perfil y la cuenta
    const result = await secretariaService.deleteSecretariaService(
      req.params.id,
    );

    if (!result){
      return res
        .status(404)
        .json({ success: false, message: "Secretaria no encontrada" });
    }

    return res.status(200).json({
      success: true,
      message: "Secretaria y cuenta de usuario eliminadas correctamente",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const asignarSedeMasivaAlumnos = async (req, res) => {
  try {
    //extraemos datos del body 
    const { alumnos_ids, id_sede } = req.body;

    //llamamos al service masivo y capturamos cuantas filas modifico postgresql
    const filasAfectadas = await asignarSedeMasivaPorIdsService(alumnos_ids, id_sede);

    return res.status(200).json({
      success: true,
      message: `Sede asignada correctamente a ${filasAfectadas} alumnos.`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor al asignar sede masiva a alumnos" });
  }
};

export const asignarSedeMasivaProfesores = async (req, res) => {
  try {
    const { profesores_ids, sedes_ids } = req.body;

    //delegamos la logica de relacion n:m a su servicio
    const actualizados = await asignarSedesMasivaProfesoresService(profesores_ids, sedes_ids);

    return res.status(200).json({
      success: true,
      message: `Sedes asignadas correctamente a ${actualizados} profesores.`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor al asignar sedes masiva a profesores" });
  }
};
