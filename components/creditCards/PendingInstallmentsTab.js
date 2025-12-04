"use client";

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
}) {
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

      {pendingInstallments.map((monthGroup, index) => (
        <Accordion key={monthGroup.month} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                pr: 2,
              }}
            >
              <Typography sx={{ flexGrow: 1, fontWeight: "medium" }}>
                {MONTHS[monthGroup.monthNumber - 1]} {monthGroup.year}
              </Typography>
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
            </Box>
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
                            installment.currency || "ARS"
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
