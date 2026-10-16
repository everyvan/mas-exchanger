import { useState, useMemo } from 'react';
import { Currency } from '../data/currencies';
import { ratesService } from '../services/ratesService';
import { ArrowUpDown, Copy, Check, Info, TrendingUp, Sparkles, Building2, CreditCard, WalletCards } from 'lucide-react';

interface CurrencyCalculatorProps {
  currencies: Currency[];
  selectedCode: string;
  onSelectCode: (code: string) => void;
  favorites: string[];
  onOpenChart: (currency: Currency) => void;
}

export function CurrencyCalculator({
  currencies,
  selectedCode,
  onSelectCode,
  favorites,
  onOpenChart,
}: CurrencyCalculatorProps) {
  const [inputAmount, setInputAmount] = useState<string>('1000');
  const [direction, setDirection] = useState<'sgd_to_foreign' | 'foreign_to_sgd'>('sgd_to_foreign');
  const [copied, setCopied] = useState<boolean>(false);
  const [showFeeComparison, setShowFeeComparison] = useState<boolean>(true);

  // Selected foreign currency
  const targetCurrency = useMemo(() => {
    return currencies.find((c) => c.code === selectedCode) || currencies[0];
  }, [currencies, selectedCode]);

  // Numerical value
  const numericAmount = Math.max(0, parseFloat(inputAmount) || 0);

  // Calculated values
  const conversionResult = useMemo(() => {
    if (!targetCurrency) return { output: 0, rateUsed: 1, inverseRate: 1 };
    const rate = targetCurrency.sgdRate;
    const inverse = 1 / rate;

    if (direction === 'sgd_to_foreign') {
      return {
        output: numericAmount * rate,
        rateUsed: rate,
        inverseRate: inverse,
      };
    } else {
      return {
        output: numericAmount / rate,
        rateUsed: inverse,
        inverseRate: rate,
      };
    }
  }, [numericAmount, targetCurrency, direction]);

  const handleQuickAdd = (delta: number) => {
    const current = parseFloat(inputAmount) || 0;
    setInputAmount(String(Math.round(current + delta)));
  };

  const handleSetAmount = (amt: number) => {
    setInputAmount(String(amt));
  };

  const handleFlipDirection = () => {
    setDirection((prev) => (prev === 'sgd_to_foreign' ? 'foreign_to_sgd' : 'sgd_to_foreign'));
  };

  const handleCopy = () => {
    const text = `${ratesService.formatAmount(conversionResult.output)} ${
      direction === 'sgd_to_foreign' ? targetCurrency.code : 'SGD'
    }`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Favorite currencies converted values for multi-comparison
  const favoriteConversions = useMemo(() => {
    const favCurrencies = currencies.filter((c) => favorites.includes(c.code));
    return favCurrencies.map((c) => {
      const converted = direction === 'sgd_to_foreign' 
        ? numericAmount * c.sgdRate 
        : numericAmount / c.sgdRate;
      return {
        ...c,
        convertedAmount: converted,
      };
    });
  }, [currencies, favorites, numericAmount, direction]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner / Card Title */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>SGD Real-Time Currency Calculator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interbank Mid-Market Reference Benchmark · Updated every tick
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenChart(targetCurrency)}
            className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
            <span>30-Day Trend Chart</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Main 2-way conversion inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Input 1 (Source) */}
          <div className="md:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200/80 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/10 transition-all">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {direction === 'sgd_to_foreign' ? 'You Send (Singapore Dollar)' : `You Send (${targetCurrency.name})`}
              </label>
              <span className="text-xs font-mono text-slate-400">
                {direction === 'sgd_to_foreign' ? 'SGD' : targetCurrency.code}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-slate-400 select-none">
                {direction === 'sgd_to_foreign' ? 'S$' : targetCurrency.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl sm:text-3xl font-bold font-mono text-slate-900 bg-transparent focus:outline-none tabular-nums"
              />
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
              {direction === 'sgd_to_foreign' ? (
                <span>🇸🇬 Singapore Dollar (SGD)</span>
              ) : (
                <span>{targetCurrency.flag} {targetCurrency.name}</span>
              )}
            </div>
          </div>

          {/* Direction Switch Button */}
          <div className="md:col-span-2 flex justify-center">
            <button
              type="button"
              onClick={handleFlipDirection}
              aria-label="Switch conversion direction"
              className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="Reverse conversion direction"
            >
              <ArrowUpDown className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* Input 2 (Target Output) */}
          <div className="md:col-span-5 bg-rose-50/50 rounded-xl p-4 border border-rose-200/80 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/10 transition-all">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                {direction === 'sgd_to_foreign' ? `Recipient Gets (${targetCurrency.name})` : 'Recipient Gets (Singapore Dollar)'}
              </label>
              <div className="relative">
                <select
                  value={selectedCode}
                  onChange={(e) => onSelectCode(e.target.value)}
                  className="bg-white border border-rose-200 text-slate-800 font-semibold text-xs rounded-md px-2.5 py-1 pr-6 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer appearance-none"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-rose-400 select-none">
                {direction === 'sgd_to_foreign' ? targetCurrency.symbol : 'S$'}
              </span>
              <div className="w-full text-2xl sm:text-3xl font-bold font-mono text-slate-900 truncate tabular-nums">
                {ratesService.formatAmount(conversionResult.output, targetCurrency.sgdRate > 100 ? 2 : 4)}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-md transition-colors shrink-0 cursor-pointer"
                title="Copy conversion amount"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2 text-xs text-rose-700/80 flex items-center justify-between">
              <span>{direction === 'sgd_to_foreign' ? `${targetCurrency.flag} ${targetCurrency.name}` : '🇸🇬 Singapore Dollar (SGD)'}</span>
              <span className="font-mono text-[11px] font-medium">
                {copied && 'Copied to clipboard!'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-1">Quick Presets:</span>
          {[100, 500, 1000, 2500, 5000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleSetAmount(amt)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer font-mono tabular-nums ${
                numericAmount === amt
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {direction === 'sgd_to_foreign' ? `S$${amt.toLocaleString()}` : `${targetCurrency.code} ${amt.toLocaleString()}`}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
          {[100, 500, 1000].map((step) => (
            <button
              key={`add-${step}`}
              type="button"
              onClick={() => handleQuickAdd(step)}
              className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer font-mono"
            >
              +{step}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setInputAmount('0')}
            className="text-xs px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Currency Benchmark & Official MAS Standard Box */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block mb-0.5">Direct & Inverted Rates:</span>
              <p className="font-mono text-slate-700">
                1 SGD = <strong className="font-bold text-slate-900">{ratesService.formatRate(targetCurrency.sgdRate)} {targetCurrency.code}</strong>
              </p>
              <p className="font-mono text-slate-600 text-[11px] mt-0.5">
                1 {targetCurrency.code} = <span className="font-medium">S$ {(1 / targetCurrency.sgdRate).toFixed(4)}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex items-start gap-3">
            <Building2 className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block mb-0.5">Monetary Authority of Singapore (MAS) Quotation:</span>
              <p className="font-mono text-slate-700">
                {targetCurrency.masUnit === 100 ? (
                  <>
                    MAS Standard: <strong>S$ {((100 / targetCurrency.sgdRate)).toFixed(4)}</strong> per 100 {targetCurrency.code}
                  </>
                ) : (
                  <>
                    MAS Standard: <strong>S$ {((1 / targetCurrency.sgdRate)).toFixed(4)}</strong> per 1 {targetCurrency.code}
                  </>
                )}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Official daily closing interbank benchmark publication format.
              </p>
            </div>
          </div>
        </div>

        {/* Real-World Exchange Comparison (Arcade Money Changer vs Bank Card vs Multi-Currency Card) */}
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <WalletCards className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Singapore Market FX Comparison for {direction === 'sgd_to_foreign' ? `S$${numericAmount.toLocaleString()}` : `${targetCurrency.code} ${numericAmount.toLocaleString()}`}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowFeeComparison(!showFeeComparison)}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
            >
              {showFeeComparison ? 'Hide details' : 'Show details'}
            </button>
          </div>

          {showFeeComparison && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Interbank / Multi-currency Card (YouTrip / Revolut / Trust) */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span>Multi-Currency Cards</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-mono">~0.3% spread</span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {ratesService.formatAmount(
                    direction === 'sgd_to_foreign'
                      ? conversionResult.output * 0.997
                      : conversionResult.output * 1.003
                  )}{' '}
                  <span className="text-xs font-normal text-slate-600">
                    {direction === 'sgd_to_foreign' ? targetCurrency.code : 'SGD'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  YouTrip, Revolut, Trust Bank near spot rate.
                </p>
              </div>

              {/* Option 2: Raffles Place Arcade / People's Park Money Changer */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Cash Money Changer</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">~0.8% spread</span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {ratesService.formatAmount(
                    direction === 'sgd_to_foreign'
                      ? conversionResult.output * 0.992
                      : conversionResult.output * 1.008
                  )}{' '}
                  <span className="text-xs font-normal text-slate-600">
                    {direction === 'sgd_to_foreign' ? targetCurrency.code : 'SGD'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Physical cash changers (The Arcade, Chinatown).
                </p>
              </div>

              {/* Option 3: Traditional Bank Credit Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Bank Credit Card</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-mono">~3.25% fee</span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {ratesService.formatAmount(
                    direction === 'sgd_to_foreign'
                      ? conversionResult.output * 0.9675
                      : conversionResult.output * 1.0325
                  )}{' '}
                  <span className="text-xs font-normal text-slate-600">
                    {direction === 'sgd_to_foreign' ? targetCurrency.code : 'SGD'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard credit card cross-border transaction fee.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Multi-Currency Quick Compare Drawer (Starred favorites) */}
        {favoriteConversions.length > 0 && direction === 'sgd_to_foreign' && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Favorite Currencies Yield for S${ratesService.formatAmount(numericAmount)}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {favoriteConversions.map((fav) => (
                <button
                  key={fav.code}
                  type="button"
                  onClick={() => onSelectCode(fav.code)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    fav.code === targetCurrency.code
                      ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-400'
                      : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span>{fav.flag}</span>
                      <span>{fav.code}</span>
                    </span>
                    <span className={`text-[10px] font-mono ${fav.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fav.change24h >= 0 ? '+' : ''}{fav.change24h}%
                    </span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1 truncate tabular-nums">
                    {ratesService.formatAmount(fav.convertedAmount, fav.sgdRate > 100 ? 2 : 2)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    1 SGD = {ratesService.formatRate(fav.sgdRate)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
