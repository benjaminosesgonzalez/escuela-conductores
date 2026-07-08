import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHandlers.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return handleErrorClient(
      res,
      401,
      "Acceso denegado. No se proporcionó token.",
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return handleErrorClient(res, 401, "Acceso denegado. Token malformado.");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Aquí ya tenemos el rol guardado en req.user.rol
    next();
  } catch (error) {
    return handleErrorClient(
      res,
      401,
      "Token inválido o expirado.",
      error.message,
    );
  }
}

export function isAdmin(req, res, next) {
  try {
    if (req.user && req.user.rol === "administrador") {
      next();
    } else {
      const rolEncontrado = req.user ? req.user.rol : "Ninguno";
      return handleErrorClient(
        res,
        403,
        `Acceso restringido. Rol actual: ${rolEncontrado}`,
      );
    }
  } catch (error) {
    return handleErrorClient(
      res,
      500,
      "Error al verificar permisos.",
      error.message,
    );
  }
}
export const isSecretaria = (req, res, next) => {
  if (req.user && req.user.rol === "secretaria") {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Requiere rol de Secretaria" });
  }
};

export const isAdminOrSecretaria = (req, res, next) => {
  const rolesPermitidos = ["administracion", "secretaria"];
  if (req.user && rolesPermitidos.includes(req.user.rol)) {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Acceso restringido a Staff únicamente" });
  }
};
