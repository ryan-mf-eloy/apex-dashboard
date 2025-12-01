import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  valueClassName?: string;
}

export default function KpiCard({ 
  title, 
  value, 
  subtext, 
  icon, 
  trend, 
  trendValue,
  className,
  valueClassName
}: KpiCardProps) {
  return (
    <div className={cn("bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
        {icon && <div className="text-slate-400 bg-slate-50 p-2 rounded-lg">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={cn("text-3xl font-bold text-slate-900 tracking-tight", valueClassName)}>
          {value}
        </span>
      </div>
      
      {(subtext || trend) && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {trend && (
            <span className={cn(
              "flex items-center gap-1 font-medium px-2 py-0.5 rounded-full text-xs",
              trend === "up" && "text-emerald-700 bg-emerald-50",
              trend === "down" && "text-rose-700 bg-rose-50",
              trend === "neutral" && "text-slate-600 bg-slate-100"
            )}>
              {trend === "up" && <ArrowUpRight size={14} />}
              {trend === "down" && <ArrowDownRight size={14} />}
              {trend === "neutral" && <Minus size={14} />}
              {trendValue}
            </span>
          )}
          {subtext && <span className="text-slate-500">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
