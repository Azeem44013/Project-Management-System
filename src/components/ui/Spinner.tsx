import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-5 h-5 animate-spin text-slate-400 ${className}`} />;
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

export function SectionSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner className="w-7 h-7" />
    </div>
  );
}
