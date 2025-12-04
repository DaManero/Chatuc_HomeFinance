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
  TrendingUpOutlined,
  TrendingDownOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import transactionService from "@/services/transaction.service";
import categoryService from "@/services/category.service";
import paymentMethodService from "@/services/paymentMethod.service";
import TransactionDialog from "@/components/transactions/TransactionDialog";

export default function TransactionsPage() {
  const { isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [currencyFilter, setCurrencyFilter] = useState("Todas");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [transactions, filter, currencyFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, categoriesData, paymentMethodsData] =
        await Promise.all([
          transactionService.getTransactions(),
          categoryService.getCategories(),
          paymentMethodService.getPaymentMethods(),
        ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
      setPaymentMethods(paymentMethodsData.paymentMethods || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...transactions];

    // Filtrar por tipo
    if (filter !== "Todos") {
      filtered = filtered.filter((t) => t.type === filter);
    }

    // Filtrar por moneda
    if (currencyFilter !== "Todas") {
      filtered = filtered.filter(
        (t) => (t.currency || "ARS") === currencyFilter
      );
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchLower) ||
          t.category?.name?.toLowerCase().includes(searchLower) ||
          t.paymentMethod?.name?.toLowerCase().includes(searchLower) ||
          t.amount.toString().includes(searchLower)
      );
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(0);
    }
  };

  const handleCurrencyFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setCurrencyFilter(newFilter);
      setPage(0);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (transaction = null) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTransaction(null);
    setDialogOpen(false);
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      if (selectedTransaction) {
        await transactionService.updateTransaction(
          selectedTransaction.id,
          transactionData
        );
      } else {
        await transactionService.createTransaction(transactionData);
      }
      handleCloseDialog();
      loadData();
      setError(null);
    } catch (err) {
      console.error("Error al guardar transacción:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al guardar transacción"
      );
    }
  };

  const handleDelete = async (transactionId) => {
    if (!isAdmin()) {
      alert("No tienes permisos para eliminar transacciones");
      return;
    }

    if (!confirm("¿Estás seguro de eliminar esta transacción?")) {
      return;
    }

    try {
      await transactionService.deleteTransaction(transactionId);
      loadData();
      setError(null);
    } catch (err) {
      console.error("Error al eliminar transacción:", err);
      setError(err.response?.data?.error || "Error al eliminar transacción");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calcular totales del mes actual separados por moneda
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totals = transactions
    .filter((t) => {
      const transactionDate = new Date(t.date + "T00:00:00");
      const isCurrentMonth =
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;
      // Excluir transacciones con medio de pago tipo "Tarjeta" del balance
      const isCreditCardPayment = t.paymentMethod?.type === "Tarjeta";
      return isCurrentMonth && !isCreditCardPayment;
    })
    .reduce((acc, t) => {
      const currency = t.currency || "ARS";
      const amount = parseFloat(t.amount);

      if (!acc[currency]) {
        acc[currency] = { ingresos: 0, egresos: 0 };
      }

      if (t.type === "Ingreso") {
        acc[currency].ingresos += amount;
      } else {
        acc[currency].egresos += amount;
      }
      return acc;
    }, {});

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
              Transacciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión de ingresos y egresos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={() => handleOpenDialog()}
          >
            Nueva Transacción
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Tarjetas de resumen */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {Object.keys(totals).length > 0 ? (
            Object.entries(totals).map(([currency, values]) => {
              const balance = values.ingresos - values.egresos;
              const isUSD = currency === "USD";
              const bgColor = isUSD
                ? "rgba(0, 123, 255, 0.04)"
                : "rgba(76, 175, 80, 0.04)";
              const borderColor = isUSD
                ? "rgba(0, 123, 255, 0.2)"
                : "rgba(76, 175, 80, 0.2)";

              return (
                <Box
                  key={currency}
                  sx={{ display: "flex", gap: 2, flex: "1 1 100%" }}
                >
                  <Paper
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: bgColor,
                      border: `1px solid ${borderColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Ingresos ({currency})
                      </Typography>
                      <Typography
                        variant="h5"
                        color="success.main"
                        fontWeight={600}
                      >
                        {getCurrencySymbol(currency)}{" "}
                        {values.ingresos.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <TrendingUpOutlined
                      sx={{
                        color: "success.main",
                        fontSize: 40,
                      }}
                    />
                  </Paper>
                  <Paper
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: bgColor,
                      border: `1px solid ${borderColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Egresos ({currency})
                      </Typography>
                      <Typography
                        variant="h5"
                        color="error.main"
                        fontWeight={600}
                      >
                        {getCurrencySymbol(currency)}{" "}
                        {values.egresos.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <TrendingDownOutlined
                      sx={{
                        color: "error.main",
                        fontSize: 40,
                      }}
                    />
                  </Paper>
                  <Paper
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: bgColor,
                      border: `1px solid ${borderColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Balance ({currency})
                      </Typography>
                      <Typography
                        variant="h5"
                        color={balance >= 0 ? "success.main" : "error.main"}
                        fontWeight={600}
                      >
                        {getCurrencySymbol(currency)}{" "}
                        {balance.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: balance >= 0 ? "success.main" : "error.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 20,
                        fontWeight: 600,
                      }}
                    >
                      {balance >= 0 ? "+" : "-"}
                    </Box>
                  </Paper>
                </Box>
              );
            })
          ) : (
            <Paper sx={{ flex: 1, p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No hay transacciones este mes
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
            placeholder="Buscar transacciones..."
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
            aria-label="filtro de transacciones"
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
          <ToggleButtonGroup
            value={currencyFilter}
            exclusive
            onChange={handleCurrencyFilterChange}
            aria-label="filtro de moneda"
            size="small"
          >
            <ToggleButton value="Todas" aria-label="todas">
              Todas
            </ToggleButton>
            <ToggleButton value="ARS" aria-label="pesos">
              🇦🇷 Pesos
            </ToggleButton>
            <ToggleButton value="USD" aria-label="dolares">
              🇺🇸 Dólares
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
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Medio de Pago</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Monto</TableCell>
                {isAdmin() && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    {new Date(
                      transaction.date + "T00:00:00"
                    ).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        transaction.type === "Ingreso" ? (
                          <TrendingUpOutlined />
                        ) : (
                          <TrendingDownOutlined />
                        )
                      }
                      label={transaction.type}
                      color={
                        transaction.type === "Ingreso" ? "success" : "error"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.category?.name || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.paymentMethod?.name || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {transaction.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={
                        transaction.type === "Ingreso"
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      {getCurrencySymbol(transaction.currency || "ARS")}{" "}
                      {parseFloat(transaction.amount).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </TableCell>
                  {isAdmin() && (
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(transaction)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(transaction.id)}
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
            count={filteredTransactions.length}
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

        {filteredTransactions.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm || filter !== "Todos"
                ? "No se encontraron transacciones que coincidan con los filtros"
                : "No hay transacciones registradas"}
            </Typography>
          </Box>
        )}
      </Box>

      <TransactionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction}
        categories={categories}
        paymentMethods={paymentMethods}
      />
    </DashboardLayout>
  );
}
