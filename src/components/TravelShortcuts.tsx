import { ArrowRight, Plane, Car, ShoppingBag, Laptop, Palmtree, GraduationCap } from 'lucide-react';
import { Currency } from '../data/currencies';
import { ratesService } from '../services/ratesService';

interface TravelShortcutsProps {
  currencies: Currency[];
  onApplyPreset: (code: string, amount: number) => void;
}

export function TravelShortcuts({ currencies, onApplyPreset }: TravelShortcutsProps) {
  const getCurrency = (code: string) => currencies.find((c) => c.code === code);

  const presets = [
    {
      title: 'Causeway / Johor Bahru',
      code: 'MYR',
      amount: 150,
      icon: Car,
      tag: 'Weekend Grocery & Dining',
      desc: 'Cross-border travel via Woodlands & Tuas checkpoints',
    },
    {
      title: 'Tokyo / Japan Holiday',
      code: 'JPY',
      amount: 3000,
      icon: Plane,
      tag: 'Vacation & Shopping',
      desc: 'Autumn foliage, skiing & Tokyo electronics',
    },
    {
      title: 'Bangkok Weekend',
      code: 'THB',
      amount: 600,
      icon: ShoppingBag,
      tag: 'Chatuchak & Food',
      desc: 'Direct short-haul flights from Changi Terminal 4',
    },
    {
      title: 'US Tech & SaaS Subscriptions',
      code: 'USD',
      amount: 250,
      icon: Laptop,
      tag: 'Cloud & E-Commerce',
      desc: 'AWS, Apple, Netflix & online purchases',
    },
    {
      title: 'Batam / Bintan Ferry',
      code: 'IDR',
      amount: 250,
      icon: Palmtree,
      tag: 'Spa & Seafood Retreat',
      desc: 'HarbourFront & Tanah Merah ferry terminals',
    },
    {
      title: 'Australia & Study Overseas',
      code: 'AUD',
      amount: 2500,
      icon: GraduationCap,
      tag: 'Perth / Melbourne Travel',
      desc: 'Tuition remittance and holiday road trips',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Popular Singapore Travel & Remittance Presets
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            One-tap quick conversions for frequent Singapore outbound corridors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset) => {
          const cur = getCurrency(preset.code);
          if (!cur) return null;
          const converted = preset.amount * cur.sgdRate;
          const Icon = preset.icon;

          return (
            <button
              key={preset.title}
              type="button"
              onClick={() => onApplyPreset(preset.code, preset.amount)}
              className="text-left p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-rose-300 hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl select-none">{cur.flag}</span>
                    <span className="text-xs font-bold text-slate-900">{preset.title}</span>
                  </div>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{preset.desc}</div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-mono">S${preset.amount.toLocaleString()} yields:</span>
                  <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    {cur.symbol} {ratesService.formatAmount(converted, cur.sgdRate > 100 ? 0 : 2)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Calculate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
