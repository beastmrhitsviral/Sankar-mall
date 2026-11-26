import { useMemo } from 'react';
import { CheckCircle2, ExternalLink, MapPin, Clock, CreditCard } from 'lucide-react';
import { generateQrMatrix } from '../lib/qr';
import {
  buildPhotoListWhatsAppUrl,
  buildStoreWhatsAppUrl,
  formatINR,
} from '../lib/bookingStore';
import { BookingRecord } from '../lib/types';

interface QrPassCardProps {
  booking: BookingRecord;
  onTrackClick?: () => void;
}

export function QrPassCard({ booking, onTrackClick }: QrPassCardProps) {
  const qrPayload = useMemo(
    () => `${booking.id}|${booking.branch}|${booking.phone}`,
    [booking.id, booking.branch, booking.phone]
  );
  const matrix = useMemo(() => generateQrMatrix(qrPayload), [qrPayload]);

  const whatsappHref =
    booking.kind === 'standard'
      ? buildStoreWhatsAppUrl(booking)
      : buildPhotoListWhatsAppUrl(booking);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-[#1E3A8A] text-white px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-blue-100 font-medium">Express Pickup Pass</p>
          <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums mt-0.5">
            {booking.id}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-white/10 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Confirmed</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100">
          <div
            className="bg-white p-3 rounded-lg border border-slate-200 shrink-0"
            aria-label={`QR Code for Booking ${booking.id}`}
          >
            <svg
              width="126"
              height="126"
              viewBox="0 0 21 21"
              shapeRendering="crispEdges"
              className="block"
            >
              <rect width="21" height="21" fill="#FFFFFF" />
              {matrix.map((row, r) =>
                row.map((cell, c) =>
                  cell ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c}
                      y={r}
                      width="1"
                      height="1"
                      fill="#0F172A"
                    />
                  ) : null
                )
              )}
            </svg>
          </div>

          <div className="space-y-2 text-sm text-slate-700 w-full">
            <p className="font-semibold text-slate-900 text-base">{booking.customerName}</p>
            <p className="font-mono text-xs text-slate-500 tabular-nums">+91 {booking.phone}</p>
            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
              <span className="text-slate-800 font-medium">{booking.branch}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>Pickup: {booking.pickupSlot}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{booking.paymentMode}</span>
            </div>
          </div>
        </div>

        {booking.kind === 'standard' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Reserved Items ({booking.items.length})</span>
              <span className="font-mono tabular-nums">
                Total {formatINR(booking.subtotal)}
              </span>
            </div>
            <ul className="divide-y divide-slate-100 max-h-40 overflow-y-auto pr-1">
              {booking.items.map((item) => (
                <li
                  key={`${item.productId}-${item.variant}`}
                  className="py-2 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.variant} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-medium text-slate-900 tabular-nums shrink-0">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            {booking.savings > 0 && (
              <p className="text-xs text-emerald-700 font-medium pt-1">
                Total Member Savings: {formatINR(booking.savings)}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Submitted List Summary</p>
            {booking.listText && (
              <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap font-sans">
                {booking.listText}
              </pre>
            )}
            {booking.photoDataUrl && (
              <p className="text-xs text-[#1E3A8A] font-medium">
                Handwritten list photo attached ({booking.photoFileName || 'list-image'})
              </p>
            )}
          </div>
        )}

        <div className="pt-2 space-y-2.5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm transition-colors"
          >
            <span>Send Booking Pass to Store WhatsApp</span>
            <ExternalLink className="w-4 h-4 shrink-0" />
          </a>
          {onTrackClick && (
            <button
              type="button"
              onClick={onTrackClick}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-50 font-medium text-sm transition-colors"
            >
              View Live Order Tracker
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
