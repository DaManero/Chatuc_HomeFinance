"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#16498C", // Azul oscuro principal
      light: "#2E81C9", // Azul medio para hover
      dark: "#004E4A", // Verde oscuro
    },
    secondary: {
      main: "#9BB3B8", // Gris-azul
      light: "#F2F2F2", // Gris claro
    },
    background: {
      default: "#F2F2F2", // Fondo claro
      paper: "#FFFFFF", // Fondo de tarjetas
    },
    text: {
      primary: "#004E4A", // Texto principal verde oscuro
      secondary: "#16498C", // Texto secundario azul
    },
  },
  typography: {
    fontFamily: '"Roboto Flex", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: "none", // Botones sin mayúsculas
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Bordes redondeados suaves
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: "outlined", // Botones outlined por defecto (minimalista)
      },
      styleOverrides: {
        root: {
          borderWidth: 1.5,
          "&:hover": {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(46, 129, 201, 0.08)", // Hover suave
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0, 78, 74, 0.08)", // Sombra sutil
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(155, 179, 184, 0.2)", // Bordes sutiles
        },
      },
    },
  },
});

export default theme;
