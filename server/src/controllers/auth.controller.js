import { loginUser } from "../services/auth.service.js";
import { createUser } from "../services/user.service.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHandlers.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return handleErrorClient(res, 400, "Email y contraseña son requeridos");
    }

    const data = await loginUser(email, password);
    handleSuccess(res, 200, "Login exitoso", data);
  } catch (error) {
    handleErrorClient(res, 401, error.message);
  }
}

export async function register(req, res) {
  try {
    const data = { ...req.body, rol: "alumno" };
    const newUser = await createUser(data);
    res
      .status(201)
      .json({ message: "Alumno registrado con éxito", data: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al registrar alumno", error: error.message });
  }
}

export async function registerStaff(req, res) {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json({
      message: "Miembro del personal registrado con éxito",
      data: newUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al registrar personal", error: error.message });
  }
}
