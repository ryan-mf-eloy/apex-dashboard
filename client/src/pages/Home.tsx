import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  CreditCard, 
  Activity,
  AlertTriangle,
  ArrowRight,
  Filter,
  Download,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Cores do gráfico
const COLORS = {
  success: "#10B981", // Emerald 500
  failed: "#EF4444",  // Red 500
  warning: "#F59E0B", // Amber 500
  primary: "#3B82F6", // Blue 500
  secondary: "#6366F1", // Indigo 500
  neutral: "#64748B"  // Slate 500
};

// Cores para o heatmap
const HEATMAP_COLORS = {
  low: "#FEF3C7",    // Amber 100
  medium: "#F59E0B", // Amber 500
  high: "#B45309",   // Amber 700
  critical: "#78350F" // Amber 900
};

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAllErrors, setShowAllErrors] = useState(false);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p>Não foi possível carregar os dados do dashboard.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Preparar dados para o gráfico de volume diário
  const dailyVolumeData = data.daily_data.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Sucessos: day.success,
    Falhas: day.failed,
    Total: day.total
  }));

  // Preparar dados para o gráfico de conversão
  const conversionData = [
    { name: "Aprovadas", value: data.kpis.success_count, color: COLORS.success },
    { name: "Reprovadas", value: data.kpis.failed_count, color: COLORS.failed }
  ];

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para determinar a cor do heatmap baseada no valor
  const getHeatmapColor = (value: number) => {
    if (value === 0) return "#F8FAFC"; // Slate 50
    if (value < 10) return HEATMAP_COLORS.low;
    if (value < 50) return HEATMAP_COLORS.medium;
    if (value < 100) return HEATMAP_COLORS.high;
    return HEATMAP_COLORS.critical;
  };

  // Função para determinar a cor do texto no heatmap
  const getHeatmapTextColor = (value: number) => {
    if (value === 0) return "#94A3B8"; // Slate 400
    if (value < 50) return "#1E293B"; // Slate 800
    return "#FFFFFF"; // White
  };

  // Filtrar erros para exibição (Top 5 ou Todos)
  const displayedErrors = showAllErrors 
    ? data.error_data 
    : data.error_data.slice(0, 5);

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Performance de Pagamentos</h1>
        <p className="text-slate-500 mt-2 text-lg">Diagnóstico de aprovação e oportunidades de recuperação de receita</p>
      </div>

      {/* KPIs Principais - Segregados por Categoria */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-800">Visão Geral de Transações</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Coluna: Sem Captura (Authorization Only) */}
              <div className="p-6 hover:bg-slate-50/30 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">Sem Captura</h3>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-mono">
                          {data.kpis?.authorization?.rate?.toFixed(2) || "0.00"}% Aprov.
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">Authorization Only</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-slate-900 block">{data.kpis?.authorization?.total || 0}</span>
                    <span className="text-xs text-slate-400 font-medium uppercase">Total</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Aprovadas</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">{data.kpis?.authorization?.success || 0}</div>
                    <div className="text-xs text-emerald-600 mt-1 font-medium">
                      {data.kpis?.authorization?.total ? ((data.kpis.authorization.success / data.kpis.authorization.total) * 100).toFixed(2) : "0.00"}%
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Reprovadas</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">{data.kpis?.authorization?.failed || 0}</div>
                    <div className="text-xs text-red-600 mt-1 font-medium">
                      {data.kpis?.authorization?.total ? ((data.kpis.authorization.failed / data.kpis.authorization.total) * 100).toFixed(2) : "0.00"}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna: Com Captura (Authorization + Capture) */}
              <div className="p-6 hover:bg-slate-50/30 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">Com Captura</h3>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono">
                          {data.kpis?.capture?.rate?.toFixed(2) || "0.00"}% Aprov.
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">Authorization + Capture</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-slate-900 block">{data.kpis?.capture?.total || 0}</span>
                    <span className="text-xs text-slate-400 font-medium uppercase">Total</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Aprovadas</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">{data.kpis?.capture?.success || 0}</div>
                    <div className="text-xs text-emerald-600 mt-1 font-medium">
                      {data.kpis?.capture?.total ? ((data.kpis.capture.success / data.kpis.capture.total) * 100).toFixed(2) : "0.00"}%
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Reprovadas</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">{data.kpis?.capture?.failed || 0}</div>
                    <div className="text-xs text-red-600 mt-1 font-medium">
                      {data.kpis?.capture?.total ? ((data.kpis.capture.failed / data.kpis.capture.total) * 100).toFixed(2) : "0.00"}%
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Volume Diário */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">Volume Diário de Transações</CardTitle>
                <CardDescription>Comparativo de transações aprovadas vs recusadas</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600">Sucessos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-600">Falhas</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
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
                  <Bar dataKey="Sucessos" stackId="a" fill={COLORS.success} radius={[0, 0, 4, 4]} barSize={32} />
                  <Bar dataKey="Falhas" stackId="a" fill={COLORS.failed} radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Taxa de Conversão</CardTitle>
            <CardDescription>Distribuição total do período analisado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centro do Donut */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-3xl font-bold text-slate-900">{data.kpis?.approval_rate?.toFixed(1) || "0.0"}%</span>
                <span className="text-xs text-slate-500 block uppercase tracking-wide font-medium">Aprovação</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-emerald-900">Aprovadas</span>
                </div>
                <span className="text-sm font-bold text-emerald-700">{data.kpis?.success_count || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-red-900">Reprovadas</span>
                </div>
                <span className="text-sm font-bold text-red-700">{data.kpis?.failed_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Tipo de Cartão */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Performance por Tipo de Cartão
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.card_type_data?.map((type: any, index: number) => (
            <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold capitalize text-slate-800">
                      {type.type === 'credit' ? 'Crédito' : 
                       type.type === 'debit' ? 'Débito' : 
                       type.type === 'multiple' ? 'Múltiplo' : type.type}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-wider mt-1">
                      {type.total} Transações
                    </CardDescription>
                  </div>
                  <Badge variant={type.approval_rate >= 70 ? "default" : "destructive"} className={type.approval_rate >= 70 ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                    {type.approval_rate?.toFixed(1) || "0.0"}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Barra de Progresso */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${type.approval_rate || 0}%` }}
                    ></div>
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${100 - (type.approval_rate || 0)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-emerald-600 font-bold">{type.success || 0}</span>
                      <span className="text-xs text-slate-400">Aprovadas</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-red-600 font-bold">{type.failed || 0}</span>
                      <span className="text-xs text-slate-400">Reprovadas</span>
                    </div>
                  </div>

                  {/* Detalhamento por Bandeira */}
                  {type.brands && type.brands.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Por Bandeira</p>
                      <div className="space-y-3">
                        {type.brands.map((brand: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${brand.brand === 'visa' ? 'bg-blue-600' : 'bg-orange-500'}`}></div>
                              <span className="capitalize text-slate-700 font-medium">{brand.brand}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-xs">{brand.total} txns</span>
                              <span className={`font-bold ${brand.rate >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {brand.rate?.toFixed(1) || "0.0"}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance por Bandeira (Heatmap de Erros) */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Distribuição de Erros por Bandeira
        </h2>
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider rounded-tl-lg">Bandeira</th>
                    {data.heatmap_columns?.map((col: string) => (
                      <th key={col} className="px-4 py-3 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-center">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.heatmap_data?.map((row: any) => (
                    <tr key={row.brand}>
                      <td className="px-4 py-4 font-bold text-slate-900 capitalize bg-slate-50/30 border-r border-slate-100">
                        {row.brand}
                      </td>
                      {data.heatmap_columns?.map((col: string) => {
                        const value = row[col] || 0;
                        return (
                          <td 
                            key={`${row.brand}-${col}`} 
                            className="px-4 py-4 text-center font-bold transition-colors hover:opacity-90 cursor-default"
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
            <div className="mt-4 flex items-center justify-end gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#FEF3C7]"></div>
                <span>Baixo Impacto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#F59E0B]"></div>
                <span>Médio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#B45309]"></div>
                <span>Alto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#78350F]"></div>
                <span>Crítico</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Erros */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Principais Motivos de Recusa
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAllErrors(!showAllErrors)}
            className="text-slate-600"
          >
            {showAllErrors ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Mostrar Menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Ver Todos ({data.error_data?.length || 0})
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {displayedErrors?.map((error: any, index: number) => (
            <Card key={index} className="border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-red-50 rounded-lg border border-red-100 group-hover:bg-red-100 transition-colors">
                    <span className="text-xl font-bold text-red-700">{error.percentage?.toFixed(1) || "0.0"}%</span>
                    <span className="text-[10px] text-red-600 uppercase font-bold">Impacto</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-mono">
                        {error.code}
                      </Badge>
                      <span className="text-sm text-slate-500 font-medium">{error.count} ocorrências</span>
                    </div>
                    <p className="text-slate-900 font-medium">{error.details}</p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}
