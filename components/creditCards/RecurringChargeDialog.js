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
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

export default function RecurringChargeDialog({
  open,
  onClose,
  onSave,
  creditCards = [],
  categories = [],
  charge = null,
}) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    chargeDay: "",
    isActive: true,
    currency: "ARS",
    creditCardId: "",
    categoryId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (charge) {
      setFormData({
        description: charge.description || "",
        amount: charge.amount || "",
        chargeDay: charge.chargeDay || "",
        isActive: charge.isActive ?? true,
        currency: charge.currency || "ARS",
        creditCardId: charge.creditCardId || "",
        categoryId: charge.categoryId || "",
      });
    } else {
      setFormData({
        description: "",
        amount: "",
        chargeDay: "",
        isActive: true,
        currency: "ARS",
        creditCardId: creditCards.length > 0 ? creditCards[0].id : "",
        categoryId: "",
      });
    }
    setErrors({});
  }, [charge, open, creditCards]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Ingrese un monto válido mayor a 0";
    }

    if (!formData.chargeDay) {
      newErrors.chargeDay = "El día de cargo es requerido";
    } else {
      const day = parseInt(formData.chargeDay);
      if (day < 1 || day > 31) {
        newErrors.chargeDay = "Debe estar entre 1 y 31";
      }
    }

    if (!formData.creditCardId) {
      newErrors.creditCardId = "Seleccione una tarjeta";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const dataToSend = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      chargeDay: parseInt(formData.chargeDay),
      isActive: formData.isActive,
      currency: formData.currency,
      creditCardId: formData.creditCardId,
      categoryId: formData.categoryId || null,
    };

    onSave(dataToSend);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {charge ? "Editar Débito Automático" : "Nuevo Débito Automático"}
        <IconButton onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          label="Descripción"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={!!errors.description}
          helperText={errors.description || "Ej: Netflix, Spotify, HBO Max"}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          select
          label="Tarjeta"
          name="creditCardId"
          value={formData.creditCardId}
          onChange={handleChange}
          error={!!errors.creditCardId}
          helperText={errors.creditCardId}
          sx={{ mb: 2.5 }}
        >
          {creditCards.length === 0 ? (
            <MenuItem disabled>No hay tarjetas disponibles</MenuItem>
          ) : (
            creditCards.map((card) => (
              <MenuItem key={card.id} value={card.id}>
                {card.name} - *{card.lastFourDigits} ({card.bank})
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          fullWidth
          label="Monto mensual"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          error={!!errors.amount}
          helperText={errors.amount}
          inputProps={{ min: 0, step: 0.01 }}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          label="Día de cargo"
          name="chargeDay"
          type="number"
          value={formData.chargeDay}
          onChange={handleChange}
          error={!!errors.chargeDay}
          helperText={errors.chargeDay || "Día del mes en que se cobra (1-31)"}
          inputProps={{ min: 1, max: 31 }}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          select
          label="Moneda"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          sx={{ mb: 2.5 }}
        >
          <MenuItem value="ARS">ARS (Pesos)</MenuItem>
          <MenuItem value="USD">USD (Dólares)</MenuItem>
        </TextField>

        <TextField
          fullWidth
          select
          label="Categoría"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          helperText="Opcional"
          sx={{ mb: 2.5 }}
        >
          <MenuItem value="">
            <em>Sin categoría</em>
          </MenuItem>
          {categories
            .filter((cat) => cat.type === "Egreso")
            .map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
        </TextField>

        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={handleChange}
              name="isActive"
            />
          }
          label="Activo"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={creditCards.length === 0}
        >
          {charge ? "Guardar Cambios" : "Crear Débito"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
