import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { 
  Activity, CreditCard, AlertCircle, CheckCircle2, XCircle, 
  Calendar, DollarSign, TrendingUp, ShieldAlert, Info
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Cores do tema
const COLORS = {
  primary: "#0052CC",
  success: "#10B981",
  danger: "#F43F5E",
  warning: "#F59E0B",
  neutral: "#94A3B8",
  slate: "#475569"
};

const PIE_COLORS = [COLORS.success, COLORS.danger];

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
          <p className="text-slate-500 font-medium">Carregando análises...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div>Erro ao carregar dados.</div>;

  const { kpis, daily_data, brand_data, error_categories, error_data } = data;

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <DashboardLayout>
      {/* Header Section with Date Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visão Geral de Transações</h2>
          <p className="text-slate-500 mt-1">
            Análise detalhada de aprovação e falhas no período
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
          <Calendar size={18} className="text-slate-400" />
          <span>
            {format(parseISO(kpis.period_start), "dd 'de' MMM, yyyy", { locale: ptBR })} 
            {' - '} 
            {format(parseISO(kpis.period_end), "dd 'de' MMM, yyyy", { locale: ptBR })}
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Taxa de Aprovação" 
          value={`${kpis.approval_rate}%`}
          subtext="Média do período"
          icon={<Activity size={20} />}
          trend={kpis.approval_rate < 70 ? "down" : "up"}
          trendValue="Abaixo da meta (75%)"
          valueClassName={kpis.approval_rate < 65 ? "text-rose-600" : "text-emerald-600"}
        />
        <KpiCard 
          title="Volume Total" 
          value={formatCurrency(kpis.total_attempted)}
          subtext={`${kpis.total_transactions} transações`}
          icon={<DollarSign size={20} />}
          trend="neutral"
          trendValue="Estável"
        />
        <KpiCard 
          title="Valor Aprovado" 
          value={formatCurrency(kpis.total_approved)}
          subtext={`${kpis.success_count} transações`}
          icon={<CheckCircle2 size={20} />}
          valueClassName="text-emerald-600"
        />
        <KpiCard 
          title="Valor Perdido (Falhas)" 
          value={formatCurrency(kpis.total_lost)}
          subtext={`${kpis.failed_count} transações`}
          icon={<XCircle size={20} />}
          valueClassName="text-rose-600"
          trend="down"
          trendValue="Crítico"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Daily Volume Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Volume Diário de Transações</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Sucessos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-600">Falhas</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
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
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="success" name="Sucessos" stackId="a" fill={COLORS.success} radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="failed" name="Falhas" stackId="a" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Rate Gauge/Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-2">Taxa de Aprovação</h3>
          <p className="text-sm text-slate-500 mb-6">Distribuição total do período</p>
          
          <div className="flex-1 flex items-center justify-center relative">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Sucessos', value: kpis.success_count },
                      { name: 'Falhas', value: kpis.failed_count }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="cell-0" fill={COLORS.success} />
                    <Cell key="cell-1" fill={COLORS.danger} />
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <span className="block text-3xl font-bold text-slate-900">{kpis.approval_rate}%</span>
                <span className="text-xs text-slate-500 uppercase font-medium">Aprovação</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Errors List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Principais Motivos de Falha</h3>
              <p className="text-sm text-slate-500">Erros mais frequentes nas transações</p>
            </div>
          </div>

          <div className="space-y-4">
            {error_data.slice(0, 5).map((error: any, index: number) => (
              <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 font-bold text-slate-600 text-xs">
                  {error.code.split('-')[1] || error.code}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-800 text-sm truncate pr-2" title={error.details}>
                      {error.details.length > 50 ? error.details.substring(0, 50) + '...' : error.details}
                    </span>
                    <span className="font-bold text-rose-600 text-sm">{error.count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-mono">{error.code}</span>
                    <span className="text-xs font-medium text-slate-400">{error.percentage}% das falhas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full" 
                      style={{ width: `${error.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Categories & Recommendations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Categorias de Impacto</h3>
              <p className="text-sm text-slate-500">Agrupamento de erros e recomendações</p>
            </div>
          </div>

          <div className="space-y-4">
            {error_categories.slice(0, 4).map((cat: any, index: number) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-800">{cat.name}</h4>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                    {cat.count} falhas
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
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
                  <span className="text-xs font-bold text-slate-600 w-12 text-right">{cat.percentage}%</span>
                </div>

                <div className="bg-blue-50 p-3 rounded-md flex gap-3 items-start">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-blue-800 block mb-0.5">Recomendação:</span>
                    <p className="text-xs text-blue-700 leading-relaxed">
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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Performance por Bandeira</h3>
            <p className="text-sm text-slate-500">Comparativo de aprovação entre bandeiras</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {brand_data.map((brand: any, index: number) => (
            <div key={index} className="flex flex-col">
              <div className="flex justify-between items-end mb-2">
                <span className="text-lg font-bold text-slate-800 capitalize">{brand.brand}</span>
                <span className={cn(
                  "text-2xl font-bold",
                  brand.approval_rate > 50 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {brand.approval_rate}%
                </span>
              </div>
              
              <div className="w-full bg-slate-100 h-3 rounded-full mb-4 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    brand.approval_rate > 50 ? "bg-emerald-500" : "bg-rose-500"
                  )}
                  style={{ width: `${brand.approval_rate}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="block text-xs text-slate-500 uppercase font-bold">Total</span>
                  <span className="block text-lg font-semibold text-slate-800">{brand.total}</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <span className="block text-xs text-emerald-600 uppercase font-bold">Aprovados</span>
                  <span className="block text-lg font-semibold text-emerald-700">{brand.success}</span>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg">
                  <span className="block text-xs text-rose-600 uppercase font-bold">Falhas</span>
                  <span className="block text-lg font-semibold text-rose-700">{brand.failed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan Footer */}
      <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Plano de Ação Recomendado</h3>
            <p className="text-slate-400 max-w-2xl">
              Baseado na análise dos dados e documentação da Cielo, estas são as ações prioritárias para recuperar a receita perdida.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
            <span className="text-sm font-medium text-slate-300">Potencial de Recuperação:</span>
            <span className="block text-xl font-bold text-emerald-400">R$ 100k - 150k / mês</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center font-bold mb-4">1</div>
            <h4 className="font-bold text-lg mb-2">Ativar 3D Secure</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              28% das falhas são por suspeita de fraude. O 3DS 2.0 transfere a responsabilidade para o emissor e aumenta a aprovação.
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold mb-4">2</div>
            <h4 className="font-bold text-lg mb-2">Implementar ZeroAuth</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Validar o cartão antes da transação para evitar erros de "Cartão Inválido" e "Restrições", melhorando a UX.
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold mb-4">3</div>
            <h4 className="font-bold text-lg mb-2">Revisar Mastercard</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              A taxa de aprovação da Mastercard está 7% abaixo da Visa. Necessário revisar configurações de MCC e antifraude.
            </p>
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
