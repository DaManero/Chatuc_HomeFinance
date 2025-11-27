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
  TablePagination,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TrendingUpOutlined,
  AccountBalanceOutlined,
  AttachMoneyOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import investmentService from "@/services/investment.service";
import InvestmentDialog from "@/components/investments/InvestmentDialog";
import EarningDialog from "@/components/investments/EarningDialog";
import EarningsHistoryDialog from "@/components/investments/EarningsHistoryDialog";

export default function InvestmentsPage() {
  const { isAdmin } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [earningDialogOpen, setEarningDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");

  useEffect(() => {
    loadInvestments();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [investments, statusFilter, typeFilter, searchTerm]);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const data = await investmentService.getInvestments();
      setInvestments(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar inversiones");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!investments) return;

    let filtered = [...investments];

    if (statusFilter !== "Todos") {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    if (typeFilter !== "Todos") {
      filtered = filtered.filter((i) => i.type === typeFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.entity?.toLowerCase().includes(searchLower) ||
          i.description?.toLowerCase().includes(searchLower) ||
          i.amount.toString().includes(searchLower)
      );
    }

    // Ordenar: Plazo Fijo primero, luego por fecha
    filtered.sort((a, b) => {
      // Prioridad 1: Plazo Fijo siempre primero
      if (a.type === "Plazo Fijo" && b.type !== "Plazo Fijo") return -1;
      if (a.type !== "Plazo Fijo" && b.type === "Plazo Fijo") return 1;

      // Prioridad 2: Por fecha (más reciente primero)
      return new Date(b.startDate) - new Date(a.startDate);
    });

    setFilteredInvestments(filtered);
  };

  const handleStatusFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setStatusFilter(newFilter);
      setPage(0);
    }
  };

  const handleTypeFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setTypeFilter(newFilter);
      setPage(0);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (investment = null) => {
    setSelectedInvestment(investment);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedInvestment(null);
    setDialogOpen(false);
  };

  const handleSaveInvestment = () => {
    handleCloseDialog();
    loadInvestments();
  };

  const handleOpenEarningDialog = (investment) => {
    setSelectedInvestment(investment);
    setEarningDialogOpen(true);
  };

  const handleCloseEarningDialog = () => {
    setSelectedInvestment(null);
    setEarningDialogOpen(false);
  };

  const handleSaveEarning = () => {
    handleCloseEarningDialog();
    loadInvestments();
  };

  const handleOpenHistoryDialog = (investmentId) => {
    setSelectedInvestmentId(investmentId);
    setHistoryDialogOpen(true);
  };

  const handleCloseHistoryDialog = () => {
    setSelectedInvestmentId(null);
    setHistoryDialogOpen(false);
  };

  const handleDelete = async (investmentId) => {
    if (!isAdmin()) {
      alert("No tienes permisos para eliminar inversiones");
      return;
    }

    if (
      !confirm(
        "¿Estás seguro de eliminar esta inversión? (Las transacciones creadas no se eliminarán)"
      )
    ) {
      return;
    }

    try {
      await investmentService.deleteInvestment(investmentId);
      loadInvestments();
      setError(null);
    } catch (err) {
      console.error("Error al eliminar inversión:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al eliminar inversión"
      );
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedInvestments = filteredInvestments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calcular totales para Plazos Fijos
  const plazoFijoStats = (investments || [])
    .filter((i) => i.type === "Plazo Fijo" && i.status === "Activo")
    .reduce((acc, inv) => {
      const currency = inv.currency || "ARS";
      const amount = parseFloat(inv.amount);
      const earnings = parseFloat(inv.totalEarnings || 0);

      if (!acc[currency]) {
        acc[currency] = { invertido: 0, intereses: 0, count: 0 };
      }

      acc[currency].invertido += amount;
      acc[currency].intereses += earnings;
      acc[currency].count += 1;

      return acc;
    }, {});

  // Calcular totales para Compra/Venta de Divisas
  const divisasStats = (investments || [])
    .filter(
      (i) =>
        (i.type === "Compra Divisa" || i.type === "Venta Divisa") &&
        i.status === "Activo"
    )
    .reduce(
      (acc, inv) => {
        const amount = parseFloat(inv.amount);
        const exchangeAmount = parseFloat(inv.exchangeAmount || 0);

        if (inv.type === "Compra Divisa") {
          acc.compras.USD += amount;
          acc.compras.ARS += exchangeAmount;
          acc.compras.count += 1;
        } else {
          // Venta Divisa
          acc.ventas.USD += amount;
          acc.ventas.ARS += exchangeAmount;
          acc.ventas.count += 1;
        }

        return acc;
      },
      {
        compras: { USD: 0, ARS: 0, count: 0 },
        ventas: { USD: 0, ARS: 0, count: 0 },
      }
    );

  const getCurrencySymbol = (currency) => {
    return currency === "USD" ? "U$S" : "$";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Activo":
        return "primary";
      case "Vencido":
        return "warning";
      case "Rescatado":
        return "success";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type) => {
    if (type === "Plazo Fijo")
      return <AccountBalanceOutlined fontSize="small" />;
    return <TrendingUpOutlined fontSize="small" />;
  };

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
              Inversiones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Plazos fijos y operaciones de divisas
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
          >
            Nueva Inversión
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Tarjetas de resumen */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {/* Card Plazos Fijos */}
          {Object.keys(plazoFijoStats).length > 0 &&
            Object.entries(plazoFijoStats).map(([currency, values]) => {
              const isUSD = currency === "USD";
              const bgColor = isUSD
                ? "rgba(0, 123, 255, 0.04)"
                : "rgba(76, 175, 80, 0.04)";
              const borderColor = isUSD
                ? "rgba(0, 123, 255, 0.2)"
                : "rgba(76, 175, 80, 0.2)";

              return (
                <Paper
                  key={`plazo-${currency}`}
                  sx={{
                    flex: "1 1 300px",
                    p: 2,
                    bgcolor: bgColor,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Plazos Fijos ({currency})
                    </Typography>
                    <AccountBalanceOutlined
                      sx={{ color: "primary.main", fontSize: 40 }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Invertido
                      </Typography>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        fontWeight={600}
                      >
                        {getCurrencySymbol(currency)}{" "}
                        {values.invertido.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: "right" }}>
                      <Typography variant="caption" color="text.secondary">
                        Intereses
                      </Typography>
                      <Typography
                        variant="h6"
                        color="success.main"
                        fontWeight={600}
                      >
                        {getCurrencySymbol(currency)}{" "}
                        {values.intereses.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    {values.count} plazo{values.count !== 1 ? "s" : ""} activo
                    {values.count !== 1 ? "s" : ""}
                  </Typography>
                </Paper>
              );
            })}

          {/* Card Compra de Dólares */}
          {divisasStats.compras.count > 0 && (
            <Paper
              sx={{
                flex: "1 1 300px",
                p: 2,
                bgcolor: "rgba(76, 175, 80, 0.04)",
                border: "1px solid rgba(76, 175, 80, 0.2)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Compra de Dólares
                </Typography>
                <TrendingUpOutlined
                  sx={{ color: "success.main", fontSize: 40 }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Dólares
                  </Typography>
                  <Typography
                    variant="h6"
                    color="success.main"
                    fontWeight={600}
                  >
                    U$S{" "}
                    {divisasStats.compras.USD.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: "right" }}>
                  <Typography variant="caption" color="text.secondary">
                    Pesos pagados
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight={600}
                  >
                    ${" "}
                    {divisasStats.compras.ARS.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {divisasStats.compras.count} compra
                {divisasStats.compras.count !== 1 ? "s" : ""}
              </Typography>
            </Paper>
          )}

          {/* Card Venta de Dólares */}
          {divisasStats.ventas.count > 0 && (
            <Paper
              sx={{
                flex: "1 1 300px",
                p: 2,
                bgcolor: "rgba(255, 152, 0, 0.04)",
                border: "1px solid rgba(255, 152, 0, 0.2)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Venta de Dólares
                </Typography>
                <TrendingUpOutlined
                  sx={{ color: "warning.main", fontSize: 40 }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Dólares
                  </Typography>
                  <Typography
                    variant="h6"
                    color="warning.main"
                    fontWeight={600}
                  >
                    U$S{" "}
                    {divisasStats.ventas.USD.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: "right" }}>
                  <Typography variant="caption" color="text.secondary">
                    Pesos recibidos
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight={600}
                  >
                    ${" "}
                    {divisasStats.ventas.ARS.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {divisasStats.ventas.count} venta
                {divisasStats.ventas.count !== 1 ? "s" : ""}
              </Typography>
            </Paper>
          )}

          {Object.keys(plazoFijoStats).length === 0 &&
            Object.keys(divisasStats).length === 0 && (
              <Paper sx={{ flex: 1, p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No hay inversiones activas
                </Typography>
              </Paper>
            )}
        </Box>

        {/* Filtros */}
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
            placeholder="Buscar inversiones..."
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
            value={statusFilter}
            exclusive
            onChange={handleStatusFilterChange}
            size="small"
          >
            <ToggleButton value="Todos">Todos</ToggleButton>
            <ToggleButton value="Activo">Activos</ToggleButton>
            <ToggleButton value="Vencido">Vencidos</ToggleButton>
            <ToggleButton value="Rescatado">Rescatados</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={typeFilter}
            exclusive
            onChange={handleTypeFilterChange}
            size="small"
          >
            <ToggleButton value="Todos">Todos</ToggleButton>
            <ToggleButton value="Plazo Fijo">Plazo Fijo</ToggleButton>
            <ToggleButton value="Compra Divisa">Compra</ToggleButton>
            <ToggleButton value="Venta Divisa">Venta</ToggleButton>
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
                <TableCell>Tipo</TableCell>
                <TableCell>Entidad</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell>Tasa</TableCell>
                <TableCell>Estado</TableCell>
                {isAdmin() && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvestments.map((investment) => (
                <TableRow key={investment.id} hover>
                  <TableCell>
                    <Chip
                      icon={getTypeIcon(investment.type)}
                      label={investment.type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {investment.entity}
                    </Typography>
                    {investment.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {investment.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      investment.startDate + "T00:00:00"
                    ).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {getCurrencySymbol(investment.currency)}{" "}
                      {parseFloat(investment.amount).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    {investment.exchangeRate && (
                      <Typography variant="caption" color="text.secondary">
                        TC: $
                        {parseFloat(investment.exchangeRate).toLocaleString(
                          "es-AR"
                        )}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {investment.interestRate ? (
                      <Typography variant="body2">
                        {parseFloat(investment.interestRate).toFixed(2)}%
                      </Typography>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={investment.status}
                      color={getStatusColor(investment.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  {isAdmin() && (
                    <TableCell>
                      {investment.type === "Plazo Fijo" && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenEarningDialog(investment)}
                            title="Registrar rendimiento"
                          >
                            <AttachMoneyOutlined fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() =>
                              handleOpenHistoryDialog(investment.id)
                            }
                            title="Ver historial"
                          >
                            <VisibilityOutlined fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(investment)}
                        title="Editar"
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(investment.id)}
                        title="Eliminar"
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
            count={filteredInvestments.length}
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

        {filteredInvestments.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm || statusFilter !== "Todos" || typeFilter !== "Todos"
                ? "No se encontraron inversiones que coincidan con los filtros"
                : "No hay inversiones registradas"}
            </Typography>
          </Box>
        )}
      </Box>

      <InvestmentDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveInvestment}
        investment={selectedInvestment}
      />

      <EarningDialog
        open={earningDialogOpen}
        onClose={handleCloseEarningDialog}
        onSave={handleSaveEarning}
        investment={selectedInvestment}
      />

      <EarningsHistoryDialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        investmentId={selectedInvestmentId}
      />
    </DashboardLayout>
  );
}
