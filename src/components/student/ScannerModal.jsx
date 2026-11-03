import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { 
  Camera, 
  CameraOff, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Keyboard, 
  ShieldCheck, 
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { extractTokenFromInput } from '../../utils/tokenGenerator';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';

export default function ScannerModal({ isOpen = true, onClose, onScanned }) {
  const { recordAttendance } = useAttendance();
  const { user } = useAuth();

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { success: bool, message: string, code: string }
  const [useManualMode, setUseManualMode] = useState(false);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Initialize camera scanner
  useEffect(() => {
    if (!isOpen || useManualMode) {
      stopScanner();
      return;
    }

    let isMounted = true;
    const scannerId = 'smartattend-qr-reader';

    const startCamera = async () => {
      try {
        setCameraError(null);
        setScanning(true);

        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: 'environment' }, // Back camera preferred on phones
          config,
          (decodedText) => {
            if (isMounted) {
              handleTokenSubmit(decodedText);
            }
          },
          () => {
            // Scan parse error / waiting for frame
          }
        );
      } catch (err) {
        console.warn('Camera start warning:', err);
        if (isMounted) {
          setScanning(false);
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access in browser settings or enter the code manually.'
              : 'No camera stream detected. Switching to manual token entry mode.'
          );
          setUseManualMode(true);
        }
      }
    };

    // Small delay to allow DOM element to render
    const timer = setTimeout(startCamera, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, useManualMode]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner', e);
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleTokenSubmit = async (rawInput) => {
    const token = extractTokenFromInput(rawInput);
    if (!token) return;

    setProcessing(true);
    setScanResult(null);

    // Stop scanning while verifying
    if (html5QrCodeRef.current?.isScanning) {
      try {
        await html5QrCodeRef.current.pause(true);
      } catch {}
    }

    const result = await recordAttendance(token);
    setProcessing(false);
    setScanResult(result);

    if (result.success) {
      fireCelebration();
      if (onScanned) onScanned(result);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setManualToken('');
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
      } catch {}
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-elevated overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">QR Attendance Scanner</h3>
            <p className="text-xs text-slate-500">Scanning as {user?.full_name} (#{user?.roll_number})</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Success or Error Result Card */}
        {scanResult && (
          <div
            className={`p-5 rounded-2xl border mb-6 text-center animate-in zoom-in-95 ${
              scanResult.success
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3 ${
                scanResult.success
                  ? 'bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/20'
                  : 'bg-rose-100 text-rose-600 shadow-lg shadow-rose-500/20'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>

            <h4 className="text-base font-bold mb-1">
              {scanResult.success ? 'Attendance Verified!' : 'Attendance Rejected'}
            </h4>
            <p className="text-xs text-slate-700 max-w-sm mx-auto leading-relaxed mb-4">
              {scanResult.message}
            </p>

            {scanResult.success ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full text-xs font-semibold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-4 h-4" /> Present & Synced
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleReset}
                className="bg-white"
              >
                Try Another Code
              </Button>
            )}
          </div>
        )}

        {/* Camera Viewfinder (if not in manual mode) */}
        {!useManualMode && !scanResult && (
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square max-w-[320px] mx-auto border-2 border-slate-800 shadow-inner">
            <div id="smartattend-qr-reader" className="w-full h-full" />

            {/* Viewfinder crosshairs and scanning laser animation */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-brand-400/80 rounded-2xl relative shadow-glow">
                {/* Laser animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-brand-400 shadow-[0_0_12px_#3b82f6] animate-scan-laser" />
              </div>
            </div>

            {/* Scanning indicator */}
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-sm border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Align QR inside frame
              </span>
            </div>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && !scanResult && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-4 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{cameraError}</div>
          </div>
        )}

        {/* Toggle between Camera and Manual Code Input */}
        <div className="mt-5 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
          <button
            onClick={() => setUseManualMode(!useManualMode)}
            className="flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            {useManualMode ? (
              <>
                <Camera className="w-3.5 h-3.5" /> Switch to Camera Scanner
              </>
            ) : (
              <>
                <Keyboard className="w-3.5 h-3.5" /> Enter Token Manually
              </>
            )}
          </button>

          <span className="text-[11px] text-slate-400">Roll #{user?.roll_number || '101'}</span>
        </div>

        {/* Manual Code Input Form */}
        {(useManualMode || cameraError) && !scanResult && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTokenSubmit(manualToken);
            }}
            className="mt-4 space-y-3 animate-in fade-in"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter QR Session Token or Link
              </label>
              <input
                type="text"
                placeholder="e.g. SMART-CS301-ACTIVE-QR"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={processing}
              className="w-full"
              icon={ArrowRight}
            >
              Verify & Mark Attendance
            </Button>
          </form>
        )}

        {/* Quick Demo Token Buttons for Instant Testing & Proof */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" /> Hackathon Quick Test Tokens
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleTokenSubmit('SMART-CS301-ACTIVE-QR')}
              className="px-2.5 py-1.5 rounded-xl text-left bg-white border border-slate-200 hover:border-emerald-300 text-[11px] transition-all hover:shadow-subtle group"
            >
              <span className="font-bold text-emerald-700 block group-hover:underline">1. Valid QR</span>
              <span className="text-[10px] text-slate-400 truncate block">Active session</span>
            </button>

            <button
              onClick={() => handleTokenSubmit('SMART-CS301-ACTIVE-QR')}
              className="px-2.5 py-1.5 rounded-xl text-left bg-white border border-slate-200 hover:border-amber-300 text-[11px] transition-all hover:shadow-subtle group"
            >
              <span className="font-bold text-amber-700 block group-hover:underline">2. Duplicate</span>
              <span className="text-[10px] text-slate-400 truncate block">Scan twice test</span>
            </button>

            <button
              onClick={() => handleTokenSubmit('SMART-DBMS-EXPIRED-TOKEN')}
              className="px-2.5 py-1.5 rounded-xl text-left bg-white border border-slate-200 hover:border-rose-300 text-[11px] transition-all hover:shadow-subtle group"
            >
              <span className="font-bold text-rose-700 block group-hover:underline">3. Expired QR</span>
              <span className="text-[10px] text-slate-400 truncate block">Rejection test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
