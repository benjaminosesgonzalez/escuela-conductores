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
    req.user = payload;
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
    if (req.user && req.user.rol === "administracion") {
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

export function isSecretaria(req, res, next) {
  try {
    if (req.user && req.user.rol === "secretaria") {
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

export function isAdminOrSecretaria(req, res, next) {
  try {
    const rolesPermitidos = ["administracion", "secretaria"];

    if (req.user && rolesPermitidos.includes(req.user.rol)) {
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
