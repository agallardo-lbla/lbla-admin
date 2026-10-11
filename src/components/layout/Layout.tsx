import React, { ReactNode, useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentPath, onNavigate, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-gray-900">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1 min-h-[calc(100vh-60px)]">
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          {/* Barra Footer Independiente — Azul Institucional #1B357F */}
          <footer
            role="contentinfo"
            className="mt-auto flex-shrink-0 bg-[#1B357F] border-t border-[#10204D] text-[#F5F7FA] px-6 md:px-8 py-3.5 text-xs flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              &copy; 2026{' '}
              <strong className="text-[#F8EE7A] font-semibold">
                Liceo Bicentenario Latinoamericano &reg;
              </strong>{' '}
              &middot; Todos los derechos reservados.
            </div>
            <div>
              Desarrollado por el{' '}
              <strong className="text-[#F8EE7A] font-semibold">
                Departamento de Informática LBLA
              </strong>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
