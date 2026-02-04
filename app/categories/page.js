"use client";

import { useState, useEffect, Fragment } from "react";
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
  Switch,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  TablePagination,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  AccountBalanceWalletOutlined,
  CreditCardOutlined,
  SwapHorizOutlined,
  MoneyOutlined,
  MoreHorizOutlined,
  SearchOutlined,
  FilterListOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  SubdirectoryArrowRightOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import categoryService from "@/services/category.service";
import paymentMethodService from "@/services/paymentMethod.service";
import CategoryDialog from "@/components/categories/CategoryDialog";
import PaymentMethodDialog from "@/components/paymentMethods/PaymentMethodDialog";

const getPaymentMethodIcon = (type) => {
  switch (type) {
    case "Efectivo":
      return <MoneyOutlined fontSize="small" />;
    case "Tarjeta":
      return <CreditCardOutlined fontSize="small" />;
    case "Transferencia":
      return <SwapHorizOutlined fontSize="small" />;
    case "Billetera Virtual":
      return <AccountBalanceWalletOutlined fontSize="small" />;
    case "Otro":
      return <MoreHorizOutlined fontSize="small" />;
    default:
      return <AccountBalanceWalletOutlined fontSize="small" />;
  }
};

export default function CategoriesPage() {
  const { isAdmin } = useAuth();

  // Estados para categorías
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [categoryTypeFilter, setCategoryTypeFilter] = useState("Todos");
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryRowsPerPage, setCategoryRowsPerPage] = useState(10);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Estados para medios de pago
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentMethodSearchTerm, setPaymentMethodSearchTerm] = useState("");
  const [paymentMethodTypeFilter, setPaymentMethodTypeFilter] =
    useState("Todos");
  const [paymentMethodPage, setPaymentMethodPage] = useState(0);
  const [paymentMethodRowsPerPage, setPaymentMethodRowsPerPage] = useState(10);

  // Estado general
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
    loadPaymentMethods();
  }, []);

  // ===== CATEGORÍAS =====
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar categorías");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleOpenCategoryDialog = (category = null) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(false);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (selectedCategory) {
        await categoryService.updateCategory(selectedCategory.id, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }
      handleCloseCategoryDialog();
      loadCategories();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar categoría");
    }
  };

  const handleToggleRecurring = async (category) => {
    if (!isAdmin()) {
      alert("No tienes permisos para modificar categorías");
      return;
    }

    try {
      const updatedData = {
        name: category.name,
        type: category.type,
        isRecurring: !category.isRecurring,
      };

      await categoryService.updateCategory(category.id, updatedData);

      // Actualizar estado local en lugar de recargar toda la página
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === category.id
            ? { ...cat, isRecurring: updatedData.isRecurring }
            : cat,
        ),
      );

      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar categoría");
    }
  };

  const handleToggleExpand = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDeleteCategory = async (categoryId) => {
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
      setError(err.response?.data?.error || "Error al eliminar categoría");
    }
  };

  // ===== MEDIOS DE PAGO =====
  const loadPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const data = await paymentMethodService.getPaymentMethods();
      setPaymentMethods(data.paymentMethods || []);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar medios de pago");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleOpenPaymentMethodDialog = (paymentMethod = null) => {
    setSelectedPaymentMethod(paymentMethod);
    setPaymentMethodDialogOpen(true);
  };

  const handleClosePaymentMethodDialog = () => {
    setSelectedPaymentMethod(null);
    setPaymentMethodDialogOpen(false);
  };

  const handleSavePaymentMethod = async (paymentMethodData) => {
    try {
      if (selectedPaymentMethod) {
        await paymentMethodService.updatePaymentMethod(
          selectedPaymentMethod.id,
          paymentMethodData,
        );
      } else {
        await paymentMethodService.createPaymentMethod(paymentMethodData);
      }
      handleClosePaymentMethodDialog();
      loadPaymentMethods();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar medio de pago");
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId) => {
    if (!isAdmin()) {
      alert("No tienes permisos para eliminar medios de pago");
      return;
    }

    if (!confirm("¿Estás seguro de eliminar este medio de pago?")) {
      return;
    }

    try {
      await paymentMethodService.deletePaymentMethod(paymentMethodId);
      loadPaymentMethods();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar medio de pago");
    }
  };

  // ===== FILTROS Y PAGINACIÓN =====
  // Categorías filtradas y paginadas (solo principales)
  const filteredCategories = categories
    .filter((cat) => !cat.parentCategoryId) // Solo categorías principales
    .filter((cat) => {
      const matchesSearch = cat.name
        .toLowerCase()
        .includes(categorySearchTerm.toLowerCase());
      const matchesType =
        categoryTypeFilter === "Todos" || cat.type === categoryTypeFilter;
      return matchesSearch && matchesType;
    });

  const paginatedCategories = filteredCategories.slice(
    categoryPage * categoryRowsPerPage,
    categoryPage * categoryRowsPerPage + categoryRowsPerPage,
  );

  // Medios de pago filtrados y paginados
  const filteredPaymentMethods = paymentMethods.filter((method) => {
    const matchesSearch = method.name
      .toLowerCase()
      .includes(paymentMethodSearchTerm.toLowerCase());
    const matchesType =
      paymentMethodTypeFilter === "Todos" ||
      method.type === paymentMethodTypeFilter;
    return matchesSearch && matchesType;
  });

  const paginatedPaymentMethods = filteredPaymentMethods.slice(
    paymentMethodPage * paymentMethodRowsPerPage,
    paymentMethodPage * paymentMethodRowsPerPage + paymentMethodRowsPerPage,
  );

  const loading = loadingCategories || loadingPaymentMethods;

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
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Configuración
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de categorías y medios de pago
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
          {/* CATEGORÍAS */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Categorías
                  </Typography>
                  {isAdmin() && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddOutlined />}
                      onClick={() => handleOpenCategoryDialog()}
                    >
                      Agregar
                    </Button>
                  )}
                </Box>

                {/* Filtros de categorías */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Buscar categoría..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    select
                    size="small"
                    value={categoryTypeFilter}
                    onChange={(e) => setCategoryTypeFilter(e.target.value)}
                    sx={{ minWidth: 150 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="Ingreso">Ingreso</MenuItem>
                    <MenuItem value="Egreso">Egreso</MenuItem>
                  </TextField>
                </Box>
              </Box>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width={50}></TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="center">Tipo</TableCell>
                      <TableCell align="center">Fija</TableCell>
                      {isAdmin() && (
                        <TableCell align="center">Acciones</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin() ? 5 : 4} align="center">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 4 }}
                          >
                            {categorySearchTerm ||
                            categoryTypeFilter !== "Todos"
                              ? "No se encontraron categorías con los filtros aplicados"
                              : "No hay categorías registradas"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCategories.map((category) => (
                        <Fragment key={category.id}>
                          <TableRow hover>
                            <TableCell>
                              {category.subcategories &&
                              category.subcategories.length > 0 ? (
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleToggleExpand(category.id)
                                  }
                                >
                                  {expandedCategories.has(category.id) ? (
                                    <ExpandLessOutlined fontSize="small" />
                                  ) : (
                                    <ExpandMoreOutlined fontSize="small" />
                                  )}
                                </IconButton>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {category.name}
                                {category.subcategories &&
                                  category.subcategories.length > 0 && (
                                    <Chip
                                      label={category.subcategories.length}
                                      size="small"
                                      sx={{ ml: 1, height: 20 }}
                                    />
                                  )}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={
                                  category.type === "Ingreso" ? (
                                    <TrendingUpOutlined />
                                  ) : (
                                    <TrendingDownOutlined />
                                  )
                                }
                                label={category.type}
                                color={
                                  category.type === "Ingreso"
                                    ? "success"
                                    : "error"
                                }
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Switch
                                checked={category.isRecurring || false}
                                onChange={() => handleToggleRecurring(category)}
                                disabled={!isAdmin()}
                                size="small"
                              />
                            </TableCell>
                            {isAdmin() && (
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    handleOpenCategoryDialog(category)
                                  }
                                >
                                  <EditOutlined fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                >
                                  <DeleteOutlined fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>

                          {/* Subcategorías expandibles */}
                          {expandedCategories.has(category.id) &&
                            category.subcategories &&
                            category.subcategories.map((subcat) => (
                              <TableRow
                                key={`sub-${subcat.id}`}
                                sx={{ bgcolor: "action.hover" }}
                              >
                                <TableCell></TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      pl: 2,
                                    }}
                                  >
                                    <SubdirectoryArrowRightOutlined
                                      fontSize="small"
                                      sx={{ mr: 1, color: "text.secondary" }}
                                    />
                                    <Typography variant="body2">
                                      {subcat.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={subcat.type}
                                    color={
                                      subcat.type === "Ingreso"
                                        ? "success"
                                        : "error"
                                    }
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Switch
                                    checked={subcat.isRecurring || false}
                                    onChange={() =>
                                      handleToggleRecurring(subcat)
                                    }
                                    disabled={!isAdmin()}
                                    size="small"
                                  />
                                </TableCell>
                                {isAdmin() && (
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() =>
                                        handleOpenCategoryDialog(subcat)
                                      }
                                    >
                                      <EditOutlined fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        handleDeleteCategory(subcat.id)
                                      }
                                    >
                                      <DeleteOutlined fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                        </Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación de categorías */}
              {filteredCategories.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredCategories.length}
                  page={categoryPage}
                  onPageChange={(event, newPage) => setCategoryPage(newPage)}
                  rowsPerPage={categoryRowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setCategoryRowsPerPage(parseInt(event.target.value, 10));
                    setCategoryPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count}`
                  }
                />
              )}
            </Paper>
          </Box>

          {/* MEDIOS DE PAGO */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Medios de Pago
                  </Typography>
                  {isAdmin() && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddOutlined />}
                      onClick={() => handleOpenPaymentMethodDialog()}
                    >
                      Agregar
                    </Button>
                  )}
                </Box>

                {/* Filtros de medios de pago */}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Buscar medio de pago..."
                    value={paymentMethodSearchTerm}
                    onChange={(e) => setPaymentMethodSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    select
                    size="small"
                    value={paymentMethodTypeFilter}
                    onChange={(e) => setPaymentMethodTypeFilter(e.target.value)}
                    sx={{ minWidth: 180 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="Efectivo">Efectivo</MenuItem>
                    <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                    <MenuItem value="Transferencia">Transferencia</MenuItem>
                    <MenuItem value="Billetera Virtual">
                      Billetera Virtual
                    </MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </TextField>
                </Box>
              </Box>

              <TableContainer sx={{ maxHeight: 600 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell align="center">Tipo</TableCell>
                      {isAdmin() && (
                        <TableCell align="center">Acciones</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPaymentMethods.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin() ? 3 : 2} align="center">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 4 }}
                          >
                            {paymentMethodSearchTerm ||
                            paymentMethodTypeFilter !== "Todos"
                              ? "No se encontraron medios de pago con los filtros aplicados"
                              : "No hay medios de pago registrados"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPaymentMethods.map((method) => (
                        <TableRow key={method.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {method.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={getPaymentMethodIcon(method.type)}
                              label={method.type}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          {isAdmin() && (
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  handleOpenPaymentMethodDialog(method)
                                }
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleDeletePaymentMethod(method.id)
                                }
                              >
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación de medios de pago */}
              {filteredPaymentMethods.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredPaymentMethods.length}
                  page={paymentMethodPage}
                  onPageChange={(event, newPage) =>
                    setPaymentMethodPage(newPage)
                  }
                  rowsPerPage={paymentMethodRowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setPaymentMethodRowsPerPage(
                      parseInt(event.target.value, 10),
                    );
                    setPaymentMethodPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count}`
                  }
                />
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      <CategoryDialog
        open={categoryDialogOpen}
        onClose={handleCloseCategoryDialog}
        onSave={handleSaveCategory}
        category={selectedCategory}
        parentCategories={categories}
      />

      <PaymentMethodDialog
        open={paymentMethodDialogOpen}
        onClose={handleClosePaymentMethodDialog}
        onSave={handleSavePaymentMethod}
        paymentMethod={selectedPaymentMethod}
      />
    </DashboardLayout>
  );
}
