import React, { useState } from 'react';
import { Star, CheckCircle2, Circle, Pencil, Trash2, Check, User, Clock, AlertTriangle } from 'lucide-react';
import { getBadgeStyleForNickname } from '../utils/nicknameGenerator';

export default function TaskCard({
  task,
  userProfile,
  onToggleSubtask,
  onEdit,
  onDelete,
  onOpenAuth
}) {
  const [loadingSubtaskId, setLoadingSubtaskId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = userProfile?.role === 'admin';
  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.is_completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (task.status === 'done' ? 100 : 0);
  const isDone = task.status === 'done' || (totalCount > 0 && completedCount === totalCount);

  const handleSubtaskClick = async (subtask) => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    try {
      setLoadingSubtaskId(subtask.id);
      await onToggleSubtask({
        subtaskId: subtask.id,
        taskId: task.id,
        isCompleted: !subtask.is_completed
      });
    } finally {
      setLoadingSubtaskId(null);
    }
  };

  return (
    <div className={`paper-card relative rounded-2xl p-5 border transition-all duration-200 ${
      isDone
        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 shadow-xs'
        : 'bg-white dark:bg-slate-900 border-stone-200/90 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700 shadow-xs'
    }`}>
      
      {/* Top Header: Difficulty Stars & Admin Actions */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        
        {/* 5-Star Difficulty Display */}
        <div className="flex items-center gap-1" title={`Zorluk Derecesi: ${task.difficulty || 1} / 5`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= (task.difficulty || 1)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-stone-300 dark:text-slate-700'
              }`}
            />
          ))}
          <span className="text-[11px] font-semibold text-stone-500 dark:text-slate-400 ml-1">
            Zorluk: {task.difficulty || 1}/5
          </span>
        </div>

        {/* Top Right: Status Badge & Admin Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isDone ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Tamamlandı
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
              <Circle className="h-3 w-3 text-amber-500 fill-amber-500" /> Devam Ediyor
            </span>
          )}

          {isAdmin && (
            <div className="flex items-center gap-1 ml-1 border-l border-stone-200 dark:border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-sage-700 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition"
                title="Görevi Düzenle"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                title="Görevi Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Title & Description */}
      <h3 className={`text-base sm:text-lg font-bold font-serif leading-snug ${
        isDone ? 'text-stone-700 dark:text-slate-300' : 'text-stone-900 dark:text-white'
      }`}>
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-slate-400 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Subtasks List */}
      <div className="mt-4 space-y-2">
        {subtasks.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-slate-500 italic">
            Bu görev için alt görev tanımlanmamış.
          </p>
        ) : (
          subtasks.map((st) => {
            const completedProfile = st.profiles;
            const badgeStyle = completedProfile
              ? getBadgeStyleForNickname(completedProfile.color_nickname)
              : null;
            const isLoading = loadingSubtaskId === st.id;

            return (
              <div
                key={st.id}
                onClick={() => !isLoading && handleSubtaskClick(st)}
                role="button"
                tabIndex={0}
                className={`group flex items-start gap-3 p-2.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer select-none ${
                  st.is_completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 text-stone-500 dark:text-slate-400'
                    : 'bg-stone-50/70 dark:bg-slate-800/60 border-stone-200/70 dark:border-slate-700/60 text-stone-800 dark:text-slate-200 hover:border-sage-300 dark:hover:border-emerald-500/40 hover:bg-stone-100/60 dark:hover:bg-slate-800'
                }`}
              >
                {/* Custom Checkbox */}
                <div className={`mt-0.5 h-4.5 w-4.5 rounded-md flex items-center justify-center border transition shrink-0 ${
                  st.is_completed
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                    : 'border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-sage-500'
                } ${isLoading ? 'opacity-50 animate-pulse' : ''}`}>
                  {st.is_completed && <Check className="h-3 w-3 stroke-[3]" />}
                </div>

                {/* Subtask Title & Completed By info */}
                <div className="flex-1 min-w-0">
                  <span className={`block font-medium ${
                    st.is_completed ? 'line-through text-stone-500 dark:text-slate-400' : ''
                  }`}>
                    {st.title}
                  </span>

                  {/* Who completed it tag */}
                  {st.is_completed && completedProfile && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}>
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: completedProfile.badge_color || badgeStyle.hex }}
                        ></span>
                        {completedProfile.color_nickname} tamamladı
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Progress Bar Footer */}
      {totalCount > 0 && (
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 mb-1.5">
            <span className="font-medium">İlerleme:</span>
            <span className="font-semibold text-stone-700 dark:text-slate-300">
              {completedCount} / {totalCount} alt görev (%{progressPercent})
            </span>
          </div>
          <div className="h-2 w-full bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isDone
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-sage-500 to-amber-500 dark:from-emerald-500 dark:to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Inline Delete Confirmation Dialog for Admin */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 animate-fadeIn">
          <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-white mb-1">Görevi Silmek İstiyor musunuz?</p>
          <p className="text-xs text-stone-300 mb-4 max-w-xs">
            "{task.title}" ve tüm alt görevleri kalıcı olarak silinecektir.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-stone-700 text-stone-200 text-xs font-semibold hover:bg-stone-600 transition"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(task.id);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
            >
              Evet, Sil
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
