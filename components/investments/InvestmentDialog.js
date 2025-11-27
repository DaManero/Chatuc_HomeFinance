"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { RefreshOutlined } from "@mui/icons-material";
import investmentService from "@/services/investment.service";
import exchangeRateService from "@/services/exchangeRate.service";

const INVESTMENT_TYPES = [
  "Plazo Fijo",
  "Compra Divisa",
  "Venta Divisa",
  "Otro",
];

const CURRENCIES = ["ARS", "USD"];

const STATUSES = ["Activo", "Vencido", "Rescatado"];

export default function InvestmentDialog({
  open,
  onClose,
  onSave,
  investment,
}) {
  const isEditing = !!investment;

  const [formData, setFormData] = useState({
    type: "Plazo Fijo",
    amount: "",
    currency: "ARS",
    exchangeRate: "",
    exchangeAmount: "",
    exchangeCurrency: "ARS",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    interestRate: "",
    status: "Activo",
    entity: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchingRate, setFetchingRate] = useState(false);

  useEffect(() => {
    if (investment) {
      setFormData({
        type: investment.type || "Plazo Fijo",
        amount: investment.amount || "",
        currency: investment.currency || "ARS",
        exchangeRate: investment.exchangeRate || "",
        exchangeAmount: investment.exchangeAmount || "",
        exchangeCurrency: investment.exchangeCurrency || "ARS",
        startDate: investment.startDate
          ? investment.startDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: investment.endDate ? investment.endDate.split("T")[0] : "",
        interestRate: investment.interestRate || "",
        status: investment.status || "Activo",
        entity: investment.entity || "",
        description: investment.description || "",
      });
    } else {
      setFormData({
        type: "Plazo Fijo",
        amount: "",
        currency: "ARS",
        exchangeRate: "",
        exchangeAmount: "",
        exchangeCurrency: "ARS",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        interestRate: "",
        status: "Activo",
        entity: "",
        description: "",
      });
    }
    setError(null);
  }, [investment, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-cálculo para compra/venta de divisa
      if (
        (newData.type === "Compra Divisa" || newData.type === "Venta Divisa") &&
        (name === "amount" || name === "exchangeRate")
      ) {
        const amount = parseFloat(newData.amount) || 0;
        const rate = parseFloat(newData.exchangeRate) || 0;
        if (amount > 0 && rate > 0) {
          newData.exchangeAmount = (amount * rate).toFixed(2);
        }
      }

      // Ajustar monedas automáticamente para compra/venta
      if (name === "type") {
        if (value === "Compra Divisa") {
          newData.currency = "USD";
          newData.exchangeCurrency = "ARS";
        } else if (value === "Venta Divisa") {
          newData.currency = "USD";
          newData.exchangeCurrency = "ARS";
        }
      }

      return newData;
    });
  };

  const handleFetchExchangeRate = async () => {
    try {
      setFetchingRate(true);
      const rate = await exchangeRateService.getCurrentRate("USD");
      setFormData((prev) => {
        const newData = {
          ...prev,
          exchangeRate: rate.sellRate.toString(),
        };

        // Recalcular exchangeAmount
        const amount = parseFloat(newData.amount) || 0;
        if (amount > 0) {
          newData.exchangeAmount = (amount * rate.sellRate).toFixed(2);
        }

        return newData;
      });
    } catch (err) {
      console.error("Error al obtener tipo de cambio:", err);
      setError("No se pudo obtener el tipo de cambio actual");
    } finally {
      setFetchingRate(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validaciones
      if (!formData.entity.trim()) {
        setError("La entidad es obligatoria");
        return;
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError("El monto debe ser mayor a 0");
        return;
      }

      if (
        (formData.type === "Compra Divisa" ||
          formData.type === "Venta Divisa") &&
        (!formData.exchangeRate || parseFloat(formData.exchangeRate) <= 0)
      ) {
        setError(
          "El tipo de cambio es obligatorio para operaciones de divisas"
        );
        return;
      }

      // Preparar datos para enviar
      const payload = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        startDate: formData.startDate,
        status: formData.status,
        entity: formData.entity,
        description: formData.description || null,
        endDate: formData.endDate || null,
        interestRate: formData.interestRate
          ? parseFloat(formData.interestRate)
          : null,
      };

      // Agregar campos de exchange si es compra/venta
      if (
        formData.type === "Compra Divisa" ||
        formData.type === "Venta Divisa"
      ) {
        payload.exchangeRate = parseFloat(formData.exchangeRate);
        payload.exchangeAmount = parseFloat(formData.exchangeAmount);
        payload.exchangeCurrency = formData.exchangeCurrency;
      }

      if (isEditing) {
        await investmentService.updateInvestment(investment.id, payload);
      } else {
        await investmentService.createInvestment(payload);
      }

      onSave();
    } catch (err) {
      console.error("Error al guardar inversión:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al guardar la inversión"
      );
    } finally {
      setLoading(false);
    }
  };

  const isCurrencyOperation =
    formData.type === "Compra Divisa" || formData.type === "Venta Divisa";

  const isTypeChangeRestricted = isEditing && isCurrencyOperation;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Editar Inversión" : "Nueva Inversión"}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            select
            label="Tipo de Inversión"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            disabled={isTypeChangeRestricted}
            helperText={
              isTypeChangeRestricted
                ? "No se puede cambiar el tipo de operaciones de divisas"
                : isCurrencyOperation
                ? "Se crearán 2 transacciones automáticamente"
                : ""
            }
          >
            {INVESTMENT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Entidad"
            name="entity"
            value={formData.entity}
            onChange={handleChange}
            required
            placeholder="Ej: Banco Nación, Broker, etc."
          />

          {isCurrencyOperation ? (
            <>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label={
                    formData.type === "Compra Divisa"
                      ? "USD a Comprar"
                      : "USD a Vender"
                  }
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">U$S</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Tipo de Cambio"
                  name="exchangeRate"
                  type="number"
                  value={formData.exchangeRate}
                  onChange={handleChange}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleFetchExchangeRate}
                          disabled={fetchingRate}
                          title="Obtener TC actual"
                        >
                          {fetchingRate ? (
                            <CircularProgress size={20} />
                          ) : (
                            <RefreshOutlined fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TextField
                label={
                  formData.type === "Compra Divisa"
                    ? "ARS a Pagar"
                    : "ARS a Recibir"
                }
                name="exchangeAmount"
                type="number"
                value={formData.exchangeAmount}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  readOnly: true,
                }}
                helperText="Calculado automáticamente"
              />
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Monto"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                select
                label="Moneda"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                fullWidth
              >
                {CURRENCIES.map((curr) => (
                  <MenuItem key={curr} value={curr}>
                    {curr}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          <TextField
            label="Fecha de Inicio"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
          />

          {formData.type === "Plazo Fijo" && (
            <>
              <TextField
                label="Fecha de Vencimiento"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Tasa de Interés (%)"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                helperText="Anual"
              />
            </>
          )}

          <TextField
            select
            label="Estado"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="Notas adicionales (opcional)"
          />

          {isCurrencyOperation && !isEditing && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>
                  {formData.type === "Compra Divisa"
                    ? "Compra de Dólares:"
                    : "Venta de Dólares:"}
                </strong>
              </Typography>
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                {formData.type === "Compra Divisa" ? (
                  <>
                    • Se creará un <strong>Egreso</strong> de $
                    {formData.exchangeAmount || "0"} ARS (pago)
                    <br />• Se creará un <strong>Ingreso</strong> de U$S
                    {formData.amount || "0"} USD (recibido)
                  </>
                ) : (
                  <>
                    • Se creará un <strong>Egreso</strong> de U$S
                    {formData.amount || "0"} USD (vendido)
                    <br />• Se creará un <strong>Ingreso</strong> de $
                    {formData.exchangeAmount || "0"} ARS (recibido)
                  </>
                )}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {isEditing ? "Guardar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
