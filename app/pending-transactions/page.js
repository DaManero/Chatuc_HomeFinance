"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import pendingTransactionService from "@/services/pendingTransaction.service";
import categoryService from "@/services/category.service";
import { formatDate } from "@/utils/dateUtils";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PendingTransactionsPage() {
  const [pendingTransactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [stats, setStats] = useState(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "ARS",
    type: "Egreso",
    categoryId: "",
    categoryName: "",
    description: "",
    transactionDate: "",
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsData, categoriesData, statsData] = await Promise.all([
        pendingTransactionService.getPendingTransactions(statusFilter),
        categoryService.getCategories(),
        pendingTransactionService.getStats(),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al cargar las transacciones pendientes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      amount: transaction.amount || "",
      currency: transaction.currency || "ARS",
      type: transaction.type || "Egreso",
      categoryId: "",
      categoryName: transaction.suggestedCategory || "",
      description: transaction.description || "",
      transactionDate: transaction.transactionDate
        ? new Date(transaction.transactionDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProcess = async () => {
    try {
      setError(null);

      // Encontrar la categoría seleccionada
      const selectedCategory = categories.find(
        (c) => c.id === parseInt(formData.categoryId)
      );

      const processData = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        type: formData.type,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        categoryName: selectedCategory?.name || formData.categoryName,
        description: formData.description,
        transactionDate: formData.transactionDate,
      };

      await pendingTransactionService.processPendingTransaction(
        selectedTransaction.id,
        processData
      );

      setSuccess("Transacción procesada correctamente");
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al procesar la transacción"
      );
    }
  };

  const handleDiscard = async (id) => {
    if (!confirm("¿Estás seguro de descartar esta transacción?")) return;

    try {
      setError(null);
      await pendingTransactionService.discardPendingTransaction(id);
      setSuccess("Transacción descartada");
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al descartar la transacción"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processed":
        return "success";
      case "discarded":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "processed":
        return "Procesada";
      case "discarded":
        return "Descartada";
      default:
        return status;
    }
  };

  // Filtrar categorías según el tipo de transacción
  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Transacciones Pendientes
        </Typography>
        {stats && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Chip
              label={`Pendientes: ${stats.pending || 0}`}
              color="warning"
              variant={statusFilter === "pending" ? "filled" : "outlined"}
            />
            <Chip
              label={`Procesadas: ${stats.processed || 0}`}
              color="success"
              variant={statusFilter === "processed" ? "filled" : "outlined"}
            />
            <Chip
              label={`Descartadas: ${stats.discarded || 0}`}
              color="error"
              variant={statusFilter === "discarded" ? "filled" : "outlined"}
            />
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(e, newValue) => setStatusFilter(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Pendientes" value="pending" />
          <Tab label="Procesadas" value="processed" />
          <Tab label="Descartadas" value="discarded" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Mensaje Original</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Moneda</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No hay transacciones{" "}
                  {getStatusLabel(statusFilter).toLowerCase()}
                </TableCell>
              </TableRow>
            ) : (
              pendingTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      "{transaction.rawMessage}"
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {transaction.amount?.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>{transaction.currency}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      color={
                        transaction.type === "Ingreso" ? "success" : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.suggestedCategory || "-"}</TableCell>
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(transaction.status)}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {transaction.status === "pending" && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(transaction)}
                          title="Procesar"
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDiscard(transaction.id)}
                          title="Descartar"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para procesar transacción */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Procesar Transacción</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <Alert severity="info">
                Mensaje original: "{selectedTransaction.rawMessage}"
              </Alert>

              <TextField
                label="Monto"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ step: "0.01" }}
              />

              <TextField
                label="Moneda"
                name="currency"
                select
                value={formData.currency}
                onChange={handleInputChange}
                fullWidth
              >
                <MenuItem value="ARS">ARS</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </TextField>

              <TextField
                label="Tipo"
                name="type"
                select
                value={formData.type}
                onChange={handleInputChange}
                fullWidth
              >
                <MenuItem value="Ingreso">Ingreso</MenuItem>
                <MenuItem value="Egreso">Egreso</MenuItem>
              </TextField>

              <TextField
                label="Categoría"
                name="categoryId"
                select
                value={formData.categoryId}
                onChange={handleInputChange}
                fullWidth
                helperText={
                  formData.categoryName && !formData.categoryId
                    ? `Sugerencia: ${formData.categoryName}`
                    : ""
                }
              >
                <MenuItem value="">
                  <em>Crear nueva: {formData.categoryName}</em>
                </MenuItem>
                {filteredCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Fecha"
                name="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleProcess} variant="contained" color="primary">
            Procesar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </DashboardLayout>
  );
}
