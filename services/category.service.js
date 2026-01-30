import api from "./api";

const categoryService = {
  // Obtener todas las categorías (formato jerárquico con subcategorías)
  getCategories: async (includeSubcategories = true) => {
    const params =
      includeSubcategories !== false ? {} : { includeSubcategories: "false" };
    const response = await api.get("/categories", { params });
    return response.data.categories;
  },

  // Obtener todas las categorías en formato plano (para selectores)
  getCategoriesFlat: async () => {
    const hierarchical = await categoryService.getCategories(true);
    const flat = [];

    hierarchical.forEach((mainCat) => {
      // Agregar categoría principal
      flat.push(mainCat);

      // Agregar subcategorías si existen
      if (mainCat.subcategories && mainCat.subcategories.length > 0) {
        flat.push(...mainCat.subcategories);
      }
    });

    return flat;
  },

  // Crear nueva categoría
  createCategory: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  // Actualizar categoría
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Eliminar categoría
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
