import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Loader2,
  LogOut,
  UploadCloud,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AuthErrorAlert } from './AuthErrorAlert';

export function CloudPublishBanner() {
  const {
    authReady,
    authUser,
    isCloudAdmin,
    authError,
    cloudSyncStatus,
    publishStatus,
    publishError,
    pendingCount,
    signInAsCloudAdmin,
    signOutCloudAdmin,
    publishPendingNow,
  } = useStore();

  if (!authReady) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
        <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
        <span>Connecting to Shankar Mall live cloud storefront...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {isCloudAdmin ? (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              {publishStatus === 'publishing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs sm:text-sm font-bold text-emerald-950">
                  {publishStatus === 'publishing'
                    ? 'Publishing live updates...'
                    : 'Live Storefront Publishing Active'}
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200/70 text-[11px] font-semibold text-emerald-900">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{cloudSyncStatus === 'live' ? 'Synced Worldwide' : 'Connected'}</span>
                </span>
              </div>
              <p className="text-xs text-emerald-800 truncate mt-0.5">
                Signed in as {authUser?.email}. Any product or stock change is visible to everyone opening the website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pendingCount > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => void publishPendingNow()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Publish {pendingCount} Pending</span>
              </motion.button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => void signOutCloudAdmin()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100/60 text-emerald-900 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <CloudOff className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  Publish Changes to All Visitors
                </p>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[11px] font-semibold">
                    {pendingCount} local {pendingCount === 1 ? 'change' : 'changes'} waiting to publish
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                Connect your store Google account so added products and In Stock / Out of Stock updates publish for everyone opening the website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => void signInAsCloudAdmin()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-xs font-semibold shadow-xs cursor-pointer whitespace-nowrap"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>
                {authUser
                  ? 'Switch Store Google Account'
                  : pendingCount > 0
                  ? `Sign in with Google & Publish (${pendingCount})`
                  : 'Sign in with Google to Publish'}
              </span>
            </motion.button>
          </div>
        </div>
      )}

      {authError && !isCloudAdmin && <AuthErrorAlert authError={authError} />}

      {publishError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words">{publishError}</span>
          </span>
          {isCloudAdmin && (
            <button
              type="button"
              onClick={() => void publishPendingNow()}
              className="px-2.5 py-1 rounded-lg bg-rose-700 text-white font-semibold shrink-0 cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
