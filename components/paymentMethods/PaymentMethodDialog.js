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
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

export default function PaymentMethodDialog({
  open,
  onClose,
  onSave,
  paymentMethod = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Efectivo",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (paymentMethod) {
      // Modo edición
      setFormData({
        name: paymentMethod.name || "",
        type: paymentMethod.type || "Efectivo",
      });
    } else {
      // Modo creación
      setFormData({
        name: "",
        type: "Efectivo",
      });
    }
    setErrors({});
  }, [paymentMethod, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.type) {
      newErrors.type = "El tipo es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const dataToSend = {
      name: formData.name.trim(),
      type: formData.type,
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
        {paymentMethod ? "Editar Medio de Pago" : "Nuevo Medio de Pago"}
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
          helperText={errors.name}
          placeholder="Ej: Mercado Pago, Efectivo, Tarjeta Visa"
          autoFocus
          sx={{ mb: 2.5 }}
        />

        <FormControl fullWidth error={!!errors.type}>
          <InputLabel>Tipo</InputLabel>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            label="Tipo"
          >
            <MenuItem value="Efectivo">Efectivo</MenuItem>
            <MenuItem value="Tarjeta">Tarjeta</MenuItem>
            <MenuItem value="Transferencia">Transferencia</MenuItem>
            <MenuItem value="Billetera Virtual">Billetera Virtual</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </Select>
          {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {paymentMethod ? "Guardar Cambios" : "Crear Medio de Pago"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
