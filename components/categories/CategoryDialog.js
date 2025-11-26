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

export default function CategoryDialog({
  open,
  onClose,
  onSave,
  category = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Egreso",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      // Modo edición
      setFormData({
        name: category.name || "",
        type: category.type || "Egreso",
      });
    } else {
      // Modo creación
      setFormData({
        name: "",
        type: "Egreso",
      });
    }
    setErrors({});
  }, [category, open]);

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
