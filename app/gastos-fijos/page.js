"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  TablePagination,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  TrendingUpOutlined,
  TrendingDownOutlined,
  SearchOutlined,
  ExpandMoreOutlined,
  HistoryOutlined,
  BarChartOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import recurringExpensesService from "@/services/recurringExpenses.service";

export default function GastosFijosPage() {
  const [data, setData] = useState(null);
  const [filteredProjections, setFilteredProjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const [currencyView, setCurrencyView] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Historial
  const [activeTab, setActiveTab] = useState(0);
  const [historyData, setHistoryData] = useState(null);
  const [historyMonths, setHistoryMonths] = useState(6);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("Todos");

  useEffect(() => {
    loadProjection();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      loadHistory();
    }
  }, [activeTab, historyMonths]);

  useEffect(() => {
    if (data) {
      applyFilter();
    }
  }, [data, filter, searchTerm]);

  const loadProjection = async () => {
    try {
      setLoading(true);
      const result = await recurringExpensesService.getProjection();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error al cargar proyección:", err);
      setError(err.response?.data?.error || "Error al cargar proyección");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const result = await recurringExpensesService.getHistory(historyMonths);
      setHistoryData(result);
    } catch (err) {
      console.error("Error al cargar historial:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...data.projections];

    // Filtrar por tipo
    if (filter !== "Todos") {
      filtered = filtered.filter((p) => p.type === filter);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.categoryName.toLowerCase().includes(searchLower),
      );
    }

    setFilteredProjections(filtered);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(0);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCurrencyViewChange = (event, newView) => {
    if (newView !== null) {
      setCurrencyView(newView);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getNextMonthName = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount, currency = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const normalizeAmount = (value) => {
    const amount = parseFloat(value);
    return Number.isFinite(amount) ? amount : 0;
  };

  const renderCurrencyAmounts = (amountARS, amountUSD, view, fallback = 0) => {
    const normalizedARS = normalizeAmount(amountARS);
    const normalizedUSD = normalizeAmount(amountUSD);
    const fallbackAmount = normalizeAmount(fallback);
    const hasARS = normalizedARS > 0;
    const hasUSD = normalizedUSD > 0;

    if (!hasARS && !hasUSD) {
      return fallbackAmount > 0 ? formatCurrency(fallbackAmount, "ARS") : "-";
    }

    if (view === "ARS") {
      return hasARS ? formatCurrency(normalizedARS, "ARS") : "-";
    }

    if (view === "USD") {
      return hasUSD ? formatCurrency(normalizedUSD, "USD") : "-";
    }

    return (
      <span style={{ display: "inline-flex", flexDirection: "column" }}>
        {hasARS && (
          <span style={{ fontSize: "0.875rem" }}>
            {formatCurrency(normalizedARS, "ARS")}
          </span>
        )}
        {hasUSD && (
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {formatCurrency(normalizedUSD, "USD")}
          </span>
        )}
      </span>
    );
  };

  const renderSummaryAmounts = (amountARS, amountUSD, color) => {
    const normalizedARS = normalizeAmount(amountARS);
    const normalizedUSD = normalizeAmount(amountUSD);

    if (currencyView === "USD") {
      return (
        <Typography variant="h5" color={color} fontWeight={600}>
          {formatCurrency(normalizedUSD, "USD")}
        </Typography>
      );
    }

    if (currencyView === "ARS") {
      return (
        <Typography variant="h5" color={color} fontWeight={600}>
          {formatCurrency(normalizedARS, "ARS")}
        </Typography>
      );
    }

    return (
      <>
        <Typography variant="h5" color={color} fontWeight={600}>
          {formatCurrency(normalizedARS, "ARS")}
        </Typography>
        {normalizedUSD !== 0 && (
          <Typography variant="subtitle1" color="text.secondary">
            {formatCurrency(normalizedUSD, "USD")}
          </Typography>
        )}
      </>
    );
  };

  const paginatedProjections = filteredProjections.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const MONTHS_ES = [
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

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Proyecciones
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Tabs principales */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab
              icon={<BarChartOutlined />}
              iconPosition="start"
              label="Mes Actual"
            />
            <Tab
              icon={<HistoryOutlined />}
              iconPosition="start"
              label="Historial por Mes"
            />
          </Tabs>
        </Box>

        {/* ── TAB 0: Proyección del mes actual ── */}
        {activeTab === 0 && data && (
          <>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Proyección para {getNextMonthName()}
              </Typography>
            </Box>

            {/* Cards de resumen */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ingresos Fijos
                </Typography>
                {renderSummaryAmounts(
                  data.summary.totalIngresosARS,
                  data.summary.totalIngresosUSD,
                  "success.main",
                )}
              </Paper>
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Egresos Fijos
                </Typography>
                {renderSummaryAmounts(
                  data.summary.totalEgresosARS,
                  data.summary.totalEgresosUSD,
                  "error.main",
                )}
              </Paper>
              <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Balance Proyectado
                </Typography>
                {renderSummaryAmounts(
                  data.summary.balanceARS,
                  data.summary.balanceUSD,
                  (currencyView === "USD"
                    ? data.summary.balanceUSD || 0
                    : data.summary.balanceARS || 0) >= 0
                    ? "success.main"
                    : "error.main",
                )}
              </Paper>
            </Box>

            {/* Filtros y búsqueda */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <ToggleButtonGroup
                value={currencyView}
                exclusive
                onChange={handleCurrencyViewChange}
                aria-label="vista de moneda"
                size="small"
              >
                <ToggleButton value="ALL">ARS + USD</ToggleButton>
                <ToggleButton value="ARS">ARS</ToggleButton>
                <ToggleButton value="USD">USD</ToggleButton>
              </ToggleButtonGroup>
              <TextField
                placeholder="Buscar por categoría..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                }}
              />
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                aria-label="filtro de tipo"
                size="small"
              >
                <ToggleButton value="Todos">Todos</ToggleButton>
                <ToggleButton value="Ingreso">
                  <TrendingUpOutlined sx={{ mr: 1 }} fontSize="small" />
                  Ingresos
                </ToggleButton>
                <ToggleButton value="Egreso">
                  <TrendingDownOutlined sx={{ mr: 1 }} fontSize="small" />
                  Egresos
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Tabla de detalle */}
            <TableContainer component={Paper}>
              <Table
                sx={{
                  "& .MuiTableCell-root": { textAlign: "left", py: 1 },
                  "& .MuiTableRow-root": { height: 52 },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Último Monto</TableCell>
                    <TableCell>Fecha Última Transacción</TableCell>
                    <TableCell>Monto Proyectado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProjections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 4 }}
                        >
                          {data.projections.length === 0
                            ? "No hay categorías marcadas como recurrentes"
                            : "No se encontraron resultados"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProjections.map((projection) => (
                      <TableRow key={projection.categoryId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {projection.categoryName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              projection.type === "Ingreso" ? (
                                <TrendingUpOutlined />
                              ) : (
                                <TrendingDownOutlined />
                              )
                            }
                            label={projection.type}
                            color={
                              projection.type === "Ingreso"
                                ? "success"
                                : "error"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {renderCurrencyAmounts(
                            projection.lastAmountARS || 0,
                            projection.lastAmountUSD || 0,
                            currencyView,
                            projection.lastAmount || 0,
                          )}
                        </TableCell>
                        <TableCell>
                          {projection.lastDate
                            ? new Date(
                                projection.lastDate + "T00:00:00",
                              ).toLocaleDateString("es-ES")
                            : "-"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {renderCurrencyAmounts(
                            projection.projectedAmountARS || 0,
                            projection.projectedAmountUSD || 0,
                            currencyView,
                            projection.projectedAmount || 0,
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredProjections.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </TableContainer>

            {filteredProjections.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  * La proyección usa la suma del mes actual o, si no hubo
                  movimientos, el último monto registrado
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* ── TAB 1: Historial por mes ── */}
        {activeTab === 1 && (
          <>
            {/* Controles de historial */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Período</InputLabel>
                <Select
                  value={historyMonths}
                  label="Período"
                  onChange={(e) => setHistoryMonths(e.target.value)}
                >
                  <MenuItem value={3}>Últimos 3 meses</MenuItem>
                  <MenuItem value={6}>Últimos 6 meses</MenuItem>
                  <MenuItem value={12}>Últimos 12 meses</MenuItem>
                  <MenuItem value={24}>Últimos 24 meses</MenuItem>
                </Select>
              </FormControl>

              <ToggleButtonGroup
                value={historyFilter}
                exclusive
                onChange={(_, v) => {
                  if (v !== null) setHistoryFilter(v);
                }}
                size="small"
              >
                <ToggleButton value="Todos">Todos</ToggleButton>
                <ToggleButton value="Ingreso">
                  <TrendingUpOutlined sx={{ mr: 1 }} fontSize="small" />
                  Ingresos
                </ToggleButton>
                <ToggleButton value="Egreso">
                  <TrendingDownOutlined sx={{ mr: 1 }} fontSize="small" />
                  Egresos
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {historyLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : historyData && historyData.history.length > 0 ? (
              /* Meses en orden inverso (más reciente primero) */
              [...historyData.history].reverse().map((monthData, idx) => {
                const categoriesFiltered = monthData.categories.filter(
                  (c) => historyFilter === "Todos" || c.type === historyFilter,
                );
                const balanceARS = monthData.balanceARS;

                return (
                  <Accordion
                    key={monthData.month}
                    defaultExpanded={idx === 0}
                    sx={{
                      mb: 1,
                      "&:before": { display: "none" },
                      borderRadius: "8px !important",
                      overflow: "hidden",
                    }}
                    elevation={0}
                    variant="outlined"
                  >
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          pr: 2,
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography fontWeight={600} sx={{ minWidth: 160 }}>
                          {MONTHS_ES[monthData.monthNumber - 1]}{" "}
                          {monthData.year}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {monthData.totalIngresosARS > 0 && (
                            <Chip
                              icon={<TrendingUpOutlined />}
                              label={`Ingr. ${formatCurrency(monthData.totalIngresosARS, "ARS")}`}
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {monthData.totalEgresosARS > 0 && (
                            <Chip
                              icon={<TrendingDownOutlined />}
                              label={`Egr. ${formatCurrency(monthData.totalEgresosARS, "ARS")}`}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {monthData.totalIngresosUSD > 0 && (
                            <Chip
                              label={`Ingr. ${formatCurrency(monthData.totalIngresosUSD, "USD")}`}
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {monthData.totalEgresosUSD > 0 && (
                            <Chip
                              label={`Egr. ${formatCurrency(monthData.totalEgresosUSD, "USD")}`}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          <Chip
                            label={`Balance ${formatCurrency(balanceARS, "ARS")}`}
                            color={balanceARS >= 0 ? "success" : "error"}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "grey.50" }}>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Categoría
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Tipo
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }} align="right">
                                Total ARS
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }} align="right">
                                Total USD
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {categoriesFiltered.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ py: 2 }}
                                  >
                                    Sin movimientos
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              categoriesFiltered.map((cat) => (
                                <TableRow key={cat.categoryId} hover>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {cat.categoryName}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={cat.type}
                                      color={
                                        cat.type === "Ingreso"
                                          ? "success"
                                          : "error"
                                      }
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    {cat.totalARS > 0
                                      ? formatCurrency(cat.totalARS, "ARS")
                                      : "-"}
                                  </TableCell>
                                  <TableCell align="right">
                                    {cat.totalUSD > 0
                                      ? formatCurrency(cat.totalUSD, "USD")
                                      : "-"}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                );
              })
            ) : (
              <Alert severity="info">
                No hay transacciones en el período seleccionado
              </Alert>
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
