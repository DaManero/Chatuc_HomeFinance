"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import {
  ReceiptLongOutlined,
  CategoryOutlined,
  AccountBalanceOutlined,
  TrendingUpOutlined,
  PeopleOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";

const DRAWER_WIDTH = 260;

const menuItems = [
  {
    text: "Transacciones",
    icon: <ReceiptLongOutlined />,
    path: "/transactions",
  },
  { text: "Categorías", icon: <CategoryOutlined />, path: "/categories" },
  { text: "Préstamos", icon: <AccountBalanceOutlined />, path: "/loans" },
  { text: "Inversiones", icon: <TrendingUpOutlined />, path: "/investments" },
  {
    text: "Usuarios",
    icon: <PeopleOutlined />,
    path: "/users",
    adminOnly: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "primary.main",
            textAlign: "center",
          }}
        >
          Home Finance
        </Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "white",
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || "?"}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "text.primary",
              mb: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name || "Cargando..."}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            {user?.role || "..."}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => {
          // Ocultar items de admin si no es admin
          if (item.adminOnly && !isAdmin()) {
            return null;
          }

          const isActive = pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 1,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "white" : "text.secondary",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Drawer>
  );
}
