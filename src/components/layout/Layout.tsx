import { ReactNode } from "react";
import { Navbar } from "./Navbar.tsx";

export function Layout({
  children,
  currentPage,
  onNavigate,
}: {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="d-flex flex-column vh-100">
      <main className="container p-4 flex-grow-1">
        {children}
      </main>
      <Navbar currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}
