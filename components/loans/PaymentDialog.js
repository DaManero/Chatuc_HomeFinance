"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Grid,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import loanService from "@/services/loan.service";

export default function PaymentDialog({ open, onClose, onSave, loan = null }) {
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      // Sugerir monto de cuota si existe
      setFormData({
        amount: loan.installmentAmount || "",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } else {
      setFormData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    setErrors({});
  }, [loan, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
    }

    if (loan && parseFloat(formData.amount) > parseFloat(loan.pendingAmount)) {
      newErrors.amount = `El monto no puede ser mayor al pendiente (${getCurrencySymbol()} ${parseFloat(
        loan.pendingAmount
      ).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })})`;
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "La fecha es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const dataToSend = {
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      notes: formData.notes.trim() || null,
    };

    try {
      setLoading(true);
      await loanService.registerPayment(loan.id, dataToSend);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error al registrar pago:", error);
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al registrar pago"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = () => {
    return loan?.currency === "USD" ? "U$S" : "$";
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Registrar Pago
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Préstamo
          </Typography>
          <Typography variant="h6" gutterBottom>
            {loan.entity}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Monto Total
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {getCurrencySymbol()}{" "}
                {parseFloat(loan.totalAmount).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Pendiente
              </Typography>
              <Typography variant="body1" fontWeight={600} color="error.main">
                {getCurrencySymbol()}{" "}
                {parseFloat(loan.pendingAmount).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Monto del Pago"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={
                errors.amount ||
                (loan.installmentAmount
                  ? `Monto sugerido: ${getCurrencySymbol()} ${parseFloat(
                      loan.installmentAmount
                    ).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "")
              }
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getCurrencySymbol()}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Fecha de Pago"
              name="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={handleChange}
              error={!!errors.paymentDate}
              helperText={errors.paymentDate}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notas"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              error={!!errors.notes}
              helperText={errors.notes || "Opcional"}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "action.hover",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Nuevo pendiente después del pago:
          </Typography>
          <Typography variant="h6" color="success.main" fontWeight={600}>
            {getCurrencySymbol()}{" "}
            {(
              parseFloat(loan.pendingAmount) -
              (parseFloat(formData.amount) || 0)
            ).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Registrando..." : "Registrar Pago"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
