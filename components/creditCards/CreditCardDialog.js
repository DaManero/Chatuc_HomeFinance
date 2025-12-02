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
  Box,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

export default function CreditCardDialog({
  open,
  onClose,
  onSave,
  creditCard = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    brand: "Visa",
    lastFourDigits: "",
    expirationMonth: "",
    expirationYear: "",
    dueDay: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (creditCard) {
      setFormData({
        name: creditCard.name || "",
        bank: creditCard.bank || "",
        brand: creditCard.brand || "Visa",
        lastFourDigits: creditCard.lastFourDigits || "",
        expirationMonth: creditCard.expirationMonth || "",
        expirationYear: creditCard.expirationYear || "",
        dueDay: creditCard.dueDay || "",
      });
    } else {
      setFormData({
        name: "",
        bank: "",
        brand: "Visa",
        lastFourDigits: "",
        expirationMonth: "",
        expirationYear: "",
        dueDay: "",
      });
    }
    setErrors({});
  }, [creditCard, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.bank.trim()) {
      newErrors.bank = "La entidad es requerida";
    }

    if (!formData.lastFourDigits) {
      newErrors.lastFourDigits = "Los últimos 4 dígitos son requeridos";
    } else if (!/^\d{4}$/.test(formData.lastFourDigits)) {
      newErrors.lastFourDigits = "Deben ser exactamente 4 números";
    }

    if (!formData.expirationMonth || formData.expirationMonth === "") {
      newErrors.expirationMonth = "El mes de vencimiento es requerido";
    }

    if (!formData.expirationYear || formData.expirationYear === "") {
      newErrors.expirationYear = "El año de vencimiento es requerido";
    }

    if (!formData.dueDay || formData.dueDay === "") {
      newErrors.dueDay = "El día de cierre es requerido";
    } else {
      const day = parseInt(formData.dueDay);
      if (isNaN(day) || day < 1 || day > 31) {
        newErrors.dueDay = "Debe estar entre 1 y 31";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const dataToSend = {
      name: formData.name.trim(),
      bank: formData.bank.trim(),
      brand: formData.brand,
      lastFourDigits: formData.lastFourDigits,
      expirationMonth: Number(formData.expirationMonth),
      expirationYear: Number(formData.expirationYear),
      dueDay: Number(formData.dueDay),
    };

    console.log("Datos a enviar:", dataToSend); // Para debug

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
        {creditCard ? "Editar Tarjeta de Crédito" : "Nueva Tarjeta de Crédito"}
        <IconButton onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name || "Ej: Visa Personal, Mastercard Gold"}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          label="Entidad"
          name="bank"
          value={formData.bank}
          onChange={handleChange}
          error={!!errors.bank}
          helperText={errors.bank || "Ej: Banco Galicia, HSBC"}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          select
          label="Marca"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          sx={{ mb: 2.5 }}
        >
          <MenuItem value="Visa">Visa</MenuItem>
          <MenuItem value="Mastercard">Mastercard</MenuItem>
          <MenuItem value="American Express">American Express</MenuItem>
          <MenuItem value="Otras">Otras</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Últimos 4 dígitos"
          name="lastFourDigits"
          value={formData.lastFourDigits}
          onChange={handleChange}
          error={!!errors.lastFourDigits}
          helperText={errors.lastFourDigits}
          inputProps={{ maxLength: 4 }}
          sx={{ mb: 2.5 }}
        />

        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
          <TextField
            fullWidth
            select
            label="Mes de vencimiento"
            name="expirationMonth"
            value={formData.expirationMonth}
            onChange={handleChange}
            error={!!errors.expirationMonth}
            helperText={errors.expirationMonth}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <MenuItem key={month} value={month}>
                {month.toString().padStart(2, "0")}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Año de vencimiento"
            name="expirationYear"
            value={formData.expirationYear}
            onChange={handleChange}
            error={!!errors.expirationYear}
            helperText={errors.expirationYear}
          >
            {Array.from(
              { length: 15 },
              (_, i) => new Date().getFullYear() + i
            ).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          fullWidth
          select
          label="Día de cierre"
          name="dueDay"
          value={formData.dueDay}
          onChange={handleChange}
          error={!!errors.dueDay}
          helperText={errors.dueDay || "Día del mes en que cierra el resumen"}
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <MenuItem key={day} value={day}>
              {day}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {creditCard ? "Guardar Cambios" : "Crear Tarjeta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
