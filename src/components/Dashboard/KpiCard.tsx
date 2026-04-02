import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number; // percentage change
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export default function KpiCard({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  iconColor = "text-[#1A2D4A]",
  className,
}: KpiCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;
  const trendNeutral = trend !== undefined && trend === 0;

  return (
    <Card
      className={cn(
        "border border-border/60 hover:shadow-md transition-shadow",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-foreground leading-none">
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
            )}
            {trend !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-2 text-xs font-medium",
                  trendPositive && "text-emerald-600",
                  trendNegative && "text-red-500",
                  trendNeutral && "text-muted-foreground"
                )}
              >
                {trendPositive && <TrendingUp className="w-3 h-3" />}
                {trendNegative && <TrendingDown className="w-3 h-3" />}
                {trendNeutral && <Minus className="w-3 h-3" />}
                <span>
                  {trendPositive ? "+" : ""}
                  {trend.toFixed(1)}% vs last month
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ml-4",
              "bg-[#1A2D4A]/8"
            )}
          >
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
