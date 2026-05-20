// Keywords ranking dashboard for PreciseDM.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, Search, AlertCircle, ExternalLink, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type KeywordRow = {
  keyword: string;
  status: "ranking" | "na" | "not_connected";
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
  sources: Array<{ kind: "task" | "blog"; id: string; title: string; role: "primary" | "secondary"; url: string | null }>;
};

type Payload = {
  range: { startDate: string; endDate: string; days: number };
  siteUrl?: string;
  generatedAt?: string;
  total: number;
  ranking: number;
  keywords: KeywordRow[];
  error?: string;
};

function positionTone(pos: number | null): { label: string; cls: string } {
  if (pos == null) return { label: "NA", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  if (pos <= 3) return { label: pos.toFixed(1), cls: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  if (pos <= 10) return { label: pos.toFixed(1), cls: "bg-blue-100 text-blue-800 border-blue-200" };
  if (pos <= 20) return { label: pos.toFixed(1), cls: "bg-amber-100 text-amber-800 border-amber-200" };
  return { label: pos.toFixed(1), cls: "bg-orange-100 text-orange-800 border-orange-200" };
}

function pageBucket(pos: number | null) {
  if (pos == null) return "Not ranking";
  if (pos <= 10) return "Page 1";
  if (pos <= 20) return "Page 2";
  if (pos <= 30) return "Page 3";
  return "Page 4+";
}

export default function AdminSeoKeywords() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("28");
  const [filter, setFilter] = useState<"all" | "ranking" | "na">("all");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("seo-keywords-status", {
        body: { days: Number(days) },
      });
      if (error) throw error;
      const payload = res as Payload;
      if (payload?.error && payload.error !== "not_connected") throw new Error(payload.error);
      // Normalize rows so missing numeric fields (e.g. when not connected) don't crash render.
      payload.keywords = (payload.keywords ?? []).map((k) => ({
        ...k,
        clicks: k.clicks ?? 0,
        impressions: k.impressions ?? 0,
        ctr: k.ctr ?? 0,
        position: k.position ?? null,
        sources: k.sources ?? [],
      }));
      setData(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Failed to load keywords");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [days]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.keywords.filter((k) => {
      if (filter === "ranking" && k.status !== "ranking") return false;
      if (filter === "na" && k.status === "ranking") return false;
      if (q && !k.keyword.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, filter, search]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, ranking: 0, page1: 0, page2: 0, na: 0, top3: 0 };
    return {
      total: data.keywords.length,
      ranking: data.keywords.filter((k) => k.status === "ranking").length,
      top3: data.keywords.filter((k) => k.position != null && k.position <= 3).length,
      page1: data.keywords.filter((k) => k.position != null && k.position <= 10).length,
      page2: data.keywords.filter((k) => k.position != null && k.position > 10 && k.position <= 20).length,
      na: data.keywords.filter((k) => k.status !== "ranking").length,
    };
  }, [data]);

  const notConnected = data?.error === "not_connected";

  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-wrap items-center gap-3 text-sm">
        {notConnected ? (
          <span className="flex items-center gap-1 text-amber-700">
            <AlertCircle className="h-4 w-4" /> Connect Google in the Analytics tab to see live rankings.
          </span>
        ) : (
          <>
            <Badge variant="outline" className="bg-emerald-50">Live from Search Console</Badge>
            <span className="text-muted-foreground">
              Window: <span className="font-medium text-foreground">last {data?.range.days ?? days} days</span>
              {data?.range.startDate && <> · {data.range.startDate} → {data.range.endDate}</>}
            </span>
            {data?.generatedAt && (
              <span className="text-xs text-muted-foreground">Updated {new Date(data.generatedAt).toLocaleString("en-IN")}</span>
            )}
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="28">Last 28 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Tracked" value={stats.total} sub="In our SEO plan" />
        <Stat label="Ranking" value={stats.ranking} sub="With impressions" tone="emerald" />
        <Stat label="Top 3" value={stats.top3} sub="Best positions" tone="emerald" />
        <Stat label="Page 1" value={stats.page1} sub="Positions 1–10" tone="blue" />
        <Stat label="Not ranking" value={stats.na} sub="No data yet" tone="slate" />
      </div>

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search keyword…" className="pl-8 h-9" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All keywords</SelectItem>
            <SelectItem value="ranking">Ranking only</SelectItem>
            <SelectItem value="na">Not ranking yet</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} shown</span>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-3 py-2">Keyword</th>
                <th className="px-3 py-2 whitespace-nowrap">Position</th>
                <th className="px-3 py-2">Page</th>
                <th className="px-3 py-2 text-right">Impressions</th>
                <th className="px-3 py-2 text-right">Clicks</th>
                <th className="px-3 py-2 text-right">CTR</th>
                <th className="px-3 py-2">Tracked in</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr><td colSpan={8} className="p-10 text-center"><Loader2 className="h-5 w-5 mx-auto animate-spin" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No keywords match.</td></tr>
              ) : filtered.map((k) => {
                const tone = positionTone(k.position);
                const serpUrl = `https://www.google.com/search?q=${encodeURIComponent(k.keyword)}&gl=in&hl=en`;
                return (
                  <tr key={k.keyword} className="border-t hover:bg-muted/20 align-top">
                    <td className="px-3 py-2 font-medium">{k.keyword}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${tone.cls}`}>
                        {tone.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{pageBucket(k.position)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{k.impressions.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{k.clicks.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{k.impressions ? `${(k.ctr * 100).toFixed(1)}%` : "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1 max-w-[24rem]">
                        {k.sources.slice(0, 4).map((s, i) => (
                          <Badge key={i} variant="outline" className={s.kind === "blog" ? "border-violet-200 bg-violet-50 text-violet-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
                            {s.kind === "blog" ? "Blog" : "Task"}{s.role === "secondary" ? " · 2°" : ""} · {s.title.length > 28 ? s.title.slice(0, 28) + "…" : s.title}
                          </Badge>
                        ))}
                        {k.sources.length > 4 && <span className="text-xs text-muted-foreground">+{k.sources.length - 4}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <a href={serpUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" title="Open in Google">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Positions are the average rank in Google over the selected window. "NA" means the keyword had zero impressions yet — normal for keywords we just started targeting. Data refreshes daily from Search Console (~48h crawl lag).
      </p>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: number; sub: string; tone?: "emerald" | "blue" | "slate" }) {
  const bg = tone === "emerald" ? "bg-emerald-50" : tone === "blue" ? "bg-blue-50" : tone === "slate" ? "bg-slate-50" : "bg-card";
  return (
    <Card className={`p-4 border-0 ${bg}`}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </Card>
  );
}
