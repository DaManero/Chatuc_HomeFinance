"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  InputAdornment,
  Grid,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import loanService from "@/services/loan.service";

export default function LoanDialog({ open, onClose, onSave, loan = null }) {
  const [formData, setFormData] = useState({
    entity: "",
    totalAmount: "",
    currency: "ARS",
    interestRate: "",
    loanDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    installments: "",
    installmentAmount: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      // Modo edición
      setFormData({
        entity: loan.entity || "",
        totalAmount: loan.totalAmount || "",
        currency: loan.currency || "ARS",
        interestRate: loan.interestRate || "",
        loanDate: loan.loanDate || new Date().toISOString().split("T")[0],
        dueDate: loan.dueDate || "",
        installments: loan.installments || "",
        installmentAmount: loan.installmentAmount || "",
        description: loan.description || "",
      });
    } else {
      // Modo creación
      setFormData({
        entity: "",
        totalAmount: "",
        currency: "ARS",
        interestRate: "",
        loanDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        installments: "",
        installmentAmount: "",
        description: "",
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

    if (!formData.entity.trim()) {
      newErrors.entity = "La entidad es requerida";
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = "El monto debe ser mayor a 0";
    }

    if (!formData.loanDate) {
      newErrors.loanDate = "La fecha es requerida";
    }

    if (
      formData.interestRate &&
      (parseFloat(formData.interestRate) < 0 ||
        parseFloat(formData.interestRate) > 100)
    ) {
      newErrors.interestRate = "La tasa debe estar entre 0 y 100";
    }

    if (
      formData.installments &&
      (!Number.isInteger(parseFloat(formData.installments)) ||
        parseFloat(formData.installments) <= 0)
    ) {
      newErrors.installments = "Las cuotas deben ser un número entero positivo";
    }

    if (
      formData.installmentAmount &&
      parseFloat(formData.installmentAmount) <= 0
    ) {
      newErrors.installmentAmount = "El monto de cuota debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const dataToSend = {
      entity: formData.entity.trim(),
      totalAmount: parseFloat(formData.totalAmount),
      currency: formData.currency,
      interestRate: formData.interestRate
        ? parseFloat(formData.interestRate)
        : null,
      loanDate: formData.loanDate,
      dueDate: formData.dueDate || null,
      installments: formData.installments
        ? parseInt(formData.installments)
        : null,
      installmentAmount: formData.installmentAmount
        ? parseFloat(formData.installmentAmount)
        : null,
      description: formData.description.trim() || null,
    };

    try {
      setLoading(true);
      if (loan) {
        await loanService.updateLoan(loan.id, dataToSend);
      } else {
        await loanService.createLoan(dataToSend);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error al guardar préstamo:", error);
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al guardar préstamo"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyPrefix = () => {
    return formData.currency === "USD" ? "U$S" : "$";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {loan ? "Editar Préstamo" : "Nuevo Préstamo"}
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Entidad"
              name="entity"
              value={formData.entity}
              onChange={handleChange}
              error={!!errors.entity}
              helperText={errors.entity || "Banco, persona, etc."}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.currency}>
              <InputLabel>Moneda</InputLabel>
              <Select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                label="Moneda"
              >
                <MenuItem value="ARS">🇦🇷 Pesos (ARS)</MenuItem>
                <MenuItem value="USD">🇺🇸 Dólares (USD)</MenuItem>
              </Select>
              {errors.currency && (
                <FormHelperText>{errors.currency}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monto Total"
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={handleChange}
              error={!!errors.totalAmount}
              helperText={errors.totalAmount}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getCurrencyPrefix()}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tasa de Interés"
              name="interestRate"
              type="number"
              value={formData.interestRate}
              onChange={handleChange}
              error={!!errors.interestRate}
              helperText={errors.interestRate || "Opcional"}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha del Préstamo"
              name="loanDate"
              type="date"
              value={formData.loanDate}
              onChange={handleChange}
              error={!!errors.loanDate}
              helperText={errors.loanDate}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Vencimiento"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              error={!!errors.dueDate}
              helperText={errors.dueDate || "Opcional"}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cantidad de Cuotas"
              name="installments"
              type="number"
              value={formData.installments}
              onChange={handleChange}
              error={!!errors.installments}
              helperText={errors.installments || "Opcional"}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monto por Cuota"
              name="installmentAmount"
              type="number"
              value={formData.installmentAmount}
              onChange={handleChange}
              error={!!errors.installmentAmount}
              helperText={errors.installmentAmount || "Opcional"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getCurrencyPrefix()}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description || "Opcional"}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Guardando..." : loan ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
