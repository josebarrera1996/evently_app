import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";

// Layout para 'Root'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Todos los componentes hijos estarán entre un Navbar & un Footer
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
