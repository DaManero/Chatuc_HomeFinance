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
  Box,
  Typography,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

export default function PaymentDialog({
  open,
  onClose,
  onSave,
  creditCards = [],
  paymentMethods = [],
  projection = null,
}) {
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    currency: "ARS",
    notes: "",
    creditCardId: "",
    paymentMethodId: "",
    installmentIds: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (projection) {
      // Si hay proyección, prellenar con los datos
      setFormData({
        amount: projection.total || "",
        paymentDate: new Date().toISOString().split("T")[0],
        currency: "ARS",
        notes: "",
        creditCardId: projection.creditCardId || "",
        paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0].id : "",
        installmentIds: projection.installments?.map((inst) => inst.id) || [],
      });
    } else {
      setFormData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        currency: "ARS",
        notes: "",
        creditCardId: creditCards.length > 0 ? creditCards[0].id : "",
        paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0].id : "",
        installmentIds: [],
      });
    }
    setErrors({});
  }, [projection, open, creditCards, paymentMethods]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Ingrese un monto válido mayor a 0";
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "La fecha es requerida";
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
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      currency: formData.currency,
      notes: formData.notes.trim() || null,
      creditCardId: formData.creditCardId,
      paymentMethodId: formData.paymentMethodId || null,
      installmentIds: formData.installmentIds,
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
        Registrar Pago de Tarjeta
        <IconButton onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Este pago se registrará como egreso y afectará el saldo de tu cuenta.
        </Alert>

        {projection && (
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Resumen del mes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuotas pendientes: {projection.installments?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Débitos automáticos: {projection.recurringCharges?.length || 0}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total: {formData.currency}{" "}
              {projection.total?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          select
          label="Tarjeta"
          name="creditCardId"
          value={formData.creditCardId}
          onChange={handleChange}
          error={!!errors.creditCardId}
          helperText={errors.creditCardId}
          disabled={!!projection}
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
          label="Monto"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          error={!!errors.amount}
          helperText={errors.amount || "Monto total del pago"}
          inputProps={{ min: 0, step: 0.01 }}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          label="Fecha de pago"
          name="paymentDate"
          type="date"
          value={formData.paymentDate}
          onChange={handleChange}
          error={!!errors.paymentDate}
          helperText={errors.paymentDate}
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

        <TextField
          fullWidth
          select
          label="Medio de Pago"
          name="paymentMethodId"
          value={formData.paymentMethodId}
          onChange={handleChange}
          helperText="Seleccione con qué medio pagó la tarjeta"
          sx={{ mb: 2.5 }}
        >
          {paymentMethods.length === 0 ? (
            <MenuItem disabled>No hay medios de pago disponibles</MenuItem>
          ) : (
            paymentMethods.map((method) => (
              <MenuItem key={method.id} value={method.id}>
                {method.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          fullWidth
          label="Notas"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={3}
          helperText="Opcional: agregue detalles sobre el pago"
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
          Registrar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
}
