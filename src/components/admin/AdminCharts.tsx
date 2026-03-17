import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserRow {
  created_at: string;
}

interface SubscriptionRecord {
  plan_type: string;
  status: string;
  created_at: string;
}

export type ChartDateRange = "7d" | "14d" | "last_month" | "this_month" | "today" | "custom";

const CHART_DATE_LABELS: Record<ChartDateRange, string> = {
  "7d": "Last 7 Days",
  "14d": "Last 14 Days",
  "last_month": "Last Month",
  "this_month": "This Month",
  "today": "Today",
  "custom": "Custom Range",
};

const MONTHLY_PRICE = 1;
const YEARLY_PRICE = 12;

function getDays(range: ChartDateRange, customStart?: string, customEnd?: string): string[] {
  const days: string[] = [];
  const now = new Date();

  if (range === "today") {
    days.push(now.toISOString().slice(0, 10));
    return days;
  }

  if (range === "custom" && customStart && customEnd) {
    const s = new Date(customStart);
    const e = new Date(customEnd);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().slice(0, 10));
    }
    return days.length > 0 ? days : [now.toISOString().slice(0, 10)];
  }

  if (range === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  if (range === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  const count = range === "14d" ? 14 : 7;
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDay(dateStr: string, total: number): string {
  const d = new Date(dateStr);
  if (total <= 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  if (total <= 14) return `${d.getMonth() + 1}/${d.getDate()}`;
  // For larger ranges, show every Nth label
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function buildPath(data: number[], width: number, height: number, padding = 20): string {
  if (data.length === 0) return "";
  const max = Math.max(...data, 1);
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v / max) * (height - padding * 2));
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildAreaPath(data: number[], width: number, height: number, padding = 20): string {
  if (data.length === 0) return "";
  const linePath = buildPath(data, width, height, padding);
  const max = Math.max(data.length - 1, 1);
  const stepX = (width - padding * 2) / max;
  const lastX = padding + (data.length - 1) * stepX;
  const baseY = height - padding;
  return `${linePath} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
}

interface ChartDatePickerProps {
  range: ChartDateRange;
  onRangeChange: (r: ChartDateRange) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
}

const ChartDatePicker = ({ range, onRangeChange, customStart, customEnd, onCustomStartChange, onCustomEndChange }: ChartDatePickerProps) => (
  <div className="space-y-2">
    <Select value={range} onValueChange={(v) => onRangeChange(v as ChartDateRange)}>
      <SelectTrigger className="h-7 rounded-lg bg-muted/40 border-border text-[10px] font-semibold w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CHART_DATE_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {range === "custom" && (
      <div className="flex gap-2">
        <div className="flex items-center gap-1 flex-1">
          <Label className="text-[10px] text-muted-foreground">From</Label>
          <Input type="date" value={customStart} onChange={(e) => onCustomStartChange(e.target.value)}
            className="h-7 rounded-lg bg-muted/40 border-border text-[10px] flex-1 px-1.5" />
        </div>
        <div className="flex items-center gap-1 flex-1">
          <Label className="text-[10px] text-muted-foreground">To</Label>
          <Input type="date" value={customEnd} onChange={(e) => onCustomEndChange(e.target.value)}
            className="h-7 rounded-lg bg-muted/40 border-border text-[10px] flex-1 px-1.5" />
        </div>
      </div>
    )}
  </div>
);

const GradientChart = ({
  data,
  labels,
  title,
  icon,
  value,
  subtitle,
  gradientId,
  lineColor,
  gradientStops,
  datePickerProps,
}: {
  data: number[];
  labels: string[];
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
  gradientId: string;
  lineColor: string;
  gradientStops: [string, string];
  datePickerProps: ChartDatePickerProps;
}) => {
  const width = 340;
  const height = 140;
  const padding = 20;

  const linePath = buildPath(data, width, height, padding);
  const areaPath = buildAreaPath(data, width, height, padding);
  const max = Math.max(...data, 1);
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

  // For large datasets, only show every Nth label/point
  const showEveryN = data.length > 14 ? Math.ceil(data.length / 10) : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border shadow-sm p-4 overflow-hidden"
    >
      <div className="flex items-start justify-between mb-1 gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        <ChartDatePicker {...datePickerProps} />
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 120 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientStops[0]} stopOpacity="0.4" />
            <stop offset="100%" stopColor={gradientStops[1]} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {linePath && (
          <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {data.map((v, i) => {
          const x = padding + i * stepX;
          const y = height - padding - ((v / max) * (height - padding * 2));
          const showLabel = i % showEveryN === 0 || i === data.length - 1;
          return (
            <g key={i}>
              {showLabel && <circle cx={x} cy={y} r="3.5" fill={lineColor} stroke="white" strokeWidth="1.5" />}
              {showLabel && (
                <text x={x} y={height - 4} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: data.length > 14 ? 7 : 9, fontWeight: 600 }}>
                  {labels[i]}
                </text>
              )}
              {v > 0 && showLabel && (
                <text x={x} y={y - 8} textAnchor="middle" className="fill-foreground" style={{ fontSize: data.length > 14 ? 7 : 9, fontWeight: 700 }}>
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};

interface ChartProps {
  dateRange: ChartDateRange;
  onDateRangeChange: (r: ChartDateRange) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
}

export const UserGrowthChart = ({ users, ...dateProps }: { users: UserRow[] } & ChartProps) => {
  const days = useMemo(() => getDays(dateProps.dateRange, dateProps.customStart, dateProps.customEnd), [dateProps.dateRange, dateProps.customStart, dateProps.customEnd]);
  const data = useMemo(() => days.map((day) => users.filter((u) => u.created_at.slice(0, 10) === day).length), [users, days]);
  const labels = useMemo(() => days.map((d) => formatDay(d, days.length)), [days]);
  const total = data.reduce((a, b) => a + b, 0);
  const rangeLabel = CHART_DATE_LABELS[dateProps.dateRange];

  return (
    <GradientChart
      data={data}
      labels={labels}
      title="User Growth"
      icon={<TrendingUp className="h-4 w-4 text-primary" />}
      value={String(total)}
      subtitle={`new users — ${rangeLabel}`}
      gradientId="userGrowthGrad"
      lineColor="hsl(197, 71%, 52%)"
      gradientStops={["hsl(197, 71%, 52%)", "hsl(197, 71%, 52%)"]}
      datePickerProps={{
        range: dateProps.dateRange,
        onRangeChange: dateProps.onDateRangeChange,
        customStart: dateProps.customStart,
        customEnd: dateProps.customEnd,
        onCustomStartChange: dateProps.onCustomStartChange,
        onCustomEndChange: dateProps.onCustomEndChange,
      }}
    />
  );
};

export const RevenueChart = ({ subscriptions, ...dateProps }: { subscriptions: SubscriptionRecord[] } & ChartProps) => {
  const days = useMemo(() => getDays(dateProps.dateRange, dateProps.customStart, dateProps.customEnd), [dateProps.dateRange, dateProps.customStart, dateProps.customEnd]);
  const data = useMemo(() => days.map((day) => {
    const daySubs = subscriptions.filter((s) => s.created_at.slice(0, 10) === day && s.status === "active");
    return daySubs.reduce((sum, s) => {
      if (s.plan_type === "monthly") return sum + MONTHLY_PRICE;
      if (s.plan_type === "yearly") return sum + YEARLY_PRICE;
      return sum;
    }, 0);
  }), [subscriptions, days]);
  const labels = useMemo(() => days.map((d) => formatDay(d, days.length)), [days]);
  const periodRevenue = data.reduce((a, b) => a + b, 0);
  const rangeLabel = CHART_DATE_LABELS[dateProps.dateRange];

  const allTimeRevenue = useMemo(() =>
    subscriptions.filter((s) => s.status === "active").reduce((sum, s) => {
      if (s.plan_type === "monthly") return sum + MONTHLY_PRICE;
      if (s.plan_type === "yearly") return sum + YEARLY_PRICE;
      return sum;
    }, 0), [subscriptions]);

  return (
    <GradientChart
      data={data}
      labels={labels}
      title="Revenue"
      icon={<DollarSign className="h-4 w-4 text-primary" />}
      value={`$${allTimeRevenue}`}
      subtitle={`$${periodRevenue} — ${rangeLabel}`}
      gradientId="revenueGrad"
      lineColor="hsl(142, 52%, 45%)"
      gradientStops={["hsl(142, 52%, 45%)", "hsl(142, 52%, 45%)"]}
      datePickerProps={{
        range: dateProps.dateRange,
        onRangeChange: dateProps.onDateRangeChange,
        customStart: dateProps.customStart,
        customEnd: dateProps.customEnd,
        onCustomStartChange: dateProps.onCustomStartChange,
        onCustomEndChange: dateProps.onCustomEndChange,
      }}
    />
  );
};
