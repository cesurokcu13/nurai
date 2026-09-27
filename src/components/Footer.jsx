import React from 'react';
import { BookOpen, ShieldCheck, ExternalLink } from 'lucide-react';
import VecizeCard from './VecizeCard';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-stone-200/80 dark:border-slate-800 bg-[#FAF8F5] dark:bg-slate-950 pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Random Risale-i Nur Vecize Card */}
        <VecizeCard />

        {/* Footer Bottom Links & Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-slate-400 border-t border-stone-200/80 dark:border-slate-800 pt-6">
          <div className="flex items-center gap-2 text-sage-800 dark:text-emerald-400 font-semibold font-serif">
            <BookOpen className="h-4 w-4 text-sage-700 dark:text-emerald-400" />
            <span>Risale-i Nur Birlikte Okuma Halkası</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-stone-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-sage-700 dark:text-emerald-400" /> %100 Anonim & Güvenli
            </span>
            <span>•</span>
            <a
              href="https://sorularlarisale.com/kaynaklar/muhtelif-calismalar/risale-i-nurdan-vecizeler"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sage-800 dark:hover:text-emerald-400 transition flex items-center gap-1 text-stone-500 dark:text-slate-400"
            >
              Kaynak: Sorularla Risale Vecizeler
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-stone-400 dark:text-slate-600">
          Birlikte okuma şevkini ve meşvereti artırmak için tasarlanmıştır.
        </p>

      </div>
    </footer>
  );
}
