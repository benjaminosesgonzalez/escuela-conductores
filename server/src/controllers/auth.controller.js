import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";

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

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario por email
    const user = await userRepository.findOne({
      where: { email: email },
    });

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

    // Responder
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

// REGISTER
export const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, nombre, rut, telefono } =
      req.body;

    // Validaciones extendidas
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

    // Verificar si el email ya existe
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "El email ya está registrado" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = userRepository.create({
      email,
      password: hashedPassword,
      rol: "alumno",
    });
    const savedUser = await userRepository.save(newUser);
    const alumnoRepo = AppDataSource.getRepository("Alumno"); // O importa la entidad Alumno
    await alumnoRepo.save(
      alumnoRepo.create({
        nombre,
        rut,
        telefono,
        id_user: savedUser.id, // Vinculamos con el usuario recién creado
      }),
    );

    // Generar token
    const token = generateToken(savedUser);

    return res.status(201).json({
      success: true,
      message: "Usuario y perfil de alumno registrados exitosamente",
      token,
      user: { id: savedUser.id, email: savedUser.email, rol: savedUser.rol },
    });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error en el servidor",
        error: error.message,
      });
  }
};

// REGISTER STAFF (solo admin)
export const registerStaff = async (req, res) => {
  try {
    const { email, password, rol } = req.body;

    // Validaciones
    if (!email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: "Email, contraseña y rol son requeridos",
      });
    }

    // Validar que el rol sea válido
    const rolesValidos = ["profesor", "administrador"];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        message: `Rol inválido. Debe ser uno de: ${rolesValidos.join(", ")}`,
      });
    }

    // Verificar si el email ya existe
    const existingUser = await userRepository.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario staff
    const newStaff = userRepository.create({
      email,
      password: hashedPassword,
      rol,
    });

    await userRepository.save(newStaff);

    return res.status(201).json({
      success: true,
      message: "Staff registrado exitosamente",
      user: {
        id: newStaff.id,
        email: newStaff.email,
        rol: newStaff.rol,
        created_at: newStaff.created_at,
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
