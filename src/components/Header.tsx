import { RefreshCw, KeyRound, MessageSquare } from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenMasModal: () => void;
  activeTab: 'all' | 'favorites' | 'calculator' | 'talk-to-us';
  onSelectTab: (tab: 'all' | 'favorites' | 'calculator' | 'talk-to-us') => void;
  favoritesCount: number;
}

export function Header({
  lastUpdated,
  isRefreshing,
  onRefresh,
  onOpenMasModal,
  activeTab,
  onSelectTab,
  favoritesCount,
}: HeaderProps) {
  const formattedTime = lastUpdated.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Contract: 3 zones separated by gap-8 */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-bold shadow-xs">
              <span className="text-base font-black tracking-tighter">S$</span>
            </div>
            <a href="#" className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Singa<span className="text-rose-600">Rate</span>
            </a>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onSelectTab('all')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeTab === 'all' ? 'text-rose-600 font-semibold border-b-2 border-rose-600' : ''
              }`}
            >
              All Rates
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('favorites')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'favorites' ? 'text-rose-600 font-semibold border-b-2 border-rose-600' : ''
              }`}
            >
              Favorites
              {favoritesCount > 0 && (
                <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full font-mono">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('calculator')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeTab === 'calculator' ? 'text-rose-600 font-semibold border-b-2 border-rose-600' : ''
              }`}
            >
              SGD Calculator
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('talk-to-us')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'talk-to-us' ? 'text-rose-600 font-semibold border-b-2 border-rose-600' : ''
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Talk to Us</span>
            </button>
            <button
              type="button"
              onClick={onOpenMasModal}
              className="text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>MAS API Guide</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] text-slate-400 font-medium">SGT (UTC+8)</span>
              <span className="text-xs font-mono tabular-nums text-slate-600 font-medium">{formattedTime}</span>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-75 whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Refresh Rates'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
