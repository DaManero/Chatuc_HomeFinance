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
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

export default function TransactionDialog({
  open,
  onClose,
  onSave,
  transaction = null,
  categories = [],
}) {
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "Egreso",
    categoryId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      // Modo edición
      setFormData({
        amount: transaction.amount || "",
        date: transaction.date || new Date().toISOString().split("T")[0],
        description: transaction.description || "",
        type: transaction.type || "Egreso",
        categoryId: transaction.categoryId || "",
      });
    } else {
      // Modo creación
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        type: "Egreso",
        categoryId: "",
      });
    }
    setErrors({});
  }, [transaction, open]);

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

    if (!formData.date) {
      newErrors.date = "La fecha es requerida";
    }

    if (!formData.type) {
      newErrors.type = "El tipo es requerido";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "La categoría es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const dataToSend = {
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description.trim() || null,
      type: formData.type,
      categoryId: parseInt(formData.categoryId),
    };

    onSave(dataToSend);
  };

  // Filtrar categorías según el tipo seleccionado
  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {transaction ? "Editar Transacción" : "Nueva Transacción"}
        <IconButton onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <FormControl fullWidth error={!!errors.type} sx={{ mb: 2.5 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            label="Tipo"
          >
            <MenuItem value="Ingreso">Ingreso</MenuItem>
            <MenuItem value="Egreso">Egreso</MenuItem>
          </Select>
          {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
        </FormControl>

        <TextField
          fullWidth
          label="Monto"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          error={!!errors.amount}
          helperText={errors.amount}
          inputProps={{ min: 0, step: 0.01 }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          label="Fecha"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2.5 }}
        />

        <FormControl
          fullWidth
          error={!!errors.categoryId}
          sx={{ mb: 2.5 }}
          disabled={!formData.type}
        >
          <InputLabel>Categoría</InputLabel>
          <Select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            label="Categoría"
          >
            {filteredCategories.length === 0 ? (
              <MenuItem disabled>
                No hay categorías de tipo {formData.type}
              </MenuItem>
            ) : (
              filteredCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.categoryId && (
            <FormHelperText>{errors.categoryId}</FormHelperText>
          )}
        </FormControl>

        <TextField
          fullWidth
          label="Descripción (opcional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
          helperText="Agrega detalles sobre esta transacción"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {transaction ? "Guardar Cambios" : "Crear Transacción"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
