import { useState, useEffect } from 'react';
import { X, Key, Check, Copy, ExternalLink, ShieldCheck, Terminal, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ratesService, HealthCheckResult, MASApiResponse } from '../services/ratesService';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MasApiModal({ isOpen, onClose }: MasApiModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<MASApiResponse | null>(null);
  const [testDate, setTestDate] = useState<string>('2026-10-14');

  useEffect(() => {
    if (isOpen) {
      ratesService.checkApiHealth().then((h) => setHealthStatus(h));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestEndpoint = async () => {
    setIsTesting(true);
    setApiResponse(null);
    try {
      const res = await ratesService.fetchMasExchangeRates(testDate);
      setApiResponse(res);
      const h = await ratesService.checkApiHealth();
      setHealthStatus(h);
    } finally {
      setIsTesting(false);
    }
  };

  const sampleEnvConfig = `# .env
MAS_KEY_ID="your_mas_key_id_here"`;

  const sampleCurl = `curl -X GET \\
  "https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=${testDate}" \\
  -H "KeyId: <MAS_KEY_ID>"`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                MAS API Serverless Integration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monetary Authority of Singapore (MAS) API Catalogue Gateway
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Serverless Connection Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">/api/health Endpoint</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Status: <strong className="text-emerald-700">{healthStatus?.status || 'Active'}</strong>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Ready at root /api/health.ts
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {healthStatus?.mas_configured ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">MAS_KEY_ID Status</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {healthStatus?.mas_configured ? (
                    <strong className="text-emerald-700">Configured in environment</strong>
                  ) : (
                    <strong className="text-amber-600">Awaiting your MAS_KEY_ID</strong>
                  )}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Configure in .env or via header
                </span>
              </div>
            </div>
          </div>

          {/* Endpoint Specification Box */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-4">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>MAS Catalogue Endpoint Configured</span>
            </h4>
            <p className="text-slate-600 leading-relaxed mb-2">
              The serverless function at <code className="bg-rose-100/70 px-1 py-0.5 rounded text-rose-900 font-mono">/api/exchangerates.ts</code> proxies directly to the official MAS API:
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-rose-200/60 font-mono text-[11px] text-slate-800 break-all select-all">
              GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day={testDate}
            </div>
            <div className="mt-2 text-[11px] text-rose-800">
              Required Header: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-rose-200">KeyId: &lt;MAS_KEY_ID&gt;</code> (pulled securely from <code className="font-mono">process.env.MAS_KEY_ID</code>)
            </div>
          </div>

          {/* Live Interactive Test Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-slate-700" />
                <span>Test Live /api/exchangerates Endpoint</span>
              </h4>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-500 font-medium">end_of_day:</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleTestEndpoint}
                  disabled={isTesting}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  <span>{isTesting ? 'Calling API...' : 'Execute Test'}</span>
                </button>
              </div>
            </div>

            {apiResponse && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Response from /api/exchangerates:</span>
                  <span className={`font-mono ${apiResponse.success ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {apiResponse.success ? '200 OK (Live MAS Data)' : 'Awaiting MAS_KEY_ID'}
                  </span>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[10px] font-mono overflow-x-auto max-h-40 leading-relaxed border border-slate-800">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Configuration Steps */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2.5">
              How to add your MAS API Key:
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-slate-600">
              <li className="leading-relaxed">
                Log in to the{' '}
                <a
                  href="https://eservices.mas.gov.sg/apimg-gw"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-600 font-medium hover:underline inline-flex items-center gap-0.5"
                >
                  MAS API Catalogue Portal <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li className="leading-relaxed">
                Copy your <strong>KeyId</strong> from your application subscription.
              </li>
              <li className="leading-relaxed">
                Paste into your project's <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">.env</code> file:
              </li>
            </ol>
            <div className="mt-2 relative">
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] font-mono leading-relaxed border border-slate-800">
                {sampleEnvConfig}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(sampleEnvConfig)}
                className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
