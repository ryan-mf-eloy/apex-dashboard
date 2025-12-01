import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  CreditCard, AlertCircle, ShieldAlert, Info, TrendingUp, 
  CheckCircle2, XCircle, ListFilter, Grid, Wallet, ArrowRight, ChevronDown, ChevronUp
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

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

  const { kpis, daily_data, brand_data, error_categories, error_data, heatmap_data, heatmap_columns, card_type_data } = data;

  // Função para determinar a cor da célula do heatmap baseada no valor
  const getHeatmapColor = (value: number) => {
    if (value === 0) return '#FFFBEB'; // Amarelo muito claro
    if (value < 20) return '#FDE68A'; // Amarelo claro
    if (value < 50) return '#FCD34D'; // Amarelo médio
    if (value < 80) return '#FB923C'; // Laranja
    if (value < 100) return '#EF4444'; // Vermelho claro
    return '#991B1B'; // Vermelho escuro
  };

  const getHeatmapTextColor = (value: number) => {
    return value > 80 ? 'white' : '#1E293B';
  };

  // Determinar quantos erros mostrar
  const displayedErrors = showAllErrors ? error_data : error_data?.slice(0, 5);

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

      {/* KPI Section - Unified Block with Segregation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-12 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ListFilter size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Visão Geral de Transações</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Authorization (Sem Captura) */}
          <div className="p-8 hover:bg-slate-50/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-900 text-xl">Sem Captura</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold border",
                      (kpis?.authorization?.rate || 0) > 50 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {kpis?.authorization?.rate?.toFixed(2) || "0.00"}% Aprov.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Authorization Only</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-3xl font-bold text-slate-900">{kpis?.authorization?.total || 0}</span>
                <span className="text-sm text-slate-500">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold uppercase">Aprovadas</span>
                </div>
                <span className="block text-2xl font-bold text-emerald-700">{kpis?.authorization?.success || 0}</span>
                <span className="text-sm font-medium text-emerald-600/80">{kpis?.authorization?.rate?.toFixed(2) || "0.00"}%</span>
              </div>

              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-rose-700">
                  <XCircle size={16} />
                  <span className="text-xs font-bold uppercase">Reprovadas</span>
                </div>
                <span className="block text-2xl font-bold text-rose-700">{kpis?.authorization?.failed || 0}</span>
                <span className="text-sm font-medium text-rose-600/80">{((100 - (kpis?.authorization?.rate || 0))).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Capture (Com Captura) */}
          <div className="p-8 hover:bg-slate-50/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-900 text-xl">Com Captura</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold border",
                      (kpis?.capture?.rate || 0) > 50 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {kpis?.capture?.rate?.toFixed(2) || "0.00"}% Aprov.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Authorization + Capture</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-3xl font-bold text-slate-900">{kpis?.capture?.total || 0}</span>
                <span className="text-sm text-slate-500">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold uppercase">Aprovadas</span>
                </div>
                <span className="block text-2xl font-bold text-emerald-700">{kpis?.capture?.success || 0}</span>
                <span className="text-sm font-medium text-emerald-600/80">{kpis?.capture?.rate?.toFixed(2) || "0.00"}%</span>
              </div>

              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-rose-700">
                  <XCircle size={16} />
                  <span className="text-xs font-bold uppercase">Reprovadas</span>
                </div>
                <span className="block text-2xl font-bold text-rose-700">{kpis?.capture?.failed || 0}</span>
                <span className="text-sm font-medium text-rose-600/80">{((100 - (kpis?.capture?.rate || 0))).toFixed(2)}%</span>
              </div>
            </div>
          </div>
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
                <Bar dataKey="success" stackId="a" fill={COLORS.success} radius={[0, 0, 4, 4]} barSize={32} />
                <Bar dataKey="failed" stackId="a" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rate Donut */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-xl">Taxa de Conversão</h3>
            <p className="text-slate-500 text-sm mt-1">Distribuição total do período analisado</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Aprovadas', value: kpis?.success_count || 0, color: COLORS.success },
                      { name: 'Reprovadas', value: kpis?.failed_count || 0, color: COLORS.danger }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      { name: 'Aprovadas', value: kpis?.success_count || 0, color: COLORS.success },
                      { name: 'Reprovadas', value: kpis?.failed_count || 0, color: COLORS.danger }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-slate-900">{kpis?.approval_rate?.toFixed(1) || "0.0"}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Aprovação</span>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Card Type Performance */}
      <div id="cards" className="mb-12 scroll-mt-28">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <CreditCard size={20} />
          </div>
          <h3 className="font-bold text-slate-800 text-xl">Performance por Tipo de Cartão</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {card_type_data?.map((type: any, index: number) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg capitalize">
                    {type.type === 'credit' ? 'Crédito' : 
                     type.type === 'debit' ? 'Débito' : 
                     type.type === 'multiple' ? 'Múltiplo' : type.type}
                  </h4>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{type.total} Transações</span>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-bold",
                  (type.approval_rate || 0) >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                  {type.approval_rate?.toFixed(1) || "0.0"}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${type.approval_rate || 0}%` }}
                ></div>
                <div 
                  className="h-full bg-rose-500" 
                  style={{ width: `${100 - (type.approval_rate || 0)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm mb-6">
                <div className="flex flex-col">
                  <span className="text-emerald-600 font-bold">{type.success || 0}</span>
                  <span className="text-xs text-slate-400">Aprovadas</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-rose-600 font-bold">{type.failed || 0}</span>
                  <span className="text-xs text-slate-400">Reprovadas</span>
                </div>
              </div>

              {/* Brand Breakdown */}
              {type.brands && type.brands.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3">Por Bandeira</p>
                  <div className="space-y-3">
                    {type.brands.map((brand: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            brand.brand === 'visa' ? 'bg-blue-600' : 'bg-orange-500'
                          )}></div>
                          <span className="capitalize text-slate-700 font-medium">{brand.brand}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-xs">{brand.total} txns</span>
                          <span className={cn(
                            "font-bold",
                            (brand.rate || 0) >= 70 ? 'text-emerald-600' : 'text-rose-600'
                          )}>
                            {brand.rate?.toFixed(1) || "0.0"}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Brand Performance (Heatmap) */}
      <div id="brands" className="mb-12 scroll-mt-28">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Grid size={20} />
          </div>
          <h3 className="font-bold text-slate-800 text-xl">Distribuição de Erros por Bandeira</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
                    Bandeira
                  </th>
                  {heatmap_columns?.map((col: string) => (
                    <th key={col} className="px-6 py-4 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs text-center border-b border-slate-100">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {heatmap_data?.map((row: any) => (
                  <tr key={row.brand} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 capitalize border-r border-slate-100 bg-slate-50/30">
                      {row.brand}
                    </td>
                    {heatmap_columns?.map((col: string) => {
                      const value = row[col] || 0;
                      return (
                        <td 
                          key={`${row.brand}-${col}`} 
                          className="px-6 py-4 text-center font-bold cursor-default"
                          style={{ 
                            backgroundColor: getHeatmapColor(value),
                            color: getHeatmapTextColor(value)
                          }}
                          title={`${value} ocorrências de ${col} em ${row.brand}`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end gap-6 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#FFFBEB] border border-slate-200"></span>
              <span>Baixo Impacto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#FCD34D]"></span>
              <span>Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#EF4444]"></span>
              <span>Crítico</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis */}
      <div id="errors" className="mb-12 scroll-mt-28">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <AlertCircle size={20} />
          </div>
          <h3 className="font-bold text-slate-800 text-xl">Principais Motivos de Recusa</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {displayedErrors?.map((error: any, index: number) => (
              <div key={index} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono font-bold border border-slate-200">
                      {error.code}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm md:text-base">
                      {error.details}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                      {error.count} falhas
                    </span>
                    <span className="text-sm font-bold text-slate-900 w-12 text-right">{error.percentage?.toFixed(1) || "0.0"}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${error.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-50 border-t border-slate-100 p-2">
            <button 
              onClick={() => setShowAllErrors(!showAllErrors)}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 py-3 rounded-lg transition-all"
            >
              {showAllErrors ? (
                <>
                  <ChevronUp size={16} />
                  Mostrar Menos
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Ver Todos ({error_data?.length || 0})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div id="transactions-list" className="mb-12 scroll-mt-28">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <ListFilter size={20} />
          </div>
          <h3 className="font-bold text-slate-800 text-xl">Histórico Completo de Transações</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Data</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">External ID</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.transactions?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((txn: any, index: number) => {
                  const isSuccess = txn.status === 'authorized' || txn.status === 'captured';
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                        {txn.date ? format(parseISO(txn.date), "dd/MM/yyyy HH:mm") : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {(txn.merchant_order_id && txn.merchant_order_id !== "nan") ? txn.merchant_order_id : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold border uppercase",
                          isSuccess 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                          {isSuccess ? "Aprovada" : "Recusada"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        R$ {txn.amount?.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {data.transactions && data.transactions.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-sm text-slate-500">
                Mostrando <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold">{Math.min(currentPage * itemsPerPage, data.transactions.length)}</span> de <span className="font-bold">{data.transactions.length}</span> transações
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(data.transactions.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(data.transactions.length / itemsPerPage)}
                  className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}

          {(!data.transactions || data.transactions.length === 0) && (
            <div className="p-8 text-center text-slate-500">
              Nenhuma transação encontrada.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
