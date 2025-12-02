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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ListFilter size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Transaction Overview</h3>
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
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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

      {/* Brand Performance (Heatmap) */}
      <div id="brands" className="mb-12 scroll-mt-28">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Grid size={20} />
          </div>
          <h3 className="font-bold text-slate-800 text-xl">Error Distribution by Brand</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
                    Brand
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
                  <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 capitalize border-r border-slate-100 bg-slate-50/30">
                      {row.name}
                    </td>
                    {heatmap_columns?.map((col: string) => {
                      const value = row[col] || 0;
                      return (
                        <td 
                          key={`${row.name}-${col}`} 
                          className="px-6 py-4 text-center font-bold cursor-default"
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
          
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end gap-6 text-xs font-medium text-slate-500">
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="space-y-8">
            {displayedErrors?.map((error: any, index: number) => (
              <div key={index} className="relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div className="flex items-start md:items-center gap-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold font-mono border border-slate-200 whitespace-nowrap">
                      {error.code}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm md:text-base uppercase tracking-tight">
                      {error.details}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 pl-12 md:pl-0">
                    <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-xs font-bold border border-rose-100 whitespace-nowrap">
                      {error.count} failures
                    </span>
                    <span className="font-bold text-slate-900 text-sm w-12 text-right">
                      {error.percentage?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${Math.min(error.percentage * 2, 100)}%` }} // Scale up for visibility
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {error_data && error_data.length > 5 && (
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center">
              <button 
                onClick={() => setShowAllErrors(!showAllErrors)}
                className="px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                {showAllErrors ? (
                  <>Show Less <ChevronUp size={16} /></>
                ) : (
                  <>Show All Reasons ({error_data.length - 5} more) <ChevronDown size={16} /></>
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
