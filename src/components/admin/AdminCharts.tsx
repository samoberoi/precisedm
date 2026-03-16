import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";

interface UserRow {
  created_at: string;
}

interface SubscriptionRecord {
  plan_type: string;
  status: string;
  created_at: string;
}

const MONTHLY_PRICE = 1;
const YEARLY_PRICE = 12;

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
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
}) => {
  const width = 340;
  const height = 140;
  const padding = 20;

  const linePath = buildPath(data, width, height, padding);
  const areaPath = buildAreaPath(data, width, height, padding);
  const max = Math.max(...data, 1);
  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border shadow-sm p-4 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">Last 7 days</span>
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
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={lineColor} stroke="white" strokeWidth="2" />
              <text x={x} y={height - 4} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9, fontWeight: 600 }}>
                {labels[i]}
              </text>
              {v > 0 && (
                <text x={x} y={y - 10} textAnchor="middle" className="fill-foreground" style={{ fontSize: 9, fontWeight: 700 }}>
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

export const UserGrowthChart = ({ users }: { users: UserRow[] }) => {
  const days = useMemo(() => getLast7Days(), []);
  const data = useMemo(() => {
    return days.map((day) =>
      users.filter((u) => u.created_at.slice(0, 10) === day).length
    );
  }, [users, days]);
  const labels = useMemo(() => days.map(formatDay), [days]);
  const totalThisWeek = data.reduce((a, b) => a + b, 0);

  return (
    <GradientChart
      data={data}
      labels={labels}
      title="User Growth"
      icon={<TrendingUp className="h-4 w-4 text-primary" />}
      value={String(totalThisWeek)}
      subtitle="new users this week"
      gradientId="userGrowthGrad"
      lineColor="hsl(197, 71%, 52%)"
      gradientStops={["hsl(197, 71%, 52%)", "hsl(197, 71%, 52%)"]}
    />
  );
};

export const RevenueChart = ({ subscriptions }: { subscriptions: SubscriptionRecord[] }) => {
  const days = useMemo(() => getLast7Days(), []);
  const data = useMemo(() => {
    return days.map((day) => {
      const daySubs = subscriptions.filter(
        (s) => s.created_at.slice(0, 10) === day && s.status === "active"
      );
      return daySubs.reduce((sum, s) => {
        if (s.plan_type === "monthly") return sum + MONTHLY_PRICE;
        if (s.plan_type === "yearly") return sum + YEARLY_PRICE;
        return sum;
      }, 0);
    });
  }, [subscriptions, days]);
  const labels = useMemo(() => days.map(formatDay), [days]);
  const totalRevenue = data.reduce((a, b) => a + b, 0);

  // Also compute all-time revenue from all subscriptions
  const allTimeRevenue = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        if (s.plan_type === "monthly") return sum + MONTHLY_PRICE;
        if (s.plan_type === "yearly") return sum + YEARLY_PRICE;
        return sum;
      }, 0);
  }, [subscriptions]);

  return (
    <GradientChart
      data={data}
      labels={labels}
      title="Revenue"
      icon={<DollarSign className="h-4 w-4 text-primary" />}
      value={`$${allTimeRevenue}`}
      subtitle={`$${totalRevenue} this week`}
      gradientId="revenueGrad"
      lineColor="hsl(142, 52%, 45%)"
      gradientStops={["hsl(142, 52%, 45%)", "hsl(142, 52%, 45%)"]}
    />
  );
};
