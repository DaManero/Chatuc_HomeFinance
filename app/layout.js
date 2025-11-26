import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import { AuthProvider } from "@/context/AuthContext";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Home Finance",
  description: "Sistema de gestión de finanzas personales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={robotoFlex.className}>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
