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
  const displayedErrors = showAllErrors ? error_data : error_data.slice(0, 5);

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
                      kpis.authorization.rate > 50 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {kpis.authorization.rate}% Aprov.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Authorization Only</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-3xl font-bold text-slate-900">{kpis.authorization.total}</span>
                <span className="text-sm text-slate-500">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold uppercase">Aprovadas</span>
                </div>
                <span className="block text-2xl font-bold text-emerald-700">{kpis.authorization.success}</span>
                <span className="text-sm font-medium text-emerald-600/80">{kpis.authorization.rate}%</span>
              </div>

              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-rose-700">
                  <XCircle size={16} />
                  <span className="text-xs font-bold uppercase">Reprovadas</span>
                </div>
                <span className="block text-2xl font-bold text-rose-700">{kpis.authorization.failed}</span>
                <span className="text-sm font-medium text-rose-600/80">{(100 - kpis.authorization.rate).toFixed(2)}%</span>
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
                      kpis.capture.rate > 50 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {kpis.capture.rate}% Aprov.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Authorization + Capture</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-3xl font-bold text-slate-900">{kpis.capture.total}</span>
                <span className="text-sm text-slate-500">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold uppercase">Aprovadas</span>
                </div>
                <span className="block text-2xl font-bold text-emerald-700">{kpis.capture.success}</span>
                <span className="text-sm font-medium text-emerald-600/80">{kpis.capture.rate}%</span>
              </div>

              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-rose-700">
                  <XCircle size={16} />
                  <span className="text-xs font-bold uppercase">Reprovadas</span>
                </div>
                <span className="block text-2xl font-bold text-rose-700">{kpis.capture.failed}</span>
                <span className="text-sm font-medium text-rose-600/80">{(100 - kpis.capture.rate).toFixed(2)}%</span>
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

      {/* Error Heatmap Section */}
      <div id="heatmap" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-12 scroll-mt-28">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <Grid size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xl">Distribuição de Erros por Bandeira</h3>
            <p className="text-sm text-slate-500 mt-1">Mapa de calor identificando concentração de falhas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-[150px_repeat(8,1fr)] gap-1 mb-1">
              <div className="font-bold text-slate-500 text-sm flex items-end pb-2">Bandeira</div>
              {heatmap_columns.map((col: string) => (
                <div key={col} className="font-bold text-slate-500 text-xs text-center pb-2 rotate-0">
                  {col}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {heatmap_data.map((row: any) => (
              <div key={row.brand} className="grid grid-cols-[150px_repeat(8,1fr)] gap-1 mb-1">
                <div className="font-bold text-slate-800 text-sm flex items-center uppercase">
                  {row.brand}
                </div>
                {heatmap_columns.map((col: string) => {
                  const value = row[col] || 0;
                  return (
                    <div 
                      key={`${row.brand}-${col}`}
                      className="h-16 flex items-center justify-center rounded font-bold text-sm transition-all hover:scale-105 cursor-default"
                      style={{ 
                        backgroundColor: getHeatmapColor(value),
                        color: getHeatmapTextColor(value)
                      }}
                      title={`${row.brand} - ${col}: ${value} ocorrências`}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex justify-end items-center gap-4 mt-6 text-xs text-slate-500">
              <span>Escala de Ocorrências:</span>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-[#FFFBEB]"></span> 0
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-[#FDE68A]"></span> &lt; 20
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-[#FCD34D]"></span> &lt; 50
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-[#FB923C]"></span> &lt; 80
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-[#EF4444]"></span> &lt; 100
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-[#991B1B]"></span> 100+
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Type Analysis with Brand Breakdown */}
      <div id="card-types" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-12 scroll-mt-28">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xl">Performance por Tipo de Cartão</h3>
            <p className="text-sm text-slate-500 mt-1">Análise comparativa entre modalidades de pagamento e bandeiras</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {card_type_data.map((type: any, index: number) => (
            <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-slate-800 capitalize text-lg">{type.type}</h4>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-bold",
                  type.approval_rate > 50 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                )}>
                  {type.approval_rate}% Aprov.
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Barra de progresso geral */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Total</span>
                    <span className="font-medium text-slate-900">{type.total}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>

                {/* Detalhamento por Bandeira */}
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Por Bandeira</p>
                  <div className="space-y-2">
                    {type.brands && type.brands.map((brand: any, bIndex: number) => (
                      <div key={bIndex} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span className="capitalize text-slate-700 font-medium">{brand.brand}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-xs">{brand.total} txns</span>
                          <span className={cn(
                            "font-bold text-xs",
                            brand.rate > 50 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {brand.rate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div className="text-center p-2 bg-white rounded border border-slate-100">
                    <span className="block text-xs text-emerald-600 font-bold">Aprovados</span>
                    <span className="block font-bold text-slate-700">{type.success}</span>
                  </div>
                  <div className="text-center p-2 bg-white rounded border border-slate-100">
                    <span className="block text-xs text-rose-600 font-bold">Falhas</span>
                    <span className="block font-bold text-slate-700">{type.failed}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Brands Analysis (Moved Here) */}
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

      {/* Error Analysis Section */}
      <div id="errors" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 scroll-mt-28">
        {/* Top Errors List */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl">Motivos de Recusa</h3>
                <p className="text-sm text-slate-500 mt-1">Detalhamento dos códigos de erro</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAllErrors(!showAllErrors)}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              {showAllErrors ? (
                <>
                  <ChevronUp size={16} />
                  Recolher
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Ver todos ({error_data.length})
                </>
              )}
            </button>
          </div>

          <div className="space-y-5">
            {displayedErrors.map((error: any, index: number) => (
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
            
            {!showAllErrors && error_data.length > 5 && (
              <div className="pt-4 text-center border-t border-slate-100">
                <button 
                  onClick={() => setShowAllErrors(true)}
                  className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                >
                  + {error_data.length - 5} outros motivos de recusa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Categories */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">Diagnóstico por Categoria</h3>
              <p className="text-sm text-slate-500 mt-1">Agrupamento de impacto</p>
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
              </div>
            ))}
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
