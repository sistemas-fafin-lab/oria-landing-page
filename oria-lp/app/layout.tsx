import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme";
import { AccessibilityProvider } from "../components/accessibility";

export const metadata: Metadata = {
  title: "ORIA — Saúde inteligente",
  description:
    "Seus exames finalmente fazem sentido. Envie seus exames pelo WhatsApp e receba um relatório claro, organizado e compreensível da sua saúde ao longo do tempo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <AccessibilityProvider>{children}</AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
