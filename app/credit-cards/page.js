"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  CreditCardOutlined,
  PaymentOutlined,
  ReceiptOutlined,
  AutorenewOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

import CreditCardDialog from "@/components/creditCards/CreditCardDialog";
import CreditCardExpenseDialog from "@/components/creditCards/CreditCardExpenseDialog";
import RecurringChargeDialog from "@/components/creditCards/RecurringChargeDialog";
import PaymentDialog from "@/components/creditCards/PaymentDialog";
import CardBrandIcon from "@/components/creditCards/CardBrandIcon";

import creditCardService from "@/services/creditCard.service";
import creditCardExpenseService from "@/services/creditCardExpense.service";
import recurringChargeService from "@/services/creditCardRecurringCharge.service";
import paymentService from "@/services/creditCardPayment.service";
import categoryService from "@/services/category.service";
import paymentMethodService from "@/services/paymentMethod.service";

export default function CreditCardsPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Data states
  const [creditCards, setCreditCards] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [recurringCharges, setRecurringCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [projections, setProjections] = useState(null);

  // Dialog states
  const [cardDialog, setCardDialog] = useState({ open: false, data: null });
  const [expenseDialog, setExpenseDialog] = useState({
    open: false,
    data: null,
  });
  const [chargeDialog, setChargeDialog] = useState({ open: false, data: null });
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    data: null,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cardsRes, categoriesRes, paymentMethodsRes] = await Promise.all([
        creditCardService.getCreditCards(),
        categoryService.getCategories(),
        paymentMethodService.getPaymentMethods(),
      ]);
      setCreditCards(cardsRes.creditCards || []);
      setCategories(categoriesRes.data || []);
      setPaymentMethods(paymentMethodsRes.paymentMethods || []);

      if (activeTab === 1) {
        const expensesRes = await creditCardExpenseService.getExpenses();
        setExpenses(expensesRes.data || []);
      } else if (activeTab === 2) {
        const chargesRes = await recurringChargeService.getRecurringCharges();
        setRecurringCharges(chargesRes.data || []);
      } else if (activeTab === 3) {
        const paymentsRes = await paymentService.getPayments();
        setPayments(paymentsRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab > 0) {
      loadTabData();
    }
  }, [activeTab, isAuthenticated]);

  const loadTabData = async () => {
    try {
      if (activeTab === 1) {
        const res = await creditCardExpenseService.getExpenses();
        setExpenses(res.data || []);
      } else if (activeTab === 2) {
        const res = await recurringChargeService.getRecurringCharges();
        setRecurringCharges(res.data || []);
      } else if (activeTab === 3) {
        const res = await paymentService.getPayments();
        setPayments(res.payments || []);
      }
    } catch (error) {
      console.error("Error loading tab data:", error);
    }
  };

  // Credit Card handlers
  const handleSaveCard = async (data) => {
    try {
      if (cardDialog.data) {
        await creditCardService.updateCreditCard(cardDialog.data.id, data);
        toast.success("Tarjeta actualizada");
      } else {
        await creditCardService.createCreditCard(data);
        toast.success("Tarjeta creada");
      }
      setCardDialog({ open: false, data: null });
      loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al guardar la tarjeta"
      );
    }
  };

  const handleDeleteCard = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta tarjeta?")) return;
    try {
      await creditCardService.deleteCreditCard(id);
      toast.success("Tarjeta eliminada");
      loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al eliminar la tarjeta"
      );
    }
  };

  // Expense handlers
  const handleSaveExpense = async (data) => {
    try {
      if (expenseDialog.data) {
        await creditCardExpenseService.updateExpense(
          expenseDialog.data.id,
          data
        );
        toast.success("Gasto actualizado");
      } else {
        await creditCardExpenseService.createExpense(data);
        toast.success("Gasto creado con cuotas generadas");
      }
      setExpenseDialog({ open: false, data: null });
      loadTabData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar el gasto");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm("¿Está seguro de eliminar este gasto y sus cuotas?")) return;
    try {
      await creditCardExpenseService.deleteExpense(id);
      toast.success("Gasto eliminado");
      loadTabData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al eliminar el gasto"
      );
    }
  };

  // Recurring charge handlers
  const handleSaveCharge = async (data) => {
    try {
      if (chargeDialog.data) {
        await recurringChargeService.updateRecurringCharge(
          chargeDialog.data.id,
          data
        );
        toast.success("Débito automático actualizado");
      } else {
        await recurringChargeService.createRecurringCharge(data);
        toast.success("Débito automático creado");
      }
      setChargeDialog({ open: false, data: null });
      loadTabData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al guardar el débito"
      );
    }
  };

  const handleDeleteCharge = async (id) => {
    if (!confirm("¿Está seguro de eliminar este débito automático?")) return;
    try {
      await recurringChargeService.deleteRecurringCharge(id);
      toast.success("Débito automático eliminado");
      loadTabData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al eliminar el débito"
      );
    }
  };

  // Payment handlers
  const handleSavePayment = async (data) => {
    try {
      await paymentService.createPayment(data);
      toast.success("Pago registrado exitosamente");
      setPaymentDialog({ open: false, data: null });
      loadData(); // Recargar todo para actualizar las tarjetas y el historial
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al registrar el pago"
      );
    }
  };

  const handleDeletePayment = async (id) => {
    if (!confirm("¿Está seguro de eliminar este pago?")) return;
    try {
      await paymentService.deletePayment(id);
      toast.success("Pago eliminado");
      // Recargar los datos generales
      await loadData();
      // Recargar los pagos directamente
      const res = await paymentService.getPayments();
      setPayments(res.payments || []);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al eliminar el pago");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Tarjetas de Crédito</Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => setCardDialog({ open: true, data: null })}
              sx={{ mr: 1 }}
            >
              Nueva Tarjeta
            </Button>
            <Button
              variant="outlined"
              startIcon={<PaymentOutlined />}
              onClick={() => setPaymentDialog({ open: true, data: null })}
            >
              Registrar Pago
            </Button>
          </Box>
        </Box>

        {/* Cards Overview - Always visible */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {creditCards.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                No hay tarjetas registradas. Haga clic en "Nueva Tarjeta" para
                comenzar.
              </Alert>
            </Grid>
          ) : (
            creditCards.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.id}>
                <Card sx={{ width: 320, height: "100%" }}>
                  <CardContent sx={{ height: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <CardBrandIcon brand={card.brand} size={32} />
                        <Typography variant="h6">{card.name}</Typography>
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            setCardDialog({ open: true, data: card })
                          }
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.bank}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      **** **** **** {card.lastFourDigits}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Vence: {card.expirationMonth?.toString().padStart(2, "0")}
                      /{card.expirationYear}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cierre día: {card.dueDay}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
            <Tab label="Resumen" />
            <Tab label="Gastos" />
            <Tab label="Débitos Automáticos" />
            <Tab label="Historial de Pagos" />
          </Tabs>
        </Box>

        {/* Summary Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resumen
            </Typography>
            <Alert severity="info">
              Contenido del resumen de tarjetas de crédito.
            </Alert>
          </Box>
        )}

        {/* Expenses Tab */}
        {activeTab === 1 && (
          <Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Gastos de Tarjeta</Typography>
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={() => setExpenseDialog({ open: true, data: null })}
                disabled={creditCards.length === 0}
              >
                Nuevo Gasto
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Tarjeta</TableCell>
                    <TableCell>Monto Total</TableCell>
                    <TableCell>Cuotas</TableCell>
                    <TableCell>Fecha Compra</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay gastos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{expense.creditCard?.name || "-"}</TableCell>
                        <TableCell>
                          {expense.currency} {expense.totalAmount?.toFixed(2)}
                        </TableCell>
                        <TableCell>{expense.installments}</TableCell>
                        <TableCell>
                          {new Date(expense.purchaseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{expense.category?.name || "-"}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              setExpenseDialog({ open: true, data: expense })
                            }
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Recurring Charges Tab */}
        {activeTab === 2 && (
          <Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Débitos Automáticos</Typography>
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={() => setChargeDialog({ open: true, data: null })}
                disabled={creditCards.length === 0}
              >
                Nuevo Débito
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Tarjeta</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Día de Cargo</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recurringCharges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay débitos automáticos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    recurringCharges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell>{charge.description}</TableCell>
                        <TableCell>{charge.creditCard?.name || "-"}</TableCell>
                        <TableCell>
                          {charge.currency} {charge.amount?.toFixed(2)}
                        </TableCell>
                        <TableCell>{charge.chargeDay}</TableCell>
                        <TableCell>{charge.category?.name || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={charge.isActive ? "Activo" : "Inactivo"}
                            color={charge.isActive ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              setChargeDialog({ open: true, data: charge })
                            }
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteRecurringCharge(charge.id)
                            }
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Payment History Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Historial de Pagos
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tarjeta</TableCell>
                    <TableCell>Entidad</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Detalle</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay pagos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payment.creditCard?.name || "-"}</TableCell>
                        <TableCell>{payment.creditCard?.bank || "-"}</TableCell>
                        <TableCell>
                          {payment.currency} {payment.amount?.toFixed(2)}
                        </TableCell>
                        <TableCell>{payment.notes || "-"}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Dialogs */}
        <CreditCardDialog
          open={cardDialog.open}
          onClose={() => setCardDialog({ open: false, data: null })}
          onSave={handleSaveCard}
          creditCard={cardDialog.data}
        />

        <CreditCardExpenseDialog
          open={expenseDialog.open}
          onClose={() => setExpenseDialog({ open: false, data: null })}
          onSave={handleSaveExpense}
          creditCards={creditCards}
          categories={categories}
          expense={expenseDialog.data}
        />

        <RecurringChargeDialog
          open={chargeDialog.open}
          onClose={() => setChargeDialog({ open: false, data: null })}
          onSave={handleSaveCharge}
          creditCards={creditCards}
          categories={categories}
          charge={chargeDialog.data}
        />

        <PaymentDialog
          open={paymentDialog.open}
          onClose={() => setPaymentDialog({ open: false, data: null })}
          onSave={handleSavePayment}
          creditCards={creditCards}
          paymentMethods={paymentMethods}
          projection={paymentDialog.data}
        />
      </Box>
    </DashboardLayout>
  );
}
