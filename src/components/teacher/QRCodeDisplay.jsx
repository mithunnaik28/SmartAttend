import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCountdown } from '../../hooks/useCountdown';
import { buildQRContent } from '../../utils/tokenGenerator';
import { 
  Clock, 
  Copy, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  PowerOff,
  Maximize2
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function QRCodeDisplay({
  session,
  onCloseSession,
  isClosing = false,
  onFullscreen
}) {
  const [copied, setCopied] = useState(false);

  const countdown = useCountdown(
    session?.expires_at,
    session?.duration_minutes,
    () => {}
  );

  if (!session) return null;

  const qrUrl = buildQRContent(session.session_token);
  const isInactive = !session.is_active || countdown.isExpired;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.session_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card flex flex-col items-center text-center relative overflow-hidden">
      {/* Top Banner Status */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {session.is_active && !countdown.isExpired ? (
            <Badge variant="success" dot={true}>
              Active Session
            </Badge>
          ) : !session.is_active ? (
            <Badge variant="danger" dot={true}>
              Closed Manually
            </Badge>
          ) : (
            <Badge variant="warning" dot={true}>
              QR Expired
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              title="Classroom Presentation Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Session Title Header */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1 block">
          {session.class_name} • {session.section}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {session.subject}
        </h2>
        {session.description && (
          <p className="text-xs text-slate-500 mt-1 max-w-md">{session.description}</p>
        )}
      </div>

      {/* QR Code Container with Frame */}
      <div className="relative p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-elevated mb-6 group">
        <div className="p-3 bg-white rounded-2xl">
          <QRCodeSVG
            value={qrUrl}
            size={240}
            level="H"
            includeMargin={true}
            className={`transition-all duration-300 ${isInactive ? 'opacity-30 grayscale blur-[1px]' : ''}`}
          />
        </div>

        {/* Overlay when expired or closed */}
        {isInactive && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">QR Code Inactive</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              {!session.is_active ? 'Session ended by teacher' : 'Session duration has expired'}
            </p>
          </div>
        )}
      </div>

      {/* Countdown Timer with Progress bar */}
      <div className="w-full max-w-xs mb-6">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-600" /> Time Remaining:
          </span>
          <span
            className={`font-mono text-base font-bold ${
              countdown.isExpired
                ? 'text-rose-600'
                : countdown.totalRemainingSeconds < 120
                ? 'text-amber-600 animate-pulse'
                : 'text-slate-900'
            }`}
          >
            {countdown.formatted}
          </span>
        </div>

        {/* Linear progress bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              countdown.isExpired
                ? 'bg-rose-500'
                : countdown.totalRemainingSeconds < 120
                ? 'bg-amber-500'
                : 'bg-brand-600'
            }`}
            style={{ width: `${countdown.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Session Token & Manual Code Fallback */}
      <div className="w-full max-w-md bg-slate-50 rounded-2xl border border-slate-200/80 p-3 mb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="text-left overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Session Verification Token
            </div>
            <div className="font-mono text-xs font-semibold text-slate-800 truncate select-all">
              {session.session_token}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors shrink-0"
            title="Copy Token"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
        {session.is_active && !countdown.isExpired && (
          <Button
            variant="danger"
            size="md"
            icon={PowerOff}
            loading={isClosing}
            onClick={() => onCloseSession(session.id)}
            className="w-full sm:w-auto"
          >
            Close Session Now
          </Button>
        )}
      </div>
    </div>
  );
}
