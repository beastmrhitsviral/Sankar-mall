import { useState } from 'react';
import { Check, Copy, ExternalLink, ShieldAlert } from 'lucide-react';
import {
  FIREBASE_AUTH_SETTINGS_URL,
  UNAUTHORIZED_DOMAIN_PREFIX,
} from '../lib/firebase';

interface AuthErrorAlertProps {
  authError: string;
}

export function AuthErrorAlert({ authError }: AuthErrorAlertProps) {
  const [copied, setCopied] = useState(false);

  if (!authError.startsWith(UNAUTHORIZED_DOMAIN_PREFIX)) {
    return (
      <div
        role="alert"
        className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800"
      >
        {authError}
      </div>
    );
  }

  const domain =
    authError.slice(UNAUTHORIZED_DOMAIN_PREFIX.length).trim() ||
    (typeof window !== 'undefined' ? window.location.hostname : 'your-app.vercel.app');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(domain);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback unavailable
    }
  };

  return (
    <div
      role="alert"
      className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2.5"
    >
      <div className="flex items-start gap-2 font-bold text-rose-900">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
        <span>Allow this domain in Firebase to sign in on Vercel</span>
      </div>

      <p className="text-rose-800 leading-relaxed">
        Add <span className="font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-rose-200">{domain}</span> to{' '}
        <strong>Firebase Console → Authentication → Settings → Authorized domains</strong>, then tap Sign in again.
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100/70 text-rose-900 font-semibold cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Domain' : `Copy ${domain}`}</span>
        </button>

        <a
          href={FIREBASE_AUTH_SETTINGS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold"
        >
          <span>Open Firebase Authorized Domains</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
