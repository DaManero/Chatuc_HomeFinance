"use client";

import { useEffect, useState } from "react";

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
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import {
  ExpandMoreOutlined,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import CardBrandIcon from "./CardBrandIcon";

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

export default function PendingInstallmentsTab({
  pendingInstallments,
  onMarkAsPaid,
  onMarkMonthAsPaid,
}) {
  const [expandedMonth, setExpandedMonth] = useState(false);

  useEffect(() => {
    if (!pendingInstallments || pendingInstallments.length === 0) {
      setExpandedMonth(false);
      return;
    }

    const currentExpandedStillExists = pendingInstallments.some(
      (monthGroup) => monthGroup.month === expandedMonth,
    );

    if (!currentExpandedStillExists) {
      setExpandedMonth(pendingInstallments[0].month);
    }
  }, [pendingInstallments, expandedMonth]);

  const formatCurrency = (amount, currency = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-AR");
  };

  if (!pendingInstallments || pendingInstallments.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No hay cuotas pendientes de pago</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Cuotas Pendientes por Mes
      </Typography>

      {pendingInstallments.map((monthGroup) => (
        <Accordion
          key={monthGroup.month}
          expanded={expandedMonth === monthGroup.month}
          onChange={(_, isExpanded) => {
            setExpandedMonth(isExpanded ? monthGroup.month : false);
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            {(() => {
              const uniqueDescriptions = [
                ...new Set(
                  monthGroup.installments
                    .map((installment) => installment.description)
                    .filter(Boolean),
                ),
              ];
              const previewDescriptions = uniqueDescriptions.slice(0, 2);
              const remainingDescriptions =
                uniqueDescriptions.length - previewDescriptions.length;

              return (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    pr: 2,
                  }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: "medium" }}>
                      {MONTHS[monthGroup.monthNumber - 1]} {monthGroup.year}
                    </Typography>
                    {previewDescriptions.length > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {previewDescriptions.join(" · ")}
                        {remainingDescriptions > 0
                          ? ` +${remainingDescriptions} más`
                          : ""}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
                    {monthGroup.totalARS > 0 && (
                      <Chip
                        label={formatCurrency(monthGroup.totalARS, "ARS")}
                        color="primary"
                        size="small"
                      />
                    )}
                    {monthGroup.totalUSD > 0 && (
                      <Chip
                        label={formatCurrency(monthGroup.totalUSD, "USD")}
                        color="secondary"
                        size="small"
                      />
                    )}
                  </Box>
                  <Chip
                    label={`${monthGroup.installments.length} cuota${
                      monthGroup.installments.length !== 1 ? "s" : ""
                    }`}
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    size="small"
                    color="success"
                    variant="contained"
                    sx={{ ml: 1.5 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (onMarkMonthAsPaid) {
                        onMarkMonthAsPaid(monthGroup);
                      }
                    }}
                  >
                    Confirmar todo el mes
                  </Button>
                </Box>
              );
            })()}
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tarjeta</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="center">Cuota</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="center">Vencimiento</TableCell>
                    <TableCell align="center">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthGroup.installments.map((installment) => (
                    <TableRow key={installment.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CardBrandIcon
                            brand={installment.cardBrand}
                            size="small"
                          />
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "medium" }}
                            >
                              {installment.cardName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {installment.cardBank}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {installment.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={installment.categoryName}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {installment.installmentNumber}/
                          {installment.totalInstallments}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {formatCurrency(
                            installment.amount,
                            installment.currency || "ARS",
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(installment.dueDate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onMarkAsPaid(installment.id)}
                          title="Marcar como pagada"
                        >
                          <CheckCircleOutlineOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
