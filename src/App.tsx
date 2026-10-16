/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { Currency, INITIAL_CURRENCIES } from './data/currencies';
import { ratesService } from './services/ratesService';
import { Header } from './components/Header';
import { CurrencyCalculator } from './components/CurrencyCalculator';
import { CurrencyCard } from './components/CurrencyCard';
import { RatesTable } from './components/RatesTable';
import { HistoricalChartModal } from './components/HistoricalChartModal';
import { TravelShortcuts } from './components/TravelShortcuts';
import { MasApiModal } from './components/MasApiModal';
import { TalkToUs } from './components/TalkToUs';
import {
  Search,
  Star,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowDownUp,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Navigation & view states
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'calculator' | 'talk-to-us'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quoteMode, setQuoteMode] = useState<'standard' | 'inverted' | 'mas'>('standard');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'change_desc' | 'change_asc' | 'code'>('default');

  // Calculator target currency code
  const [calcCurrencyCode, setCalcCurrencyCode] = useState<string>('MYR');

  // Modal states
  const [chartCurrency, setChartCurrency] = useState<Currency | null>(null);
  const [isMasModalOpen, setIsMasModalOpen] = useState<boolean>(false);

  // Ref to calculator container for smooth scrolling
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Load favorites on mount
  useEffect(() => {
    const loaded = ratesService.getFavoriteCodes();
    setFavorites(loaded);
  }, []);

  // Handle toggling favorite
  const handleToggleFavorite = (code: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      ratesService.saveFavoriteCodes(updated);
      return updated;
    });
  };

  // Refresh rates
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await ratesService.fetchLatestRates();
      setCurrencies(result.currencies);
      setLastUpdated(result.lastUpdated);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Switch to calculator with smooth scroll
  const handleSelectForCalculator = (code: string) => {
    setCalcCurrencyCode(code);
    setActiveTab('calculator');
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Apply travel shortcut
  const handleApplyPreset = (code: string, amount: number) => {
    setCalcCurrencyCode(code);
    setActiveTab('calculator');
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filtered and sorted currencies
  const displayedCurrencies = useMemo(() => {
    let list = currencies.filter((c) => {
      // Tab filter
      if (activeTab === 'favorites') {
        if (!favorites.includes(c.code)) return false;
      }

      // Region filter
      if (selectedRegion !== 'all') {
        if (selectedRegion === 'favorites') {
          if (!favorites.includes(c.code)) return false;
        } else if (c.region !== selectedRegion) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCountry = c.country.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesCountry) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'change_desc') {
      list = [...list].sort((a, b) => b.change24h - a.change24h);
    } else if (sortBy === 'change_asc') {
      list = [...list].sort((a, b) => a.change24h - b.change24h);
    } else if (sortBy === 'code') {
      list = [...list].sort((a, b) => a.code.localeCompare(b.code));
    }

    return list;
  }, [currencies, activeTab, selectedRegion, searchQuery, sortBy, favorites]);

  // Market movers calculations
  const topGainer = useMemo(() => {
    return [...currencies].sort((a, b) => b.change24h - a.change24h)[0];
  }, [currencies]);

  const topLoser = useMemo(() => {
    return [...currencies].sort((a, b) => a.change24h - b.change24h)[0];
  }, [currencies]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Header */}
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenMasModal={() => setIsMasModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'calculator' && calculatorRef.current) {
            calculatorRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        favoritesCount={favorites.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'talk-to-us' ? (
          <TalkToUs />
        ) : (
          <>
            {/* Hero Section & Singapore FX Market Overview */}
            <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-md overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Singapore Monetary Authority (MAS) Benchmark Rates</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Singapore Dollar (SGD) Live Exchange Rates
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Track real-time foreign exchange conversions, ASEAN cross-border travel pairs, official MAS quoting conventions, and commercial money changer spreads.
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="relative z-10 mt-6 pt-6 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Base Currency</span>
              <span className="font-bold text-white text-sm">🇸🇬 SGD (S$)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tracked Currencies</span>
              <span className="font-bold text-white text-sm tabular-nums">{currencies.length} Global Pairs</span>
            </div>
            {topGainer && (
              <div>
                <span className="text-slate-400 block text-[11px]">Top 24h Gainer</span>
                <span className="font-bold text-emerald-400 text-sm tabular-nums flex items-center gap-1">
                  <span>{topGainer.flag} {topGainer.code}</span>
                  <span>+{topGainer.change24h.toFixed(2)}%</span>
                </span>
              </div>
            )}
            {topLoser && (
              <div>
                <span className="text-slate-400 block text-[11px]">Top 24h Loser</span>
                <span className="font-bold text-rose-400 text-sm tabular-nums flex items-center gap-1">
                  <span>{topLoser.flag} {topLoser.code}</span>
                  <span>{topLoser.change24h.toFixed(2)}%</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Currency Calculator Anchor Container */}
        <div ref={calculatorRef} className="scroll-mt-20">
          <CurrencyCalculator
            currencies={currencies}
            selectedCode={calcCurrencyCode}
            onSelectCode={setCalcCurrencyCode}
            favorites={favorites}
            onOpenChart={(c) => setChartCurrency(c)}
          />
        </div>

        {/* Travel & Cross-Border Presets Strip */}
        <TravelShortcuts currencies={currencies} onApplyPreset={handleApplyPreset} />

        {/* Rates Explorer Section (Search, Filters, Quoting Modes, Cards/Table) */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>SGD Exchange Rate Directory</span>
                <span className="text-xs font-normal font-mono text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                  {displayedCurrencies.length} results
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch quoting conventions, filter regions, or bookmark favorites for quick access.
              </p>
            </div>

            {/* View Mode & Quote Mode Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Quoting Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs font-medium shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuoteMode('standard')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    quoteMode === 'standard' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Show how many foreign currency units 1 SGD buys"
                >
                  1 SGD =
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteMode('inverted')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    quoteMode === 'inverted' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Show how many SGD 1 foreign unit costs"
                >
                  1 Unit = S$
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteMode('mas')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    quoteMode === 'mas' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Show in official MAS quoting convention (e.g. per 100 units for JPY, THB, IDR)"
                >
                  <Building2 className="w-3 h-3 text-rose-500" />
                  <span>MAS Standard</span>
                </button>
              </div>

              {/* Grid / Table toggle */}
              <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Table View"
                  aria-label="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar & Region Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by currency code (USD, MYR, JPY), country or name..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Region Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedRegion('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedRegion === 'all'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Currencies
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('favorites')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedRegion === 'favorites'
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${selectedRegion === 'favorites' ? 'fill-white' : 'text-amber-500 fill-amber-500'}`} />
                <span>Favorites ({favorites.length})</span>
              </button>
              {['ASEAN', 'Asia-Pacific', 'Europe', 'Americas', 'Middle East'].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 font-medium hover:bg-white focus:outline-none cursor-pointer"
              >
                <option value="default">Default Priority</option>
                <option value="change_desc">24h Gainers (%)</option>
                <option value="change_asc">24h Losers (%)</option>
                <option value="code">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Directory Content: Grid or Table */}
          {displayedCurrencies.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No currencies match your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Try searching with another currency code or clear your filter to view all rates.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRegion('all');
                }}
                className="mt-4 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedCurrencies.map((c) => (
                <CurrencyCard
                  key={c.code}
                  currency={c}
                  isFavorite={favorites.includes(c.code)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectForCalculator={handleSelectForCalculator}
                  onOpenChart={(curr) => setChartCurrency(curr)}
                  quoteMode={quoteMode}
                />
              ))}
            </div>
          ) : (
            <RatesTable
              currencies={displayedCurrencies}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectForCalculator={handleSelectForCalculator}
              onOpenChart={(curr) => setChartCurrency(curr)}
              quoteMode={quoteMode}
            />
          )}
        </div>
      </>
    )}
  </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">SingaRate</span>
            <span>·</span>
            <span>Singapore Exchange Rate Portal</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-center sm:text-right">
            <span>Interbank Benchmark Rates referenced against Monetary Authority of Singapore conventions.</span>
            <button
              type="button"
              onClick={() => setIsMasModalOpen(true)}
              className="text-rose-600 hover:text-rose-700 font-medium underline underline-offset-2 cursor-pointer"
            >
              Developer API Setup
            </button>
          </div>
        </div>
      </footer>

      {/* 30-Day Historical Trend Modal */}
      <HistoricalChartModal
        currency={chartCurrency}
        onClose={() => setChartCurrency(null)}
        onSelectForCalculator={handleSelectForCalculator}
      />

      {/* MAS API Integration Guide Modal */}
      <MasApiModal
        isOpen={isMasModalOpen}
        onClose={() => setIsMasModalOpen(false)}
      />
    </div>
  );
}
