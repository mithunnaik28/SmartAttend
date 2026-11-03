import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-card">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-100">
          <QrCode className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-base font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The page or attendance session you requested could not be found or may have expired.
        </p>
        <Button
          variant="primary"
          size="md"
          icon={ArrowLeft}
          onClick={() => navigate('/')}
          className="w-full"
        >
          Return to SmartAttend Home
        </Button>
      </div>
    </div>
  );
}
