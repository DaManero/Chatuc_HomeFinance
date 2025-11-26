"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  TablePagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import categoryService from "@/services/category.service";
import CategoryDialog from "@/components/categories/CategoryDialog";

export default function CategoriesPage() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [categories, filter, searchTerm]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = categories;

    // Filtrar por tipo
    if (filter !== "Todos") {
      filtered = filtered.filter((cat) => cat.type === filter);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCategories(filtered);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(0);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (category = null) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCategory(null);
    setDialogOpen(false);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory.id, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }
      handleCloseDialog();
      loadCategories();
      setError(null);
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al guardar categoría"
      );
    }
  };

  const handleDelete = async (categoryId) => {
    if (!isAdmin()) {
      alert("No tienes permisos para eliminar categorías");
      return;
    }

    if (!confirm("¿Estás seguro de eliminar esta categoría?")) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      loadCategories();
      setError(null);
    } catch (err) {
      console.error("Error al eliminar categoría:", err);
      setError(err.response?.data?.error || "Error al eliminar categoría");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Categorías
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión de categorías de ingresos y egresos
            </Typography>
          </Box>
          {isAdmin() && (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => handleOpenDialog()}
            >
              Nueva Categoría
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            mb: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="filtro de categorías"
            size="small"
          >
            <ToggleButton value="Todos" aria-label="todas">
              Todas
            </ToggleButton>
            <ToggleButton value="Ingreso" aria-label="ingresos">
              <TrendingUpOutlined sx={{ mr: 1 }} fontSize="small" />
              Ingresos
            </ToggleButton>
            <ToggleButton value="Egreso" aria-label="egresos">
              <TrendingDownOutlined sx={{ mr: 1 }} fontSize="small" />
              Egresos
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TableContainer component={Paper}>
          <Table
            sx={{
              "& .MuiTableCell-root": { textAlign: "left", py: 1 },
              "& .MuiTableRow-root": { height: 52 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha de Creación</TableCell>
                {isAdmin() && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        category.type === "Ingreso" ? (
                          <TrendingUpOutlined />
                        ) : (
                          <TrendingDownOutlined />
                        )
                      }
                      label={category.type}
                      color={category.type === "Ingreso" ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString("es-ES")}
                  </TableCell>
                  {isAdmin() && (
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(category.id)}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </TableContainer>

        {filteredCategories.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              {filter === "Todos"
                ? "No hay categorías registradas"
                : `No hay categorías de tipo ${filter}`}
            </Typography>
          </Box>
        )}
      </Box>

      <CategoryDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveCategory}
        category={selectedCategory}
      />
    </DashboardLayout>
  );
}
