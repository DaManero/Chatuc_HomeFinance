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
import {
  CloseOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
} from "@mui/icons-material";

export default function UserDialog({ open, onClose, onSave, user = null }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Operador",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      // Modo edición
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // No mostrar password al editar
        role: user.role || "Operador",
      });
    } else {
      // Modo creación
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Operador",
      });
    }
    setErrors({});
  }, [user, open]);

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

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Password solo requerido al crear
    if (!user && !formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Preparar datos para enviar
    const dataToSend = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
    };

    // Solo incluir password si se escribió algo
    if (formData.password) {
      dataToSend.password = formData.password;
    }

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
        {user ? "Editar Usuario" : "Nuevo Usuario"}
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

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          label={user ? "Nueva Contraseña (opcional)" : "Contraseña"}
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={
            errors.password ||
            (user ? "Dejar en blanco para mantener la actual" : "")
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? (
                    <VisibilityOffOutlined />
                  ) : (
                    <VisibilityOutlined />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2.5 }}
        />

        <FormControl fullWidth error={!!errors.role}>
          <InputLabel>Rol</InputLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            label="Rol"
          >
            <MenuItem value="Operador">Operador</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </Select>
          {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {user ? "Guardar Cambios" : "Crear Usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
