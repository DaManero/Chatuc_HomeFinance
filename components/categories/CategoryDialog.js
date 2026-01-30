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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

export default function CategoryDialog({
  open,
  onClose,
  onSave,
  category = null,
  parentCategories = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Egreso",
    isRecurring: false,
    parentCategoryId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      // Modo edición
      setFormData({
        name: category.name || "",
        type: category.type || "Egreso",
        isRecurring: category.isRecurring || false,
        parentCategoryId: category.parentCategoryId || "",
      });
    } else {
      // Modo creación
      setFormData({
        name: "",
        type: "Egreso",
        isRecurring: false,
        parentCategoryId: "",
      });
    }
    setErrors({});
  }, [category, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
      isRecurring: formData.isRecurring,
      parentCategoryId: formData.parentCategoryId || null,
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
        {category ? "Editar Categoría" : "Nueva Categoría"}
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
          autoFocus
          sx={{ mb: 2.5 }}
        />

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

        <FormControl fullWidth sx={{ mb: 2.5 }}>
          <InputLabel>Categoría Padre (opcional)</InputLabel>
          <Select
            name="parentCategoryId"
            value={formData.parentCategoryId}
            onChange={handleChange}
            label="Categoría Padre (opcional)"
          >
            <MenuItem value="">
              <em>Ninguna (Categoría Principal)</em>
            </MenuItem>
            {parentCategories
              .filter((cat) => !cat.parentCategoryId && cat.id !== category?.id)
              .map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
            />
          }
          label="Gasto/Ingreso fijo mensual"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {category ? "Guardar Cambios" : "Crear Categoría"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
