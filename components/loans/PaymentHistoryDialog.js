"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import { CloseOutlined, ReceiptLongOutlined } from "@mui/icons-material";
import loanService from "@/services/loan.service";

export default function PaymentHistoryDialog({ open, onClose, loanId }) {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && loanId) {
      loadLoanDetails();
    }
  }, [open, loanId]);

  const loadLoanDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loanService.getLoanById(loanId);
      setLoan(data);
    } catch (err) {
      console.error("Error al cargar detalle:", err);
      setError(err.response?.data?.error || "Error al cargar detalle");
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    return currency === "USD" ? "U$S" : "$";
  };

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalle de Préstamo
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : loan ? (
          <>
            {/* Información del préstamo */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {loan.entity}
                  </Typography>
                  {loan.description && (
                    <Typography variant="body2" color="text.secondary">
                      {loan.description}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={loan.status}
                  color={getStatusColor(loan.status)}
                  size="medium"
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha del Préstamo
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(loan.loanDate + "T00:00:00").toLocaleDateString(
                      "es-ES"
                    )}
                  </Typography>
                </Box>

                {loan.dueDate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Vencimiento
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(loan.dueDate + "T00:00:00").toLocaleDateString(
                        "es-ES"
                      )}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Monto Total
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {getCurrencySymbol(loan.currency)}{" "}
                    {parseFloat(loan.totalAmount).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pendiente
                  </Typography>
                  <Typography
                    variant="body1"
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
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Pagado
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="success.main"
                  >
                    {getCurrencySymbol(loan.currency)}{" "}
                    {(
                      parseFloat(loan.totalAmount) -
                      parseFloat(loan.pendingAmount)
                    ).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>

                {loan.installments && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cuotas
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {loan.installments}
                    </Typography>
                  </Box>
                )}

                {loan.interestRate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tasa de Interés
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {parseFloat(loan.interestRate).toFixed(2)}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Historial de pagos */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Historial de Pagos
              </Typography>

              {loan.payments && loan.payments.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Notas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loan.payments
                        .sort(
                          (a, b) =>
                            new Date(b.paymentDate) - new Date(a.paymentDate)
                        )
                        .map((payment, index) => (
                          <TableRow key={payment.id} hover>
                            <TableCell>
                              <Chip
                                label={loan.payments.length - index}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(
                                payment.paymentDate + "T00:00:00"
                              ).toLocaleDateString("es-ES")}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="success.main"
                              >
                                {getCurrencySymbol(loan.currency)}{" "}
                                {parseFloat(payment.amount).toLocaleString(
                                  "es-AR",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
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
                                {payment.notes || "-"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  }}
                >
                  <ReceiptLongOutlined
                    sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    No hay pagos registrados
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
