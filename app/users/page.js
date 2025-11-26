"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  TablePagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  PersonOffOutlined,
  PersonOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import userService from "@/services/user.service";
import UserDialog from "@/components/users/UserDialog";

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [users, searchTerm]);

  const applyFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower)
      );
      setFilteredUsers(filtered);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    if (!isAdmin()) return;

    try {
      await userService.toggleUserStatus(userId);
      loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.error || "Error al cambiar estado del usuario"
      );
    }
  };

  const handleDelete = async (userId) => {
    if (!isAdmin()) return;

    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await userService.deleteUser(userId);
        loadUsers();
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar usuario");
      }
    }
  };

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setDialogOpen(false);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        // Editar usuario existente
        await userService.updateUser(selectedUser.id, userData);
      } else {
        // Crear nuevo usuario
        await userService.createUser(userData);
      }
      handleCloseDialog();
      loadUsers();
      setError(null);
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al guardar usuario"
      );
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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

  return (
    <DashboardLayout>
      <Box>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Usuarios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión de usuarios del sistema
            </Typography>
          </Box>
          {isAdmin() && (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Usuario
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table
            sx={{
              "& .MuiTableCell-root": { textAlign: "left", py: 1 },
              "& .MuiTableRow-root": { height: 52 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha de Registro</TableCell>
                {isAdmin() && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === "Admin" ? "primary" : "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Activo" : "Inactivo"}
                      color={user.isActive ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </TableCell>
                  {isAdmin() && (
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={user.isActive ? "warning" : "success"}
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {user.isActive ? (
                          <PersonOffOutlined fontSize="small" />
                        ) : (
                          <PersonOutlined fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredUsers.length}
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

        {filteredUsers.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm
                ? "No se encontraron usuarios que coincidan con la búsqueda"
                : "No hay usuarios registrados"}
            </Typography>
          </Box>
        )}
      </Box>

      <UserDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </DashboardLayout>
  );
}
