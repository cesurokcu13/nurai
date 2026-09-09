import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw, ExternalLink } from 'lucide-react';

const VECIZELER = [
  {
    text: "Amelinizde rıza-yı İlâhî olmalı. Eğer O razı olsa, bütün dünya küsse ehemmiyeti yok. Eğer O kabul etse, bütün halk reddetse tesiri yok. O rıza olunduktan ve kabul edildikten sonra, isterse insanlara da kabul ettirir, onlar da razı olurlar.",
    source: "Lem'alar, Yirmi Birinci Lem'a (İhlâs Risalesi)"
  },
  {
    text: "Allah için işleyiniz, Allah için görüşünüz, Allah için çalışınız. Lillâh, livechillâh, lieclillâh rızası dairesinde hareket ediniz. O vakit sizin ömrünüzün dakikaları, seneler hükmüne geçer.",
    source: "Lem'alar, Üçüncü Lem'a"
  },
  {
    text: "Bütün kuvvetinizi ihlâsta ve hakta bilmelisiniz. Evet, kuvvet haktadır ve ihlâstadır. Haksızlar dahi, haksızlıkları içinde gösterdikleri ihlâs ve samimiyet yüzünden kuvvet kazanıyorlar.",
    source: "Lem'alar, Yirmi Birinci Lem'a"
  },
  {
    text: "Bu dünyada, hususan uhrevî hizmetlerde en mühim bir esas, en büyük bir kuvvet, en makbul bir şefaatçi, en metin bir nokta-i istinad, en kısa bir tarîk-i hakikat, en makbul bir dua-yı mânevî, en kerametli bir vesile-i makasıd, en yüksek bir haslet, en sâfi bir ubudiyet, ihlâstır.",
    source: "Lem'alar, Yirmi Birinci Lem'a"
  },
  {
    text: "Cenâb-ı Hakkın rızası ihlâs ile kazanılır; kesret-i etbâ’ ile ve fazla muvaffakiyetle değildir.",
    source: "Lem'alar, Yirminci Lem'a"
  },
  {
    text: "Allah namına ver, Allah namına al, Allah namına başla, Allah namına işle, vesselâm.",
    source: "Sözler, Birinci Söz"
  },
  {
    text: "Dost istersen Allah yeter. Evet, O dost ise her şey dosttur.",
    source: "Mektubat, Yirmi Üçüncü Mektup"
  },
  {
    text: "Hakkı tanıyan, hakkın hatırını hiçbir hatıra feda etmez. Zira, hakkın hatırı âlidir; hiçbir hatıra fedâ edilmemek gerektir.",
    source: "Münâzarat"
  },
  {
    text: "Bir zerre ihlâslı amel, batmanlarla hâlis olmayana müreccahtır.",
    source: "Lem'alar, On Yedinci Lem'a"
  },
  {
    text: "İhlâs ve rıza-yı İlâhî yolunda zerre, yıldız gibi olur. Vesilenin mahiyetine bakılmaz, neticesine bakılır. Madem neticesi rıza-yı İlâhîdir ve mayası ihlâstır; o küçük değildir, büyüktür.",
    source: "Lem'alar, Yirminci Lem'a"
  },
  {
    text: "Rıza-yı İlâhî ve iltifat-ı Rahmânî ve kabul-ü Rabbânî öyle bir makamdır ki, insanların teveccühü ve istihsânı, ona nisbeten bir zerre hükmündedir.",
    source: "Mektubat, Yirmi Dokuzuncu Mektup"
  },
  {
    text: "Niyet bir ruhtur. O ruhun ruhu da ihlâstır. Öyleyse, necat, halâs, ancak ihlâs ildedir.",
    source: "Mesnevi-i Nuriye, Katre"
  },
  {
    text: "Bir insan Allah’a hâlis bir abd olursa, Allah’ın mülkü olan kâinat, onun mülkü gibi olur.",
    source: "Mesnevi-i Nuriye, Habbe"
  },
  {
    text: "İbadetin ruhu, ihlâstır. İhlâs ise, yapılan ibadetin yalnız emredildiği için yapılmasıdır.",
    source: "İşarat-ül İ'caz, Bakara Suresi Tefsiri"
  },
  {
    text: "Biz ancak Allah’ı ve rızasını istiyoruz.",
    source: "Şualar, On Birinci Şuâ"
  }
];

export default function VecizeCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Pick a random vecize on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * VECIZELER.length);
    setCurrentIndex(randomIndex);
  }, []);

  const handleNextVecize = () => {
    setFade(false);
    setTimeout(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * VECIZELER.length);
      } while (nextIndex === currentIndex && VECIZELER.length > 1);
      setCurrentIndex(nextIndex);
      setFade(true);
    }, 150);
  };

  const currentVecize = VECIZELER[currentIndex];

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden my-8">
      {/* Ambient background glow */}
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Günün Risale-i Nur Vecizesi
          </h3>
        </div>

        <button
          onClick={handleNextVecize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-amber-500/20 transition active:scale-95"
          title="Farklı bir vecize getir"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Farklı Vecize
        </button>
      </div>

      {/* Vecize Text Box */}
      <div className={`transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <blockquote className="text-base sm:text-lg text-slate-200 font-serif italic leading-relaxed mb-4">
          &ldquo;{currentVecize.text}&rdquo;
        </blockquote>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl self-start">
            — {currentVecize.source}
          </span>

          <a
            href="https://sorularlarisale.com/kaynaklar/muhtelif-calismalar/risale-i-nurdan-vecizeler"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 transition font-medium underline-offset-4 hover:underline"
          >
            Kaynak: Sorularla Risale
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

    </div>
  );
}
