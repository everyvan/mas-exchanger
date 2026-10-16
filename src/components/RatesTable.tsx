import { Currency } from '../data/currencies';
import { ratesService } from '../services/ratesService';
import { Sparkline } from './Sparkline';
import { Star, TrendingUp, TrendingDown, Calculator, LineChart } from 'lucide-react';

interface RatesTableProps {
  currencies: Currency[];
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onSelectForCalculator: (code: string) => void;
  onOpenChart: (currency: Currency) => void;
  quoteMode: 'standard' | 'inverted' | 'mas';
}

export function RatesTable({
  currencies,
  favorites,
  onToggleFavorite,
  onSelectForCalculator,
  onOpenChart,
  quoteMode,
}: RatesTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="w-10 px-3.5 py-3 text-center">Fav</th>
              <th scope="col" className="px-3.5 py-3">Currency</th>
              <th scope="col" className="px-3.5 py-3 text-right">1 SGD =</th>
              <th scope="col" className="px-3.5 py-3 text-right">1 Foreign Unit =</th>
              <th scope="col" className="px-3.5 py-3 text-right">MAS Standard Quote</th>
              <th scope="col" className="px-3.5 py-3 text-right">24h Change</th>
              <th scope="col" className="px-3.5 py-3 text-center w-28">7-Day Trend</th>
              <th scope="col" className="px-3.5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {currencies.map((c) => {
              const isFav = favorites.includes(c.code);
              const isPositive = c.change24h >= 0;
              const inverted = 1 / c.sgdRate;
              const masQuote = c.masUnit === 100 ? (100 / c.sgdRate) : inverted;

              return (
                <tr
                  key={c.code}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Favorite star */}
                  <td className="px-3.5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(c.code)}
                      className="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer text-slate-300 hover:text-amber-500"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </td>

                  {/* Flag & Name */}
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl select-none" role="img" aria-label={c.name}>
                        {c.flag}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{c.code}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">({c.symbol})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{c.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* 1 SGD = Foreign */}
                  <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {c.symbol} {ratesService.formatRate(c.sgdRate)}
                  </td>

                  {/* Inverted: 1 Foreign = SGD */}
                  <td className="px-3.5 py-3 text-right font-mono text-slate-600 tabular-nums">
                    S$ {inverted >= 10 ? inverted.toFixed(2) : inverted.toFixed(4)}
                  </td>

                  {/* MAS Official Quote standard */}
                  <td className="px-3.5 py-3 text-right font-mono text-slate-700 tabular-nums">
                    <span className="font-medium text-slate-900">S$ {masQuote.toFixed(4)}</span>{' '}
                    <span className="text-[10px] text-slate-400">/{c.masUnit}</span>
                  </td>

                  {/* 24h Change */}
                  <td className="px-3.5 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono font-semibold tabular-nums px-1.5 py-0.5 rounded ${
                        isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {c.change24h.toFixed(2)}%
                    </span>
                  </td>

                  {/* 7D Trend Sparkline */}
                  <td className="px-3.5 py-3 text-center">
                    <div className="flex justify-center">
                      <Sparkline data={c.sparkline} isPositive={isPositive} width={70} height={20} />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3.5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectForCalculator(c.code)}
                        className="px-2 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        title="Calculate with this currency"
                      >
                        <Calculator className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Calc</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenChart(c)}
                        className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="View 30-day historical chart"
                      >
                        <LineChart className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
