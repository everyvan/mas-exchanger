import { Currency } from '../data/currencies';
import { ratesService } from '../services/ratesService';
import { Sparkline } from './Sparkline';
import { Star, TrendingUp, TrendingDown, Calculator, LineChart } from 'lucide-react';

interface CurrencyCardProps {
  currency: Currency;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onSelectForCalculator: (code: string) => void;
  onOpenChart: (currency: Currency) => void;
  quoteMode: 'standard' | 'inverted' | 'mas';
}

export function CurrencyCard({
  currency,
  isFavorite,
  onToggleFavorite,
  onSelectForCalculator,
  onOpenChart,
  quoteMode,
}: CurrencyCardProps) {
  const isPositive = currency.change24h >= 0;
  const invertedRate = 1 / currency.sgdRate;

  // Primary rate display according to selected mode
  const getDisplayRate = () => {
    if (quoteMode === 'inverted') {
      return {
        label: `1 ${currency.code} =`,
        value: `S$ ${invertedRate >= 10 ? invertedRate.toFixed(2) : invertedRate.toFixed(4)}`,
        sub: `1 SGD = ${ratesService.formatRate(currency.sgdRate)} ${currency.code}`,
      };
    }
    if (quoteMode === 'mas') {
      if (currency.masUnit === 100) {
        const per100Sgd = 100 / currency.sgdRate;
        return {
          label: `Per 100 ${currency.code} =`,
          value: `S$ ${per100Sgd.toFixed(4)}`,
          sub: `1 SGD = ${ratesService.formatRate(currency.sgdRate)} ${currency.code}`,
        };
      }
      return {
        label: `Per 1 ${currency.code} =`,
        value: `S$ ${invertedRate.toFixed(4)}`,
        sub: `1 SGD = ${ratesService.formatRate(currency.sgdRate)} ${currency.code}`,
      };
    }
    // Standard mode: 1 SGD = X foreign
    return {
      label: '1 SGD =',
      value: `${currency.symbol} ${ratesService.formatRate(currency.sgdRate)}`,
      sub: `1 ${currency.code} = S$ ${invertedRate.toFixed(4)}`,
    };
  };

  const display = getDisplayRate();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Card Header */}
      <div className="p-4.5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none" role="img" aria-label={currency.name}>
              {currency.flag}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-900 tracking-tight">{currency.code}</span>
                <span className="text-xs text-slate-400 font-mono">· {currency.symbol}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">{currency.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(currency.code);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isFavorite
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={`Favorite ${currency.code}`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Rate & Metric Section */}
        <div className="mt-3.5 flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
              {display.label}
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight tabular-nums mt-0.5">
              {display.value}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {display.sub}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div
              className={`flex items-center gap-1 text-xs font-semibold font-mono tabular-nums px-2 py-0.5 rounded-md ${
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isPositive ? '+' : ''}
                {currency.change24h.toFixed(2)}%
              </span>
            </div>
            <Sparkline data={currency.sparkline} isPositive={isPositive} width={76} height={24} />
          </div>
        </div>

        {/* 24h High & Low range stats */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>L: {ratesService.formatRate(currency.low24h)}</span>
          <span className="text-slate-300">|</span>
          <span>H: {ratesService.formatRate(currency.high24h)}</span>
          {currency.masUnit === 100 && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-rose-600 font-medium">MAS /100</span>
            </>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-4.5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelectForCalculator(currency.code)}
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-slate-500" />
          <span>Convert</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenChart(currency)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>30D Chart</span>
        </button>
      </div>
    </div>
  );
}
