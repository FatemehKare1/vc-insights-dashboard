import React, { useMemo } from 'react';
import { UserPreferences } from './OnboardingFlow';
import { Sparkles, ArrowRight, TrendingUp, DollarSign, BarChart3, Activity, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface PersonalizedDashboardProps {
  preferences: UserPreferences;
  fintechData: any;
  onViewFullDashboard: () => void;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  preferences,
  fintechData,
  onViewFullDashboard,
}) => {
  // Filter pages based on user preferences
  const filteredPages = useMemo(() => {
    if (!fintechData?.pages) return [];

    // If segments exist (Fintech), filter by segments
    if (preferences.segments && preferences.segments.length > 0) {
      return fintechData.pages.filter((page: any) => {
        // ...existing segment filter logic...
        const flattenText = (obj: any): string => {
          if (typeof obj === 'string') return obj;
          if (Array.isArray(obj)) return obj.map(flattenText).join(' ');
          if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).map(flattenText).join(' ');
          }
          return String(obj || '');
        };

        const searchableFields = [
          page.page_headline,
          page.key_insight,
          flattenText(page.verbatim_text),
          page.executive_summary?.text,
          page.leadership_quote?.quote,
          flattenText(page.key_trends),
          flattenText(page.text_blocks),
        ].filter(Boolean);
        
        const searchText = searchableFields.join(' ').toLowerCase();
        const headline = (page.page_headline || '').toLowerCase();

        const keywords: Record<string, string[]> = {
          'digital-assets': [
            'digital asset', 'digital currency', 'crypto', 'cryptocurrency', 'bitcoin', 'ethereum',
            'blockchain', 'stablecoin', 'tokenization', 'tokenized', 'nft', 'web3',
            'defi', 'decentralized finance', 'smart contract', 'genius act', 'mica'
          ],
          'payments': [
            'payment', 'payments', 'transaction', 'remittance', 'cross-border',
            'revolut', 'phonepe', 'ripple', 'rapyd', 'pix', 'transferencias',
            'm-pesa', 'mobile money', 'qr payment', 'instant payment', 'digital wallet',
            'mobile wallet', 'fintech-as-a-service'
          ],
          'insurtech-segment': [
            'insurtech', 'insurance', 'insurer', 'reinsurance', 'underwriting',
            'claims', 'policy', 'actuarial', 'risk assessment', 'insurance tech',
            'health insurance', 'life insurance', 'p&c insurance', 'property insurance',
            'next insurance', 'sapiens', 'wefox', 'federato', 'bowtie', 'kin insurance'
          ],
          'cybersecurity': [
            'cybersecurity', 'cyber security', 'fraud detection', 'fraud prevention',
            'identity', 'authentication', 'id.me', 'feedzai', 'resistant ai',
            'glide identity', 'riskops', 'digital identity', 'identity verification',
            'security', 'data protection', 'encryption'
          ],
          'regtech': [
            'regtech', 'regulatory', 'compliance', 'regulation', 'aml', 'kyc',
            'anti-money laundering', 'know your customer', 'reporting', 'audit',
            'risk management', 'governance', 'appzen', 'treasury', 'finance compliance'
          ],
          'wealthtech': [
            'wealth', 'wealthtech', 'asset management', 'investment', 'portfolio',
            'robo-advisor', 'wealth management', 'financial advisor', 'private banking',
            'investment platform', 'trading', 'brokerage', 'retirement', 'wealthsimple',
            'geowealth', 'money management'
          ],
        };

        return preferences.segments.some(segment => {
          const segmentKeywords = keywords[segment] || [segment.replace('-', ' ')];
          return segmentKeywords.some(keyword => 
            headline.includes(keyword) || searchText.includes(keyword)
          );
        });
      });
    }

    // If subsector is insurtech or banking, show all pages (no segment filtering)

    if (
      preferences.subsectors &&
      preferences.subsectors.length === 1 &&
      (preferences.subsectors[0] === 'insurtech' || preferences.subsectors[0] === 'banking')
    ) {
      // Only include pages with meaningful content
      return fintechData.pages.filter((page: any) => {
        // Exclude pages with only a title or only a contents list
        const hasContent = (
          (page.key_insight && typeof page.key_insight === 'string' && page.key_insight.trim() !== '') ||
          (page.verbatim_text && (
            (typeof page.verbatim_text === 'string' && page.verbatim_text.trim() !== '') ||
            (Array.isArray(page.verbatim_text) && page.verbatim_text.some((t: any) => typeof t === 'string' && t.trim() !== '')) ||
            (typeof page.verbatim_text === 'object' && page.verbatim_text !== null && Object.values(page.verbatim_text).some((v: any) => typeof v === 'string' && v.trim() !== ''))
          )) ||
          (page.executive_summary && page.executive_summary.text && page.executive_summary.text.trim() !== '') ||
          (page.leadership_quote && page.leadership_quote.quote && page.leadership_quote.quote.trim() !== '') ||
          (page.charts && Array.isArray(page.charts) && page.charts.length > 0) ||
          (page.text_blocks && Array.isArray(page.text_blocks) && page.text_blocks.some((t: any) => typeof t === 'string' && t.trim() !== '' && t.trim() !== page.page_headline))
        );
        // Exclude contents/cover pages by type or headline
        const isContentsOrCover = (
          (page.page_type && ["contents_page", "cover_page"].includes(page.page_type)) ||
          (typeof page.page_headline === 'string' && ["contents", "cover page"].includes(page.page_headline.trim().toLowerCase()))
        );
        return hasContent && !isContentsOrCover;
      });
    }

    // Otherwise, nothing matches
    return [];
  }, [preferences, fintechData]);

  // Extract all charts from filtered pages
  const allCharts = useMemo(() => {
    return filteredPages.flatMap((page: any) => 
      (page.charts || []).map((chart: any) => ({
        ...chart,
        page_headline: page.page_headline,
        page_number: page.page_number,
      }))
    ).filter((chart: any) => chart.data && Array.isArray(chart.data) && chart.data.length > 0);
  }, [filteredPages]);

  // Extract key insights
  const keyInsights = useMemo(() => {
    const insights: Array<{ insight: string; headline?: string }> = [];

    // 1) Prefer explicit page key_insight, but skip title-like or short placeholders
    filteredPages.forEach((page: any) => {
      const ki = page.key_insight && typeof page.key_insight === 'string' ? page.key_insight.trim() : '';
      if (!ki) return;
      const lower = ki.toLowerCase();
      const isTitleLike = ki.length < 35 || lower.includes('rundown') || lower.includes('tl;dr') || ki === (page.page_headline || '');
      if (!isTitleLike) {
        insights.push({ insight: ki, headline: page.page_headline });
      }
    });

    // 2) Next, use KPI card descriptions (TL;DR style pages)
    filteredPages.forEach((page: any) => {
      if (insights.length >= 5) return;
      if (page.charts && Array.isArray(page.charts)) {
        page.charts.forEach((chart: any) => {
          if (insights.length >= 5) return;
          if (chart.chart_type === 'kpi_cards' && Array.isArray(chart.data)) {
            chart.data.forEach((kpi: any) => {
              if (insights.length >= 5) return;
              const desc = (kpi.description || kpi.additional_description || '').toString().trim();
              if (desc) {
                insights.push({ insight: desc, headline: page.page_headline });
              } else if (kpi.label && kpi.value !== undefined) {
                // Compose analytical sentence from label and value
                let valueStr = kpi.value;
                if (typeof valueStr === 'number') {
                  valueStr = valueStr.toLocaleString();
                }
                let unit = kpi.unit ? ` ${kpi.unit.replace('_', ' ')}` : '';
                let insightSentence = `There are ${valueStr}${unit} ${kpi.label.toLowerCase()} in the banking sector.`;
                insights.push({ insight: insightSentence, headline: page.page_headline });
              }
            });
          }
        });
      }
    });

    // 3) Then, use chart-level analyst_note values
    filteredPages.forEach((page: any) => {
      if (insights.length >= 5) return;
      if (page.charts && Array.isArray(page.charts)) {
        page.charts.forEach((chart: any) => {
          if (insights.length >= 5) return;
          if (chart.analyst_note && typeof chart.analyst_note === 'string' && chart.analyst_note.trim()) {
            insights.push({ insight: chart.analyst_note.trim(), headline: page.page_headline });
          }
        });
      }
    });

    // 4) Finally, use executive summaries or verbatim text as fallback
    filteredPages.forEach((page: any) => {
      if (insights.length >= 5) return;
      if (page.executive_summary && page.executive_summary.text) {
        insights.push({ insight: page.executive_summary.text.trim(), headline: page.page_headline });
      } else if (page.verbatim_text) {
        const vt = typeof page.verbatim_text === 'string' ? page.verbatim_text : Array.isArray(page.verbatim_text) ? page.verbatim_text.join(' ') : JSON.stringify(page.verbatim_text);
        if (vt && vt.trim()) insights.push({ insight: vt.trim().slice(0, 400), headline: page.page_headline });
      }
    });

    // Deduplicate and limit to 5
    const seen = new Set<string>();
    const unique = insights.filter(i => {
      const key = i.insight.slice(0, 200);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, 5);
  }, [filteredPages]);

  // Extract all key trends
  const allKeyTrends = useMemo(() => {
    const trends: string[] = [];
    filteredPages.forEach((page: any) => {
      if (page.key_trends && Array.isArray(page.key_trends)) {
        page.key_trends.forEach((trend: any) => {
          if (typeof trend === 'string') {
            trends.push(trend);
          } else if (typeof trend === 'object' && trend !== null) {
            const trendText = trend.trend || trend.details || '';
            if (trendText) trends.push(trendText);
          }
        });
      }
    });
    return trends.slice(0, 6); // Top 6 trends
  }, [filteredPages]);

  // Get segment name for display
  const getSegmentName = (segmentId: string): string => {
    const names: Record<string, string> = {
      'digital-assets': 'Digital Assets',
      'payments': 'Payments',
      'insurtech-segment': 'Insurtech',
      'cybersecurity': 'Cybersecurity',
      'regtech': 'Regtech',
      'wealthtech': 'Wealthtech',
    };
    return names[segmentId] || segmentId;
  };

  // Get report info
  const reportInfo = fintechData?.report_info;

  // Render chart helper
  const renderChart = (chart: any, index: number) => {
    if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) return null;

    const chartType = chart.suggested_chart_type?.toLowerCase() || chart.chart_type?.toLowerCase() || 'bar';
    const colors = ['#183661', '#C7B299', '#2a5080', '#d4c5ad', '#0f2744', '#a89275'];

    return (
      <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">{chart.chart_title || 'Chart'}</h3>
          {chart.page_headline && (
            <p className="text-sm text-slate-600 mt-1">From: {chart.page_headline}</p>
          )}
          {chart.analyst_note && (
            <div className="mt-3 p-3 bg-[#F5F0E8] rounded-lg border border-[#C7B299]/30">
              <p className="text-xs font-semibold text-[#183661] mb-1">📊 Analyst Note</p>
              <p className="text-sm text-slate-700">{chart.analyst_note}</p>
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartType.includes('bar') || chartType.includes('column') ? (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={Object.keys(chart.data[0])[0]} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              {Object.keys(chart.data[0]).slice(1).map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
              ))}
            </BarChart>
          ) : chartType.includes('line') ? (
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={Object.keys(chart.data[0])[0]} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              {Object.keys(chart.data[0]).slice(1).map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} />
              ))}
            </LineChart>
          ) : chartType.includes('area') ? (
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={Object.keys(chart.data[0])[0]} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              {Object.keys(chart.data[0]).slice(1).map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} fill={colors[i % colors.length]} stroke={colors[i % colors.length]} />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={Object.keys(chart.data[0])[0]} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              {Object.keys(chart.data[0]).slice(1).map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>

        {chart.source && (
          <p className="text-xs text-slate-500 mt-3">Source: {chart.source}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#183661] to-[#2a5080] text-white p-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#C7B299]" />
            <h1 className="text-3xl font-bold">Your Personalized Dashboard</h1>
          </div>
          
          {reportInfo && (
            <div className="text-[#C7B299] text-sm">
              {reportInfo.title} • {reportInfo.organization} • {reportInfo.date_published}
            </div>
          )}

          {/* Preferences Summary */}
          <div className="max-w-7xl mx-auto mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-[#C7B299]/30">
              <h3 className="text-sm font-semibold text-[#C7B299] uppercase tracking-wider mb-3">Your Focus Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {preferences.sectors.length > 0 && (
                <div>
                  <div className="text-xs text-white/70 mb-1">Sectors</div>
                  <div className="flex flex-wrap gap-1">
                    {preferences.sectors.map(s => (
                      <span key={s} className="px-2 py-1 bg-[#C7B299] text-[#183661] rounded-full text-xs font-medium">
                        {s.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {preferences.subsectors.length > 0 && (
                <div>
                  <div className="text-xs text-white/70 mb-1">Subsectors</div>
                  <div className="flex flex-wrap gap-1">
                    {preferences.subsectors.map(s => (
                      <span key={s} className="px-2 py-1 bg-[#C7B299] text-[#183661] rounded-full text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {preferences.segments.length > 0 && (
                <div>
                  <div className="text-xs text-white/70 mb-1">Segments</div>
                  <div className="flex flex-wrap gap-1">
                    {preferences.segments.map(s => (
                      <span key={s} className="px-2 py-1 bg-[#C7B299] text-[#183661] rounded-full text-xs font-medium">
                        {s.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onViewFullDashboard}
            className="mt-4 px-4 py-2 bg-[#C7B299] hover:bg-[#d4c5ad] text-[#183661] rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-2"
          >
            View Full Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {filteredPages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Matching Content Found</h2>
            <p className="text-slate-600 mb-6">
              We couldn't find any content matching your preferences in this report.
            </p>
            <button
              onClick={onViewFullDashboard}
              className="px-6 py-3 bg-[#183661] text-white rounded-lg font-semibold hover:bg-[#2a5080] transition-colors inline-flex items-center gap-2"
            >
              View Full Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#183661] to-[#2a5080] rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-[#C7B299]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Relevant Sections</h3>
                </div>
                <p className="text-4xl font-bold">{filteredPages.length}</p>
                <p className="text-sm text-white/70 mt-1">Pages found matching your interests</p>
              </div>

              <div className="bg-gradient-to-br from-[#C7B299] to-[#a89275] rounded-xl p-6 text-[#183661] shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-6 h-6" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Key Insights</h3>
                </div>
                <p className="text-4xl font-bold">{keyInsights.length}</p>
                <p className="text-sm text-[#183661]/70 mt-1">Critical insights extracted</p>
              </div>

              <div className="bg-gradient-to-br from-[#2a5080] to-[#183661] rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-[#C7B299]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Data Charts</h3>
                </div>
                <p className="text-4xl font-bold">{allCharts.length}</p>
                <p className="text-sm text-white/70 mt-1">Visualizations available</p>
              </div>
            </div>

            {/* Key Insights Section */}
            {keyInsights.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-[#C7B299]" />
                  <h2 className="text-2xl font-bold text-slate-800">Top Insights</h2>
                </div>
                <div className="space-y-4">
                  {keyInsights.map((item, i) => (
                    <div key={i} className="p-4 bg-[#F5F0E8] rounded-xl border border-[#C7B299]/30">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#183661] text-white flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-700 font-medium leading-relaxed">{item.insight}</p>
                          {item.headline && (
                            <p className="text-xs text-slate-500 mt-2">From: {item.headline}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts Section */}
            {allCharts.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-[#C7B299]" />
                  <h2 className="text-2xl font-bold text-slate-800">Data Visualizations</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {allCharts.slice(0, 6).map((chart, i) => renderChart(chart, i))}
                </div>
              </div>
            )}

            {/* Key Trends Section */}
            {allKeyTrends.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-[#C7B299]" />
                  <h2 className="text-2xl font-bold text-slate-800">Key Trends to Watch</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allKeyTrends.map((trend, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F0E8] border border-[#C7B299]/30 hover:shadow-md transition-shadow">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#183661] text-white flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-700 font-medium leading-relaxed">{trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Pages - Only show top 3 */}
            {filteredPages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">Detailed Analysis</h2>
                  <span className="text-sm text-slate-600">Showing top {Math.min(3, filteredPages.length)} sections</span>
                </div>
                <div className="space-y-6">
                  {filteredPages.slice(0, 3).map((page: any, index: number) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow">
                      {page.page_headline && typeof page.page_headline === 'string' && (
                        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-3">
                          {page.page_headline}
                        </h3>
                      )}

                      {page.key_insight && typeof page.key_insight === 'string' && (
                        <div className="mb-4 p-4 bg-[#F5F0E8] rounded-xl border border-[#C7B299]/30">
                          <h4 className="text-xs font-bold text-[#183661] uppercase tracking-wider mb-2">💡 Key Insight</h4>
                          <p className="text-slate-700 font-medium text-sm leading-relaxed">{page.key_insight}</p>
                        </div>
                      )}

                      {/* Verbatim Text - Main Content */}
                      {page.verbatim_text && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">📄 Detailed Overview</h4>
                          <div className="prose prose-sm max-w-none">
                            {typeof page.verbatim_text === 'string' ? (
                              <p className="text-slate-700 leading-relaxed">{page.verbatim_text}</p>
                            ) : Array.isArray(page.verbatim_text) ? (
                              page.verbatim_text.slice(0, 3).map((text: string, i: number) => (
                                <p key={i} className="text-slate-700 leading-relaxed mb-3">{text}</p>
                              ))
                            ) : typeof page.verbatim_text === 'object' && page.verbatim_text !== null ? (
                              Object.entries(page.verbatim_text).slice(0, 3).map(([key, value]: [string, any]) => (
                                <div key={key} className="mb-3">
                                  <h5 className="font-semibold text-slate-800 mb-2 capitalize text-sm">{key.replace(/_/g, ' ')}</h5>
                                  {typeof value === 'string' ? (
                                    <p className="text-slate-700 leading-relaxed">{value}</p>
                                  ) : (
                                    <p className="text-slate-700 leading-relaxed">{JSON.stringify(value)}</p>
                                  )}
                                </div>
                              ))
                            ) : null}
                          </div>
                        </div>
                      )}

                      {/* Executive Summary */}
                      {page.executive_summary?.text && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Executive Summary</h4>
                          <p className="text-slate-700 text-sm leading-relaxed">{page.executive_summary.text}</p>
                        </div>
                      )}

                      {/* Leadership Quote */}
                      {page.leadership_quote && typeof page.leadership_quote === 'object' && page.leadership_quote.quote && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-[#183661]/5 to-[#C7B299]/5 rounded-xl border-l-4 border-[#183661]">
                          <p className="text-slate-700 italic text-sm mb-2">"{page.leadership_quote.quote}"</p>
                          <div className="text-xs">
                            {page.leadership_quote.author && (
                              <div className="font-semibold text-[#183661]">{page.leadership_quote.author}</div>
                            )}
                            {page.leadership_quote.title && (
                              <div className="text-slate-600">{page.leadership_quote.title}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Page Charts */}
                      {page.charts && Array.isArray(page.charts) && page.charts.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">📊 Related Charts</h4>
                          <div className="grid grid-cols-1 gap-4">
                            {page.charts.slice(0, 2).map((chart: any, i: number) => (
                              chart.data && Array.isArray(chart.data) && chart.data.length > 0 && renderChart({...chart, page_headline: page.page_headline}, index * 100 + i)
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Trends from this page */}
                      {page.key_trends && Array.isArray(page.key_trends) && page.key_trends.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">🔥 Trends from this Section</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {page.key_trends.slice(0, 4).map((trend: any, i: number) => (
                              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-[#F5F0E8] border border-[#C7B299]/20">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#183661] text-white flex items-center justify-center text-xs font-bold">
                                  {i + 1}
                                </span>
                                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                                  {typeof trend === 'string' ? trend : typeof trend === 'object' && trend !== null ? (trend.trend || trend.details || JSON.stringify(trend)) : String(trend)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
