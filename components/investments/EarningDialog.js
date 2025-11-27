"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  InputAdornment,
} from "@mui/material";
import investmentService from "@/services/investment.service";

export default function EarningDialog({ open, onClose, onSave, investment }) {
  const [formData, setFormData] = useState({
    amount: "",
    earningDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setFormData({
        amount: "",
        earningDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setError(null);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError("El monto debe ser mayor a 0");
        return;
      }

      if (!formData.earningDate) {
        setError("La fecha es obligatoria");
        return;
      }

      const payload = {
        amount: parseFloat(formData.amount),
        earningDate: formData.earningDate,
        notes: formData.notes || null,
      };

      await investmentService.registerEarning(investment.id, payload);

      onSave();
    } catch (err) {
      console.error("Error al registrar rendimiento:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al registrar el rendimiento"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    return currency === "USD" ? "U$S" : "$";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Rendimiento</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {investment && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>{investment.entity}</strong>
            <br />
            {investment.type} - {getCurrencySymbol(investment.currency)}{" "}
            {parseFloat(investment.amount).toLocaleString("es-AR")}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Monto del Rendimiento"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {investment && getCurrencySymbol(investment.currency)}
                </InputAdornment>
              ),
            }}
            helperText="Monto cobrado por intereses"
          />

          <TextField
            label="Fecha del Rendimiento"
            name="earningDate"
            type="date"
            value={formData.earningDate}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Notas"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="Notas adicionales (opcional)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
