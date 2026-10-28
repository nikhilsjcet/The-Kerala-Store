import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw,
  Key,
  Globe
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  isSupabaseConfigured,
  resetSupabaseClient 
} from '../../lib/supabase';
import { StoreService } from '../../services/storeService';
import { SUPABASE_SCHEMA_SQL } from '../../lib/supabaseSchema';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfigUpdated 
}) => {
  if (!isOpen) return null;

  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'schema' | 'storage'>('connect');

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    saveSupabaseConfig(url, anonKey);
    resetSupabaseClient();

    const res = await StoreService.testSupabase();
    setTestResult(res);
    setTesting(false);
    if (res.ok && onConfigUpdated) {
      onConfigUpdated();
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    resetSupabaseClient();
    setUrl('');
    setAnonKey('');
    setTestResult({ ok: false, message: 'Disconnected from Supabase. Active local fallback data will be used.' });
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0A5C36] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Supabase Integration Manager</h3>
              <p className="text-xs text-gray-500">
                Connect your PostgreSQL database, manage RLS, and sync dropship catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="mt-4 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-gray-800 font-semibold">
                  Supabase Credentials Configured
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-gray-700">
                  Running on <strong className="text-gray-900">Local Interactive State</strong>. Enter credentials below to bind live Supabase.
                </span>
              </>
            )}
          </div>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="text-red-600 hover:underline text-[11px] font-bold"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mt-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'connect'
                ? 'border-[#0A5C36] text-[#0A5C36]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-2 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-[#0A5C36] text-[#0A5C36]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            SQL Database Schema &amp; RLS
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'storage'
                ? 'border-[#0A5C36] text-[#0A5C36]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Image Storage Setup
          </button>
        </div>

        {/* Tab 1: Connect Form */}
        {activeTab === 'connect' && (
          <form onSubmit={handleSaveAndTest} className="mt-4 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-gray-500" /> Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/30 font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Found in your Supabase Dashboard &gt; Project Settings &gt; API
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-gray-500" /> Supabase Anon / Public Key
              </label>
              <textarea
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/30 font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Public anon key with Row Level Security (RLS) protection. Do NOT paste your service_role secret here.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  testResult.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{testResult.message}</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={testing}
                className="flex-1 py-3 bg-[#0A5C36] hover:bg-[#064024] disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>{testing ? 'Testing Connection...' : 'Save & Verify Supabase'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: SQL Schema */}
        {activeTab === 'schema' && (
          <div className="mt-4 flex-1 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Execute this SQL in Supabase SQL Editor to create tables, indexes, and RLS policies:
              </p>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 flex items-center gap-1.5 transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-gray-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 border border-gray-800">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        )}

        {/* Tab 3: Storage Setup */}
        {activeTab === 'storage' && (
          <div className="mt-4 flex-1 overflow-y-auto space-y-3 text-xs text-gray-600">
            <h4 className="font-bold text-gray-900 text-sm">Supabase Storage Configuration</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open your Supabase project dashboard and click on <strong>Storage</strong>.</li>
              <li>Click <strong>New Bucket</strong> and name it <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-bold">product-images</code>.</li>
              <li>Make sure to toggle <strong>Public bucket</strong> to <span className="text-emerald-700 font-bold">ON</span> so product images can be served publicly to storefront shoppers.</li>
              <li>Add an upload policy allowing authenticated admin users to insert and update objects.</li>
            </ol>
            <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-xs">
              <strong>Tip:</strong> TheKeralaStore already supports high-res CDN product images out-of-the-box, and will seamlessly upload new admin images directly to your bucket once configured!
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

