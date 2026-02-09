import { models } from "../models/index.js";

export async function createCategory(req, res) {
  try {
    const { name, type, isRecurring, parentCategoryId } = req.body;
    const userId = req.user.userId;

    if (!name || !type) {
      return res.status(400).json({ error: "Nombre y tipo son requeridos" });
    }

    if (!["Ingreso", "Egreso"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Tipo debe ser "Ingreso" o "Egreso"' });
    }

    // Si tiene categoría padre, validar que exista
    if (parentCategoryId) {
      const parentCategory = await models.Category.findOne({
        where: { id: parentCategoryId, userId },
      });
      if (!parentCategory) {
        return res.status(400).json({ error: "Categoría padre no encontrada" });
      }
      if (parentCategory.type !== type) {
        return res.status(400).json({
          error: "La categoría padre debe ser del mismo tipo",
        });
      }
    }

    const category = await models.Category.create({
      name,
      type,
      isRecurring: isRecurring || false,
      parentCategoryId: parentCategoryId || null,
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
    const { type, includeSubcategories } = req.query;

    const where = {};
    if (type) {
      where.type = type;
    }

    // Si includeSubcategories es "false", solo traer categorías principales
    // Si es true o undefined, solo traer categorías principales pero con sus subcategorías incluidas
    where.parentCategoryId = null;

    const categories = await models.Category.findAll({
      where,
      include:
        includeSubcategories !== "false"
          ? [
              {
                model: models.Category,
                as: "subcategories",
                required: false,
              },
            ]
          : [],
      order: [
        ["name", "ASC"],
        [{ model: models.Category, as: "subcategories" }, "name", "ASC"],
      ],
    });

    res.json({ categories });
  } catch (err) {
    console.error("Error en getCategories:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, type, isRecurring, parentCategoryId } = req.body;
    const userId = req.user.userId;

    console.log(`Intentando actualizar categoría: id=${id}, userId=${userId}`);

    const category = await models.Category.findOne({
      where: { id: parseInt(id), userId },
    });

    if (!category) {
      console.log(`Categoría no encontrada: id=${id}, userId=${userId}`);
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    if (type && !["Ingreso", "Egreso"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Tipo debe ser "Ingreso" o "Egreso"' });
    }

    // Validar que no se pueda hacer una categoría hija de sí misma
    if (parentCategoryId && parseInt(parentCategoryId) === parseInt(id)) {
      return res
        .status(400)
        .json({ error: "Una categoría no puede ser hija de sí misma" });
    }

    // Si tiene categoría padre, validar que exista
    if (parentCategoryId) {
      const parentCategory = await models.Category.findOne({
        where: { id: parentCategoryId, userId },
      });
      if (!parentCategory) {
        return res.status(400).json({ error: "Categoría padre no encontrada" });
      }
      const targetType = type || category.type;
      if (parentCategory.type !== targetType) {
        return res.status(400).json({
          error: "La categoría padre debe ser del mismo tipo",
        });
      }
    }

    if (name) category.name = name;
    if (type) category.type = type;
    if (isRecurring !== undefined) category.isRecurring = isRecurring;
    if (parentCategoryId !== undefined)
      category.parentCategoryId = parentCategoryId || null;

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
      where: { id: parseInt(id), userId },
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
