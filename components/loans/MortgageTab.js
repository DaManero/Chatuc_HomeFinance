"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  TablePagination,
  InputAdornment,
  Divider,
  Grid,
} from "@mui/material";
import {
  PaymentOutlined,
  HomeOutlined,
  TrendingDownOutlined,
  AccountBalanceOutlined,
  AttachMoneyOutlined,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import mortgageService from "@/services/mortgage.service";

export default function MortgageTab() {
  const [mortgage, setMortgage] = useState(null);
  const [summary, setSummary] = useState(null);
  const [nextInstallment, setNextInstallment] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    uvaRate: "",
    dollarRate: "",
  });
  const [paying, setPaying] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [showSetup, setShowSetup] = useState(false);
  const [incomeRatio, setIncomeRatio] = useState(null);
  const [incomeRatioMonths, setIncomeRatioMonths] = useState(12);
  const [incomeRatioLoading, setIncomeRatioLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadRatio = async () => {
      try {
        setIncomeRatioLoading(true);
        const data = await mortgageService.getIncomeRatio(incomeRatioMonths);
        if (!cancelled) setIncomeRatio(data);
      } catch (err) {
        if (!cancelled)
          setIncomeRatio({ data: [], hasSalaryCategories: false });
      } finally {
        if (!cancelled) setIncomeRatioLoading(false);
      }
    };
    loadRatio();
    return () => {
      cancelled = true;
    };
  }, [incomeRatioMonths]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await mortgageService.getMortgage();

      if (!data.mortgage) {
        setShowSetup(true);
        setLoading(false);
        return;
      }

      setMortgage(data.mortgage);
      setSummary(data.summary);
      setNextInstallment(data.nextInstallment);

      const installmentData = await mortgageService.getInstallments();
      setInstallments(installmentData);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.error || "Error al cargar préstamo hipotecario",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      setLoading(true);
      await mortgageService.setupMortgage({
        name: "Préstamo Hipotecario UVA",
        totalUva: 140058.48,
        annualRate: 4.5,
        totalInstallments: 360,
        startDate: "2026-02-10",
        firstInstallment: {
          capitalUva: 184.44,
          interestUva: 735.31,
          totalUva: 919.75,
          isPaid: true,
          paidDate: "2026-02-10",
          uvaRate: 1768.65,
          amountPaid: 1626715.84,
        },
      });
      setShowSetup(false);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.error || "Error al configurar préstamo hipotecario",
      );
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!paymentData.uvaRate || parseFloat(paymentData.uvaRate) <= 0) {
      setError("Ingresá la cotización del UVA");
      return;
    }

    try {
      setPaying(true);
      await mortgageService.payInstallment({
        installmentId: nextInstallment.id,
        uvaRate: parseFloat(paymentData.uvaRate),
        dollarRate: paymentData.dollarRate
          ? parseFloat(paymentData.dollarRate)
          : null,
      });
      setPayDialogOpen(false);
      setPaymentData({ uvaRate: "", dollarRate: "" });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Error al pagar cuota");
    } finally {
      setPaying(false);
    }
  };

  const formatCurrency = (amount, currency = "ARS") => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const formatUva = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return parseFloat(amount).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Datos para gráfico de evolución mensual (solo cuotas pagadas)
  const paidChartData = useMemo(() => {
    return installments
      .filter((i) => i.isPaid)
      .map((i) => ({
        cuota: `#${i.installmentNumber}`,
        capital: parseFloat(i.capitalUva),
        interes: parseFloat(i.interestUva),
        montoARS: parseFloat(i.amountPaid || 0),
      }));
  }, [installments]);

  const paginatedInstallments = installments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (showSetup) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <HomeOutlined sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Configurar Préstamo Hipotecario
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No hay un préstamo hipotecario configurado. Hacé clic para crear el
          préstamo con las 360 cuotas pre-calculadas.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AccountBalanceOutlined />}
          onClick={handleSetup}
        >
          Configurar Hipotecario
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Resumen */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper sx={{ flex: 1, p: 2, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total del Préstamo
          </Typography>
          <Typography variant="h5" color="primary.main" fontWeight={600}>
            {formatUva(summary?.totalUva)} UVAs
          </Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pagado en UVAs
          </Typography>
          <Typography variant="h5" color="success.main" fontWeight={600}>
            {formatUva(summary?.paidUva)} UVAs
          </Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Restante en UVAs
          </Typography>
          <Typography variant="h5" color="error.main" fontWeight={600}>
            {formatUva(summary?.remainingUva)} UVAs
          </Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pagado en Pesos
          </Typography>
          <Typography variant="h6" color="info.main" fontWeight={600}>
            {formatCurrency(summary?.totalPaidArs)}
          </Typography>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Equivalente en USD
          </Typography>
          <Typography variant="h6" color="text.primary" fontWeight={600}>
            {summary?.totalPaidUsd > 0
              ? formatCurrency(summary?.totalPaidUsd, "USD")
              : "-"}
          </Typography>
        </Paper>
      </Box>

      {/* Barra de progreso */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Progreso: {summary?.paidInstallments} /{" "}
            {mortgage?.totalInstallments} cuotas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {summary?.progressPercent?.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={summary?.progressPercent || 0}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Paper>

      {/* Próxima cuota + botón pagar */}
      {nextInstallment && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            border: 2,
            borderColor: "primary.main",
            borderStyle: "dashed",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Próxima Cuota: #{nextInstallment.installmentNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vencimiento:{" "}
                {new Date(
                  nextInstallment.dueDate + "T00:00:00",
                ).toLocaleDateString("es-ES")}
              </Typography>
              <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                <Typography variant="body2">
                  Capital:{" "}
                  <strong>{formatUva(nextInstallment.capitalUva)} UVAs</strong>
                </Typography>
                <Typography variant="body2">
                  Interés:{" "}
                  <strong>{formatUva(nextInstallment.interestUva)} UVAs</strong>
                </Typography>
                <Typography variant="body2" color="primary.main">
                  Total:{" "}
                  <strong>{formatUva(nextInstallment.totalUva)} UVAs</strong>
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<PaymentOutlined />}
              onClick={() => setPayDialogOpen(true)}
            >
              Pagar Cuota
            </Button>
          </Box>
        </Paper>
      )}

      {/* Gráficos */}
      {paidChartData.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Capital vs Interés (UVAs pagadas)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={paidChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cuota" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="capital"
                    fill="#4caf50"
                    name="Capital"
                    stackId="a"
                  />
                  <Bar
                    dataKey="interes"
                    fill="#ff9800"
                    name="Interés"
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Monto pagado en $ por cuota
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={paidChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cuota" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(value)
                    }
                  />
                  <Bar dataKey="montoARS" fill="#2196f3" name="Monto $" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Cuota hipotecaria vs ingresos por sueldo */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Cuota vs Ingresos por Sueldo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              % de la cuota sobre los sueldos mensuales (categorías con
              &quot;sueldo&quot; o &quot;salario&quot;). USD calculado con la
              cotización registrada al pagar la cuota de cada mes.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Rango:
            </Typography>
            {[6, 12, 24].map((m) => (
              <Button
                key={m}
                size="small"
                variant={incomeRatioMonths === m ? "contained" : "outlined"}
                onClick={() => setIncomeRatioMonths(m)}
              >
                {m} m
              </Button>
            ))}
          </Box>
        </Box>

        {incomeRatioLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !incomeRatio?.data?.length ? (
          <Alert severity="info">
            Aún no hay datos suficientes. Se necesitan cuotas pagadas e ingresos
            del mes en categorías con nombre &quot;Sueldo&quot; o
            &quot;Salario&quot;.
          </Alert>
        ) : (
          <>
            {!incomeRatio.hasSalaryCategories && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No se encontraron categorías de tipo Ingreso cuyo nombre
                contenga &quot;sueldo&quot; o &quot;salario&quot;. Creá una para
                que el ratio refleje tus sueldos.
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  En pesos (ARS)
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={incomeRatio.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis
                      yAxisId="left"
                      fontSize={12}
                      tickFormatter={(v) =>
                        new Intl.NumberFormat("es-AR", {
                          notation: "compact",
                        }).format(v)
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={12}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "% Cuota / Ingresos")
                          return [`${value}%`, name];
                        return [
                          new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                            maximumFractionDigits: 0,
                          }).format(value),
                          name,
                        ];
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="incomeArs"
                      fill="#4caf50"
                      name="Ingresos"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="installmentArs"
                      fill="#f44336"
                      name="Cuota"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ratioArs"
                      stroke="#1976d2"
                      strokeWidth={2}
                      name="% Cuota / Ingresos"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  En dólares (USD)
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={incomeRatio.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis
                      yAxisId="left"
                      fontSize={12}
                      tickFormatter={(v) =>
                        new Intl.NumberFormat("es-AR", {
                          notation: "compact",
                        }).format(v)
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={12}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "% Cuota / Ingresos")
                          return [`${value}%`, name];
                        return [
                          new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }).format(value),
                          name,
                        ];
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="incomeUsd"
                      fill="#4caf50"
                      name="Ingresos"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="installmentUsd"
                      fill="#f44336"
                      name="Cuota"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ratioUsd"
                      stroke="#1976d2"
                      strokeWidth={2}
                      name="% Cuota / Ingresos"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Tabla de amortización */}
      <Paper>
        <Typography variant="subtitle1" sx={{ p: 2 }} fontWeight={600}>
          Tabla de Amortización
        </Typography>
        <Divider />
        <TableContainer>
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": { py: 0.75 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell align="right">Capital UVA</TableCell>
                <TableCell align="right">Interés UVA</TableCell>
                <TableCell align="right">Total UVA</TableCell>
                <TableCell align="right">Cotiz. UVA</TableCell>
                <TableCell align="right">Monto $</TableCell>
                <TableCell align="right">Equiv. USD</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInstallments.map((inst) => (
                <TableRow
                  key={inst.id}
                  hover
                  sx={{
                    backgroundColor: inst.isPaid
                      ? "action.hover"
                      : "transparent",
                    opacity: inst.isPaid ? 1 : 0.8,
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {inst.installmentNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(inst.dueDate + "T00:00:00").toLocaleDateString(
                      "es-ES",
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {formatUva(inst.capitalUva)}
                  </TableCell>
                  <TableCell align="right">
                    {formatUva(inst.interestUva)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatUva(inst.totalUva)}
                  </TableCell>
                  <TableCell align="right">
                    {inst.uvaRate ? `$${formatUva(inst.uvaRate)}` : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {inst.amountPaid ? formatCurrency(inst.amountPaid) : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {inst.amountUsd
                      ? formatCurrency(inst.amountUsd, "USD")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={inst.isPaid ? "Pagada" : "Pendiente"}
                      color={inst.isPaid ? "success" : "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[12, 24, 60, 120, 360]}
          component="div"
          count={installments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Cuotas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      </Paper>

      {/* Dialog de pago */}
      <Dialog
        open={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Pagar Cuota #{nextInstallment?.installmentNumber}
        </DialogTitle>
        <DialogContent dividers>
          {nextInstallment && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Total de la cuota:{" "}
                  <strong>{formatUva(nextInstallment.totalUva)} UVAs</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Capital: {formatUva(nextInstallment.capitalUva)} UVAs |
                  Interés: {formatUva(nextInstallment.interestUva)} UVAs
                </Typography>
              </Box>

              <TextField
                label="Cotización UVA ($)"
                value={paymentData.uvaRate}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, uvaRate: e.target.value })
                }
                fullWidth
                type="number"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                helperText="Cotización del UVA del día de pago"
                required
              />

              <TextField
                label="Cotización Dólar (opcional)"
                value={paymentData.dollarRate}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    dollarRate: e.target.value,
                  })
                }
                fullWidth
                type="number"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                helperText="Para calcular el equivalente en USD (dato estadístico)"
              />

              {paymentData.uvaRate && parseFloat(paymentData.uvaRate) > 0 && (
                <Paper sx={{ p: 2, bgcolor: "action.hover" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Vista previa del pago:
                  </Typography>
                  <Typography
                    variant="h5"
                    color="primary.main"
                    fontWeight={600}
                  >
                    {formatCurrency(
                      parseFloat(nextInstallment.totalUva) *
                        parseFloat(paymentData.uvaRate),
                    )}
                  </Typography>
                  {paymentData.dollarRate &&
                    parseFloat(paymentData.dollarRate) > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Equivalente:{" "}
                        {formatCurrency(
                          (parseFloat(nextInstallment.totalUva) *
                            parseFloat(paymentData.uvaRate)) /
                            parseFloat(paymentData.dollarRate),
                          "USD",
                        )}
                      </Typography>
                    )}
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handlePay}
            variant="contained"
            disabled={paying}
            startIcon={paying ? <CircularProgress size={20} /> : null}
          >
            {paying ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
