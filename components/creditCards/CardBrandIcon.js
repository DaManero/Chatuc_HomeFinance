import { Box } from "@mui/material";
import { CreditCardOutlined } from "@mui/icons-material";

// Componente para mostrar el logo de la marca de tarjeta
export default function CardBrandIcon({ brand = "other", size = 40 }) {
  const getBrandLogo = () => {
    switch (brand?.toLowerCase()) {
      case "visa":
        return (
          <svg
            viewBox="0 0 48 32"
            width={size}
            height={size * 0.67}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="32" rx="4" fill="#1434CB" />
            <path
              d="M19.5 10.5h-3l-4.5 11h3l.8-2h4.4l.8 2h3.3l-4.8-11zm-3.3 7l1.3-3.6 1.3 3.6h-2.6zm8.8-7l-2.4 11h2.8l2.4-11h-2.8zm4.5 0l-2.9 11h2.7l.4-1.8c.5.1 1.1.2 1.7.2 2.8 0 4.8-1.4 5.2-3.5.4-1.9-.8-3.4-3.2-3.6l.8-3.7c.2-.9-.4-1.6-1.3-1.6h-3.4zm1.7 4.5c-.2.9-1 1.5-2.1 1.5l-.3-.1.6-2.7c.9 0 1.6.3 1.8 1.3z"
              fill="white"
            />
          </svg>
        );
      case "mastercard":
        return (
          <svg
            viewBox="0 0 48 32"
            width={size}
            height={size * 0.67}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="32" rx="4" fill="#EB001B" />
            <circle cx="18" cy="16" r="9" fill="#FF5F00" />
            <circle cx="30" cy="16" r="9" fill="#F79E1B" />
            <path
              d="M24 9.5c-1.7 1.5-2.8 3.7-2.8 6.2s1.1 4.7 2.8 6.2c1.7-1.5 2.8-3.7 2.8-6.2s-1.1-4.7-2.8-6.2z"
              fill="#FF5F00"
            />
          </svg>
        );
      case "amex":
      case "american express":
        return (
          <svg
            viewBox="0 0 48 32"
            width={size}
            height={size * 0.67}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="32" rx="4" fill="#006FCF" />
            <text
              x="24"
              y="20"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
            >
              AMEX
            </text>
          </svg>
        );
      default:
        return <CreditCardOutlined sx={{ fontSize: size, color: "#666" }} />;
    }
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {getBrandLogo()}
    </Box>
  );
}
