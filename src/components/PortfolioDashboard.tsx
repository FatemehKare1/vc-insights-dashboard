import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Users,
  TrendingUp,
  Award,
  Briefcase,
  Star,
  MapPin,
  Calendar,
  ExternalLink,
  Twitter,
  Linkedin,
  Facebook,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Building2,
  Layers,
  Zap,
  Target,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getSocialIcon = (url: string) => {
  if (url.includes('linkedin')) return <Linkedin size={16} />;
  if (url.includes('twitter') || url.includes('x.com')) return <Twitter size={16} />;
  if (url.includes('facebook')) return <Facebook size={16} />;
  return <Globe size={16} />;
};

const getSocialLabel = (url: string) => {
  if (url.includes('linkedin')) return 'LinkedIn';
  if (url.includes('twitter') || url.includes('x.com')) return 'Twitter / X';
  if (url.includes('facebook')) return 'Facebook';
  return 'Blog / Web';
};

const metricIcon: Record<string, React.ReactNode> = {
  'Team Members': <Users size={20} />,
  'Portfolio Count': <Briefcase size={20} />,
  'Portfolio Unicorns': <Star size={20} />,
  'Portfolio Soonicorns': <TrendingUp size={20} />,
  'Portfolio IPOs': <BarChart3 size={20} />,
  'Portfolio Acquisitions': <Target size={20} />,
  'Deals in last 12 months': <Zap size={20} />,
  'Top Rounds of Entry': <Layers size={20} />,
  'Top Sectors in Portfolio': <Building2 size={20} />,
  'Top Locations in Portfolio': <MapPin size={20} />,
};

const metricColor: Record<string, string> = {
  'Team Members': 'from-blue-500 to-blue-600',
  'Portfolio Count': 'from-violet-500 to-violet-600',
  'Portfolio Unicorns': 'from-amber-500 to-orange-500',
  'Portfolio Soonicorns': 'from-emerald-500 to-teal-500',
  'Portfolio IPOs': 'from-sky-500 to-blue-500',
  'Portfolio Acquisitions': 'from-rose-500 to-pink-500',
  'Deals in last 12 months': 'from-indigo-500 to-purple-500',
  'Top Rounds of Entry': 'from-cyan-500 to-sky-500',
  'Top Sectors in Portfolio': 'from-fuchsia-500 to-pink-500',
  'Top Locations in Portfolio': 'from-green-500 to-emerald-500',
};

const stageBadge = (stage: string) => {
  const map: Record<string, string> = {
    'Seed': 'bg-green-100 text-green-700 border-green-200',
    'Series A': 'bg-blue-100 text-blue-700 border-blue-200',
    'Series B': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Series C': 'bg-violet-100 text-violet-700 border-violet-200',
    'Series D': 'bg-purple-100 text-purple-700 border-purple-200',
    'Series E': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'Public': 'bg-amber-100 text-amber-700 border-amber-200',
    'Acquired': 'bg-rose-100 text-rose-700 border-rose-200',
    'Funding Raised': 'bg-teal-100 text-teal-700 border-teal-200',
  };
  return map[stage] || 'bg-slate-100 text-slate-600 border-slate-200';
};

const ScoreBar = ({ score }: { score: number }) => {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 75 ? '#10b981' : pct >= 55 ? '#3b82f6' : '#f59e0b';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
};

// ─── Section: Hero ────────────────────────────────────────────────────────────

const HeroSection = ({
  investorName,
  basicDetails,
  companyName,
  about,
}: {
  investorName: string;
  basicDetails: any;
  companyName: string;
  about: any;
}) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-500/5 to-violet-500/5 blur-2xl rounded-full" />
      </div>

      <div className="relative z-10 p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Logo / Avatar */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-xl flex-shrink-0">
            {investorName.charAt(0)}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{investorName}</h1>
              {about?.company_details?.website && (
                <a
                  href={about.company_details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full border border-white/20 transition-colors"
                >
                  <ExternalLink size={12} />
                  {companyName}
                </a>
              )}
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {about?.company_details?.website && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-slate-300 text-xs font-medium rounded-lg border border-white/10">
                  <Globe size={12} />
                  {about.company_details.website.replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                </span>
              )}
              {about?.company_details?.social?.map((link: string, i: number) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-white/10 transition-colors"
                >
                  {getSocialIcon(link)}
                  {getSocialLabel(link)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Section: KPI Metrics ────────────────────────────────────────────────────

const MetricsSection = ({ metrics }: { metrics: Record<string, { value: string; details: string }> }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-blue-600" />
        Key Metrics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(metrics).map(([key, val]) => (
          <div
            key={key}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metricColor[key] || 'from-slate-400 to-slate-500'} flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
              {metricIcon[key] || <Award size={20} />}
            </div>
            <p className="text-2xl font-black text-slate-900 leading-none mb-1">{val.value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 leading-tight">{key}</p>
            {val.details && (
              <p className="text-xs text-slate-400 italic leading-snug">{val.details}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Section: Portfolio Leaderboard ──────────────────────────────────────────

const LeaderboardSection = ({ companies }: { companies: any[] }) => {
  const [showAll, setShowAll] = useState(false);
  const [sortKey, setSortKey] = useState<string>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = [...companies].sort((a, b) => {
    const av = typeof a[sortKey] === 'number' ? a[sortKey] : String(a[sortKey] ?? '');
    const bv = typeof b[sortKey] === 'number' ? b[sortKey] : String(b[sortKey] ?? '');
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const displayed = showAll ? sorted : sorted.slice(0, 10);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: string }) =>
    sortKey === k
      ? sortDir === 'asc'
        ? <ChevronUp size={12} className="inline ml-1 text-blue-600" />
        : <ChevronDown size={12} className="inline ml-1 text-blue-600" />
      : <span className="inline ml-1 opacity-0 group-hover:opacity-40 text-slate-400"><ChevronDown size={12} /></span>;

  const cols = [
    { key: 'rank', label: '#', w: 'w-12' },
    { key: 'company_name', label: 'Company', w: 'min-w-[160px]' },
    { key: 'stage', label: 'Stage', w: 'w-36' },
    { key: 'location', label: 'Location', w: 'w-32' },
    { key: 'tracxn_score', label: 'Score', w: 'w-40' },
    { key: 'latest_revenue', label: 'Revenue', w: 'w-28' },
    { key: 'latest_employee_count', label: 'Employees', w: 'w-28' },
    { key: 'investment_status', label: 'Status', w: 'w-24' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Award size={20} className="text-amber-500" />
        Portfolio Leaderboard
        <span className="ml-2 px-2.5 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100">
          {companies.length} companies
        </span>
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {cols.map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`group px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 hover:bg-slate-100 transition-colors select-none ${col.w}`}
                  >
                    {col.label}
                    <SortIcon k={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayed.map((co, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors group/row">
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-400">
                    {co.rank <= 3 ? (
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black text-white ${co.rank === 1 ? 'bg-amber-400' : co.rank === 2 ? 'bg-slate-400' : 'bg-amber-600/70'}`}>
                        {co.rank}
                      </span>
                    ) : (
                      <span className="text-slate-400">#{co.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900 text-sm group-hover/row:text-blue-700 transition-colors">{co.company_name}</div>
                    {co.founded_year && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> est. {co.founded_year}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${stageBadge(co.stage)}`}>
                      {co.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                    {co.location}
                  </td>
                  <td className="px-4 py-3.5 w-40">
                    <ScoreBar score={co.tracxn_score} />
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700">
                    {co.latest_revenue && co.latest_revenue !== '-' ? co.latest_revenue : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">
                    {co.latest_employee_count && co.latest_employee_count !== '-' ? co.latest_employee_count : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${co.investment_status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {co.investment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {companies.length > 10 && (
          <div className="p-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setShowAll(v => !v)}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors"
            >
              {showAll ? (
                <><ChevronUp size={16} /> Show less</>
              ) : (
                <><ChevronDown size={16} /> Show all {companies.length} companies</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Section: Incubator Programs ─────────────────────────────────────────────

const ProgramsSection = ({ programs }: { programs: any[] }) => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? programs : programs.slice(0, 8);

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Layers size={20} className="text-violet-600" />
        Incubator Programs
        <span className="ml-2 px-2.5 py-0.5 bg-violet-50 text-violet-600 text-xs font-bold rounded-full border border-violet-100">
          {programs.length} programs
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayed.map((prog, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-violet-200 transition-all group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {prog.rank}
                  </span>
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-violet-700 transition-colors truncate">
                    {prog.program_name}
                  </h3>
                </div>
                {prog.notable_companies && (
                  <p className="text-xs text-slate-500 italic ml-8">⭐ {prog.notable_companies}</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-3 ml-8">
              <div className="text-center">
                <p className="text-lg font-black text-violet-600">{prog.num_incubated_cos}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Companies</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-emerald-600">{prog.num_funded_cos}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Funded</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-600">{prog.num_batches}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Batches</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {programs.length > 8 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(v => !v)}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-xl transition-colors"
          >
            {showAll ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show all {programs.length} programs</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Section: Incubator Batches ───────────────────────────────────────────────

const BatchesSection = ({ batches }: { batches: any[] }) => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? batches : batches.slice(0, 6);

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Calendar size={20} className="text-sky-600" />
        Incubator Batches
        <span className="ml-2 px-2.5 py-0.5 bg-sky-50 text-sky-600 text-xs font-bold rounded-full border border-sky-100">
          {batches.length} batches
        </span>
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Batch', 'Program', 'Start', 'End', 'Companies', 'Funded', 'Notable'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayed.map((batch, i) => (
                <tr key={i} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 max-w-[180px] truncate" title={batch.batch}>
                    {batch.batch}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[200px] truncate" title={batch.program}>
                    {batch.program !== batch.batch ? batch.program : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {batch.start_date !== '-' && batch.start_date ? batch.start_date : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {batch.end_date !== '-' && batch.end_date ? batch.end_date : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-bold text-sky-600 text-center">{batch.num_incubated_cos}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-emerald-600 text-center">{batch.num_funded_cos}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 italic max-w-[180px] truncate" title={batch.notable_companies}>
                    {batch.notable_companies}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {batches.length > 6 && (
          <div className="p-4 border-t border-slate-100 text-center">
            <button
              onClick={() => setShowAll(v => !v)}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-xl transition-colors"
            >
              {showAll ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show all {batches.length} batches</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Section: Incubated Companies ────────────────────────────────────────────

const IncubatedCompaniesSection = ({ companies }: { companies: any[] }) => {
  const [showAll, setShowAll] = useState(false);
  const [filterSector, setFilterSector] = useState<string>('All');

  const sectors = ['All', ...Array.from(new Set(companies.map(c => c.sector).filter(Boolean)))];
  const filtered = filterSector === 'All' ? companies : companies.filter(c => c.sector === filterSector);
  const displayed = showAll ? filtered : filtered.slice(0, 9);

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Building2 size={20} className="text-emerald-600" />
        Incubated Companies
        <span className="ml-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
          {companies.length} companies
        </span>
      </h2>

      {/* Sector filter */}
      {sectors.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => { setFilterSector(s); setShowAll(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterSector === s
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((co, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors leading-tight">
                  {co.company_name}
                </h3>
                {co.founded_year && co.founded_year !== '-' && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={10} /> {co.founded_year}
                  </p>
                )}
              </div>
              <span className={`ml-2 flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${stageBadge(co.company_stage)}`}>
                {co.company_stage}
              </span>
            </div>

            {/* Description */}
            {co.short_description && (
              <p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1">{co.short_description}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-slate-50">
              {co.sector && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                  <Building2 size={10} /> {co.sector}
                </span>
              )}
              {co.location && co.location !== '-' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg">
                  <MapPin size={10} /> {co.location}
                </span>
              )}
              {co.tracxn_score && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg">
                  <Star size={10} /> {co.tracxn_score}
                </span>
              )}
              {co.latest_revenue && co.latest_revenue !== '-' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                  <TrendingUp size={10} /> {co.latest_revenue}
                </span>
              )}
            </div>

            {/* Program & Batch */}
            {(co.program || co.batch) && (
              <div className="mt-2 pt-2 border-t border-slate-50 text-xs text-slate-400 flex items-center gap-1">
                <BookOpen size={10} className="flex-shrink-0" />
                <span className="truncate">{co.program}{co.batch && co.batch !== 'Unknown' ? ` · ${co.batch}` : ''}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length > 9 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(v => !v)}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
          >
            {showAll ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show all {filtered.length} companies</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface PortfolioDashboardProps {
  investorName: string;
  portfolioData: any[];
  onBack: () => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  investorName,
  portfolioData,
  onBack,
}) => {
  const getSection = (key: string) => portfolioData.find((s: any) => s.section === key)?.data;

  const companyName = getSection('company_name') || '';
  const basicDetails = getSection('company_basic_details') || {};
  const keyMetrics: Record<string, { value: string; details: string }> = getSection('key_metrics') || {};
  const about = getSection('about') || {};
  const leaderboard: any[] = getSection('portfolio_leaderboard') || [];
  const programs: any[] = getSection('incubator_programs') || [];
  const batches: any[] = getSection('incubator_batches') || [];
  const incubatedCompanies: any[] = getSection('incubated_companies') || [];

  // Quick-nav sections
  const sections = [
    { id: 'metrics', label: 'Metrics' },
    { id: 'leaderboard', label: 'Leaderboard' },
    programs.length > 0 ? { id: 'programs', label: 'Programs' } : null,
    batches.length > 0 ? { id: 'batches', label: 'Batches' } : null,
    incubatedCompanies.length > 0 ? { id: 'incubated', label: 'Companies' } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  const scrollTo = (id: string) => {
    document.getElementById(`portfolio-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-sm font-semibold rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="text-sm text-slate-400">
          <span>Financial Services</span>
          <span className="mx-2">›</span>
          <span>Banking</span>
          <span className="mx-2">›</span>
          <span>Investors</span>
          <span className="mx-2">›</span>
          <span className="font-semibold text-slate-700">{investorName}</span>
        </div>
      </div>

      {/* Hero */}
      <HeroSection
        investorName={investorName}
        basicDetails={basicDetails}
        companyName={companyName}
        about={about}
      />

      {/* Quick Nav */}
      <div className="sticky top-0 z-20 -mx-4 px-4 md:-mx-8 md:px-8 py-3 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/70">
        <div className="flex gap-2 overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="flex-shrink-0 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full border border-slate-200 hover:border-blue-300 transition-all whitespace-nowrap"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      {Object.keys(keyMetrics).length > 0 && (
        <div id="portfolio-metrics">
          <MetricsSection metrics={keyMetrics} />
        </div>
      )}

      {/* Portfolio Leaderboard */}
      {leaderboard.length > 0 && (
        <div id="portfolio-leaderboard">
          <LeaderboardSection companies={leaderboard} />
        </div>
      )}

      {/* Incubator Programs */}
      {programs.length > 0 && (
        <div id="portfolio-programs">
          <ProgramsSection programs={programs} />
        </div>
      )}

      {/* Incubator Batches */}
      {batches.length > 0 && (
        <div id="portfolio-batches">
          <BatchesSection batches={batches} />
        </div>
      )}

      {/* Incubated Companies */}
      {incubatedCompanies.length > 0 && (
        <div id="portfolio-incubated">
          <IncubatedCompaniesSection companies={incubatedCompanies} />
        </div>
      )}

      {/* Footer attribution */}
      <div className="flex items-center justify-between py-6 border-t border-slate-200 text-xs text-slate-400">
        <span>Portfolio data powered by Tracxn</span>
        {about?.company_details?.website && (
          <a
            href={about.company_details.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium transition-colors"
          >
            Visit {investorName} <ArrowUpRight size={12} />
          </a>
        )}
      </div>
    </div>
  );
};
