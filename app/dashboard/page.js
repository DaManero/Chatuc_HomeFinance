"use client";

import { Box, Typography, Card, CardContent } from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transacciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de transacciones financieras
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bienvenido, {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta será la página de transacciones. Aquí podrás ver y gestionar
            todas tus transacciones financieras.
          </Typography>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
