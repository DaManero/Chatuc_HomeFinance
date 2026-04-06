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
  CircularProgress,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import paymentService from "@/services/creditCardPayment.service";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function getNextMonthPeriod() {
  const date = new Date();
  const nextMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return {
    month: String(nextMonthDate.getMonth() + 1),
    year: String(nextMonthDate.getFullYear()),
  };
}

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
    paymentMonth: getNextMonthPeriod().month,
    paymentYear: getNextMonthPeriod().year,
    paymentMethodId: "",
  });
  const [errors, setErrors] = useState({});
  const [projectionData, setProjectionData] = useState(null);
  const [projectionLoading, setProjectionLoading] = useState(false);

  useEffect(() => {
    const nextPeriod = getNextMonthPeriod();
    setFormData({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      currency: "ARS",
      notes: "",
      creditCardId: projection?.creditCardId || creditCards[0]?.id || "",
      paymentMonth: nextPeriod.month,
      paymentYear: nextPeriod.year,
      paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0].id : "",
    });
    setProjectionData(null);
    setErrors({});
  }, [projection, open, creditCards, paymentMethods]);

  useEffect(() => {
    const loadProjection = async () => {
      if (
        !open ||
        !formData.creditCardId ||
        !formData.paymentMonth ||
        !formData.paymentYear
      ) {
        setProjectionData(null);
        return;
      }

      setProjectionLoading(true);
      try {
        const projection = await paymentService.getProjections({
          creditCardId: formData.creditCardId,
          month: formData.paymentMonth,
          year: formData.paymentYear,
          currency: formData.currency,
        });

        setProjectionData(projection);
        const totalByCurrency =
          formData.currency === "USD"
            ? projection?.totals?.totalUSD
            : projection?.totals?.totalARS;

        setFormData((prev) => ({
          ...prev,
          amount: totalByCurrency || "0.00",
        }));
      } catch (error) {
        setProjectionData(null);
      } finally {
        setProjectionLoading(false);
      }
    };

    loadProjection();
  }, [
    open,
    formData.creditCardId,
    formData.paymentMonth,
    formData.paymentYear,
    formData.currency,
  ]);

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
      paymentMonth: parseInt(formData.paymentMonth, 10),
      paymentYear: parseInt(formData.paymentYear, 10),
      paymentMethodId: formData.paymentMethodId || null,
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
          Este pago cubrirá el período elegido para la tarjeta y se registrará
          como egreso en tus transacciones.
        </Alert>

        {projectionLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
            <CircularProgress size={22} />
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
          select
          label="Mes a pagar"
          name="paymentMonth"
          value={formData.paymentMonth}
          onChange={handleChange}
          sx={{ mb: 2.5 }}
        >
          {MONTHS.map((monthName, index) => (
            <MenuItem key={monthName} value={String(index + 1)}>
              {monthName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Año a pagar"
          name="paymentYear"
          type="number"
          value={formData.paymentYear}
          onChange={handleChange}
          inputProps={{ min: 2024, step: 1 }}
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

        {projectionData && (
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Resumen del período
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuotas del período: {projectionData.installments?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Débitos automáticos:{" "}
              {projectionData.recurringCharges?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total ARS: {projectionData.totals?.totalARS || "0.00"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total USD: {projectionData.totals?.totalUSD || "0.00"}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total a registrar: {formData.currency} {formData.amount || "0.00"}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Monto"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          error={!!errors.amount}
          helperText={
            errors.amount ||
            "Monto calculado para la tarjeta, período y moneda elegidos"
          }
          inputProps={{ min: 0, step: 0.01 }}
          InputProps={{ readOnly: true }}
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
          disabled={
            creditCards.length === 0 ||
            projectionLoading ||
            !formData.amount ||
            parseFloat(formData.amount) <= 0
          }
        >
          Registrar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
}
