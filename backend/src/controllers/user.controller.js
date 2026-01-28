import { models } from "../models/index.js";
import bcrypt from "bcryptjs";

export async function getUsers(req, res) {
  try {
    const users = await models.User.findAll({
      attributes: ["id", "name", "email", "role", "isActive", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json({ users });
  } catch (err) {
    console.error("Error en getUsers:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, password, isActive } = req.body;

    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si el email ya existe en otro usuario
    if (email && email !== user.email) {
      const existing = await models.User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: "El email ya está en uso" });
      }
    }

    // Actualizar campos
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Usuario actualizado exitosamente",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Error en updateUser:", err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;

    // Prevenir que un usuario se desactive a sí mismo
    if (parseInt(id) === req.user.userId) {
      return res
        .status(400)
        .json({ error: "No puedes desactivar tu propia cuenta" });
    }

    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Toggle del estado
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Usuario ${
        user.isActive ? "activado" : "desactivado"
      } exitosamente`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Error en toggleUserStatus:", err);
    res.status(500).json({ error: "Error al cambiar estado del usuario" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Prevenir que un usuario se elimine a sí mismo
    if (parseInt(id) === req.user.userId) {
      return res
        .status(400)
        .json({ error: "No puedes eliminar tu propia cuenta" });
    }

    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await user.destroy();

    res.json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (err) {
    console.error("Error en deleteUser:", err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
}

export async function createUser(req, res) {
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
      isActive: true,
    });

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Error en createUser:", err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
}
