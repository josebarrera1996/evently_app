import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Poppins } from "next/font/google";
import "./globals.css";

// Definiendo el tipo de letra a utilizar
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

// Definiendo la metadata
export const metadata: Metadata = {
  title: "Evently",
  description: "Evently is a platform for event managment.",
  icons: {
    icon: "/assets/images/logo.svg",
  },
};

// Definiendo el Layout principal de la app
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Aplicando el Provider de Clerk a toda la app
    <ClerkProvider>
      <html lang="en">
        {/* Aplicando el tipo de letra a todos los componentes hijos */}
        <body className={poppins.variable}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
