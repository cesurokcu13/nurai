import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  User, 
  Sparkles, 
  Undo2, 
  Check, 
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { getBadgeStyleForNickname } from '../../utils/nicknameGenerator';

export default function JuzBox({
  assignment,
  juzInfo,
  userProfile,
  onTakeJuz,
  onReleaseJuz,
  onCompleteJuz,
  isActionLoading = false
}) {
  const isAvailable = assignment.status === 'available';
  const isTaken = assignment.status === 'taken';
  const isCompleted = assignment.status === 'completed';

  const isCurrentUserOwner = Boolean(
    userProfile && assignment.user_id && assignment.user_id === userProfile.id
  );

  const isAdmin = userProfile?.role === 'admin';

  // Badge styling for assignee
  const assigneeNickname = assignment.profiles?.color_nickname || (isCurrentUserOwner ? userProfile?.color_nickname : 'Anonim');
  const badgeStyle = getBadgeStyleForNickname(assigneeNickname);

  // Format date helper
  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-200 border-2 min-h-[175px] ${
        isCompleted
          ? 'bg-emerald-50/95 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-500/90 shadow-xs ring-1 ring-emerald-500/20'
          : isTaken
          ? 'bg-amber-50/95 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500 shadow-xs ring-1 ring-amber-400/30'
          : 'bg-white dark:bg-slate-900 border-stone-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md'
      }`}
    >
      {/* Top Header inside Box: Juz Number & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        {/* Juz Number Label */}
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-serif text-sm shrink-0 shadow-2xs ${
              isCompleted
                ? 'bg-emerald-600 text-white'
                : isTaken
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700'
            }`}
          >
            {assignment.juz_number}
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white leading-tight">
              {juzInfo.name || `${assignment.juz_number}. Cüz`}
            </h3>
            <span className="text-[11px] font-mono text-stone-500 dark:text-slate-400">
              {juzInfo.pageRange ? `s. ${juzInfo.pageRange}` : ''}
            </span>
          </div>
        </div>

        {/* State Pill */}
        <div>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Okundu
            </span>
          )}
          {isTaken && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 animate-pulse">
              <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Okunuyor
            </span>
          )}
          {isAvailable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700">
              Boş
            </span>
          )}
        </div>
      </div>

      {/* Middle Content: Surah Range or Reader Badge */}
      <div className="my-2.5 space-y-1.5">
        <p className="text-[11px] text-stone-600 dark:text-slate-400 truncate" title={juzInfo.surahRange}>
          {juzInfo.surahRange || 'Kur\'an-ı Kerim'}
        </p>

        {/* Reader Display when Taken or Completed */}
        {(isTaken || isCompleted) && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold max-w-full border shadow-2xs truncate ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
              title={assigneeNickname}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: badgeStyle.hex }}
              />
              <span className="truncate text-[11px]">
                {assigneeNickname}
              </span>
            </div>

            {isCurrentUserOwner && (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                Siz
              </span>
            )}
          </div>
        )}

        {/* Completion Date */}
        {isCompleted && assignment.completed_at && (
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
            Tamamlandı: {formatDate(assignment.completed_at)}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-2 border-t border-stone-200/50 dark:border-slate-800/80 mt-auto">
        {/* Available State: Take Button */}
        {isAvailable && (
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => onTakeJuz(assignment.juz_number)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 active:scale-98 text-white shadow-2xs transition-all"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Bu Cüzü Al</span>
          </button>
        )}

        {/* Taken State: If Current User's Juz, Show "Okudum" & "Bırak" */}
        {isTaken && isCurrentUserOwner && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => onCompleteJuz(assignment.juz_number)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-2xs transition-all"
              title="Okumayı tamamladım olarak kaydet"
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>Okudum</span>
            </button>

            <button
              type="button"
              disabled={isActionLoading}
              onClick={() => onReleaseJuz(assignment.juz_number)}
              className="py-1.5 px-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title="Bu cüzü bırak / iptal et"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Taken State: Other User's Juz */}
        {isTaken && !isCurrentUserOwner && (
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-400 font-medium">
            <span className="text-[11px]">Şu an okunuyor...</span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => onReleaseJuz(assignment.juz_number)}
                className="text-[10px] text-rose-600 hover:underline"
                title="Yönetici: Cüzü Boşa Çıkar"
              >
                Boşa Çıkar
              </button>
            )}
          </div>
        )}

        {/* Completed State */}
        {isCompleted && (
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="flex items-center gap-1 text-[11px] font-semibold">
              <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              Allah kabul etsin
            </span>
            {(isCurrentUserOwner || isAdmin) && (
              <button
                type="button"
                onClick={() => onReleaseJuz(assignment.juz_number)}
                className="text-[10px] text-stone-400 hover:text-rose-600 dark:hover:text-rose-400"
                title="Geri Al / Düzelt"
              >
                Geri Al
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
