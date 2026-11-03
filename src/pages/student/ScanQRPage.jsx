import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScannerModal from '../../components/student/ScannerModal';
import { ArrowLeft, ShieldCheck, QrCode } from 'lucide-react';
import Button from '../../components/common/Button';

export default function ScanQRPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Live Scanner
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Scan Classroom QR
            </h1>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/student/history')}
        >
          My History
        </Button>
      </div>

      {/* Main Scanner Container */}
      <ScannerModal
        isOpen={true}
        onScanned={(res) => {
          // Stay on page to allow viewing confirmation
        }}
      />

      {/* Guidance Note */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle text-xs text-slate-500 leading-relaxed">
        <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Attendance Policy & Anti-Proxy Guidelines
        </div>
        <p>
          QR codes are uniquely signed and expire shortly after classroom projection. 
          Scanning the QR code records your student ID, session token, and timestamp. 
          Sharing tokens or attempting multiple submissions for the same lecture will be rejected automatically.
        </p>
      </div>
    </div>
  );
}
