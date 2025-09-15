import type { Metadata } from "next";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Technical Blog",
  description: "Espaço para compartilhar algumas descorbertas e conhecimentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="d-flex flex-column min-vh-100">
        <header className="border-bottom py-3 mb-4">
          <div className="container">
            <nav className="d-flex justify-content-between align-items-center">
              <Link href="/" className="text-dark text-decoration-none fs-4 fw-bold">
                Technical Blog
              </Link>
            </nav>
          </div>
        </header>

        <main className="container my-5 flex-grow-1">
          {children}
        </main>

        <footer className="text-muted text-center py-4 mt-auto bg-light">
          <div className="container">
            <p className="mb-0">&copy; {new Date().getFullYear()} TechNews.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}