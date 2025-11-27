"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Grid,
} from "@mui/material";
import { AccountBalanceOutlined } from "@mui/icons-material";
import investmentService from "@/services/investment.service";

export default function EarningsHistoryDialog({ open, onClose, investmentId }) {
  const [investment, setInvestment] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && investmentId) {
      loadData();
    }
  }, [open, investmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [investmentData, earningsData] = await Promise.all([
        investmentService.getInvestmentById(investmentId),
        investmentService.getEarnings(investmentId),
      ]);
      setInvestment(investmentData);
      setEarnings(Array.isArray(earningsData) ? earningsData : []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(
        err.response?.data?.error ||
          "Error al cargar el historial de rendimientos"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    return currency === "USD" ? "U$S" : "$";
  };

  const totalEarnings = (earnings || []).reduce(
    (sum, e) => sum + parseFloat(e.amount || 0),
    0
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Historial de Rendimientos</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {investment && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountBalanceOutlined color="primary" />
                      <Typography variant="h6">{investment.entity}</Typography>
                      <Chip
                        label={investment.status}
                        color="primary"
                        size="small"
                        sx={{ ml: "auto" }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Tipo
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {investment.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Monto Invertido
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {getCurrencySymbol(investment.currency)}{" "}
                      {parseFloat(investment.amount).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Total Rendimientos
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="success.main"
                    >
                      {getCurrencySymbol(investment.currency)}{" "}
                      {totalEarnings.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Grid>
                  {investment.interestRate && (
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Tasa de Interés
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {parseFloat(investment.interestRate).toFixed(2)}% anual
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Fecha Inicio
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(
                        investment.startDate + "T00:00:00"
                      ).toLocaleDateString("es-ES")}
                    </Typography>
                  </Grid>
                  {investment.endDate && (
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Vencimiento
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(
                          investment.endDate + "T00:00:00"
                        ).toLocaleDateString("es-ES")}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            <Typography variant="h6" gutterBottom>
              Rendimientos Cobrados
            </Typography>

            {earnings.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="right">Monto</TableCell>
                      <TableCell>Notas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {earnings.map((earning, index) => (
                      <TableRow key={earning.id} hover>
                        <TableCell>{earnings.length - index}</TableCell>
                        <TableCell>
                          {new Date(
                            earning.earningDate + "T00:00:00"
                          ).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="success.main"
                          >
                            {getCurrencySymbol(earning.currency)}{" "}
                            {parseFloat(earning.amount).toLocaleString(
                              "es-AR",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {earning.notes || "-"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <AccountBalanceOutlined
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No hay rendimientos registrados
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
