import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { Alumno } from "../entities/alumno.entity.js";
import { Profesor } from "../entities/profesor.entity.js";
import { Administracion } from "../entities/administracion.entity.js";
import { Secretaria } from "../entities/secretaria.entity.js";

const userRepository = AppDataSource.getRepository(User);

// Generar JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol: user.rol,
    },
    process.env.JWT_SECRET || "tu_clave_secreta_super_segura",
    { expiresIn: "24h" },
  );
};

// LOGIN - Busca en users y profesores
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    // 🔴 Buscar en tabla users
    let user = await userRepository.findOne({
      where: { email: email },
    });

    // 🔴 Si no está, buscar en tabla profesores usando AppDataSource
    if (!user) {
      const result = await AppDataSource.query(
        "SELECT * FROM profesores WHERE email = $1",
        [email]
      );

      if (result.length > 0) {
        user = result[0];
        if (!user.rol) {
          user.rol = "profesor";
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos",
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos",
      });
    }

    // Generar token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar el login",
      error: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, nombre, rut, telefono } =
      req.body;

    if (!email || !password || !nombre || !rut) {
      return res
        .status(400)
        .json({ success: false, message: "Faltan datos obligatorios" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      email,
      password: hashedPassword,
      rol: "alumno",
    });
    const savedUser = await userRepository.save(newUser);
    const alumnoRepo = AppDataSource.getRepository("Alumno");
    await alumnoRepo.save(
      alumnoRepo.create({
        nombre,
        rut,
        telefono,
        id_user: savedUser.id,
      }),
    );

    const token = generateToken(savedUser);

    return res.status(201).json({
      success: true,
      message: "Usuario y perfil de alumno registrados exitosamente",
      token,
      user: { id: savedUser.id, email: savedUser.email, rol: savedUser.rol },
    });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const registerStaff = async (req, res) => {
  try {
    const { email, password, rol, nombre, telefono, id_sedes } = req.body;
    const requesterRol = req.user.rol;

    if (!email || !password || !rol || !nombre) {
      return res.status(400).json({
        success: false,
        message: "Email, contraseña, rol y nombre son requeridos",
      });
    }

    if (requesterRol === "secretaria" && rol !== "profesor") {
      return res.status(403).json({
        success: false,
        message:
          "Las secretarias solo pueden registrar perfiles de tipo 'profesor'.",
      });
    }

    const rolesValidos = ["profesor", "secretaria"];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: `Rol inválido. Debe ser uno de: ${rolesValidos.join(", ")}`,
      });
    }

    const existingUser = await userRepository.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = userRepository.create({
      email,
      password: hashedPassword,
      rol,
    });

    const savedUser = await userRepository.save(newStaff);

    if (rol === "profesor") {
      const profRepo = AppDataSource.getRepository(Profesor);
      const sedesCargadas = id_sedes ? id_sedes.map((id) => ({ id })) : [];

      await profRepo.save(
        profRepo.create({
          nombre,
          telefono: telefono || "Sin teléfono",
          id_user: savedUser.id,
          sedes: sedesCargadas,
        }),
      );
    } else if (rol === "secretaria") {
      const secretariaRepo = AppDataSource.getRepository(Secretaria);
      await secretariaRepo.save(
        secretariaRepo.create({
          nombre,
          id_user: savedUser.id,
          telefono: telefono || "Sin teléfono",
        }),
      );
    }

    return res.status(201).json({
      success: true,
      message: "Staff registrado exitosamente",
      user: {
        id: savedUser.id,
        email: savedUser.email,
        rol: savedUser.rol,
        created_at: savedUser.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error en registro de staff:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar el registro de staff",
      error: error.message,
    });
  }
};