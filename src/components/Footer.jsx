import React from 'react';
import { BookOpen, ShieldCheck, ExternalLink } from 'lucide-react';
import VecizeCard from './VecizeCard';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950/80 pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Random Risale-i Nur Vecize Card */}
        <VecizeCard />

        {/* Footer Bottom Links & Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <BookOpen className="h-4 w-4" />
            <span>Risale-i Nur Birlikte Okuma Halkası</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> %100 Anonim & Güvenli
            </span>
            <span>•</span>
            <a
              href="https://sorularlarisale.com/kaynaklar/muhtelif-calismalar/risale-i-nurdan-vecizeler"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition flex items-center gap-1 text-slate-400"
            >
              Kaynak: Sorularla Risale Vecizeler
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600">
          Birlikte okuma şevkini ve meşvereti artırmak için tasarlanmıştır.
        </p>

      </div>
    </footer>
  );
}
