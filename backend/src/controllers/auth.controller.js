import bcrypt from "bcrypt";
import { models } from "../models/index.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Verificar si el email ya existe
    const existing = await models.User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await models.User.create({
      name,
      email,
      passwordHash,
      role: role || "Operador",
    });

    // Generar tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son requeridos" });
    }

    // Buscar usuario
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res
        .status(403)
        .json({
          error: "Usuario desactivado, contactese con el administrador",
        });
    }

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

export async function getMe(req, res) {
  try {
    // req.user viene del middleware authenticateToken
    const user = await models.User.findByPk(req.user.userId, {
      attributes: ["id", "name", "email", "role", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error en getMe:", err);
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
}
