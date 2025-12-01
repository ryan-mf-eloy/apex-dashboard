import { ReactNode } from "react";
import { LayoutDashboard, PieChart, AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Fixed Top Navigation */}
      <header className="bg-white border-b border-slate-200 h-16 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">APEX Analytics</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Relatório Executivo</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <NavButton 
              icon={<LayoutDashboard size={16} />} 
              label="Visão Geral" 
              onClick={() => scrollToSection('overview')} 
              active
            />
            <NavButton 
              icon={<PieChart size={16} />} 
              label="Transações" 
              onClick={() => scrollToSection('transactions')} 
            />
            <NavButton 
              icon={<AlertTriangle size={16} />} 
              label="Erros" 
              onClick={() => scrollToSection('errors')} 
            />
            <NavButton 
              icon={<CreditCard size={16} />} 
              label="Bandeiras" 
              onClick={() => scrollToSection('brands')} 
            />
            <NavButton 
              icon={<ShieldCheck size={16} />} 
              label="Recomendações" 
              onClick={() => scrollToSection('recommendations')} 
              variant="primary"
            />
          </nav>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">APEX COM SUP ALIM LTDA</div>
              <div className="text-[10px] text-slate-500">Merchant ID: HUB-8291</div>
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

function NavButton({ 
  icon, 
  label, 
  onClick, 
  active = false,
  variant = "default" 
}: { 
  icon: ReactNode, 
  label: string, 
  onClick: () => void, 
  active?: boolean,
  variant?: "default" | "primary"
}) {
  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-slate-900 text-white hover:bg-slate-800 ml-2 shadow-sm hover:shadow"
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
        active 
          ? "text-slate-900 bg-slate-100" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
