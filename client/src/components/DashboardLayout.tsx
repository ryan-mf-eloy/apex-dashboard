import { ReactNode } from "react";
import { LayoutDashboard, PieChart, AlertTriangle, CreditCard, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">APEX Analytics</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Visão Geral" active />
          <NavItem icon={<PieChart size={20} />} label="Análise de Transações" />
          <NavItem icon={<AlertTriangle size={20} />} label="Erros & Falhas" />
          <NavItem icon={<CreditCard size={20} />} label="Cartões & Bandeiras" />
          
          <div className="pt-8 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Configurações
          </div>
          <NavItem icon={<Settings size={20} />} label="Preferências" />
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
          <h1 className="font-semibold text-slate-800">Dashboard de Análise de Transações</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500">
              Merchant: <span className="font-medium text-slate-900">APEX COM SUP ALIM LTDA - HUB</span>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium text-sm border border-slate-200">
              AP
            </div>
          </div>
        </header>
        
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: ReactNode, label: string, active?: boolean }) {
  return (
    <button
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium transition-all duration-200",
        active 
          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
