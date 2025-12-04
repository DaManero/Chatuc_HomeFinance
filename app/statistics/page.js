"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tabs,
  Tab,
} from "@mui/material";
import {
  TrendingUpOutlined,
  TrendingDownOutlined,
  TrendingFlatOutlined,
  AccountBalanceWalletOutlined,
  CreditCardOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import statisticsService from "../../services/statistics.service";
import DashboardLayout from "@/components/layout/DashboardLayout";

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
  "#14b8a6", // teal
];

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState(12);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await statisticsService.getStatistics(period);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split("-");
    return `${MONTHS_ES[parseInt(month) - 1]} ${year.slice(2)}`;
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") return <TrendingUpOutlined color="success" />;
    if (trend === "down") return <TrendingDownOutlined color="error" />;
    return <TrendingFlatOutlined color="action" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </DashboardLayout>
    );
  }

  const monthlyChartData = stats.monthlyBalance.map((m) => ({
    month: formatMonthLabel(m.month),
    Ingresos: m.income,
    Egresos: m.expenses,
    Balance: m.balance,
  }));

  const expensesChartData = stats.expensesByCategory.map((cat) => ({
    name: cat.name,
    value: cat.total,
    ARS: cat.totalARS,
    USD: cat.totalUSD,
  }));

  return (
    <DashboardLayout>
      <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              Estadísticas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Análisis detallado de tus finanzas
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(e, newPeriod) => newPeriod && setPeriod(newPeriod)}
            size="small"
          >
            <ToggleButton value={3}>3M</ToggleButton>
            <ToggleButton value={6}>6M</ToggleButton>
            <ToggleButton value={12}>12M</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab label="General" />
            <Tab label="Ingresos" />
            <Tab label="Egresos" />
            <Tab label="Ahorro" />
            <Tab label="Tarjetas" />
          </Tabs>
        </Box>

        {/* Tab 0: General */}
        {activeTab === 0 && (
          <Box>
            {/* KPIs Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "grey.200" }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <AccountBalanceWalletOutlined
                        fontSize="small"
                        color="primary"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Balance Mensual
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(stats.kpis.balance)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Mes actual
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "grey.200" }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <ShowChartOutlined fontSize="small" color="success" />
                      <Typography variant="caption" color="text.secondary">
                        Tasa de Ahorro
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {stats.kpis.savingsRate.toFixed(1)}%
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {getTrendIcon(stats.savingsTrend.trend)}
                      <Typography variant="caption" color="text.secondary">
                        {stats.savingsTrend.percentage > 0 ? "+" : ""}
                        {stats.savingsTrend.percentage.toFixed(1)}% vs anterior
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "grey.200" }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <TrendingDownOutlined fontSize="small" color="error" />
                      <Typography variant="caption" color="text.secondary">
                        Gasto Diario Promedio
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(stats.kpis.avgDailyExpense)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Proyección:{" "}
                      {formatCurrency(stats.kpis.projectedMonthlyExpense)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "grey.200" }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <CreditCardOutlined fontSize="small" color="warning" />
                      <Typography variant="caption" color="text.secondary">
                        Deuda Tarjetas
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatCurrency(stats.creditCardDebt.totalDebtARS)}
                    </Typography>
                    {stats.creditCardDebt.totalDebtUSD > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(
                          stats.creditCardDebt.totalDebtUSD,
                          "USD"
                        )}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
              {/* Balance Mensual - Line Chart */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Evolución Mensual
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="#999"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Ingresos"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Egresos"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Balance"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Comparativa y Moneda */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Comparativa Mensual
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Ingresos
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(stats.monthlyComparison.current.income)}
                      </Typography>
                      <Chip
                        label={`${
                          stats.monthlyComparison.comparison.incomeChange > 0
                            ? "+"
                            : ""
                        }${stats.monthlyComparison.comparison.incomeChange.toFixed(
                          1
                        )}%`}
                        size="small"
                        color={
                          stats.monthlyComparison.comparison.incomeChange > 0
                            ? "success"
                            : "error"
                        }
                        sx={{ height: 20 }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Egresos
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(
                          stats.monthlyComparison.current.expenses
                        )}
                      </Typography>
                      <Chip
                        label={`${
                          stats.monthlyComparison.comparison.expensesChange > 0
                            ? "+"
                            : ""
                        }${stats.monthlyComparison.comparison.expensesChange.toFixed(
                          1
                        )}%`}
                        size="small"
                        color={
                          stats.monthlyComparison.comparison.expensesChange > 0
                            ? "error"
                            : "success"
                        }
                        sx={{ height: 20 }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Balance
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatCurrency(stats.monthlyComparison.current.balance)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Gastos por Moneda
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Pesos (ARS)
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(stats.expensesByCurrency.ARS.total)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {stats.expensesByCurrency.ARS.count} transacciones
                    </Typography>
                  </Box>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Dólares (USD)
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(
                          stats.expensesByCurrency.USD.total,
                          "USD"
                        )}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {stats.expensesByCurrency.USD.count} transacciones
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Medios de Pago */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Medios de Pago Más Utilizados
                  </Typography>
                  <Grid container spacing={2}>
                    {stats.paymentMethodStats
                      .slice(0, 6)
                      .map((method, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              border: "1px solid",
                              borderColor: "grey.200",
                              borderRadius: 2,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mb: 1,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {method.name}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, mb: 0.5 }}
                            >
                              {formatCurrency(method.total)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {method.count} usos
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Ingresos */}
        {activeTab === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Evolución de Ingresos
                  </Typography>
                  <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="#999"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Ingresos"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Ingresos del Mes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    {formatCurrency(stats.monthlyComparison.current.income)}
                  </Typography>
                  <Chip
                    label={`${
                      stats.monthlyComparison.comparison.incomeChange > 0
                        ? "+"
                        : ""
                    }${stats.monthlyComparison.comparison.incomeChange.toFixed(
                      1
                    )}%`}
                    size="small"
                    color={
                      stats.monthlyComparison.comparison.incomeChange > 0
                        ? "success"
                        : "error"
                    }
                  />
                </Paper>

                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Por Categoría
                  </Typography>
                  {stats.incomeByCategory.slice(0, 5).map((cat, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2">{cat.name}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(cat.total)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {cat.count} transacciones
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: Egresos */}
        {activeTab === 2 && (
          <Box sx={{ width: "100%" }}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "grey.200", mb: 3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Egresos por Categoría
              </Typography>
              <ResponsiveContainer width="100%" height={700}>
                <BarChart
                  data={expensesChartData}
                  layout="horizontal"
                  margin={{ top: 20, right: 20, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 11 }}
                    stroke="#999"
                  />
                  <YAxis type="number" tick={{ fontSize: 12 }} stroke="#999" />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]}>
                    {expensesChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Todas las Categorías
              </Typography>
              <Grid container spacing={2}>
                {expensesChartData.map((cat, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "grey.200",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {cat.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {formatCurrency(cat.total)}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {cat.ARS > 0 && (
                          <Chip
                            label={formatCurrency(cat.ARS)}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {cat.USD > 0 && (
                          <Chip
                            label={formatCurrency(cat.USD, "USD")}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Tab 3: Ahorro */}
        {activeTab === 3 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "grey.200", mb: 2 }}
                >
                  <CardContent>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      Tasa de Ahorro
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, my: 1 }}>
                      {stats.kpis.savingsRate.toFixed(1)}%
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getTrendIcon(stats.savingsTrend.trend)}
                      <Typography variant="body2" color="text.secondary">
                        {stats.savingsTrend.percentage > 0 ? "+" : ""}
                        {stats.savingsTrend.percentage.toFixed(1)}% vs trimestre
                        anterior
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "grey.200" }}
                >
                  <CardContent>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      Balance Actual
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                      {formatCurrency(stats.kpis.balance)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Mes actual
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Evolución del Ahorro
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="#999"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Balance"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 4: Tarjetas */}
        {activeTab === 4 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "grey.200" }}
                >
                  <CardContent>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      Deuda Total
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                      {formatCurrency(stats.creditCardDebt.totalDebtARS)}
                    </Typography>
                    {stats.creditCardDebt.totalDebtUSD > 0 && (
                      <Typography variant="h6" color="text.secondary">
                        {formatCurrency(
                          stats.creditCardDebt.totalDebtUSD,
                          "USD"
                        )}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {stats.creditCardDebt.totalInstallments} cuotas pendientes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, border: "1px solid", borderColor: "grey.200" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Deuda por Tarjeta
                  </Typography>
                  <Grid container spacing={2}>
                    {stats.creditCardDebt.byCard.map((card, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "grey.200",
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            {card.name}
                          </Typography>
                          {card.totalARS > 0 && (
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {formatCurrency(card.totalARS)}
                            </Typography>
                          )}
                          {card.totalUSD > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(card.totalUSD, "USD")}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
}
