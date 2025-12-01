import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  CreditCard, AlertCircle, ShieldAlert, Info, TrendingUp, 
  CheckCircle2, XCircle, ListFilter
} from "lucide-react";
import { format, parseISO } from "date-fns";

// Cores do tema
const COLORS = {
  primary: "#0052CC",
  success: "#10B981",
  danger: "#F43F5E",
  warning: "#F59E0B",
  neutral: "#94A3B8",
  slate: "#475569"
};

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar dados:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando apresentação...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div>Erro ao carregar dados.</div>;

  const { kpis, daily_data, brand_data, error_categories, error_data } = data;

  return (
    <DashboardLayout>
      {/* Header Section - Simplified */}
      <div id="overview" className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 scroll-mt-28">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Performance de Pagamentos</h2>
          <p className="text-slate-500 mt-2 text-lg">
            Diagnóstico de aprovação e oportunidades de recuperação de receita
          </p>
        </div>
      </div>

      {/* KPI Grid - Simplified to 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Total de Transações */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total de Transações</h3>
            <div className="text-slate-400 bg-slate-50 p-2 rounded-lg"><ListFilter size={20} /></div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">
              {kpis.total_transactions}
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-500">Volume total processado</div>
        </div>

        {/* Quantidade Aprovada */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Transações Aprovadas</h3>
            <div className="text-emerald-600 bg-emerald-50 p-2 rounded-lg"><CheckCircle2 size={20} /></div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-emerald-600 tracking-tight">
              {kpis.success_count}
            </span>
            <span className="text-lg font-medium text-emerald-600/80 ml-1">
              ({kpis.approval_rate}%)
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-500">Sucesso na autorização</div>
        </div>

        {/* Quantidade Reprovada */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Transações Reprovadas</h3>
            <div className="text-rose-600 bg-rose-50 p-2 rounded-lg"><XCircle size={20} /></div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-rose-600 tracking-tight">
              {kpis.failed_count}
            </span>
            <span className="text-lg font-medium text-rose-600/80 ml-1">
              ({(100 - kpis.approval_rate).toFixed(2)}%)
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-500">Falhas e recusas</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div id="transactions" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 scroll-mt-28">
        {/* Daily Volume Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-slate-900 text-xl">Volume Diário de Transações</h3>
              <p className="text-slate-500 text-sm mt-1">Comparativo de transações aprovadas vs recusadas</p>
            </div>
            <div className="flex gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700">Sucessos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-700">Falhas</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(parseISO(val), "dd/MM")}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="success" name="Sucessos" stackId="a" fill={COLORS.success} radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="failed" name="Falhas" stackId="a" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Rate Gauge/Pie */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 text-xl mb-2">Taxa de Conversão</h3>
          <p className="text-sm text-slate-500 mb-8">Distribuição total do período analisado</p>
          
          <div className="flex-1 flex items-center justify-center relative">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Aprovadas', value: kpis.success_count },
                      { name: 'Recusadas', value: kpis.failed_count }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="cell-0" fill={COLORS.success} />
                    <Cell key="cell-1" fill={COLORS.danger} />
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-10">
              <div className="text-center">
                <span className="block text-4xl font-bold text-slate-900 tracking-tight">{kpis.approval_rate}%</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1 block">Aprovação</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis Section */}
      <div id="errors" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 scroll-mt-28">
        {/* Top Errors List */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">Principais Motivos de Recusa</h3>
              <p className="text-sm text-slate-500 mt-1">Detalhamento dos códigos de erro mais frequentes</p>
            </div>
          </div>

          <div className="space-y-5">
            {error_data.slice(0, 5).map((error: any, index: number) => (
              <div key={index} className="group">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {error.code}
                    </span>
                    <span className="font-medium text-slate-700 text-sm group-hover:text-slate-900 transition-colors">
                      {error.details.length > 45 ? error.details.substring(0, 45) + '...' : error.details}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-rose-600">{error.count}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${error.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs font-medium text-slate-400">{error.percentage}% do total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Categories & Recommendations */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">Diagnóstico por Categoria</h3>
              <p className="text-sm text-slate-500 mt-1">Agrupamento de impacto e soluções sugeridas</p>
            </div>
          </div>

          <div className="space-y-6">
            {error_categories.slice(0, 3).map((cat: any, index: number) => (
              <div key={index} className="border border-slate-100 bg-slate-50/50 rounded-xl p-5 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-800 text-lg">{cat.name}</h4>
                  <span className="px-3 py-1 bg-white text-slate-700 text-xs font-bold rounded-full border border-slate-200 shadow-sm">
                    {cat.count} ocorrências
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        index === 0 ? "bg-rose-500" : 
                        index === 1 ? "bg-orange-500" : 
                        "bg-blue-500"
                      )}
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 w-12 text-right">{cat.percentage}%</span>
                </div>

                <div className="flex gap-3 items-start">
                  <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide block mb-1">Ação Recomendada</span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {cat.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Brands Analysis */}
      <div id="brands" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-12 scroll-mt-28">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xl">Performance por Bandeira</h3>
            <p className="text-sm text-slate-500 mt-1">Comparativo de aprovação entre processadoras</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {brand_data.map((brand: any, index: number) => (
            <div key={index} className="flex flex-col p-6 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  {/* Brand Logo Placeholder */}
                  <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                    {brand.brand.substring(0, 3)}
                  </div>
                  <span className="text-xl font-bold text-slate-800 capitalize">{brand.brand}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Taxa de Aprovação</span>
                  <span className={cn(
                    "text-3xl font-bold tracking-tight",
                    brand.approval_rate > 50 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {brand.approval_rate}%
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-slate-200 h-4 rounded-full mb-6 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    brand.approval_rate > 50 ? "bg-emerald-500" : "bg-rose-500"
                  )}
                  style={{ width: `${brand.approval_rate}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Total</span>
                  <span className="block text-lg font-bold text-slate-800">{brand.total}</span>
                </div>
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                  <span className="block text-xs text-emerald-600 uppercase font-bold mb-1">Aprovados</span>
                  <span className="block text-lg font-bold text-emerald-700">{brand.success}</span>
                </div>
                <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                  <span className="block text-xs text-rose-600 uppercase font-bold mb-1">Falhas</span>
                  <span className="block text-lg font-bold text-rose-700">{brand.failed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan Footer */}
      <div id="recommendations" className="bg-slate-900 text-white p-10 rounded-3xl shadow-xl scroll-mt-28 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="text-emerald-400" size={24} />
                <h3 className="text-2xl font-bold">Plano de Recuperação de Receita</h3>
              </div>
              <p className="text-slate-400 max-w-2xl text-lg">
                Ações estratégicas para reverter o cenário de falhas e otimizar a conversão.
              </p>
            </div>
            <div className="bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <span className="text-sm font-medium text-slate-300 uppercase tracking-wider block mb-1">Potencial Mensal</span>
              <span className="block text-3xl font-bold text-emerald-400">R$ 150.000+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center font-bold text-lg mb-5 shadow-lg shadow-rose-500/20">1</div>
              <h4 className="font-bold text-xl mb-3">Ativar 3D Secure</h4>
              <p className="text-slate-400 leading-relaxed">
                Combata os 28% de falhas por suspeita de fraude transferindo a responsabilidade para o emissor com o protocolo 3DS 2.0.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold text-lg mb-5 shadow-lg shadow-orange-500/20">2</div>
              <h4 className="font-bold text-xl mb-3">ZeroAuth Check</h4>
              <p className="text-slate-400 leading-relaxed">
                Valide cartões silenciosamente antes do checkout para eliminar erros de "Cartão Inválido" e melhorar a experiência do usuário.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-lg mb-5 shadow-lg shadow-blue-500/20">3</div>
              <h4 className="font-bold text-xl mb-3">Ajuste Mastercard</h4>
              <p className="text-slate-400 leading-relaxed">
                A taxa da Mastercard está 7% abaixo da Visa. Uma revisão técnica de MCC e parâmetros antifraude é urgente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper para classes condicionais
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
