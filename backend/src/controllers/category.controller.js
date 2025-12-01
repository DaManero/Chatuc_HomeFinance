import { models } from "../models/index.js";

export async function createCategory(req, res) {
  try {
    const { name, type, isRecurring } = req.body;
    const userId = req.user.userId;

    if (!name || !type) {
      return res.status(400).json({ error: "Nombre y tipo son requeridos" });
    }

    if (!["Ingreso", "Egreso"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Tipo debe ser "Ingreso" o "Egreso"' });
    }

    const category = await models.Category.create({
      name,
      type,
      isRecurring: isRecurring || false,
      userId,
    });

    res.status(201).json({
      message: "Categoría creada exitosamente",
      category,
    });
  } catch (err) {
    console.error("Error en createCategory:", err);
    res.status(500).json({ error: "Error al crear categoría" });
  }
}

export async function getCategories(req, res) {
  try {
    const { type } = req.query;

    const where = {};
    if (type) {
      where.type = type;
    }

    const categories = await models.Category.findAll({ where });

    res.json({ categories });
  } catch (err) {
    console.error("Error en getCategories:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, type, isRecurring } = req.body;
    const userId = req.user.userId;

    const category = await models.Category.findOne({
      where: { id, userId },
    });

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    if (type && !["Ingreso", "Egreso"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Tipo debe ser "Ingreso" o "Egreso"' });
    }

    if (name) category.name = name;
    if (type) category.type = type;
    if (isRecurring !== undefined) category.isRecurring = isRecurring;

    await category.save();

    res.json({
      message: "Categoría actualizada exitosamente",
      category,
    });
  } catch (err) {
    console.error("Error en updateCategory:", err);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const category = await models.Category.findOne({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    await category.destroy();

    res.json({ message: "Categoría eliminada exitosamente" });
  } catch (err) {
    console.error("Error en deleteCategory:", err);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
}
