import React, { useState, useEffect, useRef } from 'react';
import overviewData from './data/overview.json';
import overviewDataFa from './data/overview.fa.json';
import globalData from './data/global.json';
import usData from './data/us.json';
import americasData from './data/americas.json';
import europeData from './data/europe.json';
import africaData from './data/africa.json';
import asiaData from './data/asia.json';
import methodologyData from './data/methodology.json';
import { overviewTranslations } from './overviewTranslations';
import logo from './assets/logo.jpg';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  PieChart,
  Pie
} from 'recharts';
import {
  LayoutDashboard,
  Globe,
  MapPin,
  Map,
  Euro,
  Sun,
  Compass,
  BookOpen,
  Menu,
  X,
  ArrowRight,
  Briefcase,
  ArrowLeft,
  Shield,
  ChevronUp,
  Sparkles,
  Activity,
  Landmark
} from 'lucide-react';

import { industriesData, subsectorsData } from './data/industriesList';
import { Chatbot } from './components/Chatbot';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { WelcomeLanding } from './components/WelcomeLanding';
import { OnboardingFlow, UserPreferences } from './components/OnboardingFlow';
import { PersonalizedDashboard } from './components/PersonalizedDashboard';

const formatSourceText = (text: string | null | undefined) => {
  if (!text) return text;
  return text.replace(/\s*\|\s*\d+\s*$/, '');
};

const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const CustomTooltip = ({ active, payload, label, hiddenKeys, is100Percent, dataKeys }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md" style={{ zIndex: 1000 }}>
        <p className="font-bold text-slate-800 mb-2">{typeof label === 'string' ? formatKey(label) : label}</p>
        {payload.map((entry: any, index: number) => {
          let value = entry.value;
          if (is100Percent && dataKeys) {
            const total = dataKeys.reduce((sum: number, key: string) => sum + (Number(data[key]) || 0), 0);
            const percent = total > 0 ? (Number(value) / total) * 100 : 0;
            value = `${percent.toFixed(1)}%`;
          }
          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {formatKey(entry.name)}: {value}
            </p>
          );
        })}
        {hiddenKeys && hiddenKeys.map((key: string) => {
          if (data[key] !== undefined) {
            return (
              <p key={key} className="text-sm font-semibold text-slate-700 mt-1 pt-1 border-t border-slate-100">
                {formatKey(key)}: {data[key]}
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  }
  return null;
};


const SectionHeader = ({ title, subtitle, category, copyright, isSticky = true }: { title: string, subtitle?: string, category?: string, copyright?: string, isSticky?: boolean }) => (
  <div className={`p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 mb-2 ${isSticky ? 'sticky top-0 z-10' : ''}`}>
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-1">{title}</h2>
        {subtitle && <p className="text-slate-500 font-medium">{subtitle}</p>}
        {copyright && <p className="text-xs text-slate-400 mt-1">{copyright}</p>}
      </div>
      {category && (
        <div className="hidden md:block">
          <div className="px-4 py-2 bg-[#C7B299]/10 text-[#183661] rounded-lg text-sm font-bold uppercase tracking-wider border border-[#C7B299]/20">
            {category}
          </div>
        </div>
      )}
    </div>
  </div>
);

const shouldSkipPage = (page: any) => {
  if (!page) return true;
  const headline = (page.page_headline || '').toLowerCase();
  const pageType = (page.page_type || '').toLowerCase();
  
  if (headline === 'contents' || headline === 'table of contents' || pageType === 'contents_page') {
    if (Array.isArray(page.table_of_contents) || (!page.table_of_contents && !page.charts?.length)) return true;
  }
  if (headline === 'cover page' || page.executive_summary?.title === 'Cover Page' || pageType === 'cover_page') {
    if (!page.charts?.length && (!page.verbatim_text || page.verbatim_text.length === 0)) return true;
  }
  if (headline === 'mega-round funding & deals by global region in q4’25') return true;
  return false;
};

// Placeholder Components
// ── Overview KPI data ────────────────────────────────────────────────────────
const OV_KPI_CARDS = [
  { label: 'Global VC 2025', value: '$512B', sub: 'Total investment', color: 'from-[#183661] to-[#2a5080]', icon: '🌍' },
  { label: 'YoY Growth', value: '+30.7%', sub: 'vs $391.9B in 2024', color: 'from-emerald-600 to-teal-400', icon: '📈' },
  { label: 'Q4\'25 Investment', value: '$138.1B', sub: '7,981 deals globally', color: 'from-violet-600 to-purple-400', icon: '💼' },
  { label: 'US Q4\'25', value: '$91.15B', sub: '3,378 deals', color: 'from-amber-500 to-orange-400', icon: '🇺🇸' },
  { label: 'AI Deals (US Q4)', value: '$32B+', sub: '8 companies combined', color: 'from-rose-600 to-pink-400', icon: '🤖' },
  { label: 'Record Round', value: '$40B', sub: 'OpenAI Q3\'25 — largest ever', color: 'from-sky-600 to-cyan-400', icon: '🏆' },
];

const OV_REGIONAL_DATA = [
  { region: 'Americas', investment: 95.1, deals: 3724, color: '#3b82f6' },
  { region: 'Europe', investment: 21.1, deals: 1652, color: '#8b5cf6' },
  { region: 'Asia', investment: 21.4, deals: 2474, color: '#f59e0b' },
];

const OV_AI_DEALS = [
  { company: 'OpenAI', amount: 40000, country: '🇺🇸', round: 'Q3\'25' },
  { company: 'Anthropic', amount: 15000, country: '🇺🇸', round: 'Q4\'25' },
  { company: 'Prometheus', amount: 6200, country: '🇺🇸', round: 'Q4\'25' },
  { company: 'Brevo', amount: 578, country: '🇫🇷', round: 'Q4\'25' },
  { company: 'Firmus Tech', amount: 541, country: '🇦🇺', round: 'Q4\'25' },
  { company: 'Black Forest', amount: 300, country: '🇩🇪', round: 'Q4\'25' },
];

const OV_YEAR_TREND = [
  { year: '2021', vc: 680 },
  { year: '2022', vc: 531 },
  { year: '2023', vc: 345 },
  { year: '2024', vc: 391.9 },
  { year: '2025', vc: 512 },
];

const OV_REGION_LABELS: Record<string, string> = {
  global: '🌍 Global', us: '🇺🇸 United States', americas: '🌎 Americas',
  europe: '🇪🇺 Europe', africa: '🌍 Africa', asia: '🌏 Asia',
};

const GaugeChart = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
  const pct = Math.min(value / max, 1);
  const angle = pct * 180;
  const r = 70; const cx = 90; const cy = 90;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startX = cx + r * Math.cos(toRad(180));
  const startY = cy + r * Math.sin(toRad(180));
  const endAngle = 180 + angle;
  const endX = cx + r * Math.cos(toRad(endAngle));
  const endY = cy + r * Math.sin(toRad(endAngle));
  const large = angle > 180 ? 1 : 0;
  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[180px]">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
      {pct > 0 && (
        <path d={`M ${startX} ${startY} A ${r} ${r} 0 ${large} 1 ${endX} ${endY}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">{Math.round(value)}B</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fill="#64748b">{label}</text>
    </svg>
  );
};

const OverviewTab = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'fa'>('en');
  
  const data = language === 'fa' ? overviewDataFa : overviewData;
  const t = overviewTranslations[language];
  const tocPage = data.pages.find((p: any) => p.table_of_contents);
  const regions = tocPage ? Object.entries(tocPage.table_of_contents) : [];
  const filteredRegions = activeRegion ? regions.filter(([k]) => k === activeRegion) : regions;
  
  // KPI Cards with translation
  const kpiCards = [
    { label: t.kpiCards.globalVC, value: '$512B', sub: t.kpiSubs.globalVC, color: 'from-[#183661] to-[#2a5080]', icon: '🌍' },
    { label: t.kpiCards.yoyGrowth, value: '+30.7%', sub: t.kpiSubs.yoyGrowth, color: 'from-emerald-600 to-teal-400', icon: '📈' },
    { label: t.kpiCards.q4Investment, value: '$138.1B', sub: t.kpiSubs.q4Investment, color: 'from-violet-600 to-purple-400', icon: '💼' },
    { label: t.kpiCards.usQ4, value: '$91.15B', sub: t.kpiSubs.usQ4, color: 'from-amber-500 to-orange-400', icon: '🇺🇸' },
    { label: t.kpiCards.aiDeals, value: '$32B+', sub: t.kpiSubs.aiDeals, color: 'from-rose-600 to-pink-400', icon: '🤖' },
    { label: t.kpiCards.recordRound, value: '$40B', sub: t.kpiSubs.recordRound, color: 'from-sky-600 to-cyan-400', icon: '🏆' },
  ];

  return (
    <div className="space-y-8" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            language === 'en' 
              ? 'bg-[#183661] text-white shadow-sm' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('fa')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            language === 'fa' 
              ? 'bg-[#183661] text-white shadow-sm' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}
        >
          فارسی
        </button>
      </div>

      <SectionHeader 
        title={t.sectionTitles.executiveOverview}
        subtitle={t.sectionTitles.venturePulse}
        category={t.sectionTitles.summary}
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg flex flex-col gap-1`}>
            <span className="text-2xl">{kpi.icon}</span>
            <div className="text-2xl font-extrabold leading-tight">{kpi.value}</div>
            <div className="text-xs font-semibold opacity-90" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{kpi.label}</div>
            <div className="text-xs opacity-75" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Year Trend + Gauge row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend line */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.sectionTitles.globalTrend}</h3>
          <p className="text-xs text-slate-500 mb-4" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.descriptions.globalTrend}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={OV_YEAR_TREND}>
              <defs>
                <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="B" />
              <Tooltip formatter={(v: any) => [`$${v}B`, t.dataLabels.investment]} />
              <Area type="monotone" dataKey="vc" stroke="#3b82f6" strokeWidth={3} fill="url(#ovGrad)">
                <LabelList dataKey="vc" position="top" formatter={(v: any) => `$${v}B`} style={{ fontSize: 10, fill: '#3b82f6', fontWeight: 700 }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gauges */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.sectionTitles.regionalShare}</h3>
          <p className="text-xs text-slate-500" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.descriptions.regionalShare}</p>
          <div className="flex flex-col gap-2">
            {OV_REGIONAL_DATA.map((r) => (
              <div key={r.region} className="flex items-center gap-3">
                <GaugeChart value={r.investment} max={138.1} label={r.region} color={r.color} />
                <div>
                  <div className="font-bold text-slate-800 text-sm">{r.region}</div>
                  <div className="text-xs text-slate-500" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{r.deals.toLocaleString()} {t.descriptions.deals}</div>
                  <div className="text-sm font-semibold" style={{ color: r.color }}>${r.investment}B</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Regional bar + AI deals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.sectionTitles.regionalInvestment}</h3>
          <p className="text-xs text-slate-500 mb-4" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.descriptions.regionalInvestment}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={OV_REGIONAL_DATA} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="B" />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} width={72} />
              <Tooltip formatter={(v: any) => [`$${v}B`, t.dataLabels.investment]} />
              <Bar dataKey="investment" radius={[0, 8, 8, 0]}>
                {OV_REGIONAL_DATA.map((entry) => (
                  <Cell key={entry.region} fill={entry.color} />
                ))}
                <LabelList dataKey="investment" position="right" formatter={(v: any) => `$${v}B`} style={{ fontSize: 11, fontWeight: 700, fill: '#1e293b' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top AI deals */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>🤖 {t.sectionTitles.topAIRounds}</h3>
          <p className="text-xs text-slate-500 mb-4" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.descriptions.topAI}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={OV_AI_DEALS} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `$${v/1000}B` : `$${v}M`} />
              <YAxis type="category" dataKey="company" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={90}
                tickFormatter={(v, i) => `${OV_AI_DEALS[i]?.country ?? ''} ${v}`} />
              <Tooltip formatter={(v: any) => [v >= 1000 ? `$${(v/1000).toFixed(1)}B` : `$${v}M`, t.dataLabels.raised]} />
              <Bar dataKey="amount" radius={[0, 8, 8, 0]} fill="#8b5cf6">
                {OV_AI_DEALS.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#f59e0b' : i === 1 ? '#3b82f6' : '#8b5cf6'} />
                ))}
                <LabelList dataKey="amount" position="right"
                  formatter={(v: any) => v >= 1000 ? `$${(v/1000).toFixed(1)}B` : `$${v}M`}
                  style={{ fontSize: 10, fontWeight: 700, fill: '#1e293b' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Regional Slicer + Highlights ── */}
      {tocPage && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mr-2" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.sectionTitles.regionalHighlights}</h3>
            <button
              onClick={() => setActiveRegion(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeRegion === null ? 'bg-[#183661] text-white border-[#183661]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#C7B299]/40'}`}
              style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}
            >{t.buttons.all}</button>
            {regions.map(([key]) => (
              <button
                key={key}
                onClick={() => setActiveRegion(activeRegion === key ? null : key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeRegion === key ? 'bg-[#183661] text-white border-[#183661]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#C7B299]/40'}`}
                style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}
              >{t.regions[key as keyof typeof t.regions] ?? key}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRegions.map(([region, regionData]: [string, any]) => (
              <div key={region} className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                  <span className="text-xl">{t.regions[region as keyof typeof t.regions]?.split(' ')[0] ?? '🌐'}</span>
                  <h4 className="font-bold text-slate-800 capitalize" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>
                    {region === 'us' ? (language === 'fa' ? 'ایالات متحده' : 'United States') : 
                     region === 'global' ? (language === 'fa' ? 'جهانی' : 'Global') :
                     region === 'americas' ? (language === 'fa' ? 'قاره آمریکا' : 'Americas') :
                     region === 'europe' ? (language === 'fa' ? 'اروپا' : 'Europe') :
                     region === 'africa' ? (language === 'fa' ? 'آفریقا' : 'Africa') :
                     region === 'asia' ? (language === 'fa' ? 'آسیا' : 'Asia') : region}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {regionData.highlights?.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1 w-4 h-4 rounded-full bg-[#C7B299]/20 text-[#183661] flex-shrink-0 flex items-center justify-center text-[10px] font-bold">{language === 'fa' ? `${i + 1}` : i + 1}</span>
                      <span style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Welcome text ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit' }}>{t.sectionTitles.welcomeMessage}</h3>
        <p className="text-slate-600 leading-relaxed text-base" style={{ fontFamily: language === 'fa' ? 'Tahoma, Arial' : 'inherit', textAlign: language === 'fa' ? 'justify' : 'left' }}>
          {data.pages.find((p: any) => p.page_headline === (language === 'fa' ? 'پیام خوش‌آمدگویی' : 'Welcome message'))?.executive_summary?.text}
        </p>
      </div>
    </div>
  );
};

const GlobalTab = () => {
  const renderTextContent = (content: any) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <p className="text-slate-700 leading-relaxed text-lg mb-4 whitespace-pre-line">{formatSourceText(content)}</p>;
    }
    
    if (typeof content === 'object') {
      if (content.title === 'Cover Page') return null;
      if (content.text) {
        return <p className="text-slate-700 leading-relaxed text-lg mb-4 whitespace-pre-line">{formatSourceText(content.text)}</p>;
      }
      
      return (
        <div className="space-y-4 mb-6">
          {Object.values(content).map((val: any, idx: number) => (
            <div key={idx}>{renderTextContent(val)}</div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  const renderChart = (chartData: any, hideTitle?: boolean) => {
    const { chart_title, suggested_chart_type, data, note, source } = chartData;
    if (!data || data.length === 0) return null;
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }


    let dataKeys = Object.keys(data[0]).filter(key => 
      key !== 'period' && 
      key !== 'year' &&
      !['rank', 'id', 'meta_display', 'location_display', 'meta', 'source', 'share_of_funded_percent', 'is_ytd'].includes(key)
    );


    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);


    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });

    const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);
    const isBar = type.includes('bar') && !isComposed;
    const isLine = type.includes('line') && !isComposed;
    const isArea = type.includes('area') && !isComposed;
    const isStacked = type.includes('stacked');
    const is100Percent = type.includes('100%') || type.includes('100_percent');

    const isPie = type.includes('pie') || type.includes('donut');
    const isFunnel = type.includes('funnel');

    const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#000080', '#3cb371', '#ffa500', '#6a5acd', '#ff1493'];

    let ChartComponent: any;
    let children: any[] = [];
    let stackOffset: "expand" | "none" = is100Percent ? "expand" : "none";

    if (isFunnel) {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Funnel
                  data={data}
                  dataKey={dataKeys[0]}
                  nameKey={xAxisKey}
                  fill="#3b82f6"
                >
                  <LabelList position="right" fill="#64748b" stroke="none" dataKey={xAxisKey} />
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          {(source || note) && (
            <div className="mt-6 text-sm text-slate-500 space-y-1">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isPie) {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={type.includes('donut') ? 60 : 0}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey={dataKeys[0]}
                  nameKey={xAxisKey}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {(source || note) && (
            <div className="mt-6 text-sm text-slate-500 space-y-1">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isComposed) {
      ChartComponent = ComposedChart;
      const hasLeftAndRight = hasCount && hasValue;
      children = dataKeys.map((key, index) => {
        const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key.toLowerCase().includes('rounds') || key === 'number_of_deals';
        const yAxisId = hasLeftAndRight ? (isCount ? "right" : "left") : "left";
        if (isCount) {
          return <Line key={key} name={formatKey(key)} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        } else {
          return <Bar key={key} name={formatKey(key)} yAxisId={yAxisId} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />;
        }
      });
    } else if (isBar) {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} name={formatKey(key)} dataKey={key} fill={COLORS[index % COLORS.length]} stackId={isStacked || is100Percent ? "a" : undefined} radius={isStacked || is100Percent ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
      ));
    } else if (isLine) {
      ChartComponent = LineChart;
      children = dataKeys.map((key, index) => (
        <Line key={key} name={formatKey(key)} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ));
    } else if (isArea) {
      ChartComponent = AreaChart;
      children = dataKeys.map((key, index) => (
        <Area key={key} name={formatKey(key)} type="monotone" dataKey={key} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} stackId={isStacked ? "a" : undefined} />
      ));
    } else {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} name={formatKey(key)} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
      ));
    }

    return (
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} stackOffset={stackOffset} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} tickFormatter={(val) => typeof val === 'string' ? formatKey(val) : val} />
              {isComposed && hasCount && hasValue ? (
                <>
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                </>
              ) : (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={is100Percent ? (tick: any) => `${Math.round(tick * 100)}%` : undefined} />
              )}
              <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        {(source || note) && (
          <div className="mt-6 text-sm text-slate-500 space-y-1">
            {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
            {note && <p className="italic">{note}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {globalData.pages.filter((p: any) => !shouldSkipPage(p)).map((page: any, index: number) => (
        <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          {page.page_headline && (
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{page.page_headline}</h2>
          )}
          
          {page.key_insight && (
            <div className="mb-8 p-8 bg-slate-50 rounded-xl border-l-4 border-[#183661] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-16 bg-[#C7B299]/20 rounded-br-full opacity-50 -z-10"></div>
              <svg className="w-8 h-8 text-[#C7B299] mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl text-slate-700 italic leading-relaxed mb-4 relative z-10 whitespace-pre-line">
                "{typeof page.key_insight === 'string' ? formatSourceText(page.key_insight) : formatSourceText(page.key_insight.quote)}"
              </p>
              {page.key_insight.quote_author && (
                <div className="flex items-center">
                  <div className="w-8 h-[2px] bg-[#183661] mr-3"></div>
                  <p className="font-semibold text-slate-900">{formatSourceText(page.key_insight.quote_author)}</p>
                </div>
              )}
            </div>
          )}

          {page.executive_summary && (
            <div className="mb-8">
              {renderTextContent(page.executive_summary)}
            </div>
          )}

          {page.charts && (
            <div className="space-y-8">
              {Object.values(page.charts).map((chart: any, idx) => (
                <div key={idx}>
                  {renderChart(chart, chart.chart_title === page.page_headline)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const USTab = () => {
  const renderTextContent = (content: any) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <p className="text-slate-700 leading-relaxed text-lg mb-4 whitespace-pre-line">{formatSourceText(content)}</p>;
    }
    
    if (typeof content === 'object') {
      if (content.title === 'Cover Page') return null;
      if (content.text) {
        return <p className="text-slate-700 leading-relaxed text-lg mb-4 whitespace-pre-line">{formatSourceText(content.text)}</p>;
      }
      
      return (
        <div className="space-y-4 mb-6">
          {Object.values(content).map((val: any, idx: number) => (
            <div key={idx}>{renderTextContent(val)}</div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  const renderChart = (chartData: any, hideTitle?: boolean) => {
    const { chart_title, suggested_chart_type, data, note, source } = chartData;
    if (!data || data.length === 0) return null;
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }


    let dataKeys = Object.keys(data[0]).filter(key => key !== 'period' && key !== 'year');

    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);


    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });

    const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);
    const isBar = type.includes('bar') && !isComposed;
    const isLine = type.includes('line') && !isComposed;
    const isArea = type.includes('area') && !isComposed;
    const isStacked = type.includes('stacked');
    const is100Percent = type.includes('100%') || type.includes('100_percent');

    const isPie = type.includes('pie') || type.includes('donut');
    const isFunnel = type.includes('funnel');

    const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#000080', '#3cb371', '#ffa500', '#6a5acd', '#ff1493'];

    let ChartComponent: any;
    let children: any[] = [];
    let stackOffset: "expand" | "none" = is100Percent ? "expand" : "none";

    if (isFunnel) {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Funnel
                  data={data}
                  dataKey={dataKeys[0]}
                  nameKey={xAxisKey}
                  fill="#3b82f6"
                >
                  <LabelList position="right" fill="#64748b" stroke="none" dataKey={xAxisKey} />
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          {(source || note) && (
            <div className="mt-4 text-sm text-slate-500">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isPie) {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={type.includes('donut') ? 60 : 0}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey={dataKeys[0]}
                  nameKey={xAxisKey}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {(source || note) && (
            <div className="mt-4 text-sm text-slate-500">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    if (is100Percent) {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} name={formatKey(key)} dataKey={key} fill={COLORS[index % COLORS.length]} stackId="a" />
      ));
    } else if (isComposed) {
      ChartComponent = ComposedChart;
      const hasLeftAndRight = hasCount && hasValue;
      children = dataKeys.map((key, index) => {
        const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key.toLowerCase().includes('rounds') || key === 'number_of_deals';
        const yAxisId = hasLeftAndRight ? (isCount ? "right" : "left") : "left";
        if (isCount) {
          return <Line key={key} name={formatKey(key)} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        } else {
          return <Bar key={key} name={formatKey(key)} yAxisId={yAxisId} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />;
        }
      });
    } else if (isBar) {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} name={formatKey(key)} dataKey={key} fill={COLORS[index % COLORS.length]} stackId={isStacked ? "a" : undefined} radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
      ));
    } else if (isLine) {
      ChartComponent = LineChart;
      children = dataKeys.map((key, index) => (
        <Line key={key} name={formatKey(key)} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ));
    } else {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} name={formatKey(key)} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
      ));
    }

    return (
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} stackOffset={stackOffset} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} tickFormatter={(val) => typeof val === 'string' ? formatKey(val) : val} />
              {is100Percent ? (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={(tick) => `${Math.round(tick * 100)}%`} />
              ) : isComposed && hasCount && hasValue ? (
                <>
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                </>
              ) : (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
              )}
              <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        {(source || note) && (
          <div className="mt-4 text-sm text-slate-500">
            {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
            {note && <p className="italic">{note}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {usData.pages.filter((p: any) => !shouldSkipPage(p)).map((page: any, index) => (
        <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          {page.page_headline && (
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{page.page_headline}</h2>
          )}
          
          {page.key_insight && (
            <div className="mb-8 p-8 bg-slate-50 rounded-xl border-l-4 border-[#183661] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-16 bg-[#C7B299]/20 rounded-br-full opacity-50 -z-10"></div>
              <svg className="w-8 h-8 text-[#C7B299] mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl text-slate-700 italic leading-relaxed mb-4 relative z-10 whitespace-pre-line">
                "{typeof page.key_insight === 'string' ? page.key_insight : page.key_insight.quote}"
              </p>
              {page.key_insight.quote_author && (
                <div className="flex items-center">
                  <div className="w-8 h-[2px] bg-[#183661] mr-3"></div>
                  <p className="font-semibold text-slate-900">{page.key_insight.quote_author}</p>
                </div>
              )}
            </div>
          )}

          {page.executive_summary && (
            <div className="mb-8">
              {renderTextContent(page.executive_summary)}
            </div>
          )}

          {page.charts && (
            <div className="space-y-8">
              {Object.values(page.charts).map((chart: any, idx) => (
                <div key={idx}>
                  {renderChart(chart, chart.chart_title === page.page_headline)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AmericasTab = () => {
  const renderTextContent = (content: any) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <p className="text-slate-700 leading-relaxed text-lg mb-4">{formatSourceText(content)}</p>;
    }
    
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4 mb-6">
          {content.map((item, idx) => (
            <div key={idx}>{renderTextContent(item)}</div>
          ))}
        </div>
      );
    }
    
    if (typeof content === 'object') {
      if (content.title === 'Cover Page') return null;
      // If it has a 'sections' array
      if (content.sections && Array.isArray(content.sections)) {
        return (
          <div className="space-y-6 mb-6">
            {content.title && !['title', 'content', 'text', 'subtitle', 'description'].includes(content.title.toLowerCase()) && (
              <h3 className="text-xl font-semibold text-slate-800 mb-4">{content.title}</h3>
            )}
            {content.sections.map((section: any, idx: number) => (
              <div key={idx} className="space-y-2">
                {section.subtitle && !['title', 'content', 'text', 'subtitle', 'description'].includes(section.subtitle.toLowerCase()) && (
                  <h4 className="text-lg font-bold text-slate-800">{section.subtitle}</h4>
                )}
                {section.content && <p className="text-slate-700 leading-relaxed text-lg">{section.content}</p>}
              </div>
            ))}
          </div>
        );
      }
      
      // Otherwise map through values
      return (
        <div className="space-y-4 mb-6">
          {Object.values(content).map((val: any, idx: number) => (
            <div key={idx}>{renderTextContent(val)}</div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  const renderChart = (chartData: any, hideTitle?: boolean) => {
    // BankingTab Chart
    const { chart_title, suggested_chart_type, data, note, source } = chartData;
    if (!data || data.length === 0) return null;
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }


    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);

    // Check if it should be a table
    if (type.includes('table') || data[0].hasOwnProperty('rank') || data[0].hasOwnProperty('company_name')) {
      const headers = Object.keys(data[0]);
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {headers.map((header) => (
                  <th key={header} className="p-3 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    {header.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {headers.map((header) => (
                    <td key={header} className="p-3 text-sm text-slate-700">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {(source || note) && (
            <div className="mt-4 text-sm text-slate-500">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    let dataKeys = Object.keys(data[0]).filter(key => key !== 'period' && key !== 'year');


    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });

    const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);
    const isBar = type.includes('bar') && !isComposed;
    const isLine = type.includes('line') && !isComposed;
    const isArea = type.includes('area') && !isComposed;
    const isStacked = type.includes('stacked');
    const is100Percent = type.includes('100%') || type.includes('100_percent');

    const isPie = type.includes('pie') || type.includes('donut');
    const isFunnel = type.includes('funnel');

    const colors = ['#1e40af', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    let ChartComponent: any;
    let children: any[] = [];
    let stackOffset: "expand" | "none" = is100Percent ? "expand" : "none";

    if (isFunnel) {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Funnel
                  data={data}
                  dataKey={dataKeys[0]}
                  nameKey={xAxisKey}
                  fill="#3b82f6"
                >
                  <LabelList position="right" fill="#64748b" stroke="none" dataKey={xAxisKey} />
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          {(source || note) && (
            <div className="mt-4 text-sm text-slate-500">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isPie) {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={type.includes('donut') ? 60 : 0}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey={dataKeys[0]}
                  nameKey={xAxisKey}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {(source || note) && (
            <div className="mt-4 text-sm text-slate-500">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isComposed) {
      ChartComponent = ComposedChart;
      const hasLeftAndRight = hasCount && hasValue;
      children = dataKeys.map((key, index) => {
        const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key.toLowerCase().includes('rounds') || key === 'number_of_deals';
        const yAxisId = hasLeftAndRight ? (isCount ? "right" : "left") : "left";
        if (isCount) {
          return <Line key={key} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        } else {
          return <Bar key={key} yAxisId={yAxisId} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />;
        }
      });
    } else if (isBar) {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} stackId={isStacked || is100Percent ? "a" : undefined} radius={isStacked || is100Percent ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
      ));
    } else if (isLine) {
      ChartComponent = LineChart;
      children = dataKeys.map((key, index) => (
        <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ));
    } else if (isArea) {
      ChartComponent = AreaChart;
      children = dataKeys.map((key, index) => (
        <Area key={key} type="monotone" dataKey={key} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} stackId={isStacked ? "a" : undefined} />
      ));
    } else {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />
      ));
    }

    return (
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
              {isComposed && hasCount && hasValue ? (
                <>
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                </>
              ) : (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
              )}
              <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        {(source || note) && (
          <div className="mt-4 text-sm text-slate-500">
            {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
            {note && <p className="italic">{note}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {americasData.report_info && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{americasData.report_info.title}</h1>
          <p className="text-slate-300 uppercase tracking-widest text-sm font-semibold">{americasData.report_info.region} Region</p>
        </div>
      )}
      
      {americasData.pages.filter((p: any) => !shouldSkipPage(p)).map((page: any, index) => (
        <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          {page.page_headline && (
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{page.page_headline}</h2>
          )}
          
          {page.executive_summary && (
            <div className="mb-8">
              {renderTextContent(page.executive_summary)}
            </div>
          )}

          {page.key_insight && (
            <div className="mb-8 p-6 bg-[#C7B299]/10 rounded-xl border border-[#C7B299]/20">
              <h4 className="text-sm font-bold text-[#183661] uppercase tracking-wider mb-2">Key Insight</h4>
              {renderTextContent(page.key_insight)}
            </div>
          )}

          {page.charts && (
            <div className="space-y-8">
              {Object.values(page.charts).map((chart: any, idx) => (
                <div key={idx}>
                  {renderChart(chart, chart.chart_title === page.page_headline)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const EuropeTab = () => {
  const renderTextContent = (content: any) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <p className="text-slate-700 leading-relaxed text-lg mb-4">{formatSourceText(content)}</p>;
    }
    
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4 mb-6">
          {content.map((item, idx) => (
            <div key={idx}>{renderTextContent(item)}</div>
          ))}
        </div>
      );
    }
    
    if (typeof content === 'object') {
      if (content.title === 'Cover Page') return null;
      if (content.sections && Array.isArray(content.sections)) {
        return (
          <div className="space-y-6 mb-6">
            {content.title && !['title', 'content', 'text', 'subtitle', 'description'].includes(content.title.toLowerCase()) && (
              <h3 className="text-xl font-semibold text-slate-800 mb-4">{content.title}</h3>
            )}
            {content.sections.map((section: any, idx: number) => (
              <div key={idx} className="space-y-2">
                {section.subtitle && !['title', 'content', 'text', 'subtitle', 'description'].includes(section.subtitle.toLowerCase()) && (
                  <h4 className="text-lg font-bold text-slate-800">{section.subtitle}</h4>
                )}
                {section.content && <p className="text-slate-700 leading-relaxed text-lg">{section.content}</p>}
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div className="space-y-4 mb-6">
          {Object.values(content).map((val: any, idx: number) => (
            <div key={idx}>{renderTextContent(val)}</div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  const renderChart = (chartData: any, hideTitle?: boolean) => {
    const { chart_title, suggested_chart_type, data, note, source } = chartData;
    if (!data || data.length === 0) return null;
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }


    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);

    // Check if it should be a table
    if (type.includes('table') || data[0].hasOwnProperty('rank') || data[0].hasOwnProperty('company_name')) {
      const headers = Object.keys(data[0]);
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {headers.map((header) => (
                  <th key={header} className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    {header.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  {headers.map((header) => (
                    <td key={header} className="p-4 text-sm text-slate-700 whitespace-nowrap">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {(source || note) && (
            <div className="mt-6 text-sm text-slate-500 space-y-1">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    let dataKeys = Object.keys(data[0]).filter(key => key !== 'period' && key !== 'year');


    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });

    const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);
    const isBar = type.includes('bar') && !isComposed;
    const isLine = type.includes('line') && !isComposed;
    const isArea = type.includes('area') && !isComposed;
    const isStacked = type.includes('stacked');
    const is100Percent = type.includes('100%') || type.includes('100_percent');

    const isPie = type.includes('pie') || type.includes('donut');
    const isFunnel = type.includes('funnel');

    const colors = ['#1e40af', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    let ChartComponent: any;
    let children: any[] = [];
    let stackOffset: "expand" | "none" = is100Percent ? "expand" : "none";

    if (isFunnel) {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Funnel
                  data={data}
                  dataKey={dataKeys[0]}
                  nameKey={xAxisKey}
                  fill="#3b82f6"
                >
                  <LabelList position="right" fill="#64748b" stroke="none" dataKey={xAxisKey} />
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          {(source || note) && (
            <div className="mt-6 text-sm text-slate-500 space-y-1">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isPie) {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={type.includes('donut') ? 60 : 0}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey={dataKeys[0]}
                  nameKey={xAxisKey}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {(source || note) && (
            <div className="mt-6 text-sm text-slate-500 space-y-1">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    if (isComposed) {
      ChartComponent = ComposedChart;
      const hasLeftAndRight = hasCount && hasValue;
      children = dataKeys.map((key, index) => {
        const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key.toLowerCase().includes('rounds') || key === 'number_of_deals';
        const yAxisId = hasLeftAndRight ? (isCount ? "right" : "left") : "left";
        if (isCount) {
          return <Line key={key} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        } else {
          return <Bar key={key} yAxisId={yAxisId} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />;
        }
      });
    } else if (isBar) {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} stackId={isStacked || is100Percent ? "a" : undefined} radius={isStacked || is100Percent ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
      ));
    } else if (isLine) {
      ChartComponent = LineChart;
      children = dataKeys.map((key, index) => (
        <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ));
    } else if (isArea) {
      ChartComponent = AreaChart;
      children = dataKeys.map((key, index) => (
        <Area key={key} type="monotone" dataKey={key} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} stackId={isStacked ? "a" : undefined} />
      ));
    } else {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />
      ));
    }

    return (
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} stackOffset={stackOffset} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
              {isComposed ? (
                <>
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                </>
              ) : (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={is100Percent ? (tick: any) => `${Math.round(tick * 100)}%` : undefined} />
              )}
              <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        {(source || note) && (
          <div className="mt-6 text-sm text-slate-500 space-y-1">
            {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
            {note && <p className="italic">{note}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {europeData.report_info && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{europeData.report_info.title}</h1>
          <p className="text-slate-300 uppercase tracking-widest text-sm font-semibold">{europeData.report_info.region} Region</p>
        </div>
      )}
      
      {europeData.pages.filter((p: any) => !shouldSkipPage(p)).map((page: any, index) => (
        <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          {page.page_headline && (
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{page.page_headline}</h2>
          )}
          
          {page.executive_summary && (
            <div className="mb-8">
              {renderTextContent(page.executive_summary)}
            </div>
          )}

          {page.key_insight && (
            <div className="mb-8 p-6 bg-[#C7B299]/10 rounded-xl border border-[#C7B299]/20">
              <h4 className="text-sm font-bold text-[#183661] uppercase tracking-wider mb-2">Key Insight</h4>
              {renderTextContent(page.key_insight)}
            </div>
          )}

          {page.charts && (
            <div className="space-y-8">
              {Object.values(page.charts).map((chart: any, idx) => (
                <div key={idx}>
                  {renderChart(chart, chart.chart_title === page.page_headline)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AfricaTab = () => {
  const renderTextContent = (content: any) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <p className="text-slate-700 leading-relaxed text-lg mb-4">{formatSourceText(content)}</p>;
    }
    
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4 mb-6">
          {content.map((item, idx) => (
            <div key={idx}>{renderTextContent(item)}</div>
          ))}
        </div>
      );
    }
    
    if (typeof content === 'object') {
      if (content.title === 'Cover Page') return null;
      if (content.sections && Array.isArray(content.sections)) {
        return (
          <div className="space-y-6 mb-6">
            {content.title && !['title', 'content', 'text', 'subtitle', 'description'].includes(content.title.toLowerCase()) && (
              <h3 className="text-xl font-semibold text-slate-800 mb-4">{content.title}</h3>
            )}
            {content.sections.map((section: any, idx: number) => (
              <div key={idx} className="space-y-2">
                {section.subtitle && !['title', 'content', 'text', 'subtitle', 'description'].includes(section.subtitle.toLowerCase()) && (
                  <h4 className="text-lg font-bold text-slate-800">{section.subtitle}</h4>
                )}
                {section.content && <p className="text-slate-700 leading-relaxed text-lg">{section.content}</p>}
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div className="space-y-4 mb-6">
          {Object.values(content).map((val: any, idx: number) => (
            <div key={idx}>{renderTextContent(val)}</div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  const renderChart = (chartData: any, hideTitle?: boolean) => {
    const { chart_title, suggested_chart_type, data, note, source } = chartData;
    if (!data || data.length === 0) return null;
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }


    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);

    // Check if it should be a table
    if (type.includes('table') || data[0].hasOwnProperty('rank') || data[0].hasOwnProperty('company_name')) {
      const headers = Object.keys(data[0]);
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {headers.map((header) => (
                  <th key={header} className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    {header.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  {headers.map((header) => (
                    <td key={header} className="p-4 text-sm text-slate-700 whitespace-nowrap">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {(source || note) && (
            <div className="mt-6 text-sm text-slate-500 space-y-1">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    let dataKeys = Object.keys(data[0]).filter(key => key !== 'period' && key !== 'year');


    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });

    const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);
    const isBar = type.includes('bar') && !isComposed;
    const isLine = type.includes('line') && !isComposed;
    const isArea = type.includes('area') && !isComposed;
    const isStacked = type.includes('stacked');
    const is100Percent = type.includes('100%') || type.includes('100_percent');

    const colors = ['#1e40af', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    let ChartComponent: any;
    let children: any[] = [];
    let stackOffset: "expand" | "none" = is100Percent ? "expand" : "none";

    if (isComposed) {
      ChartComponent = ComposedChart;
      children = dataKeys.map((key, index) => {
        if (index === 0) {
          return <Bar key={key} yAxisId="left" dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />;
        } else {
          return <Line key={key} yAxisId="right" type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        }
      });
    } else if (isBar) {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} stackId={isStacked || is100Percent ? "a" : undefined} radius={isStacked || is100Percent ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
      ));
    } else if (isLine) {
      ChartComponent = LineChart;
      children = dataKeys.map((key, index) => (
        <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ));
    } else if (isArea) {
      ChartComponent = AreaChart;
      children = dataKeys.map((key, index) => (
        <Area key={key} type="monotone" dataKey={key} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} stackId={isStacked ? "a" : undefined} />
      ));
    } else {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />
      ));
    }

    return (
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} stackOffset={stackOffset} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
              {isComposed ? (
                <>
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                </>
              ) : (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={is100Percent ? (tick: any) => `${Math.round(tick * 100)}%` : undefined} />
              )}
              <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        {(source || note) && (
          <div className="mt-6 text-sm text-slate-500 space-y-1">
            {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
            {note && <p className="italic">{note}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {africaData.report_info && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{africaData.report_info.title}</h1>
          <p className="text-slate-300 uppercase tracking-widest text-sm font-semibold">{africaData.report_info.region} Region</p>
        </div>
      )}
      
      {africaData.pages.filter((p: any) => !shouldSkipPage(p)).map((page: any, index) => (
        <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          {page.page_headline && (
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{page.page_headline}</h2>
          )}
          
          {page.executive_summary && (
            <div className="mb-8">
              {renderTextContent(page.executive_summary)}
            </div>
          )}

          {page.key_insight && (
            <div className="mb-8 p-8 bg-slate-50 rounded-xl border-l-4 border-[#183661] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-16 bg-[#C7B299]/20 rounded-br-full opacity-50 -z-10"></div>
              <svg className="w-8 h-8 text-[#C7B299] mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl text-slate-700 italic leading-relaxed mb-4 relative z-10">
                "{page.key_insight.quote}"
              </p>
              {page.key_insight.quote_author && (
                <div className="flex items-center">
                  <div className="w-8 h-[2px] bg-[#183661] mr-3"></div>
                  <p className="font-semibold text-slate-900">{page.key_insight.quote_author}</p>
                </div>
              )}
            </div>
          )}

          {page.charts && (
            <div className="space-y-8">
              {Object.values(page.charts).map((chart: any, idx) => (
                <div key={idx}>
                  {renderChart(chart, chart.chart_title === page.page_headline)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AsiaTab = () => {
  const renderTextContent = (content: any) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <p className="text-slate-700 leading-relaxed text-lg mb-4">{formatSourceText(content)}</p>;
    }
    
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4 mb-6">
          {content.map((item, idx) => (
            <div key={idx}>{renderTextContent(item)}</div>
          ))}
        </div>
      );
    }
    
    if (typeof content === 'object') {
      if (content.title === 'Cover Page') return null;
      if (content.sections && Array.isArray(content.sections)) {
        return (
          <div className="space-y-6 mb-6">
            {content.title && !['title', 'content', 'text', 'subtitle', 'description'].includes(content.title.toLowerCase()) && (
              <h3 className="text-xl font-semibold text-slate-800 mb-4">{content.title}</h3>
            )}
            {content.sections.map((section: any, idx: number) => (
              <div key={idx} className="space-y-2">
                {section.subtitle && !['title', 'content', 'text', 'subtitle', 'description'].includes(section.subtitle.toLowerCase()) && (
                  <h4 className="text-lg font-bold text-slate-800">{section.subtitle}</h4>
                )}
                {section.content && <p className="text-slate-700 leading-relaxed text-lg">{section.content}</p>}
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div className="space-y-4 mb-6">
          {Object.values(content).map((val: any, idx: number) => (
            <div key={idx}>{renderTextContent(val)}</div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  const renderChart = (chartData: any, hideTitle?: boolean) => {
    // InsuranceTab Chart
    const { chart_title, suggested_chart_type, data, note, source } = chartData;
    if (!data || data.length === 0) return null;
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }


    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);

    // Check if it should be a table
    if (type.includes('table') || data[0].hasOwnProperty('rank') || data[0].hasOwnProperty('company_name')) {
      const headers = Object.keys(data[0]);
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
          <table className="min-w-full divide-y divide-gray-200 text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {headers.map((header) => (
                  <th key={header} className="p-4 text-sm font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    {header.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  {headers.map((header) => (
                    <td key={header} className="p-4 text-sm text-slate-700 whitespace-nowrap">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {(source || note) && (
            <div className="mt-6 text-sm text-slate-500 space-y-1">
              {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
              {note && <p className="italic">{note}</p>}
            </div>
          )}
        </div>
      );
    }

    let dataKeys = Object.keys(data[0]).filter(key => key !== 'period' && key !== 'year');


    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });

    const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);
    const isBar = type.includes('bar') && !isComposed;
    const isLine = type.includes('line') && !isComposed;
    const isArea = type.includes('area') && !isComposed;
    const isStacked = type.includes('stacked');
    const is100Percent = type.includes('100%') || type.includes('100_percent');

    const colors = ['#1e40af', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    let ChartComponent: any;
    let children: any[] = [];
    let stackOffset: "expand" | "none" = is100Percent ? "expand" : "none";

    if (isComposed) {
      ChartComponent = ComposedChart;
      children = dataKeys.map((key, index) => {
        if (index === 0) {
          return <Bar key={key} yAxisId="left" dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />;
        } else {
          return <Line key={key} yAxisId="right" type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        }
      });
    } else if (isBar) {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} stackId={isStacked || is100Percent ? "a" : undefined} radius={isStacked || is100Percent ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
      ));
    } else if (isLine) {
      ChartComponent = LineChart;
      children = dataKeys.map((key, index) => (
        <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ));
    } else if (isArea) {
      ChartComponent = AreaChart;
      children = dataKeys.map((key, index) => (
        <Area key={key} type="monotone" dataKey={key} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} stackId={isStacked ? "a" : undefined} />
      ));
    } else {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />
      ));
    }

    return (
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} stackOffset={stackOffset} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
              {isComposed ? (
                <>
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                </>
              ) : (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={is100Percent ? (tick: any) => `${Math.round(tick * 100)}%` : undefined} />
              )}
              <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        {(source || note) && (
          <div className="mt-6 text-sm text-slate-500 space-y-1">
            {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
            {note && <p className="italic">{note}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {asiaData.report_info && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{asiaData.report_info.title}</h1>
          <p className="text-slate-300 uppercase tracking-widest text-sm font-semibold">{asiaData.report_info.region} Region</p>
        </div>
      )}
      
      {asiaData.pages.filter((p: any) => !shouldSkipPage(p)).map((page: any, index) => (
        <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          {page.page_headline && (
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{page.page_headline}</h2>
          )}
          
          {page.executive_summary && (
            <div className="mb-8">
              {renderTextContent(page.executive_summary)}
            </div>
          )}

          {page.key_insight && (
            <div className="mb-8 p-8 bg-slate-50 rounded-xl border-l-4 border-[#183661] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-16 bg-[#C7B299]/20 rounded-br-full opacity-50 -z-10"></div>
              <svg className="w-8 h-8 text-[#C7B299] mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl text-slate-700 italic leading-relaxed mb-4 relative z-10">
                "{page.key_insight.quote}"
              </p>
              {page.key_insight.quote_author && (
                <div className="flex items-center">
                  <div className="w-8 h-[2px] bg-[#183661] mr-3"></div>
                  <p className="font-semibold text-slate-900">{page.key_insight.quote_author}</p>
                </div>
              )}
            </div>
          )}

          {page.charts && (
            <div className="space-y-8">
              {Object.values(page.charts).map((chart: any, idx) => (
                <div key={idx}>
                  {renderChart(chart, chart.chart_title === page.page_headline)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const MethodologyTab = () => {
  return (
    <div className="space-y-8">
      {methodologyData.report_info && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-4">{methodologyData.report_info.title}</h1>
          <div className="flex items-center space-x-4 text-slate-300 text-sm font-semibold uppercase tracking-widest">
            <span>{methodologyData.report_info.region} Region</span>
            {methodologyData.report_info.source_document && (
              <>
                <span className="text-slate-500">•</span>
                <span>{methodologyData.report_info.source_document}</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {methodologyData.pages.map((page: any, index: number) => (
        <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          {page.page_headline && (
            <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
              {page.page_headline}
            </h2>
          )}
          
          {page.executive_summary && (
            <div className="max-w-none">
              {page.executive_summary.title && 
               page.executive_summary.title !== page.page_headline && 
               !['title', 'content', 'text', 'subtitle', 'description'].includes(page.executive_summary.title.toLowerCase()) && (
                <h3 className="text-xl font-semibold text-slate-800 mb-6">{page.executive_summary.title}</h3>
              )}
              
              {page.executive_summary.sections && Array.isArray(page.executive_summary.sections) && (
                <div className="space-y-6">
                  {page.executive_summary.sections.map((section: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      {section.subtitle && !['title', 'content', 'text', 'subtitle', 'description'].includes(section.subtitle.toLowerCase()) && (
                        <h4 className="text-lg font-semibold text-slate-800 mt-6 mb-2">{section.subtitle}</h4>
                      )}
                      {section.content && (
                        <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                          {section.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};



const IndustriesTab = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Industries</h1>
        <p className="text-slate-300 text-sm font-medium">Explore our expertise across various sectors</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {industriesData.map((industry, index) => {
          const Icon = industry.icon;
          const isFinancialServices = industry.title.includes("Financial Services");
          
          return (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8 group">
              <div className="w-16 h-16 bg-[#C7B299]/10 text-[#183661] rounded-xl flex items-center justify-center group-hover:bg-[#183661] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                <Icon size={32} />
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{industry.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{industry.description}</p>
              </div>
              <button 
                onClick={() => {
                  if (isFinancialServices) {
                    setActiveTab('financial-services');
                  }
                }}
                className={`inline-flex items-center group/link font-semibold text-lg whitespace-nowrap ${
                  isFinancialServices 
                    ? 'text-[#183661] hover:text-[#183661] cursor-pointer' 
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                {industry.linkText}
                <ArrowRight size={20} className="ml-2 transform group-hover/link:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import fintechData from './data/industries/Financial Services/Fintech-KPMG-Half-Yearly.json';
import insurtechData from './data/industries/Financial Services/CB-Insights_Insurtech-Report-2025.json';
import bankingData from './data/industries/Financial Services/Banks_Tracxn_Feed_Report.json';

// Portfolio data imports
import villageCapitalPortfolio from './data/portfolios/village-capital.json';
import accelerateOkanaganPortfolio from './data/portfolios/accelerate-okanagan.json';
import aimforthemoonPortfolio from './data/portfolios/aimforthemoon.json';
import gxpartnersPortfolio from './data/portfolios/gxpartners.json';
import legendStarPortfolio from './data/portfolios/legend-star.json';
import masschallengePortfolio from './data/portfolios/masschallenge.json';
import nuvolabPortfolio from './data/portfolios/nuvolab.json';
import oppPortfolio from './data/portfolios/opp.json';
import techalliancePortfolio from './data/portfolios/techalliance.json';
import techstarsPortfolio from './data/portfolios/techstars.json';

const portfolioDataMap: Record<string, any> = {
  'Village Capital': villageCapitalPortfolio,
  'Accelerate Okanagan': accelerateOkanaganPortfolio,
  'Aimforthemoon': aimforthemoonPortfolio,
  'GxPartners': gxpartnersPortfolio,
  'Legend Star': legendStarPortfolio,
  'MassChallenge': masschallengePortfolio,
  'Nuvolab': nuvolabPortfolio,
  'ØPP': oppPortfolio,
  'TechAlliance': techalliancePortfolio,
  'Techstars': techstarsPortfolio,
};

const PortfolioTab = ({ investorName, onBack }: { investorName: string, onBack: () => void }) => {
  const data = portfolioDataMap[investorName];
  if (!data) return <div className="p-8 text-slate-500">Portfolio data not found for {investorName}</div>;
  return (
    <PortfolioDashboard
      investorName={investorName}
      portfolioData={data}
      onBack={onBack}
    />
  );
};

const FintechDynamicTab = ({ pages, subTabName, reportName, onInvestorClick }: { pages: any[], subTabName?: string, reportName?: string, onInvestorClick?: (name: string) => void }) => {
  const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#000080', '#3cb371', '#ffa500', '#6a5acd', '#ff1493'];

  const renderTextContent = (content: any) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <p className="text-slate-700 leading-relaxed text-lg mb-4 whitespace-pre-line">{formatSourceText(content)}</p>;
    }
    
    if (typeof content === 'object') {
      if (content.title === 'Cover Page') return null;
      return Object.entries(content).map(([key, val], idx) => {
        if (key === 'quote' && val && typeof val === 'object') {
           const quoteData = val as any;
           return (
             <blockquote key={idx} className="border-l-4 border-[#183661] pl-6 my-8 bg-[#C7B299]/10/50 p-6 rounded-r-xl italic text-slate-700">
               <p className="text-xl mb-4">"{formatSourceText(quoteData.text)}"</p>
               <footer className="text-sm font-medium text-slate-500 not-italic">
                 — {formatSourceText(quoteData.author)}, {formatSourceText(quoteData.title)}
               </footer>
             </blockquote>
           );
        }
        
        if (Array.isArray(val)) {
           return (
             <div key={idx} className="mb-6">
                {!['title', 'content', 'text', 'subtitle', 'description'].includes(key.toLowerCase()) && (
                  <h4 className="font-semibold text-slate-800 mb-3 capitalize text-lg">{key.replace(/_/g, ' ')}</h4>
                )}
                <ul className="space-y-3">
                  {val.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-[#183661] mr-3 mt-1.5 text-lg leading-none">&bull;</span>
                      <span className="text-slate-600 leading-relaxed">{formatSourceText(item)}</span>
                    </li>
                  ))}
                </ul>
             </div>
           );
        }

        if (typeof val === 'string') {
          return (
            <div key={idx} className="mb-6">
              {!['title', 'content', 'text', 'subtitle', 'description'].includes(key.toLowerCase()) && (
                <h4 className="font-semibold text-slate-800 mb-2 capitalize text-lg">{key.replace(/_/g, ' ')}</h4>
              )}
              <p className="text-slate-600 leading-relaxed">{formatSourceText(val)}</p>
            </div>
          );
        }
        return null;
      });
    }
    return null;
  };

  const renderChart = (chartData: any, index: number, hideTitle?: boolean) => {
    if (!chartData || !chartData.data) return null;

    const isKpiCards = 
      chartData.suggested_chart_type === 'kpi_cards' || 
      chartData.chart_type === 'kpi_cards' ||
      chartData.suggested_chart_type === 'stat_cards' ||
      chartData.chart_type === 'stat_cards';

    if (isKpiCards && Array.isArray(chartData.data)) {
      return (
        <div key={index} className="mb-12">
          {!hideTitle && <h3 className="text-xl font-bold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chartData.data.map((kpi: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</h4>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-slate-900">{kpi.value}</span>
                  {kpi.value_unit && <span className="ml-1 text-sm text-slate-500">{formatKey(kpi.value_unit)}</span>}
                </div>
                {(kpi.change_value !== undefined && kpi.change_value !== null) && (
                  <div className={`text-sm font-medium mb-4 ${kpi.change_value > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {kpi.change_value > 0 ? '↑' : '↓'} {Math.abs(kpi.change_value)} {kpi.change_unit && formatKey(kpi.change_unit)}
                  </div>
                )}
                {kpi.description && <p className="text-slate-600 text-sm leading-relaxed flex-grow">{kpi.description}</p>}
                {kpi.additional_description && <p className="text-slate-500 text-xs mt-4 pt-4 border-t border-slate-100">{kpi.additional_description}</p>}
              </div>
            ))}
          </div>
          
        {chartData.notes && chartData.notes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.notes.map((note: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(note)}</p>
            ))}
          </div>
        )}
        {chartData.footnotes && chartData.footnotes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.footnotes.map((footnote: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(footnote)}</p>
            ))}
          </div>
        )}
        {chartData.source && <p className="text-xs text-slate-400 mt-6 italic">{formatSourceText(chartData.source)}</p>}

        </div>
      );
    }

    if (!Array.isArray(chartData.data) || chartData.data.length === 0) {
      if (chartData.chart_type === 'kpi_plus_relationship_table' && chartData.data.relationships) {
         return (
           <div key={index} className="mb-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
             {!hideTitle && <h3 className="text-xl font-bold text-slate-800 mb-6">{chartData.chart_title}</h3>}
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                 <tr>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Insurer / MGA</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Startup Insurtechs</th>
                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Exited Insurtechs</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                 {chartData.data.relationships.map((row: any, i: number) => (
                   <tr key={i} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.insurer_mga}</td>
                     <td className="px-6 py-4 text-sm text-slate-600">{row.startup_insurtechs?.join(', ')}</td>
                     <td className="px-6 py-4 text-sm text-slate-600">{row.exited_insurtechs?.join(', ')}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             
        {chartData.notes && chartData.notes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.notes.map((note: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(note)}</p>
            ))}
          </div>
        )}
        {chartData.footnotes && chartData.footnotes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.footnotes.map((footnote: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(footnote)}</p>
            ))}
          </div>
        )}
        {chartData.source && <p className="text-xs text-slate-400 mt-6 italic">{formatSourceText(chartData.source)}</p>}

           </div>
         );
      }
      return null;
    }

    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div key={index} className="mb-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          {!hideTitle && <h3 className="text-xl font-bold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
          
        {chartData.notes && chartData.notes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.notes.map((note: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(note)}</p>
            ))}
          </div>
        )}
        {chartData.footnotes && chartData.footnotes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.footnotes.map((footnote: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(footnote)}</p>
            ))}
          </div>
        )}
        {chartData.source && <p className="text-xs text-slate-400 mt-6 italic">{formatSourceText(chartData.source)}</p>}

        </div>
      );
    }

    const possibleXAxisKeys = ['period', 'year', 'region', 'group', 'deal_stage', 'investor_group', 'quarter'];
    const xAxisKey = possibleXAxisKeys.find(key => chartData.data[0][key] !== undefined) || Object.keys(chartData.data[0])[0];
    
    // Smarter data keys selection
    let dataKeys = Object.keys(chartData.data[0]).filter(key => 
      key !== xAxisKey && 
      !['rank', 'id', 'meta_display', 'location_display', 'meta', 'source', 'share_of_funded_percent', 'is_ytd'].includes(key)
    );


    const isTableFallback = 
      chartData.suggested_chart_type === 'Table' || 
      chartData.suggested_chart_type === 'table' || 
      chartData.chart_type === 'ranking_table' || 
      chartData.chart_type === 'top_companies_list' ||
      chartData.chart_type === 'ranking_list' ||
      chartData.suggested_chart_type === 'ranked_list' ||
      chartData.chart_type === 'example_company_list' ||
      chartData.chart_type === 'annotated_company_list' ||
      dataKeys.some(k => k === 'rank' || k === 'company_name' || k === 'company_display');

    if (isTableFallback) {
      const allKeys = Object.keys(chartData.data[0]).filter(k => !['share_of_funded_percent'].includes(k));
      return (
        <div key={index} className="mb-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          {!hideTitle && <h3 className="text-xl font-bold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {allKeys.map(key => (
                  <th key={key} className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {formatKey(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {chartData.data.map((row: any, i: number) => {
                const isVCSeed = chartData.chart_title === 'Most Active Investors: VC - Seed';
                const isTopInvestor = isVCSeed && row.overall_investments_count >= 100;

                return (
                  <tr key={i} className={`transition-colors ${isTopInvestor ? 'bg-[#C7B299]/10/50 hover:bg-[#C7B299]/20/50' : 'hover:bg-slate-50'}`}>
                    {allKeys.map(key => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {key === 'investor_name' && isTopInvestor ? (
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-900">{row[key]}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#183661] text-white shadow-sm ring-1 ring-inset ring-[#183661]/10">
                              Top Investor
                            </span>
                          </div>
                        ) : key === 'investor_name' && portfolioDataMap[row[key]] ? (
                          <button 
                            onClick={() => onInvestorClick?.(row[key])}
                            className="text-[#183661] font-bold hover:text-[#183661] hover:underline inline-flex items-center group/btn transition-colors"
                          >
                            {row[key]}
                            <ArrowRight size={14} className="ml-1 opacity-0 group-hover/btn:opacity-100 transition-all transform group-hover/btn:translate-x-1" />
                          </button>
                        ) : (
                          row[key]
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
        {chartData.notes && chartData.notes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.notes.map((note: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(note)}</p>
            ))}
          </div>
        )}
        {chartData.footnotes && chartData.footnotes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.footnotes.map((footnote: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(footnote)}</p>
            ))}
          </div>
        )}
        {chartData.source && <p className="text-xs text-slate-400 mt-6 italic">{formatSourceText(chartData.source)}</p>}

        </div>
      );
    }

    const type = (chartData.suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const isStacked = type.includes('stacked');
    const isHorizontal = type.includes('horizontal');
    const is100Percent = type.includes('100%') || type.includes('100_percent');

    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });

    const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);
    const isBar = type.includes('bar') && !isComposed;
    const isLine = type.includes('line') && !isComposed;
    const isArea = type.includes('area') && !isComposed;
    const isPie = type.includes('pie');

    // Custom color mapping for specific keys
    const getColor = (key: string, index: number) => {
      if (key === 'funded_companies') return '#3b82f6'; // Blue-500
      if (key === 'unfunded_companies') return '#e2e8f0'; // Slate-200
      return COLORS[index % COLORS.length];
    };

    return (
      <div key={index} className="mb-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {!hideTitle && <h3 className="text-xl font-bold text-slate-800 mb-8">{chartData.chart_title}</h3>}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isComposed ? (
              <ComposedChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b' }} tickMargin={10} />
                {hasCount && hasValue ? (
                  <>
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b' }} />
                  </>
                ) : (
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                )}
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => formatKey(value)} />
                {dataKeys.map((key, i) => {
                  const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key.toLowerCase().includes('rounds') || key === 'number_of_deals';
                  const yAxisId = (hasCount && hasValue) ? (isCount ? "right" : "left") : "left";
                  if (isCount) {
                    return <Line yAxisId={yAxisId} key={key} type="monotone" dataKey={key} name={formatKey(key)} stroke={getColor(key, i)} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />;
                  }
                  return <Bar yAxisId={yAxisId} key={key} dataKey={key} name={formatKey(key)} fill={getColor(key, i)} radius={[4, 4, 0, 0]} maxBarSize={60} />;
                })}
              </ComposedChart>
            ) : chartData.suggested_chart_type === 'Line Chart' ? (
              <LineChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b' }} tickMargin={10} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => formatKey(value)} />
                {dataKeys.map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} name={formatKey(key)} stroke={getColor(key, i)} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            ) : chartData.suggested_chart_type === 'Area Chart' ? (
              <AreaChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b' }} tickMargin={10} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => formatKey(value)} />
                {dataKeys.map((key, i) => (
                  <Area key={key} type="monotone" dataKey={key} name={formatKey(key)} fill={getColor(key, i)} stroke={getColor(key, i)} fillOpacity={0.6} />
                ))}
              </AreaChart>
            ) : (
              <BarChart 
                data={chartData.data} 
                layout={isHorizontal ? "vertical" : "horizontal"}
                margin={{ top: 20, right: 30, left: isHorizontal ? 100 : 20, bottom: 20 }} 
                stackOffset={is100Percent ? "expand" : "none"}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={isHorizontal} horizontal={!isHorizontal} />
                {isHorizontal ? (
                  <>
                    <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b' }} tickFormatter={is100Percent ? (tick) => `${(tick * 100).toFixed(0)}%` : undefined} />
                    <YAxis type="category" dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b' }} width={90} />
                  </>
                ) : (
                  <>
                    <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b' }} tickMargin={10} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickFormatter={is100Percent ? (tick) => `${(tick * 100).toFixed(0)}%` : undefined} />
                  </>
                )}
                <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => formatKey(value)} />
                {dataKeys.map((key, i) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    name={formatKey(key)} 
                    stackId={isStacked || is100Percent ? "a" : undefined} 
                    fill={getColor(key, i)} 
                    radius={isHorizontal ? (isStacked ? [0, 0, 0, 0] : [0, 4, 4, 0]) : (isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0])} 
                    maxBarSize={60} 
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {chartData.notes && chartData.notes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.notes.map((note: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(note)}</p>
            ))}
          </div>
        )}
        {chartData.footnotes && chartData.footnotes.length > 0 && (
          <div className="mt-4 space-y-1">
            {chartData.footnotes.map((footnote: string, i: number) => (
              <p key={i} className="text-xs text-slate-500 italic">{formatSourceText(footnote)}</p>
            ))}
          </div>
        )}
        
        {chartData.analyst_note && (
          <div className="mt-8 bg-[#F5F0E8] p-6 rounded-2xl border border-[#C7B299]/30 flex items-start space-x-4">
            <div className="bg-[#183661] text-white p-2 rounded-lg mt-1 flex-shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#183661] uppercase tracking-wider mb-2">Analyst Note</h4>
              <p className="text-slate-700 leading-relaxed font-medium italic">
                {formatSourceText(chartData.analyst_note)}
              </p>
            </div>
          </div>
        )}

        {chartData.source && <p className="text-xs text-slate-400 mt-6 italic">{formatSourceText(chartData.source)}</p>}

      </div>
    );
  };

  const displayPages = pages.filter(p => !shouldSkipPage(p));
  const finalPages = subTabName 
    ? displayPages.filter((p, i) => !(i === 0 && p.page_type === 'section_divider' && p.page_headline?.toLowerCase() === subTabName.toLowerCase()))
    : displayPages;

  return (
    <div className="space-y-8">
      {subTabName && (
        <SectionHeader 
          title={subTabName} 
          subtitle={`Analysis and insights for ${reportName || 'Financial Services'}`}
          copyright={
            reportName === 'Insurtech' ? "© 2026 CB Insights" : 
            reportName === 'Banking' ? "© 2025 Tracxn Technologies" :
            "© KPMG International (data provided by PitchBook)"
          }
          category="Report Section"
          isSticky={false}
        />
      )}
      {finalPages.map((page, index) => {
        if (page.page_type === 'section_divider') {
          return (
            <div key={index} className="py-16 px-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg border border-slate-700 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white relative z-10 tracking-tight">{page.page_headline}</h2>
              {page.text_blocks && page.text_blocks.length > 1 && (
                <p className="text-slate-300 mt-6 text-xl relative z-10 font-medium">{formatSourceText(page.text_blocks[1])}</p>
              )}
            </div>
          );
        }

        if (page.page_type === 'subsection_divider') {
          return (
            <div key={index} className="py-10 px-8 bg-slate-50 rounded-2xl border-l-4 border-[#183661] shadow-sm flex items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-slate-800">{page.page_headline}</h3>
                {page.text_blocks && page.text_blocks.length > 1 && (
                  <p className="text-slate-500 mt-3 text-lg">{formatSourceText(page.text_blocks[1])}</p>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
            {page.page_headline && (
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{page.page_headline}</h2>
            )}
          
          {page.key_insight && (
            <blockquote className="border-l-4 border-[#183661] pl-6 my-8 bg-[#C7B299]/10/50 p-6 rounded-r-xl italic text-slate-700">
              {typeof page.key_insight === 'string' ? (
                <p className="text-xl">"{formatSourceText(page.key_insight)}"</p>
              ) : (
                <>
                  <p className="text-xl mb-4">"{formatSourceText(page.key_insight.quote || page.key_insight.text)}"</p>
                  <footer className="text-sm font-medium text-slate-500 not-italic">
                    — {formatSourceText(page.key_insight.author || page.key_insight.quote_author)}{page.key_insight.title ? `, ${formatSourceText(page.key_insight.title)}` : ''}
                  </footer>
                </>
              )}
            </blockquote>
          )}

          {page.quote && (
            <blockquote className="border-l-4 border-[#183661] pl-6 my-8 bg-[#C7B299]/10/50 p-6 rounded-r-xl italic text-slate-700">
              <p className="text-xl mb-4">"{formatSourceText(page.quote.text || page.quote.quote)}"</p>
              <footer className="text-sm font-medium text-slate-500 not-italic">
                — {formatSourceText(page.quote.author)}{page.quote.title ? `, ${formatSourceText(page.quote.title)}` : ''}
              </footer>
            </blockquote>
          )}

          {page.leadership_quote && (
            <blockquote className="border-l-4 border-[#183661] pl-6 my-8 bg-[#C7B299]/10/50 p-6 rounded-r-xl italic text-slate-700">
              <p className="text-xl mb-4">"{formatSourceText(page.leadership_quote.quote || page.leadership_quote.text)}"</p>
              <footer className="text-sm font-medium text-slate-500 not-italic">
                — {formatSourceText(page.leadership_quote.author)}{page.leadership_quote.role ? `, ${formatSourceText(page.leadership_quote.role)}` : ''}
              </footer>
            </blockquote>
          )}

          {page.executive_quote && (
            <blockquote className="border-l-4 border-[#183661] pl-6 my-8 bg-[#C7B299]/10/50 p-6 rounded-r-xl italic text-slate-700">
              <p className="text-xl mb-4">"{formatSourceText(page.executive_quote.quote || page.executive_quote.text || page.executive_quote.content)}"</p>
              <footer className="text-sm font-medium text-slate-500 not-italic">
                — {formatSourceText(page.executive_quote.author)}{page.executive_quote.title ? `, ${formatSourceText(page.executive_quote.title)}` : ''}
              </footer>
            </blockquote>
          )}

          {page.expert_insight && (
            <blockquote className="border-l-4 border-[#183661] pl-6 my-8 bg-[#C7B299]/10/50 p-6 rounded-r-xl italic text-slate-700">
              <p className="text-xl mb-4">"{formatSourceText(page.expert_insight.quote || page.expert_insight.text || page.expert_insight.content)}"</p>
              <footer className="text-sm font-medium text-slate-500 not-italic">
                — {formatSourceText(page.expert_insight.author)}{page.expert_insight.title ? `, ${formatSourceText(page.expert_insight.title)}` : ''}
              </footer>
            </blockquote>
          )}

          {page.verbatim_text && (
            <div className="mb-8">
              {Array.isArray(page.verbatim_text) ? (
                page.verbatim_text.map((text: string, idx: number) => (
                  <p key={idx} className="text-slate-700 leading-relaxed text-lg mb-4">{formatSourceText(text)}</p>
                ))
              ) : typeof page.verbatim_text === 'object' ? (
                Object.entries(page.verbatim_text).map(([key, text], idx) => (
                  <div key={idx} className="mb-6">
                    {!['title', 'content', 'text', 'subtitle', 'description'].includes(key.toLowerCase()) && (
                      <h4 className="font-semibold text-slate-800 mb-2 capitalize text-lg">{key.replace(/_/g, ' ')}</h4>
                    )}
                    <p className="text-slate-700 leading-relaxed text-lg">{formatSourceText(String(text))}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-700 leading-relaxed text-lg mb-4">{formatSourceText(String(page.verbatim_text))}</p>
              )}
            </div>
          )}

          {page.executive_summary && (
            <div className="mb-8">
              {renderTextContent(page.executive_summary)}
            </div>
          )}

          {page.charts && (
            <div className="mt-8">
              {Array.isArray(page.charts) 
                ? page.charts.map((chart: any, idx: number) => renderChart(chart, idx, chart.chart_title === page.page_headline))
                : Object.values(page.charts).map((chart: any, idx: number) => renderChart(chart, idx, chart.chart_title === page.page_headline))
              }
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};


// ── Insurtech Overview Dashboard ─────────────────────────────────────────────
const IT_KPI_CARDS = [
  { label: 'Funding 2025', value: '$5.3B', sub: '+10% YoY — 3-year decline halted', color: 'from-[#183661] to-[#2a5080]', icon: '💰' },
  { label: 'Total Deals', value: '405', sub: '-11% YoY (8-year low)', color: 'from-rose-600 to-pink-400', icon: '🤝' },
  { label: 'Avg Deal Size', value: '$15.2M', sub: '+13% from $13.5M in 2024', color: 'from-emerald-600 to-teal-400', icon: '📊' },
  { label: 'Mega-Rounds $100M+', value: '11', sub: 'Up from 6 in 2024', color: 'from-amber-500 to-orange-400', icon: '🚀' },
  { label: 'Active Investors (4+)', value: '15', sub: 'Lowest since 2016', color: 'from-violet-600 to-purple-400', icon: '🏦' },
  { label: 'IPO Probability', value: '58.3%', sub: 'Alan & Coalition (2-yr)', color: 'from-sky-600 to-cyan-400', icon: '🏆' },
];

const IT_FUNDING_TREND = [
  { year: '2016', funding: 2.2, deals: 336 },
  { year: '2017', funding: 3.3, deals: 451 },
  { year: '2018', funding: 5.4, deals: 560 },
  { year: '2019', funding: 8.2, deals: 609 },
  { year: '2020', funding: 10.0, deals: 636 },
  { year: '2021', funding: 16.8, deals: 854 },
  { year: '2022', funding: 9.6, deals: 770 },
  { year: '2023', funding: 6.1, deals: 557 },
  { year: '2024', funding: 4.8, deals: 454 },
  { year: '2025', funding: 5.3, deals: 405 },
];

const IT_SEGMENT_COMPARISON = [
  { segment: 'P&C Insurance', value2024: 1.8, value2025: 2.3, color: '#3b82f6' },
  { segment: 'Life & Health', value2024: 1.5, value2025: 1.6, color: '#8b5cf6' },
  { segment: 'Other', value2024: 1.5, value2025: 1.4, color: '#f59e0b' },
];

const IT_KPI_HIGHLIGHTS = [
  { title: 'P&C Funding surge', desc: '+28% YoY — largest driver of the 2025 rebound', icon: '🏠' },
  { title: 'Late-stage preference', desc: 'Only 24% of deals went to early-stage vs 46% in broader VC', icon: '🎯' },
  { title: 'General Catalyst', desc: 'Most active investor alongside American Family & Clocktower', icon: '👑' },
  { title: 'Exit pipeline', desc: '7+ insurtechs with Mosaic 800+ and >10% IPO probability', icon: '📈' },
];

const InsurtechOverviewDashboard = ({ onBack }: { onBack?: () => void }) => {
  const tldrPage = insurtechData.sections?.overview?.pages?.find((p: any) => p.page_headline === 'TL;DR');
  const kpis: any[] = Array.isArray(tldrPage?.charts?.[0]?.data) ? tldrPage.charts[0].data : [];

  return (
    <div className="space-y-8">
      <SectionHeader title="Executive Overview" subtitle="State of Insurtech 2025 · CB Insights" category="Summary" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {IT_KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg flex flex-col gap-1`}>
            <span className="text-2xl">{kpi.icon}</span>
            <div className="text-2xl font-extrabold leading-tight">{kpi.value}</div>
            <div className="text-xs font-semibold opacity-90">{kpi.label}</div>
            <div className="text-xs opacity-75">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Funding Trend + Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Annual Funding ($B) — 2016–2025</h3>
          <p className="text-xs text-slate-500 mb-4">3-year decline finally reversed in 2025</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={IT_FUNDING_TREND}>
              <defs>
                <linearGradient id="itGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} unit="B" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any, n: string) => [n === 'funding' ? `$${v}B` : v, n === 'funding' ? 'Funding' : 'Deals']} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="funding" stroke="#3b82f6" strokeWidth={3} fill="url(#itGrad)" name="Funding ($B)" />
              <Line yAxisId="right" type="monotone" dataKey="deals" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Deals" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Segment Funding — 2024 vs 2025 ($B)</h3>
          <p className="text-xs text-slate-500 mb-4">P&C Insurance led the recovery with +28% growth</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={IT_SEGMENT_COMPARISON} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="B" />
              <YAxis type="category" dataKey="segment" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={100} />
              <Tooltip formatter={(v: any) => [`$${v}B`, '']} />
              <Legend />
              <Bar dataKey="value2024" name="2024" fill="#cbd5e1" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="value2024" position="right" formatter={(v: any) => `$${v}B`} style={{ fontSize: 10, fill: '#64748b' }} />
              </Bar>
              <Bar dataKey="value2025" name="2025" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                <LabelList dataKey="value2025" position="right" formatter={(v: any) => `$${v}B`} style={{ fontSize: 10, fontWeight: 700, fill: '#1e293b' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Narrative Cards from data */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kpis.map((kpi: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-700 leading-snug flex-1 pr-2">{kpi.label}</h4>
                <span className="text-xl font-extrabold text-[#183661] whitespace-nowrap">
                  {kpi.value_unit === 'usd_billions' ? `$${kpi.value}B`
                    : kpi.value_unit === 'percent' || kpi.value_unit === 'top_percent' ? `${kpi.value}%`
                    : kpi.value}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{kpi.description}</p>
              {kpi.additional_description && (
                <p className="text-xs text-slate-400 leading-relaxed mt-2 italic">{kpi.additional_description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Highlights */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">📌 Key Highlights 2025</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IT_KPI_HIGHLIGHTS.map((h, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F0E8] border border-[#C7B299]/30">
              <span className="text-2xl">{h.icon}</span>
              <div>
                <div className="font-bold text-slate-800 text-sm">{h.title}</div>
                <div className="text-xs text-slate-500 mt-1">{h.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InsurtechDashboard = ({ data, onBack }: { data: any, onBack?: () => void }) => {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const subTabs = ['Overview', 'Global Trends', 'Collection Spotlights', 'Geographic Trends'];

  // Update document title when component mounts or subtab changes
  useEffect(() => {
    document.title = `Financial Services: State of Insurtech 2025 - ${activeSubTab}`;
    return () => {
      document.title = 'VC Insights';
    };
  }, [activeSubTab]);

  // Flatten pages if data is structured by sections, or use data.pages if it's flat
  const allPages = data.sections 
    ? Object.values(data.sections).flatMap((section: any) => section.pages || [])
    : (data.pages || []);

  const filteredPages = allPages.filter((page: any) => {
    const pageNum = page.page_number;
    switch (activeSubTab) {
      case 'Overview':
        return pageNum === 1 || (pageNum >= 4 && pageNum <= 9);
      case 'Global Trends':
        return pageNum >= 11 && pageNum <= 56;
      case 'Collection Spotlights':
        return pageNum >= 57 && pageNum <= 79;
      case 'Geographic Trends':
        return pageNum >= 80 && pageNum <= 101;
      default:
        return false;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-[#183661] transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Financial Services
        </button>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Financial Services: State of Insurtech 2025</h1>
      </div>

      {/* Sub-Navigation */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-8 md:px-8 mb-4 border-b border-slate-200/50">
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-2xl w-full overflow-x-auto shadow-sm">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeSubTab === tab 
                  ? 'bg-white text-[#183661] shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeSubTab === 'Overview'
        ? <InsurtechOverviewDashboard onBack={onBack} />
        : <FintechDynamicTab pages={filteredPages} subTabName={activeSubTab} reportName="Insurtech" />
      }
    </div>
  );
};

// ── Banking Overview Dashboard ────────────────────────────────────────────────
const BK_KPI_CARDS = [
  { label: 'Total Companies', value: '24,855', sub: 'Global banking startups', color: 'from-[#183661] to-[#2a5080]', icon: '🏦' },
  { label: 'Funded Companies', value: '2,492', sub: '10% of total tracked', color: 'from-emerald-600 to-teal-400', icon: '💰' },
  { label: 'Total Funding', value: '$37.6B', sub: 'All-time cumulative', color: 'from-violet-600 to-purple-400', icon: '📊' },
  { label: 'Funding (Last 2Y)', value: '$1.1B', sub: 'Recent activity', color: 'from-amber-500 to-orange-400', icon: '📅' },
  { label: 'Acquisitions', value: '1,437', sub: 'Recorded exits via M&A', color: 'from-rose-600 to-pink-400', icon: '🤝' },
  { label: 'IPOs', value: '1,177', sub: 'Public listings recorded', color: 'from-sky-600 to-cyan-400', icon: '🚀' },
];

const BK_FUNDING_TREND = [
  { year: '2020', funding: 0.775, rounds: 53 },
  { year: '2021', funding: 0.664, rounds: 61 },
  { year: '2022', funding: 2.3, rounds: 74 },
  { year: '2023', funding: 2.5, rounds: 42 },
  { year: '2024', funding: 0.543, rounds: 48 },
  { year: '2025 YTD', funding: 0.118, rounds: 24 },
];

const BK_GEO_DATA = [
  { country: '🇺🇸 United States', total: 13220, funded: 1336, color: '#3b82f6' },
  { country: '🇬🇧 United Kingdom', total: 1301, funded: 42, color: '#8b5cf6' },
  { country: '🇮🇳 India', total: 1202, funded: 61, color: '#f59e0b' },
  { country: '🇩🇪 Germany', total: 1105, funded: 25, color: '#10b981' },
  { country: '🇳🇬 Nigeria', total: 380, funded: 30, color: '#ef4444' },
];

const BK_FUNDING_BY_COUNTRY = [
  { country: '🇺🇸 US', share: 43.5, color: '#3b82f6' },
  { country: '🇨🇳 China', share: 20.7, color: '#ef4444' },
  { country: '🇻🇳 Vietnam', share: 9.4, color: '#f59e0b' },
  { country: '🇮🇳 India', share: 6.7, color: '#10b981' },
  { country: '🇵🇰 Pakistan', share: 4.0, color: '#8b5cf6' },
  { country: '🇬🇧 UK', share: 3.5, color: '#6366f1' },
  { country: 'Others', share: 12.2, color: '#94a3b8' },
];

const BK_STAGE_FUNNEL = [
  { stage: 'Founded', companies: 24855 },
  { stage: 'Funded', companies: 2492 },
  { stage: 'Series A+', companies: 649 },
  { stage: 'Series B+', companies: 509 },
  { stage: 'Series C+', companies: 411 },
  { stage: 'Series D+', companies: 360 },
];

const BankingOverviewDashboard = () => (
  <div className="space-y-8">
    <SectionHeader title="Executive Overview" subtitle="Feed Report — Banks · Aug 2025 · Tracxn" category="Summary" />

    {/* KPI Cards */}
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {BK_KPI_CARDS.map((kpi) => (
        <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg flex flex-col gap-1`}>
          <span className="text-2xl">{kpi.icon}</span>
          <div className="text-2xl font-extrabold leading-tight">{kpi.value}</div>
          <div className="text-xs font-semibold opacity-90">{kpi.label}</div>
          <div className="text-xs opacity-75">{kpi.sub}</div>
        </div>
      ))}
    </div>

    {/* YoY Funding + Stage Funnel */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Year-over-Year Funding ($B)</h3>
        <p className="text-xs text-slate-500 mb-4">2020–2025 YTD — funding rounds & amounts</p>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={BK_FUNDING_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} unit="B" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip formatter={(v: any, n: string) => [n === 'funding' ? `$${v}B` : v, n === 'funding' ? 'Funding' : 'Rounds']} />
            <Legend />
            <Bar yAxisId="left" dataKey="funding" name="Funding ($B)" fill="#3b82f6" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="funding" position="top" formatter={(v: any) => `$${v}B`} style={{ fontSize: 9, fill: '#3b82f6', fontWeight: 700 }} />
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="rounds" name="Rounds" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Companies by Stage Funnel</h3>
        <p className="text-xs text-slate-500 mb-4">From Founded → Series D+ (global)</p>
        <div className="space-y-2 mt-2">
          {BK_STAGE_FUNNEL.map((s, i) => {
            const pct = Math.round((s.companies / 24855) * 100);
            const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
            return (
              <div key={s.stage}>
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>{s.stage}</span>
                  <span style={{ color: colors[i] }}>{s.companies.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: colors[i] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Geography + Funding Share */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Top Geographies by Companies</h3>
        <p className="text-xs text-slate-500 mb-4">Total vs. Funded companies per country</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={BK_GEO_DATA} layout="vertical" barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis type="category" dataKey="country" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} width={130} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="total" position="right" formatter={(v: any) => v.toLocaleString()} style={{ fontSize: 9, fill: '#64748b' }} />
            </Bar>
            <Bar dataKey="funded" name="Funded" radius={[0, 4, 4, 0]}>
              {BK_GEO_DATA.map((d) => <Cell key={d.country} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Funding Distribution by Country</h3>
        <p className="text-xs text-slate-500 mb-4">% share of total $37.6B cumulative funding</p>
        <div className="space-y-3 mt-2">
          {BK_FUNDING_BY_COUNTRY.map((c) => (
            <div key={c.country}>
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                <span>{c.country}</span>
                <span style={{ color: c.color }}>{c.share}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${c.share}%`, backgroundColor: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const BankingReport = ({ onBack }: { onBack: () => void }) => {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null);
  const subTabs = ['Overview', 'Funding', 'Investors', 'Acquisitions', 'IPOs', 'Companies', 'Business Models'];

  // Update document title when component mounts or subtab changes
  useEffect(() => {
    document.title = `Financial Services: Banking Tech Report - ${activeSubTab}`;
    return () => {
      document.title = 'VC Insights';
    };
  }, [activeSubTab]);

  // If an investor with portfolio data was clicked, show their dashboard
  if (selectedInvestor) {
    return (
      <PortfolioTab
        investorName={selectedInvestor}
        onBack={() => setSelectedInvestor(null)}
      />
    );
  }

  const filteredPages = bankingData.pages.filter((page: any) => {
    const section = page.section_key;
    switch (activeSubTab) {
      case 'Overview':
        return section === 'overview' || page.page_type === 'cover_page' || page.page_type === 'contents_page';
      case 'Funding':
        return section === 'funding';
      case 'Investors':
        return section === 'investors';
      case 'Acquisitions':
        return section === 'acquisitions';
      case 'IPOs':
        return section === 'ipos';
      case 'Companies':
        return section === 'companies';
      case 'Business Models':
        return section === 'business_models';
      default:
        return false;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-slate-200/50">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-[#183661] transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Financial Services
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Financial Services: {bankingData.report_info.report_name}</h1>
        <p className="text-slate-400 mt-2">Source: {bankingData.report_info.source_provider}</p>
      </div>

      {/* Sub-Navigation */}
      <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-8 md:px-8 mb-4 border-b border-slate-200/50">
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-2xl w-full overflow-x-auto shadow-sm">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeSubTab === tab 
                  ? 'bg-white text-[#183661] shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeSubTab === 'Overview'
        ? <BankingOverviewDashboard />
        : <FintechDynamicTab pages={filteredPages} subTabName={activeSubTab} reportName="Banking" onInvestorClick={(name) => setSelectedInvestor(name)} />
      }
    </div>
  );
};

// ── Fintech Overview Dashboard ───────────────────────────────────────────────
const FT_KPI_CARDS = [
  { label: 'Global Fintech 2025', value: '$116B', sub: 'Up from $95.5B in 2024', color: 'from-[#183661] to-[#2a5080]', icon: '💰' },
  { label: 'YoY Growth', value: '+21.5%', sub: '3rd year rebound', color: 'from-emerald-600 to-teal-400', icon: '📈' },
  { label: 'H2\'25 Investment', value: '$56.3B', sub: '2,169 deals', color: 'from-violet-600 to-purple-400', icon: '📊' },
  { label: 'Digital Assets', value: '$19.1B', sub: '~Doubled YoY (+70%)', color: 'from-amber-500 to-orange-400', icon: '🪙' },
  { label: 'AI-Fintech', value: '$16.8B', sub: '1,334 deals in 2025', color: 'from-rose-600 to-pink-400', icon: '🤖' },
  { label: 'Exit Value', value: '$104.4B', sub: '+123% YoY rebound', color: 'from-sky-600 to-cyan-400', icon: '🚀' },
];

const FT_YEAR_TREND = [
  { year: '2021', fintech: 238 },
  { year: '2022', fintech: 178 },
  { year: '2023', fintech: 113 },
  { year: '2024', fintech: 95.5 },
  { year: '2025', fintech: 116 },
];

const FT_REGIONAL = [
  { region: 'Americas', annual: 66.5, h2: 27.4, deals: 2409, color: '#3b82f6' },
  { region: 'EMEA', annual: 29.2, h2: 13.8, deals: 1484, color: '#8b5cf6' },
  { region: 'ASPAC', annual: 9.3, h2: 4.6, deals: 763, color: '#f59e0b' },
];

const FT_SEGMENTS = [
  { segment: 'Payments', investment: 19.2, deals: 542, color: '#3b82f6' },
  { segment: 'Digital Assets', investment: 19.1, deals: 0, color: '#f59e0b' },
  { segment: 'AI Fintech', investment: 16.8, deals: 1334, color: '#8b5cf6' },
];

const FT_INVESTMENT_TYPES = [
  { type: 'VC', value: 56.7, prev: 0, color: '#3b82f6' },
  { type: 'M&A', value: 55.4, prev: 44.6, color: '#8b5cf6' },
  { type: 'Corp VC', value: 29.7, prev: 20.9, color: '#10b981' },
  { type: 'PE Growth', value: 4.0, prev: 5.5, color: '#f59e0b' },
];

const FT_EXIT_DATA = [
  { year: '2024', exitValue: 46.8, ipoValue: 0 },
  { year: '2025', exitValue: 104.4, ipoValue: 63 },
];

const FintechOverviewDashboard = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const welcomePage = fintechData.pages.find((p: any) => p.page_number === 2);
  const sentimentPage = fintechData.pages.find((p: any) => p.page_number === 3);

  return (
    <div className="space-y-8">
      <SectionHeader title="Executive Overview" subtitle="Pulse of Fintech H2 2025 · KPMG" category="Summary" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {FT_KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg flex flex-col gap-1`}>
            <span className="text-2xl">{kpi.icon}</span>
            <div className="text-2xl font-extrabold leading-tight">{kpi.value}</div>
            <div className="text-xs font-semibold opacity-90">{kpi.label}</div>
            <div className="text-xs opacity-75">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Year trend + H1 vs H2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Global Fintech Investment Trend ($B)</h3>
          <p className="text-xs text-slate-500 mb-4">After 3 years of decline, 2025 marks a clear inflection point</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={FT_YEAR_TREND}>
              <defs>
                <linearGradient id="ftGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="B" />
              <Tooltip formatter={(v: any) => [`$${v}B`, 'Fintech Investment']} />
              <Area type="monotone" dataKey="fintech" stroke="#3b82f6" strokeWidth={3} fill="url(#ftGrad)">
                <LabelList dataKey="fintech" position="top" formatter={(v: any) => `$${v}B`} style={{ fontSize: 10, fill: '#3b82f6', fontWeight: 700 }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">H1 vs H2 2025</h3>
          <p className="text-xs text-slate-500 mb-4">Investment split by half-year</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ half: 'H1\'25', investment: 59.7, deals: 2550 }, { half: 'H2\'25', investment: 56.3, deals: 2169 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="half" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="B" />
              <Tooltip formatter={(v: any, n: string) => [n === 'investment' ? `$${v}B` : v.toLocaleString(), n === 'investment' ? 'Investment' : 'Deals']} />
              <Bar dataKey="investment" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="investment" position="top" formatter={(v: any) => `$${v}B`} style={{ fontSize: 11, fontWeight: 700, fill: '#1e293b' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional + Investment Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">2025 Regional Fintech Investment</h3>
          <p className="text-xs text-slate-500 mb-4">Full-year ($B) — Americas leads with 57% share</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={FT_REGIONAL} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="B" />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} width={72} />
              <Tooltip formatter={(v: any) => [`$${v}B`, 'Investment']} />
              <Bar dataKey="annual" radius={[0, 8, 8, 0]}>
                {FT_REGIONAL.map((r) => <Cell key={r.region} fill={r.color} />)}
                <LabelList dataKey="annual" position="right" formatter={(v: any) => `$${v}B`} style={{ fontSize: 11, fontWeight: 700, fill: '#1e293b' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Investment by Type — 2025</h3>
          <p className="text-xs text-slate-500 mb-4">VC, M&A, Corporate VC, PE Growth ($B)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={FT_INVESTMENT_TYPES} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit="B" />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} width={70} />
              <Tooltip formatter={(v: any) => [`$${v}B`, 'Value']} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {FT_INVESTMENT_TYPES.map((d) => <Cell key={d.type} fill={d.color} />)}
                <LabelList dataKey="value" position="right" formatter={(v: any) => `$${v}B`} style={{ fontSize: 11, fontWeight: 700, fill: '#1e293b' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segments + Exit Rebound */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">🔥 Top Fintech Segments 2025</h3>
          <p className="text-xs text-slate-500 mb-4">Investment ($B) by sector</p>
          <div className="space-y-4 mt-2">
            {FT_SEGMENTS.map((seg) => {
              const pct = Math.round((seg.investment / 19.2) * 100);
              return (
                <div key={seg.segment}>
                  <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                    <span>{seg.segment}</span>
                    <span style={{ color: seg.color }}>${seg.investment}B{seg.deals ? ` · ${seg.deals.toLocaleString()} deals` : ''}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: seg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">🚀 Exit Value Rebound</h3>
          <p className="text-xs text-slate-500 mb-4">2024 vs 2025 exit value ($B) — +123% growth</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={FT_EXIT_DATA} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="B" />
              <Tooltip formatter={(v: any, n: string) => [`$${v}B`, n === 'exitValue' ? 'Total Exit Value' : 'IPO Exit Value']} />
              <Legend formatter={(v) => v === 'exitValue' ? 'Total Exits' : 'IPO Exits'} />
              <Bar dataKey="exitValue" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="exitValue" position="top" formatter={(v: any) => `$${v}B`} style={{ fontSize: 11, fontWeight: 700, fill: '#1e293b' }} />
              </Bar>
              <Bar dataKey="ipoValue" fill="#10b981" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="ipoValue" position="top" formatter={(v: any) => v ? `$${v}B` : ''} style={{ fontSize: 11, fontWeight: 700, fill: '#1e293b' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Slicer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mr-2">Regional Breakdown</h3>
          <button onClick={() => setActiveRegion(null)} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeRegion === null ? 'bg-[#183661] text-white border-[#183661]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#C7B299]/40'}`}>All</button>
          {FT_REGIONAL.map((r) => (
            <button key={r.region} onClick={() => setActiveRegion(activeRegion === r.region ? null : r.region)} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${activeRegion === r.region ? 'bg-[#183661] text-white border-[#183661]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#C7B299]/40'}`}>
              {r.region === 'Americas' ? '🌎' : r.region === 'EMEA' ? '🇪🇺' : '🌏'} {r.region}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FT_REGIONAL.filter((r) => !activeRegion || r.region === activeRegion).map((r) => (
            <div key={r.region} className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <h4 className="font-bold text-slate-800">{r.region === 'Americas' ? '🌎' : r.region === 'EMEA' ? '🇪🇺' : '🌏'} {r.region}</h4>
                <span className="text-xs bg-[#C7B299]/10 text-[#183661] px-2 py-1 rounded-full font-semibold">{r.deals.toLocaleString()} deals</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">FY 2025</span><span className="font-bold text-slate-800">${r.annual}B</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">H2 2025</span><span className="font-bold" style={{ color: r.color }}>${r.h2}B</span></div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full" style={{ width: `${Math.round((r.annual / 66.5) * 100)}%`, backgroundColor: r.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Trends */}
      {sentimentPage?.key_trends && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">📌 Key Trends — H2 2025</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sentimentPage.key_trends.map((trend: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F0E8] border border-[#C7B299]/30">
                <span className="w-6 h-6 rounded-full bg-[#183661] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <span className="text-sm text-slate-700 font-medium">{trend}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leadership Quote */}
      {welcomePage?.leadership_quote && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <div className="text-4xl mb-4 opacity-40">"</div>
          <p className="text-lg leading-relaxed italic mb-6">{welcomePage.leadership_quote.quote}</p>
          <div>
            <div className="font-bold">{welcomePage.leadership_quote.author}</div>
            <div className="text-sm opacity-70">{welcomePage.leadership_quote.role}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const FintechReport = ({ onBack }: { onBack: () => void }) => {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const subTabs = ['Overview', 'Global Insights', 'Fintech Segments', 'Regional Insights'];

  // Update document title when component mounts or subtab changes
  useEffect(() => {
    document.title = `Financial Services: Pulse of Fintech H2 2025 - ${activeSubTab}`;
    return () => {
      document.title = 'VC Insights';
    };
  }, [activeSubTab]);

  const filteredPages = fintechData.pages.filter((page: any) => {
    const pageNum = page.page_number;
    switch (activeSubTab) {
      case 'Overview':
        return pageNum >= 1 && pageNum <= 4;
      case 'Global Insights':
        return pageNum >= 5 && pageNum <= 15;
      case 'Fintech Segments':
        return pageNum >= 16 && pageNum <= 33;
      case 'Regional Insights':
        return pageNum >= 34;
      default:
        return false;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-[#183661] transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Financial Services
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Financial Services: Pulse of Fintech H2 2025</h1>
      </div>

      {/* Sub-Navigation */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-8 md:px-8 mb-4 border-b border-slate-200/50">
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-2xl w-full overflow-x-auto shadow-sm">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeSubTab === tab 
                  ? 'bg-white text-[#183661] shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeSubTab === 'Overview'
        ? <FintechOverviewDashboard />
        : <FintechDynamicTab pages={filteredPages} subTabName={activeSubTab} reportName="Fintech" />
      }
    </div>
  );
};


const FinancialServicesPage = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  if (activeReport === 'fintech') {
    return <FintechReport onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'insurtech') {
    return <InsurtechDashboard data={insurtechData} onBack={() => setActiveReport(null)} />;
  }

  if (activeReport === 'banking') {
    return <BankingReport onBack={() => setActiveReport(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-slate-200/50">
        <button 
          onClick={() => setActiveTab('industries')}
          className="flex items-center text-slate-500 hover:text-[#183661] transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Industries
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Financial Services Subsectors</h1>
        <p className="text-slate-300 mt-2">Select a subsector to view its detailed report.</p>
      </div>

      {/* Subsectors Grid (Dynamic) */}
      <div className="grid grid-cols-1 gap-6">
        {subsectorsData.filter(s => s.parent === 'financial-services').map(subsector => {
          const Icon = subsector.icon;
          // Color logic for icons (optional, can be improved)
          let iconBg = 'bg-[#C7B299]/20 text-[#183661]';
          let textColor = 'text-[#183661]';
          if (subsector.id === 'insurtech') {
            iconBg = 'bg-indigo-100 text-indigo-600';
            textColor = 'text-indigo-600';
          } else if (subsector.id === 'banking') {
            iconBg = 'bg-emerald-100 text-emerald-600';
            textColor = 'text-emerald-600';
          }
          return (
            <div
              key={subsector.id}
              onClick={() => setActiveReport(subsector.id)}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center space-x-6">
                <div className={`w-16 h-16 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <Icon size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{subsector.name}</h3>
                  <p className="text-slate-500">{subsector.description}</p>
                </div>
              </div>
              <div className={`flex items-center ${textColor} font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform`}>
                View Full Report
                <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UniversalTab = ({ data: regionData, title }: { data: any, title?: string }) => {
  const renderTextContent = (content: any) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return <p className="text-slate-700 leading-relaxed text-lg mb-4 whitespace-pre-line">{formatSourceText(content)}</p>;
    }
    
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4 mb-6">
          {content.map((item, idx) => (
            <div key={idx}>{renderTextContent(item)}</div>
          ))}
        </div>
      );
    }
    
    if (typeof content === 'object') {
      if (content.title === 'Cover Page') return null;
      if (content.text) {
        return <p className="text-slate-700 leading-relaxed text-lg mb-4 whitespace-pre-line">{formatSourceText(content.text)}</p>;
      }
      if (content.sections && Array.isArray(content.sections)) {
        return (
          <div className="space-y-6 mb-6">
            {content.title && !['title', 'content', 'text', 'subtitle', 'description'].includes(content.title.toLowerCase()) && (
              <h3 className="text-xl font-semibold text-slate-800 mb-4">{content.title}</h3>
            )}
            {content.sections.map((section: any, idx: number) => (
              <div key={idx} className="space-y-2">
                {section.subtitle && !['title', 'content', 'text', 'subtitle', 'description'].includes(section.subtitle.toLowerCase()) && (
                  <h4 className="text-lg font-bold text-slate-800">{section.subtitle}</h4>
                )}
                {section.content && <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">{section.content}</p>}
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div className="space-y-4 mb-6">
          {Object.values(content).map((val: any, idx: number) => (
            <div key={idx}>{renderTextContent(val)}</div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  const renderTable = (chartData: any, hideTitle?: boolean) => {
    const { chart_title, data, note, source } = chartData;
    if (!data || data.length === 0) return null;
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }


    const headers = Object.keys(data[0]);

    return (
      <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {formatKey(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row: any, rowIndex: number) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {(source || note) && (
          <div className="mt-6 text-sm text-slate-500 space-y-1">
            {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
            {note && <p className="italic">{note}</p>}
          </div>
        )}
      </div>
    );
  };

  const renderChart = (chartData: any, hideTitle?: boolean) => {
    const { chart_title, suggested_chart_type, data, note, source } = chartData;
    if (!data || data.length === 0) return null;
    if (chartData.suggested_chart_type === 'text_block' || chartData.chart_type === 'text_block') {
      return (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chartData.chart_title}</h3>}
          <div className="space-y-6">
            {chartData.data.map((item: any, i: number) => (
              <div key={i}>
                {item.section && <h4 className="font-semibold text-slate-800 mb-2 text-lg">{item.section}</h4>}
                <p className="text-slate-600 leading-relaxed">{formatSourceText(item.text || item.content || item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }


    const type = (suggested_chart_type || chartData.chart_type || '').toLowerCase();
    const xAxisKey = data[0].period ? 'period' : (data[0].year ? 'year' : Object.keys(data[0])[0]);
    let dataKeys = Object.keys(data[0]).filter(key => key !== 'period' && key !== 'year');

    
    const isTable = type === 'table' || dataKeys.some(k => ['rank', 'company_name', 'amount_millions'].includes(k.toLowerCase()));
    if (isTable) {
      return renderTable(chartData, hideTitle);
    }


    let hiddenKeys: string[] = [];
    const totalComponentPairs = [
      { total: 'deal_count', components: ['pre_seed_seed', 'early_vc', 'later_vc', 'venture_growth', 'angel', 'seed', 'early_stage', 'late_stage'] },
      { total: 'total_companies', components: ['funded_companies', 'unfunded_companies'] },
      { total: 'total_funding_usd_millions', components: ['seed_usd_millions', 'early_stage_usd_millions', 'late_stage_usd_millions', 'expansion_usd_millions'] },
      { total: 'total_funding_usd_billions', components: ['seed_usd_billions', 'early_stage_usd_billions', 'late_stage_usd_billions', 'expansion_usd_billions'] },
      { total: 'total_rounds', components: ['seed_rounds', 'early_stage_rounds', 'late_stage_rounds'] },
      { total: 'total_unique_institutional_investors', components: ['first_time_investors', 'existing_investors'] }
    ];

    totalComponentPairs.forEach(pair => {
      if (dataKeys.includes(pair.total) && pair.components.some(c => dataKeys.includes(c))) {
        dataKeys = dataKeys.filter(k => k !== pair.total);
        hiddenKeys.push(pair.total);
      }
    });

    const hasCount = dataKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('volume') || k.toLowerCase().includes('deals') || k.toLowerCase().includes('rounds') || k === 'number_of_deals');
    const hasValue = dataKeys.some(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('usd') || k.toLowerCase().includes('invested') || k.toLowerCase().includes('funding') || k.toLowerCase().includes('amount'));
    const isComposed = type.includes('composed') || type.includes('dual y-axes') || type.includes('dual_axis') || (hasCount && hasValue);
    const isBar = type.includes('bar') && !isComposed;
    const isLine = type.includes('line') && !isComposed;
    const isArea = type.includes('area') && !isComposed;
    const isStacked = type.includes('stacked');
    const is100Percent = type.includes('100%') || type.includes('100_percent');
    const isPie = type.includes('pie');

    const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#000080', '#3cb371', '#ffa500', '#6a5acd', '#ff1493'];

    let ChartComponent: any;
    let children: any[] = [];
    let stackOffset: "expand" | "none" = "none";

    if (is100Percent) {
      ChartComponent = BarChart;
      stackOffset = "expand";
      children = dataKeys.map((key, index) => (
        <Bar key={key} name={formatKey(key)} dataKey={key} fill={COLORS[index % COLORS.length]} stackId="a" />
      ));
    } else if (isComposed) {
      ChartComponent = ComposedChart;
      const hasLeftAndRight = hasCount && hasValue;
      children = dataKeys.map((key, index) => {
        const isCount = key.toLowerCase().includes('count') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('deals') || key.toLowerCase().includes('rounds') || key === 'number_of_deals';
        const yAxisId = hasLeftAndRight ? (isCount ? "right" : "left") : "left";
        if (isCount) {
          return <Line key={key} name={formatKey(key)} yAxisId={yAxisId} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />;
        } else {
          return <Bar key={key} name={formatKey(key)} yAxisId={yAxisId} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />;
        }
      });
    } else if (isBar) {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} name={formatKey(key)} dataKey={key} fill={COLORS[index % COLORS.length]} stackId={isStacked ? "a" : undefined} radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
      ));
    } else if (isLine) {
      ChartComponent = LineChart;
      children = dataKeys.map((key, index) => (
        <Line key={key} name={formatKey(key)} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ));
    } else if (isArea) {
      ChartComponent = AreaChart;
      children = dataKeys.map((key, index) => (
        <Area key={key} name={formatKey(key)} type="monotone" dataKey={key} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} stackId={isStacked ? "a" : undefined} />
      ));
    } else {
      ChartComponent = BarChart;
      children = dataKeys.map((key, index) => (
        <Bar key={key} name={formatKey(key)} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
      ));
    }

    return (
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {!hideTitle && <h3 className="text-xl font-semibold text-slate-800 mb-6">{chart_title}</h3>}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} stackOffset={stackOffset} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} tickFormatter={(val) => typeof val === 'string' ? formatKey(val) : val} />
              {is100Percent ? (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={(tick) => `${Math.round(tick * 100)}%`} />
              ) : isComposed && hasCount && hasValue ? (
                <>
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={10} />
                </>
              ) : (
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} />
              )}
              <Tooltip content={<CustomTooltip hiddenKeys={hiddenKeys} is100Percent={is100Percent} dataKeys={dataKeys} />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
        {(source || note) && (
          <div className="mt-6 text-sm text-slate-500 space-y-1">
            {source && <p><span className="font-medium">Source:</span> {formatSourceText(source)}</p>}
            {note && <p className="italic">{note}</p>}
          </div>
        )}
      </div>
    );
  };

  if (!regionData || !regionData.pages) return null;

  return (
    <div className="space-y-8">
      {title && (
        <SectionHeader 
          title={title} 
          subtitle={`Regional analysis and insights`}
          category="Regional Overview"
        />
      )}
      {regionData.pages.filter((p: any) => !shouldSkipPage(p)).map((page: any, index: number) => {
        if (page.page_type === 'section_divider') {
          return (
            <div key={index} className="py-16 px-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg border border-slate-700 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white relative z-10 tracking-tight">{page.page_headline}</h2>
              {page.text_blocks && page.text_blocks.length > 1 && (
                <p className="text-slate-300 mt-6 text-xl relative z-10 font-medium">{formatSourceText(page.text_blocks[1])}</p>
              )}
            </div>
          );
        }

        if (page.page_type === 'subsection_divider') {
          return (
            <div key={index} className="py-10 px-8 bg-slate-50 rounded-2xl border-l-4 border-[#183661] shadow-sm flex items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-slate-800">{page.page_headline}</h3>
                {page.text_blocks && page.text_blocks.length > 1 && (
                  <p className="text-slate-500 mt-3 text-lg">{formatSourceText(page.text_blocks[1])}</p>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={index} className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
            {page.page_headline && (
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{page.page_headline}</h2>
            )}
          
          {page.key_insight && (
            <div className="mb-8 p-8 bg-slate-50 rounded-xl border-l-4 border-[#183661] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-16 bg-[#C7B299]/20 rounded-br-full opacity-50 -z-10"></div>
              <svg className="w-8 h-8 text-[#C7B299] mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl text-slate-700 italic leading-relaxed mb-4 relative z-10 whitespace-pre-line">
                "{typeof page.key_insight === 'string' ? page.key_insight : page.key_insight.quote}"
              </p>
              {page.key_insight.quote_author && (
                <div className="flex items-center">
                  <div className="w-8 h-[2px] bg-[#183661] mr-3"></div>
                  <p className="font-semibold text-slate-900">{page.key_insight.quote_author}</p>
                </div>
              )}
            </div>
          )}

          {page.executive_summary && (
            <div className="mb-8">
              {renderTextContent(page.executive_summary)}
            </div>
          )}

          {page.charts && (
            <div className="space-y-8">
              {Object.values(page.charts).map((chart: any, idx) => (
                <div key={idx}>
                  {renderChart(chart, chart.chart_title === page.page_headline)}
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};

const ScrollToTop = ({ isVisible, scrollToTop }: { isVisible: boolean, scrollToTop: () => void }) => {
  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 p-4 bg-[#C7B299] text-white rounded-full shadow-2xl transition-all duration-500 z-[100] hover:bg-[#a89275] hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#C7B299]/50 flex items-center group border border-white/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUp size={28} strokeWidth={3} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 text-sm font-bold whitespace-nowrap uppercase tracking-wider">
        Top
      </span>
    </button>
  );
};

export default function App() {
  // Onboarding states
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    const saved = sessionStorage.getItem('onboarding_completed');
    return saved === 'true';
  });
  const [showWelcome, setShowWelcome] = useState(() => {
    const saved = sessionStorage.getItem('onboarding_completed');
    return saved !== 'true';
  });
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(() => {
    const saved = sessionStorage.getItem('user_preferences');
    return saved ? JSON.parse(saved) : null;
  });

  // Dashboard states
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showPersonalizedDashboard, setShowPersonalizedDashboard] = useState(() => {
    return userPreferences !== null; // Auto-enable if user has preferences
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle onboarding completion
  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setHasCompletedOnboarding(true);
    setShowWelcome(false);
    setShowPersonalizedDashboard(true); // Enable personalized dashboard after onboarding
    sessionStorage.setItem('user_preferences', JSON.stringify(preferences));
    sessionStorage.setItem('onboarding_completed', 'true');
  };

  // Handle skip onboarding
  const handleSkipOnboarding = () => {
    setShowWelcome(false);
    setHasCompletedOnboarding(true);
    setUserPreferences(null); // بدون فیلتر
    sessionStorage.setItem('onboarding_completed', 'true');
    sessionStorage.removeItem('user_preferences');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 100) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    // Scroll to top and reset button when tab changes
    scrollContainerRef.current?.scrollTo(0, 0);
    setShowScrollTop(false);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'global':
        return <UniversalTab data={globalData} title="Global Insights" />;
      case 'us':
        return <UniversalTab data={usData} title="United States" />;
      case 'americas':
        return <UniversalTab data={americasData} title="Americas Region" />;
      case 'europe':
        return <UniversalTab data={europeData} title="Europe Region" />;
      case 'africa':
        return <UniversalTab data={africaData} title="Africa Region" />;
      case 'asia':
        return <UniversalTab data={asiaData} title="Asia Region" />;
      case 'industries':
        return <IndustriesTab setActiveTab={setActiveTab} />;
      case 'financial-services':
        return <FinancialServicesPage setActiveTab={setActiveTab} />;
      case 'methodology':
        return <MethodologyTab />;
      default:
        return <OverviewTab />;
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'us', label: 'US', icon: MapPin },
    { id: 'americas', label: 'Americas', icon: Map },
    { id: 'europe', label: 'Europe', icon: Euro },
    { id: 'africa', label: 'Africa', icon: Sun },
    { id: 'asia', label: 'Asia', icon: Compass },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
  ];

  const activeTabLabel = activeTab === 'industries' 
    ? 'Industries' 
    : activeTab === 'financial-services'
    ? 'Financial Services'
    : TABS.find(tab => tab.id === activeTab)?.label || 'Overview';

  // Show welcome landing page if not completed onboarding
  if (showWelcome && !userPreferences) {
    return <WelcomeLanding onStart={() => setShowWelcome(false)} />;
  }

  // Show onboarding flow if started but not completed
  if (!hasCompletedOnboarding && !showWelcome) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleSkipOnboarding} />;
  }

  // Show personalized dashboard if user has preferences و فعال است
  if (showPersonalizedDashboard && userPreferences) {
    // Determine which report to show based on selected subsector
    let selectedSubsector = userPreferences.subsectors[0];
    let dashboardData = fintechData;
    if (selectedSubsector === 'insurtech') {
      dashboardData = insurtechData;
    } else if (selectedSubsector === 'banking') {
      dashboardData = bankingData;
    }
    return (
      <PersonalizedDashboard
        preferences={userPreferences}
        fintechData={dashboardData}
        onViewFullDashboard={() => setShowPersonalizedDashboard(false)}
      />
    );
  }

  // اگر کاربر روی Personalized View زد و userPreferences نداشت، آنبوردینگ را نمایش بده
  if (showPersonalizedDashboard && !userPreferences) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleSkipOnboarding} />;
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#183661] text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="font-bold text-lg tracking-tight">VC Insights 2026</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:sticky top-0 h-screen z-10
        w-64 bg-[#183661] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
        border-r border-[#C7B299]/20 shadow-2xl md:shadow-none
      `}>
        <div className="p-6 hidden md:block">
          
          <div className="flex items-center gap-3 mb-3">
            <img src={logo} alt="VC Insights Logo" className="w-12 h-12 rounded-full object-cover border-2 border-[#C7B299]" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">VC Insights</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-2 space-y-1.5 overflow-y-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                  ${isActive 
                    ? 'bg-[#C7B299] text-[#183661] shadow-md' 
                    : 'hover:bg-[#2a5080] hover:text-white'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-[#183661]' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-[#C7B299]/20">
          <button
            onClick={() => {
              setActiveTab('industries');
              setIsMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
              ${activeTab === 'industries' 
                ? 'bg-[#C7B299] text-[#183661] shadow-md' 
                : 'hover:bg-[#2a5080] hover:text-white'}
            `}
          >
            <Briefcase size={18} className={activeTab === 'industries' ? 'text-[#183661]' : 'text-slate-400'} />
            <span>Industries</span>
          </button>
        </div>

        <div className="p-6 border-t border-[#C7B299]/20 text-xs text-slate-500">
          <button
            onClick={() => setShowPersonalizedDashboard(!showPersonalizedDashboard)}
            className="w-full px-3 py-2 mb-3 bg-[#C7B299] hover:bg-[#a89275] text-[#183661] rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            {showPersonalizedDashboard ? 'Full Dashboard' : 'Personalized View'}
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('onboarding_completed');
              sessionStorage.removeItem('user_preferences');
              window.location.reload();
            }}
            className="w-full px-3 py-2 mb-3 bg-[#2a5080] hover:bg-[#C7B299] hover:text-[#183661] text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            Reset Onboarding
          </button>
          &copy; 2026 VC Insights
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* Overlay for mobile when menu is open */}
        {isMobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 hidden md:block">
          <h2 className="text-2xl font-semibold text-slate-800">{activeTabLabel}</h2>
        </header>
        
        <div 
          ref={scrollContainerRef} 
          onScroll={handleScroll}
          className="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth"
        >
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>
        <ScrollToTop isVisible={showScrollTop} scrollToTop={scrollToTop} />
        <Chatbot activeTab={activeTab} onNavigate={(tabId) => setActiveTab(tabId)} />
      </main>
    </div>
  );
}
