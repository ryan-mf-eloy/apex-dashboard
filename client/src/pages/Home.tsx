import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  CreditCard, AlertCircle, ShieldAlert, Info, TrendingUp, 
  CheckCircle2, XCircle, ListFilter, Grid, Wallet, ArrowRight, ChevronDown, ChevronUp,
  Ban, Phone, AlertTriangle, HelpCircle, ArrowLeft
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, parseISO, differenceInDays, min, max } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Theme Colors
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
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
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
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div>Error loading data.</div>;

  const { kpis, daily_data, brand_data, error_data, heatmap_data, heatmap_columns, transactions } = data;

  // Calculate period and days
  const dates = transactions?.map((t: any) => parseISO(t.date)) || [];
  const startDate = dates.length > 0 ? min(dates) : new Date();
  const endDate = dates.length > 0 ? max(dates) : new Date();
  const daysCount = differenceInDays(endDate, startDate) + 1;
  const periodString = `${format(startDate, "MMMM dd")} to ${format(endDate, "MMMM dd, yyyy")}`;

  // Heatmap color function
  const getHeatmapColor = (value: number) => {
    if (value === 0) return '#FFFBEB'; // Very light yellow
    if (value < 20) return '#FDE68A'; // Light yellow
    if (value < 50) return '#FCD34D'; // Medium yellow
    if (value < 80) return '#FB923C'; // Orange
    if (value < 100) return '#EF4444'; // Light red
    return '#991B1B'; // Dark red
  };

  const getHeatmapTextColor = (value: number) => {
    return value > 80 ? 'white' : '#1E293B';
  };

  // Get icon for error code
  const getErrorIcon = (code: string, details: string) => {
    const lowerDetails = details.toLowerCase();
    if (lowerDetails.includes('fraud') || code === 'ABECS-83' || code === 'ABECS-59') return <ShieldAlert size={16} />;
    if (lowerDetails.includes('balance') || lowerDetails.includes('limit') || code === 'ABECS-51') return <Wallet size={16} />;
    if (lowerDetails.includes('contact') || code === 'ABECS-82') return <Phone size={16} />;
    if (lowerDetails.includes('unavailable') || code === 'ABECS-91') return <Ban size={16} />;
    return <AlertTriangle size={16} />;
  };

  // Determine if error is retryable based on ABECS standards
  // Reversible = Retry Allowed, Irreversible = No Retry
  const getRetryStatus = (code: string) => {
    // Based on Cielo ABECS documentation:
    // Reversible: 51 (Insufficient Funds), 59 (Suspected Fraud), 91 (Issuer Down), 96 (System Failure)
    // Irreversible: 57 (Not Permitted), 82 (Invalid Card), 83 (Expired/Invalid PIN)
    
    const reversibleCodes = [
      'ABECS-51', // SALDO/LIMITE INSUFICIENTE -> REVERSÍVEL
      'ABECS-59', // SUSPEITA DE FRAUDE/AVISO DE VIAGEM -> REVERSÍVEL
      'ABECS-91', // EMISSOR FORA DO AR -> REVERSÍVEL
      'ABECS-96', // FALHA DO SISTEMA -> REVERSÍVEL
      'ABECS-05', // GENÉRICA -> REVERSÍVEL
      'ABECS-62', // BLOQUEIO TEMPORÁRIO -> REVERSÍVEL
      'ABECS-78'  // CARTÃO NOVO SEM DESBLOQUEIO -> REVERSÍVEL
    ];
    
    // Explicitly Irreversible codes for clarity (though default is No Retry)
    // ABECS-57: TRANSAÇÃO NÃO PERMITIDA -> IRREVERSÍVEL
    // ABECS-82: CARTÃO INVÁLIDO -> IRREVERSÍVEL
    // ABECS-83: SENHA VENCIDA / ERRO DE CRIPTOGRAFIA -> IRREVERSÍVEL
    
    // Check if code is in reversible list
    const isReversible = reversibleCodes.some(c => code === c || code.endsWith(c.replace('ABECS-', '')));
    
    return isReversible 
      ? { allowed: true, label: 'Retry Allowed' } 
      : { allowed: false, label: 'No Retry' };
  };

    // Get solution suggestion for error code with detailed steps
    const getErrorSolution = (code: string) => {
      const solutions: Record<string, { short: string, details: string }> = {
        'ABECS-51': {
          short: 'Insufficient Funds: Suggest alternative card.',
          details: 'Customer has insufficient balance. 1. Recommend using a different card. 2. If credit, suggest debit. 3. Do not retry immediately to avoid blocking.'
        },
        'ABECS-59': {
          short: 'Suspected Fraud: Enable 3DS authentication.',
          details: 'Transaction flagged as high risk. 1. Enable 3D Secure (3DS 2.0) to shift liability. 2. Use Zero Auth to validate card before charging. 3. Contact customer to confirm legitimacy.'
        },
        'ABECS-91': {
          short: 'Issuer Down: Retry later.',
          details: 'Bank system is temporarily unavailable. 1. Wait 15-30 minutes before retrying. 2. Do not retry repeatedly in short intervals. 3. If persistent, notify support.'
        },
        'ABECS-57': {
          short: 'Not Permitted: Check merchant category (MCC).',
          details: 'Transaction not allowed for this card type. 1. Verify if your MCC is blocked by the issuer. 2. Check if card brand is enabled in your acquirer settings.'
        },
        'ABECS-82': {
          short: 'Invalid Card: Validate via Zero Auth.',
          details: 'Card number is invalid or malformed. 1. Implement Zero Auth ($0.00 verification) at checkout. 2. Use Luhn algorithm check on frontend. 3. Ask customer to re-enter details.'
        },
        'ABECS-83': {
          short: 'Invalid PIN/Data: Verify input fields.',
          details: 'Authentication data is incorrect. 1. Ask customer to re-enter CVV and Expiry Date. 2. Ensure encryption keys are up to date. 3. Suggest using a digital wallet (Apple/Google Pay).'
        },
        'GEN-002': {
          short: 'System Error: Contact technical support.',
          details: 'Generic gateway error. 1. Check API logs for specific sub-codes. 2. Verify API credentials. 3. Retry once after 5 minutes.'
        }
      };
      return solutions[code] || { 
        short: 'Monitor error rate.', 
        details: 'No specific recommendation available. Monitor for spikes and contact acquirer support if rate exceeds 1%.' 
      };
    };

    // Determine errors to display
    const displayedErrors = showAllErrors ? error_data : error_data?.slice(0, 5);

  // Pagination logic
  const totalPages = Math.ceil((transactions?.length || 0) / itemsPerPage);
  const paginatedTransactions = transactions?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div id="overview" className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 scroll-mt-28">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Payment Performance</h2>
          <p className="text-slate-500 mt-2 text-lg">
            Approval diagnostics and revenue recovery opportunities
          </p>
        </div>
        <div className="flex flex-col items-end justify-center bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Analyzed Period</span>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-900 font-bold text-lg">{periodString}</span>
            <span className="text-slate-500 text-sm font-medium">({daysCount} days)</span>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-12 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <ListFilter size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Transaction Overview</h3>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Transactions:</span>
                <span className="text-lg font-bold text-slate-900">
                  {(kpis?.authorization?.total || 0) + (kpis?.capture?.total || 0)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Including only captures and authorizations</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Authorization */}
          <div className="p-8 hover:bg-slate-50/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-900 text-xl">No Capture</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold border",
                      (kpis?.authorization?.rate || 0) > 50 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {kpis?.authorization?.rate?.toFixed(2) || "0.00"}% Appr.
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
                  <span className="text-xs font-bold uppercase">Approved</span>
                </div>
                <span className="block text-2xl font-bold text-emerald-700">{kpis?.authorization?.success || 0}</span>
                <span className="text-sm font-medium text-emerald-600/80">{kpis?.authorization?.rate?.toFixed(2) || "0.00"}%</span>
              </div>

              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-rose-700">
                  <XCircle size={16} />
                  <span className="text-xs font-bold uppercase">Declined</span>
                </div>
                <span className="block text-2xl font-bold text-rose-700">{kpis?.authorization?.failed || 0}</span>
                <span className="text-sm font-medium text-rose-600/80">{((100 - (kpis?.authorization?.rate || 0))).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Capture */}
          <div className="p-8 hover:bg-slate-50/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-900 text-xl">With Capture</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold border",
                      (kpis?.capture?.rate || 0) > 50 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {kpis?.capture?.rate?.toFixed(2) || "0.00"}% Appr.
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
                  <span className="text-xs font-bold uppercase">Approved</span>
                </div>
                <span className="block text-2xl font-bold text-emerald-700">{kpis?.capture?.success || 0}</span>
                <span className="text-sm font-medium text-emerald-600/80">{kpis?.capture?.rate?.toFixed(2) || "0.00"}%</span>
              </div>

              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-rose-700">
                  <XCircle size={16} />
                  <span className="text-xs font-bold uppercase">Declined</span>
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
              <h3 className="font-bold text-slate-900 text-xl">Daily Transaction Volume</h3>
              <p className="text-slate-500 text-sm mt-1">Comparison of approved vs declined transactions</p>
            </div>
            <div className="flex gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-700">Failed</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(parseISO(val), "MM/dd")}
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
                <RechartsTooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => [value, name === 'success' ? 'Approved' : 'Declined']}
                  labelFormatter={(label) => {
                    const dateData = daily_data.find((d: any) => d.date === label);
                    const total = dateData ? dateData.success + dateData.failed : 0;
                    return (
                      <div className="mb-2">
                        <div className="font-bold text-slate-900">{format(parseISO(label), "MMMM dd, yyyy")}</div>
                        <div className="text-xs text-slate-500 font-medium">Total: {total} transactions</div>
                      </div>
                    );
                  }}
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
            <h3 className="font-bold text-slate-900 text-xl">General Approval Rate</h3>
            <p className="text-slate-500 text-sm mt-1">Total distribution of the analyzed period</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: (kpis?.authorization?.success || 0) + (kpis?.capture?.success || 0), color: COLORS.success },
                      { name: 'Declined', value: (kpis?.authorization?.failed || 0) + (kpis?.capture?.failed || 0), color: COLORS.danger }
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
                      { name: 'Approved', value: (kpis?.authorization?.success || 0) + (kpis?.capture?.success || 0), color: COLORS.success },
                      { name: 'Declined', value: (kpis?.authorization?.failed || 0) + (kpis?.capture?.failed || 0), color: COLORS.danger }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-slate-900">{kpis?.approval_rate?.toFixed(1) || "0.0"}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Period Analysis Chart */}
      <div className="mb-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-3">
                {selectedPeriod && (
                  <button 
                    onClick={() => setSelectedPeriod(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Back to periods"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h3 className="font-bold text-slate-900 text-xl">
                  {selectedPeriod ? `${selectedPeriod} Breakdown` : 'Transaction Volume by Period'}
                </h3>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {selectedPeriod 
                  ? 'Hourly breakdown of approved vs declined transactions' 
                  : 'Click on any bar below to expand hourly details'}
              </p>
            </div>
            <div className="flex gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-700">Failed</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {selectedPeriod ? (
                <BarChart 
                  data={data?.period_data?.find((p: any) => p.period === selectedPeriod)?.hourly || []} 
                  layout="horizontal" 
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(val) => `${val}h`}
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
                  <RechartsTooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [value, name === 'success' ? 'Approved' : 'Declined']}
                    labelFormatter={(label) => `${label}:00 - ${label}:59`}
                  />
                  <Bar dataKey="success" stackId="a" fill={COLORS.success} radius={[0, 0, 4, 4]} barSize={32} />
                  <Bar dataKey="failed" stackId="a" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              ) : (
                <BarChart 
                  data={data?.period_data} 
                  layout="vertical" 
                  margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                  onClick={(state) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      setSelectedPeriod(state.activePayload[0].payload.period);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="period" 
                    type="category" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 14, fontWeight: 600 }}
                    width={100}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [value, name === 'success' ? 'Approved' : 'Declined']}
                  />
                  <Bar dataKey="success" stackId="a" fill={COLORS.success} radius={[0, 4, 4, 0]} barSize={40} cursor="pointer" />
                  <Bar dataKey="failed" stackId="a" fill={COLORS.danger} radius={[0, 4, 4, 0]} barSize={40} cursor="pointer" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance by Card Type Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <CreditCard size={20} />
          </div>
          <h3 className="font-bold text-slate-800 text-xl">Performance by Card Type</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data?.card_type_data?.map((type: any) => (
            <div key={type.type} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 text-lg capitalize">
                  {type.type === 'multiple' ? 'Multiple' : type.type === 'credit' ? 'Credit' : 'Debit'}
                </h4>
                <span className="px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-600">
                  {type.approval_rate.toFixed(1)}%
                </span>
              </div>
              
              <div className="text-sm text-slate-500 mb-4">
                {type.total} TRANSACTIONS
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex mb-2">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${type.approval_rate}%` }}
                ></div>
                <div 
                  className="h-full bg-rose-500" 
                  style={{ width: `${100 - type.approval_rate}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm font-medium mb-6">
                <div className="text-emerald-600">
                  <span className="font-bold">{type.success}</span>
                  <div className="text-xs text-slate-400 font-normal">Approved</div>
                </div>
                <div className="text-rose-600 text-right">
                  <span className="font-bold">{type.failed}</span>
                  <div className="text-xs text-slate-400 font-normal">Declined</div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  BY BRAND
                </div>
                <div className="space-y-3">
                  {type.brands?.sort((a: any, b: any) => {
                    if (a.brand === 'mastercard') return -1;
                    if (b.brand === 'mastercard') return 1;
                    return 0;
                  }).map((brand: any) => (
                    <div key={brand.brand} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${brand.brand === 'visa' ? 'bg-blue-600' : 'bg-orange-500'}`}></div>
                        <span className="font-medium text-slate-700 capitalize">{brand.brand}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-xs">{brand.total} txns</span>
                        <span className="font-bold text-rose-600">{brand.rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
          <h3 className="font-bold text-slate-800 text-xl">Error Distribution by Brand</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                    Brand
                  </th>
                  {heatmap_columns?.map((col: string) => (
                    <th key={col} className="px-6 py-4 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-xs text-center">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {heatmap_data?.map((row: any) => (
                  <tr key={row.name}>
                    <td className="px-6 py-4 font-bold text-slate-900 capitalize bg-white">
                      {row.name}
                    </td>
                    {heatmap_columns?.map((col: string) => {
                      const value = row[col] || 0;
                      return (
                        <td 
                          key={`${row.name}-${col}`} 
                          className="px-6 py-4 text-center font-bold cursor-default transition-all hover:opacity-90"
                          style={{ 
                            backgroundColor: getHeatmapColor(value),
                            color: getHeatmapTextColor(value)
                          }}
                          title={`${value} occurrences of ${col} in ${row.name}`}
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
          
          <div className="mt-4 flex justify-end gap-6 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#FFFBEB] border border-slate-200"></span>
              <span>0 Occurrences</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#FDE68A]"></span>
              <span>&lt; 20</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#FCD34D]"></span>
              <span>20 - 50</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#FB923C]"></span>
              <span>50 - 80</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#EF4444]"></span>
              <span>80 - 100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#991B1B]"></span>
              <span>&gt; 100</span>
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
          <h3 className="font-bold text-slate-800 text-xl">Top Decline Reasons</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {displayedErrors?.map((error: any, index: number) => (
              <div key={index} className="p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-1.5 bg-rose-50 text-rose-600 rounded-full shrink-0 group-hover:bg-rose-100 transition-colors">
                      {getErrorIcon(error.code, error.details)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200 uppercase tracking-wider">
                          {error.code}
                        </span>
                        {(() => {
                          const status = getRetryStatus(error.code);
                          return (
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${
                              status.allowed 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                              {status.label}
                            </span>
                          );
                        })()}
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{error.details}</h4>
                      {!showAllErrors && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help group/tooltip">
                                  <Info size={12} className="text-blue-500" />
                                  <p className="text-xs text-slate-500 group-hover/tooltip:text-blue-600 transition-colors border-b border-dashed border-slate-300 hover:border-blue-400">
                                    {getErrorSolution(error.code).short}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs bg-slate-900 text-slate-50 p-3 shadow-xl border-slate-800">
                                <div className="space-y-2">
                                  <p className="font-bold text-xs uppercase tracking-wider text-slate-400">Mitigation Strategy</p>
                                  <p className="text-sm leading-relaxed">{getErrorSolution(error.code).details}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 min-w-[240px] justify-end">
                    <div className="text-right">
                      <span className="block font-bold text-rose-600 text-lg">{error.count}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase">Failures</span>
                    </div>
                    <div className="text-right w-20">
                      <span className="block font-bold text-slate-900 text-lg">{error.percentage.toFixed(1)}%</span>
                      <span className="text-xs text-slate-400 font-bold uppercase">Impact</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${error.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {error_data && error_data.length > 5 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button 
                onClick={() => setShowAllErrors(!showAllErrors)}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {showAllErrors ? (
                  <>Show Less <ChevronUp size={16} /></>
                ) : (
                  <>Show All Decline Reasons <ChevronDown size={16} /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div id="table" className="mb-12 scroll-mt-28">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <ListFilter size={20} />
          </div>
          <h3 className="font-bold text-slate-800 text-xl">Transaction History</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">Date</th>
                  <th className="px-6 py-4 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">Order ID</th>
                  <th className="px-6 py-4 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">Category</th>
                  <th className="px-6 py-4 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">External ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions?.map((txn: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {format(parseISO(txn.date), "MMM dd, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-mono text-xs">
                      {txn.order_id || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold border capitalize",
                        txn.category === 'Authorization' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        txn.category === 'Capture' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        {txn.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit",
                        (txn.status === 'Success' || txn.status === 'Authorized' || txn.status === 'Captured')
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      )}>
                        {(txn.status === 'Success' || txn.status === 'Authorized' || txn.status === 'Captured') 
                          ? <CheckCircle2 size={12} /> 
                          : <XCircle size={12} />
                        }
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {txn.external_id || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, transactions?.length || 0)}</span> of <span className="font-bold text-slate-900">{transactions?.length}</span> results
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
