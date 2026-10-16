import { useState } from 'react';
import { X, Key, Check, Copy, ExternalLink, Code2, ShieldCheck, Terminal } from 'lucide-react';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MasApiModal({ isOpen, onClose }: MasApiModalProps) {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const sampleBackendCode = `// server.ts - MAS API Proxy Route Ready
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const MAS_API_KEY = process.env.MAS_API_KEY || '';
const MAS_RESOURCE_ID = '95932927-c8bc-4e7a-b484-68a66a24edfe'; // Exchange Rates

app.get('/api/mas/rates', async (req, res) => {
  try {
    const url = \`https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=\${MAS_RESOURCE_ID}&limit=30\`;
    const response = await fetch(url, {
      headers: {
        'x-api-key': MAS_API_KEY,
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch MAS rates' });
  }
});`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleBackendCode);
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
                MAS API Integration Guide
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monetary Authority of Singapore (MAS) Developer Portal
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
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4">
            <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Frontend Architecture Ready for MAS API</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              This application has been structured with an decoupled adapter in <code className="bg-rose-100/70 px-1 py-0.5 rounded text-rose-900 font-mono">src/services/ratesService.ts</code>.
              When you obtain your MAS API key, you can configure your backend proxy endpoint without altering any UI components.
            </p>
          </div>

          {/* Steps */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2.5">
              How to connect your MAS API Key:
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-slate-600">
              <li className="leading-relaxed">
                Sign up for free at the{' '}
                <a
                  href="https://eservices.mas.gov.sg/statistics/mas-websites-api-documentation/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-600 font-medium hover:underline inline-flex items-center gap-0.5"
                >
                  MAS Developer Portal <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li className="leading-relaxed">
                Generate an API key under your application profile.
              </li>
              <li className="leading-relaxed">
                Subscribe to the <strong>Exchange Rates dataset (Monthly / Weekly End of Period)</strong>.
              </li>
              <li className="leading-relaxed">
                Save your key in your server environment as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">MAS_API_KEY</code>.
              </li>
            </ol>
          </div>

          {/* Code snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Express Server Proxy Template (Ready to paste)</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {sampleBackendCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
