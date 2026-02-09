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
  Alert,
  ListSubheader,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

export default function CreditCardExpenseDialog({
  open,
  onClose,
  onSave,
  creditCards = [],
  categories = [],
  expense = null,
}) {
  const [formData, setFormData] = useState({
    description: "",
    totalAmount: "",
    installments: "1",
    purchaseDate: new Date().toISOString().split("T")[0],
    currency: "ARS",
    creditCardId: "",
    categoryId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      // Modo edición: solo descripción y categoría
      setFormData({
        description: expense.description || "",
        categoryId: expense.categoryId || "",
      });
    } else {
      setFormData({
        description: "",
        totalAmount: "",
        installments: "1",
        purchaseDate: new Date().toISOString().split("T")[0],
        currency: "ARS",
        creditCardId: creditCards.length > 0 ? creditCards[0].id : "",
        categoryId: "",
      });
    }
    setErrors({});
  }, [expense, open, creditCards]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!expense) {
      // Validaciones solo para creación
      if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
        newErrors.totalAmount = "Ingrese un monto válido mayor a 0";
      }

      if (!formData.installments || parseInt(formData.installments) < 1) {
        newErrors.installments = "Debe ser al menos 1 cuota";
      }

      if (!formData.creditCardId) {
        newErrors.creditCardId = "Seleccione una tarjeta";
      }

      if (!formData.purchaseDate) {
        newErrors.purchaseDate = "La fecha es requerida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (expense) {
      // Edición: solo descripción y categoría
      onSave({
        description: formData.description.trim(),
        categoryId: formData.categoryId || null,
      });
    } else {
      // Creación: todos los campos
      const dataToSend = {
        description: formData.description.trim(),
        totalAmount: parseFloat(formData.totalAmount),
        installments: parseInt(formData.installments),
        purchaseDate: formData.purchaseDate,
        currency: formData.currency,
        creditCardId: formData.creditCardId,
        categoryId: formData.categoryId || null,
      };
      onSave(dataToSend);
    }
  };

  const installmentAmount =
    formData.totalAmount && formData.installments
      ? (
          parseFloat(formData.totalAmount) / parseInt(formData.installments)
        ).toFixed(2)
      : "0.00";

  const mainCategories = categories.filter(
    (cat) => cat.type === "Egreso" && !cat.parentCategoryId,
  );

  const subcategories = categories.filter(
    (cat) => cat.type === "Egreso" && cat.parentCategoryId,
  );

  const orphanSubcategories = subcategories.filter(
    (sub) => !mainCategories.some((main) => main.id === sub.parentCategoryId),
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
        {expense ? "Editar Gasto de Tarjeta" : "Nuevo Gasto de Tarjeta"}
        <IconButton onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {expense && (
          <Alert severity="info" sx={{ mb: 2.5 }}>
            Solo se puede editar la descripción y categoría. El monto y cuotas
            no pueden modificarse.
          </Alert>
        )}

        <TextField
          fullWidth
          label="Descripción"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={!!errors.description}
          helperText={errors.description}
          sx={{ mb: 2.5 }}
        />

        {!expense && (
          <>
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
              label="Monto total"
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={handleChange}
              error={!!errors.totalAmount}
              helperText={errors.totalAmount}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label="Cantidad de cuotas"
              name="installments"
              type="number"
              value={formData.installments}
              onChange={handleChange}
              error={!!errors.installments}
              helperText={
                errors.installments ||
                `Cada cuota será de: ${formData.currency} ${installmentAmount}`
              }
              inputProps={{ min: 1, step: 1 }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              label="Fecha de compra"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
              error={!!errors.purchaseDate}
              helperText={errors.purchaseDate}
              InputLabelProps={{ shrink: true }}
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
          </>
        )}

        <TextField
          fullWidth
          select
          label="Categoría"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          helperText="Opcional"
        >
          <MenuItem value="">
            <em>Sin categoría</em>
          </MenuItem>
          {mainCategories.length === 0 && subcategories.length === 0 ? (
            <MenuItem disabled>No hay categorías de egreso</MenuItem>
          ) : (
            [
              ...mainCategories.flatMap((mainCat) => {
                const children = subcategories.filter(
                  (sub) => sub.parentCategoryId === mainCat.id,
                );

                return [
                  <ListSubheader key={`header-${mainCat.id}`}>
                    {mainCat.name}
                  </ListSubheader>,
                  <MenuItem
                    key={`main-${mainCat.id}`}
                    value={mainCat.id}
                    sx={{ pl: 2, fontWeight: 500 }}
                  >
                    {mainCat.name}
                  </MenuItem>,
                  ...(children.length > 0
                    ? children.map((sub) => (
                        <MenuItem key={sub.id} value={sub.id} sx={{ pl: 3 }}>
                          ↳ {sub.name}
                        </MenuItem>
                      ))
                    : []),
                ];
              }),
              ...(orphanSubcategories.length > 0
                ? [
                    <ListSubheader key="header-orphan">
                      Subcategorías sin padre
                    </ListSubheader>,
                    ...orphanSubcategories.map((sub) => (
                      <MenuItem key={`orphan-${sub.id}`} value={sub.id}>
                        {sub.name}
                      </MenuItem>
                    )),
                  ]
                : []),
            ]
          )}
        </TextField>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!expense && creditCards.length === 0}
        >
          {expense ? "Guardar Cambios" : "Crear Gasto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
