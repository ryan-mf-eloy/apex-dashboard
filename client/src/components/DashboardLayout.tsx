import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Fixed Top Navigation */}
      <header className="bg-white border-b border-slate-200 h-16 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between relative">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">APEX Analytics</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Relatório Executivo</span>
            </div>
          </div>
          
          {/* Center: Merchant Name */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-1/3 hidden md:block">
            <div className="text-sm font-bold text-slate-900">APEX COM SUP ALIM LTDA</div>
            <div className="text-[10px] text-slate-500">Merchant ID: HUB-8291</div>
          </div>

          {/* Right: User Initials */}
          <div className="flex items-center justify-end gap-3 w-1/3">
            <div className="text-right md:hidden">
              <div className="text-xs font-bold text-slate-900">APEX COM SUP ALIM LTDA</div>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium text-xs border border-slate-200">
              AP
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Relatório gerado automaticamente em {new Date().toLocaleDateString('pt-BR')} • Confidencial
          </p>
        </div>
      </footer>
    </div>
  );
}
