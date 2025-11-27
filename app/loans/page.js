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
  PaymentOutlined,
  SearchOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import loanService from "@/services/loan.service";
import LoanDialog from "@/components/loans/LoanDialog";
import PaymentDialog from "@/components/loans/PaymentDialog";
import PaymentHistoryDialog from "@/components/loans/PaymentHistoryDialog";

export default function LoansPage() {
  const { isAdmin } = useAuth();
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [loans, filter, searchTerm]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await loanService.getLoans();
      setLoans(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar préstamos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...loans];

    // Filtrar por estado
    if (filter !== "Todos") {
      filtered = filtered.filter((l) => l.status === filter);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.entity?.toLowerCase().includes(searchLower) ||
          l.description?.toLowerCase().includes(searchLower) ||
          l.totalAmount.toString().includes(searchLower)
      );
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate));

    setFilteredLoans(filtered);
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

  const handleOpenDialog = (loan = null) => {
    setSelectedLoan(loan);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedLoan(null);
    setDialogOpen(false);
  };

  const handleOpenPaymentDialog = (loan) => {
    setSelectedLoan(loan);
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setSelectedLoan(null);
    setPaymentDialogOpen(false);
  };

  const handleSaveLoan = () => {
    handleCloseDialog();
    loadLoans();
  };

  const handleSavePayment = () => {
    handleClosePaymentDialog();
    loadLoans();
  };

  const handleOpenHistoryDialog = (loanId) => {
    setSelectedLoanId(loanId);
    setHistoryDialogOpen(true);
  };

  const handleCloseHistoryDialog = () => {
    setSelectedLoanId(null);
    setHistoryDialogOpen(false);
  };

  const handleDelete = async (loanId) => {
    if (!isAdmin()) {
      alert("No tienes permisos para eliminar préstamos");
      return;
    }

    if (!confirm("¿Estás seguro de eliminar este préstamo?")) {
      return;
    }

    try {
      await loanService.deleteLoan(loanId);
      loadLoans();
      setError(null);
    } catch (err) {
      console.error("Error al eliminar préstamo:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al eliminar préstamo"
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

  const paginatedLoans = filteredLoans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calcular totales
  const totals = loans.reduce(
    (acc, loan) => {
      const totalAmount = parseFloat(loan.totalAmount);
      const pendingAmount = parseFloat(loan.pendingAmount);

      acc.totalPrestado += totalAmount;
      acc.totalPendiente += pendingAmount;
      acc.totalPagado += totalAmount - pendingAmount;

      return acc;
    },
    { totalPrestado: 0, totalPendiente: 0, totalPagado: 0 }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Activo":
        return "primary";
      case "Pagado":
        return "success";
      case "Vencido":
        return "error";
      default:
        return "default";
    }
  };

  const getCurrencySymbol = (currency) => {
    return currency === "USD" ? "U$S" : "$";
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
              Préstamos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión de préstamos recibidos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Préstamo
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Tarjetas de resumen */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Paper sx={{ flex: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Prestado
            </Typography>
            <Typography variant="h5" color="primary.main" fontWeight={600}>
              ${" "}
              {totals.totalPrestado.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pendiente de Pago
            </Typography>
            <Typography variant="h5" color="error.main" fontWeight={600}>
              ${" "}
              {totals.totalPendiente.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Pagado
            </Typography>
            <Typography variant="h5" color="success.main" fontWeight={600}>
              ${" "}
              {totals.totalPagado.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>
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
            placeholder="Buscar préstamos..."
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
            aria-label="filtro de préstamos"
            size="small"
          >
            <ToggleButton value="Todos" aria-label="todos">
              Todos
            </ToggleButton>
            <ToggleButton value="Activo" aria-label="activos">
              Activos
            </ToggleButton>
            <ToggleButton value="Pagado" aria-label="pagados">
              Pagados
            </ToggleButton>
            <ToggleButton value="Vencido" aria-label="vencidos">
              Vencidos
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
                <TableCell>Entidad</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Monto Total</TableCell>
                <TableCell align="right">Pendiente</TableCell>
                <TableCell align="right">Cuotas</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLoans.map((loan) => (
                <TableRow key={loan.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {loan.entity}
                    </Typography>
                    {loan.description && (
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
                        {loan.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(loan.loanDate + "T00:00:00").toLocaleDateString(
                      "es-ES"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {getCurrencySymbol(loan.currency)}{" "}
                      {parseFloat(loan.totalAmount).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={
                        parseFloat(loan.pendingAmount) > 0
                          ? "error.main"
                          : "success.main"
                      }
                    >
                      {getCurrencySymbol(loan.currency)}{" "}
                      {parseFloat(loan.pendingAmount).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {loan.installments || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={loan.status}
                      color={getStatusColor(loan.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleOpenHistoryDialog(loan.id)}
                      title="Ver detalle de pagos"
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                    {loan.status === "Activo" && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleOpenPaymentDialog(loan)}
                        title="Registrar pago"
                      >
                        <PaymentOutlined fontSize="small" />
                      </IconButton>
                    )}
                    {isAdmin() && (
                      <>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(loan)}
                          disabled={loan.payments && loan.payments.length > 0}
                          title={
                            loan.payments && loan.payments.length > 0
                              ? "No se puede editar un préstamo con pagos"
                              : "Editar"
                          }
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(loan.id)}
                          disabled={
                            (loan.payments && loan.payments.length > 0) ||
                            loan.status !== "Pagado"
                          }
                          title={
                            loan.payments && loan.payments.length > 0
                              ? "No se puede eliminar un préstamo con pagos registrados"
                              : loan.status !== "Pagado"
                              ? "Solo se pueden eliminar préstamos pagados"
                              : "Eliminar"
                          }
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredLoans.length}
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

        {filteredLoans.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm || filter !== "Todos"
                ? "No se encontraron préstamos que coincidan con los filtros"
                : "No hay préstamos registrados"}
            </Typography>
          </Box>
        )}
      </Box>

      <LoanDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveLoan}
        loan={selectedLoan}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        onSave={handleSavePayment}
        loan={selectedLoan}
      />

      <PaymentHistoryDialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        loanId={selectedLoanId}
      />
    </DashboardLayout>
  );
}
