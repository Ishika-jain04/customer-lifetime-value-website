import { useState, useEffect, useRef } from "react";
import { TrendingUp, Users, ShoppingCart, RefreshCw, Calculator, ChevronDown, ArrowRight, Zap, Target } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const clvGrowthData = [
  { month: "Jan", clv: 420, industry: 310 },
  { month: "Feb", clv: 480, industry: 325 },
  { month: "Mar", clv: 510, industry: 340 },
  { month: "Apr", clv: 590, industry: 355 },
  { month: "May", clv: 640, industry: 370 },
  { month: "Jun", clv: 710, industry: 385 },
  { month: "Jul", clv: 760, industry: 395 },
  { month: "Aug", clv: 820, industry: 410 },
  { month: "Sep", clv: 890, industry: 425 },
  { month: "Oct", clv: 940, industry: 440 },
  { month: "Nov", clv: 1020, industry: 455 },
  { month: "Dec", clv: 1105, industry: 470 },
];

const industryData = [
  { industry: "SaaS", clv: 4200, cac: 820 },
  { industry: "E-comm", clv: 890, cac: 120 },
  { industry: "Finance", clv: 6800, cac: 1200 },
  { industry: "Retail", clv: 540, cac: 65 },
  { industry: "Health", clv: 3100, cac: 560 },
  { industry: "Media", clv: 720, cac: 90 },
  { industry: "Telecom", clv: 2400, cac: 380 },
];

const cohortData = [
  { cohort: "Q1 2022", m1: 100, m3: 88, m6: 74, m12: 58, m24: 41 },
  { cohort: "Q2 2022", m1: 100, m3: 91, m6: 79, m12: 63, m24: 47 },
  { cohort: "Q3 2022", m1: 100, m3: 93, m6: 83, m12: 68, m24: 52 },
  { cohort: "Q4 2022", m1: 100, m3: 90, m6: 80, m12: 66, m24: 50 },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── SVG Area Chart ──────────────────────────────────────────────────────────

function SvgAreaChart({ data }: { data: typeof clvGrowthData }) {
  const W = 900, H = 280, PL = 52, PR = 16, PT = 16, PB = 36;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxVal = Math.max(...data.map((d) => d.clv));
  const yMax = Math.ceil(maxVal / 200) * 200;
  const xStep = cW / (data.length - 1);
  const yScale = (v: number) => PT + cH - (v / yMax) * cH;
  const xScale = (i: number) => PL + i * xStep;

  const toPath = (key: "clv" | "industry") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(d[key]).toFixed(1)}`).join(" ");

  const toArea = (key: "clv" | "industry") =>
    `${toPath(key)} L${xScale(data.length - 1).toFixed(1)},${(PT + cH).toFixed(1)} L${PL},${(PT + cH).toFixed(1)} Z`;

  const yTicks = [0, 250, 500, 750, 1000].filter((v) => v <= yMax + 50);

  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="relative w-full overflow-hidden" style={{ paddingBottom: `${(H / W) * 100}%` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {/* grid lines */}
        {yTicks.map((v) => (
          <line key={`gl-${v}`} x1={PL} x2={W - PR} y1={yScale(v)} y2={yScale(v)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
        ))}
        {/* areas */}
        <path d={toArea("industry")} fill="#7C3AED" fillOpacity={0.06} />
        <path d={toArea("clv")} fill="#00C9A7" fillOpacity={0.1} />
        {/* lines */}
        <path d={toPath("industry")} fill="none" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="6 3" />
        <path d={toPath("clv")} fill="none" stroke="#00C9A7" strokeWidth={2} />
        {/* y labels */}
        {yTicks.map((v) => (
          <text key={`yl-${v}`} x={PL - 6} y={yScale(v) + 4} textAnchor="end" fontSize={10} fill="#8A97B4" fontFamily="JetBrains Mono">${v}</text>
        ))}
        {/* x labels */}
        {data.map((d, i) => (
          <text key={d.month} x={xScale(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#8A97B4" fontFamily="JetBrains Mono">{d.month}</text>
        ))}
        {/* hover dots */}
        {hover !== null && (
          <>
            <line x1={xScale(hover)} x2={xScale(hover)} y1={PT} y2={PT + cH} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <circle cx={xScale(hover)} cy={yScale(data[hover].clv)} r={4} fill="#00C9A7" />
            <circle cx={xScale(hover)} cy={yScale(data[hover].industry)} r={4} fill="#7C3AED" />
          </>
        )}
        {/* hover zone */}
        {data.map((d, i) => (
          <rect
            key={`hz-${i}`}
            x={xScale(i) - xStep / 2}
            y={PT}
            width={xStep}
            height={cH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {/* tooltip */}
      {hover !== null && (
        <div
          className="absolute pointer-events-none bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl"
          style={{ left: `${((xScale(hover) - 40) / W) * 100}%`, top: "10%", transform: "translateX(-50%)" }}
        >
          <div className="text-muted-foreground mb-1">{data[hover].month}</div>
          <div className="text-primary">CLV: ${data[hover].clv}</div>
          <div className="text-accent">Avg: ${data[hover].industry}</div>
        </div>
      )}
    </div>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────

function SvgBarChart({ data }: { data: typeof industryData }) {
  const W = 900, H = 280, PL = 52, PR = 16, PT = 16, PB = 36;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxVal = Math.max(...data.map((d) => d.clv));
  const yMax = Math.ceil(maxVal / 1000) * 1000;
  const yScale = (v: number) => PT + cH - (v / yMax) * cH;
  const groupW = cW / data.length;
  const barW = groupW * 0.28;
  const gap = groupW * 0.06;
  const yTicks = [0, 2000, 4000, 6000].filter((v) => v <= yMax + 200);
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="relative w-full overflow-hidden" style={{ paddingBottom: `${(H / W) * 100}%` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {yTicks.map((v) => (
          <line key={`bgl-${v}`} x1={PL} x2={W - PR} y1={yScale(v)} y2={yScale(v)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
        ))}
        {data.map((d, i) => {
          const cx = PL + i * groupW + groupW / 2;
          const clvH = ((d.clv / yMax) * cH);
          const cacH = ((d.cac / yMax) * cH);
          const isHov = hover === i;
          return (
            <g key={`bar-${i}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={cx - barW - gap / 2} y={yScale(d.clv)} width={barW} height={clvH} rx={3} fill="#00C9A7" fillOpacity={isHov ? 1 : 0.75} />
              <rect x={cx + gap / 2} y={yScale(d.cac)} width={barW} height={cacH} rx={3} fill="#7C3AED" fillOpacity={isHov ? 1 : 0.75} />
              <text x={cx} y={H - 6} textAnchor="middle" fontSize={10} fill={isHov ? "#DDE4F0" : "#8A97B4"} fontFamily="JetBrains Mono">{d.industry}</text>
            </g>
          );
        })}
        {yTicks.map((v) => (
          <text key={`yl-${v}`} x={PL - 6} y={yScale(v) + 4} textAnchor="end" fontSize={10} fill="#8A97B4" fontFamily="JetBrains Mono">
            ${v >= 1000 ? `${v / 1000}k` : v}
          </text>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl"
          style={{ left: `${((PL + hover * (cW / data.length) + (cW / data.length) / 2 - 40) / W) * 100}%`, top: "8%", transform: "translateX(-50%)" }}
        >
          <div className="text-muted-foreground mb-1">{data[hover].industry}</div>
          <div className="text-primary">CLV: ${data[hover].clv.toLocaleString()}</div>
          <div style={{ color: "#7C3AED" }}>CAC: ${data[hover].cac.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, delta, icon: Icon, color }: {
  label: string; value: string; delta: string; icon: any; color: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary">{delta}</span>
      </div>
      <div className={`text-3xl font-mono font-bold text-foreground mb-1 transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground font-mono tracking-wide uppercase text-xs">{label}</div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionTag({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-mono text-primary/60 tracking-widest">{n}</span>
      <div className="h-px flex-1 max-w-8 bg-primary/30" />
      <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">{label}</span>
    </div>
  );
}

// ─── CLV Calculator ──────────────────────────────────────────────────────────

function Calculator_() {
  const [aov, setAov] = useState(120);
  const [freq, setFreq] = useState(4);
  const [lifespan, setLifespan] = useState(3);
  const [margin, setMargin] = useState(35);

  const clv = Math.round(aov * freq * lifespan * (margin / 100));
  const simpleClv = Math.round(aov * freq * lifespan);
  const cac = Math.round(clv * 0.22);
  const ratio = (clv / cac).toFixed(1);

  const sliders = [
    { label: "Avg. Order Value", key: "aov", value: aov, set: setAov, min: 10, max: 1000, step: 5, prefix: "$" },
    { label: "Purchase Frequency / yr", key: "freq", value: freq, set: setFreq, min: 1, max: 52, step: 1, suffix: "×" },
    { label: "Customer Lifespan (yrs)", key: "lifespan", value: lifespan, set: setLifespan, min: 1, max: 10, step: 0.5, suffix: " yr" },
    { label: "Gross Margin", key: "margin", value: margin, set: setMargin, min: 5, max: 90, step: 1, suffix: "%" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {sliders.map((s) => (
          <div key={s.key}>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-mono text-muted-foreground tracking-wide">{s.label}</label>
              <span className="text-sm font-mono font-semibold text-foreground">
                {s.prefix}{s.value}{s.suffix}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.set(Number(e.target.value))}
                className="w-full h-1 appearance-none rounded-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00C9A7 0%, #00C9A7 ${((s.value - s.min) / (s.max - s.min)) * 100}%, rgba(255,255,255,0.1) ${((s.value - s.min) / (s.max - s.min)) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl p-8 text-center flex-1 flex flex-col items-center justify-center">
          <div className="text-xs font-mono text-primary tracking-widest uppercase mb-2">Customer Lifetime Value</div>
          <div className="text-6xl font-mono font-bold text-foreground mb-1">
            ${clv.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground font-mono">gross margin-adjusted</div>
          <div className="mt-4 text-xs font-mono text-muted-foreground">
            Simple CLV: <span className="text-foreground">${simpleClv.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Est. CAC Budget</div>
            <div className="text-2xl font-mono font-bold text-foreground">${cac.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">22% of CLV</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">LTV : CAC Ratio</div>
            <div className={`text-2xl font-mono font-bold ${Number(ratio) >= 3 ? "text-primary" : "text-chart-5"}`}>{ratio}:1</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">{Number(ratio) >= 3 ? "healthy" : "needs work"}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-mono text-muted-foreground mb-2 tracking-widest uppercase">Formula Applied</div>
          <code className="text-xs font-mono text-primary/80 leading-relaxed">
            CLV = AOV × Freq × Lifespan × Margin<br/>
            CLV = ${aov} × {freq} × {lifespan} × {margin}%<br/>
            <span className="text-primary font-semibold">CLV = ${clv.toLocaleString()}</span>
          </code>
        </div>
      </div>
    </div>
  );
}

// ─── Cohort Table ─────────────────────────────────────────────────────────────

function CohortTable() {
  const cols = ["M+1", "M+3", "M+6", "M+12", "M+24"];
  const vals = ["m1", "m3", "m6", "m12", "m24"] as const;

  const getColor = (v: number) => {
    if (v >= 90) return "#00C9A7";
    if (v >= 75) return "#3B82F6";
    if (v >= 60) return "#F59E0B";
    if (v >= 45) return "#EC4899";
    return "#EF4444";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-muted-foreground text-xs tracking-widest uppercase">Cohort</th>
            {cols.map((c) => (
              <th key={c} className="text-center py-3 px-4 text-muted-foreground text-xs tracking-widest uppercase">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohortData.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4 text-foreground font-semibold">{row.cohort}</td>
              {vals.map((v) => (
                <td key={v} className="py-3 px-4 text-center">
                  <span
                    className="inline-block px-3 py-1 rounded-md text-xs font-semibold"
                    style={{ backgroundColor: `${getColor(row[v])}18`, color: getColor(row[v]) }}
                  >
                    {row[v]}%
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Hero Counter ─────────────────────────────────────────────────────────────

function HeroCounter() {
  const [started, setStarted] = useState(false);
  const { ref, inView } = useInView(0.1);
  useEffect(() => { if (inView) setStarted(true); }, [inView]);
  const v1 = useCountUp(4200, 2500, started);
  const v2 = useCountUp(340, 2000, started);
  const v3 = useCountUp(68, 1800, started);

  return (
    <div ref={ref} className="grid grid-cols-3 gap-4 mt-12">
      {[
        { val: `$${v1.toLocaleString()}`, label: "Avg. SaaS CLV" },
        { val: `${v2}%`, label: "Retention lift" },
        { val: `${v3}x`, label: "ROI multiplier" },
      ].map((item) => (
        <div key={item.label} className="text-center border border-border/50 rounded-xl py-5 px-4 bg-card/50 backdrop-blur-sm">
          <div className="text-3xl md:text-4xl font-mono font-bold text-primary">{item.val}</div>
          <div className="text-xs font-mono text-muted-foreground mt-1 tracking-wide uppercase">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = ["Overview", "Calculator", "Benchmarks", "Cohorts", "Strategies"];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <TrendingUp size={14} className="text-primary-foreground" />
          </div>
          <span className="font-mono font-semibold text-foreground tracking-tight">CLV<span className="text-primary">·</span>Studio</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase">
              {l}
            </a>
          ))}
        </div>
        <button className="text-xs font-mono bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors tracking-wide">
          Get Started
        </button>
      </div>
    </nav>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00C9A7;
          cursor: pointer;
          border: 2px solid #080C18;
          box-shadow: 0 0 8px rgba(0,201,167,0.4);
        }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,201,167,0.2); border-radius: 4px; }
      `}</style>

      <Nav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="overview" className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, #00C9A7 0%, transparent 70%)" }} />
          <div className="absolute top-40 right-20 w-[400px] h-[400px] rounded-full opacity-5"
            style={{ background: "radial-gradient(ellipse, #7C3AED 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(0,201,167,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary tracking-widest uppercase">Customer Lifetime Value Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-mono font-bold text-foreground leading-tight mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Know What Each<br />
            <span className="text-primary">Customer</span> Is<br />
            Worth
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Customer Lifetime Value is the single most important metric for sustainable growth. Understand it, calculate it, and build strategy around it.
          </p>

          <div className="flex items-center justify-center gap-4">
            <a href="#calculator" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-mono font-semibold text-sm hover:bg-primary/90 transition-colors">
              <Calculator size={16} />
              Open Calculator
            </a>
            <a href="#overview-detail" className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg font-mono text-sm hover:border-primary/40 transition-colors">
              Learn CLV
              <ArrowRight size={14} />
            </a>
          </div>

          <HeroCounter />
        </div>

        <div className="flex justify-center mt-16">
          <ChevronDown size={20} className="text-muted-foreground animate-bounce" />
        </div>
      </section>

      {/* ── What is CLV ──────────────────────────────────────────────────── */}
      <section id="overview-detail" className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionTag n="01" label="Definition" />
              <h2 className="text-4xl font-mono font-bold text-foreground mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                What is Customer<br />Lifetime Value?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                CLV (also LTV) is the total revenue a business can expect from a single customer account throughout their entire relationship. It's a forward-looking metric that guides acquisition spend, retention investment, and pricing strategy.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                High-growth companies obsess over CLV because it determines how much they can profitably spend to acquire a new customer — the foundation of all unit economics.
              </p>
              <div className="space-y-3">
                {[
                  "Justifies customer acquisition cost (CAC)",
                  "Guides retention and loyalty investment",
                  "Identifies high-value customer segments",
                  "Informs pricing and upsell strategy",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground font-mono">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">Simple Formula</div>
                <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
                  <div className="text-primary">CLV</div>
                  <div className="text-muted-foreground mt-1">= Avg. Order Value</div>
                  <div className="text-muted-foreground">× Purchase Frequency</div>
                  <div className="text-muted-foreground">× Customer Lifespan</div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">Predictive Formula</div>
                <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
                  <div className="text-primary">CLV</div>
                  <div className="text-muted-foreground mt-1">= (Avg Revenue / Customer)</div>
                  <div className="text-muted-foreground">× Gross Margin %</div>
                  <div className="text-muted-foreground">÷ Churn Rate</div>
                </div>
              </div>
              <div className="bg-card border border-primary/20 rounded-xl p-6">
                <div className="text-xs font-mono text-primary tracking-widest uppercase mb-3">The Golden Ratio</div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-mono font-bold text-foreground">3:1</div>
                  <div className="text-sm text-muted-foreground">
                    LTV to CAC ratio is the benchmark. Below 1:1 is unsustainable; above 5:1 means you&apos;re underinvesting.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Metrics ──────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Avg. Order Value" value="$147" delta="+12%" icon={ShoppingCart} color="#00C9A7" />
            <StatCard label="Purchase Frequency" value="4.2×" delta="+8%" icon={RefreshCw} color="#7C3AED" />
            <StatCard label="Customer Lifespan" value="3.4 yr" delta="+0.6yr" icon={Users} color="#3B82F6" />
            <StatCard label="Churn Rate" value="2.1%" delta="−0.4%" icon={TrendingUp} color="#F59E0B" />
          </div>
        </div>
      </section>

      {/* ── CLV Growth Chart ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <SectionTag n="02" label="Performance" />
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <h2 className="text-3xl font-mono font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              CLV Growth Over Time
            </h2>
            <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-primary rounded" /> Your CLV</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-accent rounded" /> Industry Avg</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <SvgAreaChart data={clvGrowthData} />
          </div>
        </div>
      </section>

      {/* ── Calculator ───────────────────────────────────────────────────── */}
      <section id="calculator" className="py-24 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <SectionTag n="03" label="Calculator" />
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <h2 className="text-3xl font-mono font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              CLV Calculator
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Adjust the sliders to model your business&apos;s Customer Lifetime Value in real time.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-8">
            <Calculator_ />
          </div>
        </div>
      </section>

      {/* ── Industry Benchmarks ──────────────────────────────────────────── */}
      <section id="benchmarks" className="py-24 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <SectionTag n="04" label="Benchmarks" />
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <h2 className="text-3xl font-mono font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Industry CLV Benchmarks
            </h2>
            <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-primary/70" /> CLV</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-accent/70" /> CAC</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <SvgBarChart data={industryData} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Finance", clv: "$6,800", ratio: "5.7:1", status: "Excellent" },
              { label: "SaaS", clv: "$4,200", ratio: "5.1:1", status: "Excellent" },
              { label: "Health", clv: "$3,100", ratio: "5.5:1", status: "Excellent" },
              { label: "E-comm", clv: "$890", ratio: "7.4:1", status: "Good" },
            ].map((item) => (
              <div key={item.label} className="bg-muted/20 border border-border rounded-xl p-4">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">{item.label}</div>
                <div className="text-xl font-mono font-bold text-foreground">{item.clv}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono text-muted-foreground">{item.ratio} LTV:CAC</span>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cohort Retention ─────────────────────────────────────────────── */}
      <section id="cohorts" className="py-24 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <SectionTag n="05" label="Cohort Analysis" />
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <h2 className="text-3xl font-mono font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Cohort Retention Rates
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">% of customers still active at each time milestone</p>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <CohortTable />
          </div>
          <div className="flex items-center gap-6 mt-4 text-xs font-mono">
            {[
              { color: "#00C9A7", label: "90–100%" },
              { color: "#3B82F6", label: "75–89%" },
              { color: "#F59E0B", label: "60–74%" },
              { color: "#EC4899", label: "45–59%" },
              { color: "#EF4444", label: "<45%" },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Strategies ───────────────────────────────────────────────────── */}
      <section id="strategies" className="py-24 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <SectionTag n="06" label="Optimization" />
          <h2 className="text-3xl font-mono font-bold text-foreground mb-12" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            How to Increase Your CLV
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                color: "#00C9A7",
                title: "Reduce Churn",
                impact: "+35% CLV potential",
                tactics: [
                  "Proactive health scoring & early intervention",
                  "Onboarding optimization for time-to-value",
                  "Win-back campaigns at churn signals",
                  "Loyalty programs with real incentives",
                ],
              },
              {
                icon: TrendingUp,
                color: "#7C3AED",
                title: "Increase Purchase Value",
                impact: "+28% CLV potential",
                tactics: [
                  "Upsell and cross-sell at key lifecycle points",
                  "Bundle products for higher AOV",
                  "Premium tier development",
                  "Usage-based pricing alignment",
                ],
              },
              {
                icon: Zap,
                color: "#F59E0B",
                title: "Boost Frequency",
                impact: "+22% CLV potential",
                tactics: [
                  "Subscription model conversion",
                  "Re-engagement email sequences",
                  "Usage reminders and habit loops",
                  "Seasonal and triggered campaigns",
                ],
              },
            ].map((strategy) => (
              <div key={strategy.title} className="bg-card border border-border rounded-xl p-6 hover:border-primary/20 transition-colors group">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${strategy.color}15` }}>
                    <strategy.icon size={22} style={{ color: strategy.color }} />
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">{strategy.impact}</span>
                </div>
                <h3 className="text-lg font-mono font-bold text-foreground mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{strategy.title}</h3>
                <ul className="space-y-2.5">
                  {strategy.tactics.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: strategy.color }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card border border-primary/20 rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-10 rounded-full"
                style={{ background: "radial-gradient(ellipse, #00C9A7 0%, transparent 70%)" }} />
            </div>
            <div className="relative">
              <div className="text-xs font-mono text-primary tracking-widest uppercase mb-4">Start Measuring What Matters</div>
              <h2 className="text-4xl font-mono font-bold text-foreground mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                CLV is the north star<br />of sustainable growth
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Companies that track and optimize CLV grow 2.5× faster than those that don&apos;t. Start your CLV analysis today.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a href="#calculator" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-mono font-semibold hover:bg-primary/90 transition-colors">
                  <Calculator size={16} />
                  Calculate Your CLV
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <TrendingUp size={12} className="text-primary-foreground" />
            </div>
            <span className="font-mono text-sm text-foreground">CLV<span className="text-primary">·</span>Studio</span>
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            Customer Lifetime Value Intelligence — built for growth teams
          </p>
          <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Methodology</a>
            <a href="#" className="hover:text-primary transition-colors">Resources</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
