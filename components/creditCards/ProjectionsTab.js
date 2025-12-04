"use client";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
} from "@mui/material";
import { TrendingUpOutlined, CalendarMonthOutlined } from "@mui/icons-material";

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

export default function ProjectionsTab({ pendingInstallments }) {
  const formatCurrency = (amount, currency = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!pendingInstallments || pendingInstallments.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No hay cuotas pendientes para proyectar</Alert>
      </Box>
    );
  }

  // Agrupar por tarjeta dentro de cada mes, separando por moneda
  const projectionsByCard = pendingInstallments.map((monthGroup) => {
    const cardGroups = monthGroup.installments.reduce((acc, installment) => {
      const cardKey = `${installment.cardName} - ${installment.cardBank}`;
      const currency = installment.currency || "ARS";

      if (!acc[cardKey]) {
        acc[cardKey] = {
          cardName: installment.cardName,
          cardBank: installment.cardBank,
          cardBrand: installment.cardBrand,
          totalARS: 0,
          totalUSD: 0,
          count: 0,
        };
      }

      if (currency === "USD") {
        acc[cardKey].totalUSD += installment.amount;
      } else {
        acc[cardKey].totalARS += installment.amount;
      }
      acc[cardKey].count += 1;
      return acc;
    }, {});

    return {
      month: monthGroup.month,
      year: monthGroup.year,
      monthNumber: monthGroup.monthNumber,
      totalARS: monthGroup.totalARS || 0,
      totalUSD: monthGroup.totalUSD || 0,
      recurringChargesARS: monthGroup.recurringChargesARS || 0,
      recurringChargesUSD: monthGroup.recurringChargesUSD || 0,
      cards: Object.values(cardGroups),
    };
  });

  const totalAllMonthsARS = projectionsByCard.reduce(
    (sum, month) => sum + month.totalARS,
    0
  );

  const totalAllMonthsUSD = projectionsByCard.reduce(
    (sum, month) => sum + month.totalUSD,
    0
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Proyecciones
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {totalAllMonthsARS > 0 && (
            <Chip
              label={formatCurrency(totalAllMonthsARS, "ARS")}
              color="primary"
              size="small"
            />
          )}
          {totalAllMonthsUSD > 0 && (
            <Chip
              label={formatCurrency(totalAllMonthsUSD, "USD")}
              color="secondary"
              size="small"
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        {projectionsByCard.map((monthData) => (
          <Grid item xs={12} sm={6} md={4} key={monthData.month}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 1.5,
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 1,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontSize: "0.75rem" }}
                >
                  {MONTHS[monthData.monthNumber - 1].toUpperCase()}{" "}
                  {monthData.year}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {monthData.totalARS > 0 && (
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      {formatCurrency(monthData.totalARS, "ARS")}
                    </Typography>
                  )}
                  {monthData.totalUSD > 0 && (
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 500, color: "text.secondary" }}
                    >
                      {formatCurrency(monthData.totalUSD, "USD")}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    pt: 1.5,
                    borderTop: "1px solid",
                    borderColor: "grey.100",
                  }}
                >
                  {monthData.cards.map((card, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.875rem",
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {card.cardName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {card.count} cuota{card.count !== 1 ? "s" : ""}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            ml: 1,
                          }}
                        >
                          {card.totalARS > 0 && (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                            >
                              {formatCurrency(card.totalARS, "ARS")}
                            </Typography>
                          )}
                          {card.totalUSD > 0 && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 400,
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              {formatCurrency(card.totalUSD, "USD")}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                  {(monthData.recurringChargesARS > 0 ||
                    monthData.recurringChargesUSD > 0) && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        pt: 1,
                        borderTop: "1px dashed",
                        borderColor: "grey.300",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.875rem",
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          Débitos automáticos
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          ml: 1,
                        }}
                      >
                        {monthData.recurringChargesARS > 0 && (
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                          >
                            {formatCurrency(
                              monthData.recurringChargesARS,
                              "ARS"
                            )}
                          </Typography>
                        )}
                        {monthData.recurringChargesUSD > 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 400,
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            {formatCurrency(
                              monthData.recurringChargesUSD,
                              "USD"
                            )}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
