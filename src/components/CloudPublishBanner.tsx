import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Loader2,
  UploadCloud,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function CloudPublishBanner() {
  const {
    cloudSyncStatus,
    publishStatus,
    publishError,
    pendingCount,
    publishPendingNow,
  } = useStore();

  const isPublishing = publishStatus === 'publishing';
  const isConnecting = cloudSyncStatus === 'connecting';

  return (
    <div className="space-y-2.5">
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            {isPublishing || isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs sm:text-sm font-bold text-emerald-950">
                {isPublishing
                  ? 'Publishing live updates...'
                  : isConnecting
                  ? 'Connecting to live cloud storefront...'
                  : 'Live Storefront Sync Active'}
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200/70 text-[11px] font-semibold text-emerald-900">
                <CheckCircle2 className="w-3 h-3" />
                <span>{cloudSyncStatus === 'live' ? 'Synced Worldwide' : 'Connected'}</span>
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              Connected to Firebase Firestore. Any added products, stock toggles, or price edits appear live on every phone.
            </p>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => void publishPendingNow()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Sync {pendingCount} Pending</span>
            </motion.button>
          </div>
        )}
      </div>

      {publishError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words">{publishError}</span>
          </span>
          <button
            type="button"
            onClick={() => void publishPendingNow()}
            className="px-2.5 py-1 rounded-lg bg-rose-700 text-white font-semibold shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
