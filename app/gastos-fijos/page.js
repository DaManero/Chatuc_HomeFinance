"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  TablePagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  TrendingUpOutlined,
  TrendingDownOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import recurringExpensesService from "@/services/recurringExpenses.service";

export default function GastosFijosPage() {
  const [data, setData] = useState(null);
  const [filteredProjections, setFilteredProjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProjection();
  }, []);

  useEffect(() => {
    if (data) {
      applyFilter();
    }
  }, [data, filter, searchTerm]);

  const loadProjection = async () => {
    try {
      setLoading(true);
      const result = await recurringExpensesService.getProjection();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error al cargar proyección:", err);
      setError(err.response?.data?.error || "Error al cargar proyección");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...data.projections];

    // Filtrar por tipo
    if (filter !== "Todos") {
      filtered = filtered.filter((p) => p.type === filter);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.categoryName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProjections(filtered);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getNextMonthName = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `$ ${parseFloat(amount).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const paginatedProjections = filteredProjections.slice(
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Gastos Fijos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Proyección para {getNextMonthName()}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {data && (
          <>
            {/* Cards de resumen */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ingresos Fijos
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>
                  {formatCurrency(data.summary.totalIngresos)}
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Egresos Fijos
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight={600}>
                  {formatCurrency(data.summary.totalEgresos)}
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Balance Proyectado
                </Typography>
                <Typography
                  variant="h5"
                  color={
                    data.summary.balance >= 0 ? "success.main" : "error.main"
                  }
                  fontWeight={600}
                >
                  {formatCurrency(data.summary.balance)}
                </Typography>
              </Paper>
            </Box>

            {/* Filtros y búsqueda */}
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
                placeholder="Buscar por categoría..."
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
                aria-label="filtro de tipo"
                size="small"
              >
                <ToggleButton value="Todos" aria-label="todos">
                  Todos
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

            {/* Tabla de detalle */}
            <TableContainer component={Paper}>
              <Table
                sx={{
                  "& .MuiTableCell-root": { textAlign: "left", py: 1 },
                  "& .MuiTableRow-root": { height: 52 },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Último Monto</TableCell>
                    <TableCell>Fecha Última Transacción</TableCell>
                    <TableCell>Monto Proyectado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProjections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 4 }}
                        >
                          {data.projections.length === 0
                            ? "No hay categorías marcadas como recurrentes"
                            : "No se encontraron resultados"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProjections.map((projection) => (
                      <TableRow key={projection.categoryId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {projection.categoryName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              projection.type === "Ingreso" ? (
                                <TrendingUpOutlined />
                              ) : (
                                <TrendingDownOutlined />
                              )
                            }
                            label={projection.type}
                            color={
                              projection.type === "Ingreso"
                                ? "success"
                                : "error"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(projection.lastAmount)}
                        </TableCell>
                        <TableCell>
                          {projection.lastDate
                            ? new Date(
                                projection.lastDate + "T00:00:00"
                              ).toLocaleDateString("es-ES")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(projection.projectedAmount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredProjections.length}
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

            {filteredProjections.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  * La proyección se basa en el monto de la última transacción
                  registrada para cada categoría recurrente
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
