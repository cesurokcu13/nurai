import React from 'react';
import { Heart, Github, BookOpen, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        
        {/* Quote */}
        <div className="max-w-xl mx-auto text-slate-400 text-xs sm:text-sm italic font-serif leading-relaxed">
          &ldquo;Gözünü aç, hakikate bak, amele sarıl, ahireti kazan... Risale-i Nur, Kur'an'ın hakiki bir tefsiridir.&rdquo;
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-2">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <BookOpen className="h-3.5 w-3.5" /> Risale-i Nur Birlikte Okuma Halkası
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> %100 Anonim & Güvenli
          </span>
          <span>•</span>
          <span>GitHub Pages ile Yayınlandı</span>
        </div>

        <p className="text-[11px] text-slate-600">
          Tüm hakları saklıdır © {new Date().getFullYear()} — Birlikte okuma şevkini artırmak için tasarlanmıştır.
        </p>

      </div>
    </footer>
  );
}
