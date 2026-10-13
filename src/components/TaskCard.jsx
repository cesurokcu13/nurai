import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Circle, 
  Pencil, 
  Trash2, 
  Check, 
  UserCheck, 
  AlertTriangle, 
  X, 
  Sparkles,
  User
} from 'lucide-react';
import { getMatchedRealName, setMatchedRealName } from '../utils/userRealName';

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

  // Real Name Input Modal State
  const [nameModal, setNameModal] = useState({
    isOpen: false,
    subtask: null,
    nameInput: '',
    error: ''
  });

  const isAdmin = userProfile?.role === 'admin';
  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.is_completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (task.status === 'done' ? 100 : 0);
  const isDone = task.status === 'done' || (totalCount > 0 && completedCount === totalCount);

  // When user clicks to complete a subtask -> ask for real name
  const handleInitiateCompletion = (subtask) => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    const savedRealName = getMatchedRealName() || '';

    setNameModal({
      isOpen: true,
      subtask,
      nameInput: savedRealName,
      error: ''
    });
  };

  // Submit real name and mark subtask as completed
  const handleConfirmCompletion = async (e) => {
    e.preventDefault();
    const trimmed = nameModal.nameInput.trim();

    if (!trimmed) {
      setNameModal((prev) => ({ ...prev, error: 'Lütfen adınızı ve soyadınızı giriniz.' }));
      return;
    }

    // Save real name for convenient prefill in future subtasks
    try {
      setMatchedRealName(null, trimmed);
    } catch {}

    const targetSubtask = nameModal.subtask;
    setNameModal({ isOpen: false, subtask: null, nameInput: '', error: '' });

    if (!targetSubtask) return;

    try {
      setLoadingSubtaskId(targetSubtask.id);
      await onToggleSubtask({
        subtaskId: targetSubtask.id,
        taskId: task.id,
        isCompleted: true,
        realName: trimmed
      });
    } finally {
      setLoadingSubtaskId(null);
    }
  };

  // Revert / uncomplete subtask
  const handleUndoCompletion = async (subtask) => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    try {
      setLoadingSubtaskId(subtask.id);
      await onToggleSubtask({
        subtaskId: subtask.id,
        taskId: task.id,
        isCompleted: false,
        realName: null
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
      <div className="mt-4 space-y-2.5">
        {subtasks.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-slate-500 italic">
            Bu görev için alt görev tanımlanmamış.
          </p>
        ) : (
          subtasks.map((st) => {
            const isLoading = loadingSubtaskId === st.id;

            return (
              <div
                key={st.id}
                className={`group flex items-center justify-between gap-3 p-3 rounded-2xl border text-xs sm:text-sm transition-all select-none ${
                  st.is_completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/40 text-stone-500 dark:text-slate-400'
                    : 'bg-stone-50/80 dark:bg-slate-800/60 border-stone-200/90 dark:border-slate-700/60 text-stone-800 dark:text-slate-200 hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-800 shadow-2xs'
                }`}
              >
                {/* Left Side: Tik / Checkbox ve Başlık */}
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    if (isLoading) return;
                    if (st.is_completed) {
                      handleUndoCompletion(st);
                    } else {
                      handleInitiateCompletion(st);
                    }
                  }}
                  title={st.is_completed ? 'Tamamlanma durumunu geri al' : 'Görevi tamamlamak için tıklayın'}
                >
                  {/* Belirgin Tik / Checkbox Alanı */}
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center border-2 transition-all shrink-0 shadow-2xs ${
                    st.is_completed
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-emerald-500 group-hover:bg-emerald-50/80 dark:group-hover:bg-emerald-950/50'
                  } ${isLoading ? 'opacity-50 animate-pulse' : ''}`}>
                    {st.is_completed ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <Check className="h-4 w-4 text-emerald-600 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all stroke-[2.5]" />
                    )}
                  </div>

                  {/* Alt Görev Başlığı */}
                  <div className="flex-1 min-w-0">
                    <span className={`block font-medium leading-snug ${
                      st.is_completed ? 'line-through text-stone-400 dark:text-slate-500' : 'text-stone-800 dark:text-slate-200'
                    }`}>
                      {st.title}
                    </span>
                  </div>
                </div>

                {/* Right Side: Tamamlama Durumu / Butonu */}
                <div className="shrink-0">
                  {st.is_completed ? (
                    /* Tamamlandı -> Gerçek İsim Göster (Takma Ad Asla Gösterilmez) */
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bold">{st.completed_by_name || 'İsimsiz'}</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">tamamladı</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUndoCompletion(st);
                        }}
                        className="text-[11px] text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 px-1.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Geri al"
                      >
                        Geri Al
                      </button>
                    </div>
                  ) : (
                    /* Tamamlanmadı -> Tıklanacağı Belli Olan Belirgin "Tamamla" Butonu */
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInitiateCompletion(st);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all shadow-2xs group-hover:border-emerald-500 active:scale-95"
                      title="Bu görevi tamamladığınızı belirtmek için tıklayın"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Tamamla</span>
                    </button>
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

      {/* Real Name Input Modal */}
      {nameModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="h-5 w-5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-bold font-serif text-base text-stone-900 dark:text-white leading-tight">
                    Görevi Tamamla
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400 line-clamp-1">
                    {nameModal.subtask?.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNameModal({ isOpen: false, subtask: null, nameInput: '', error: '' })}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 mb-1.5">
                  Gerçek İsminiz:
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={nameModal.nameInput}
                  onChange={(e) => setNameModal((prev) => ({ ...prev, nameInput: e.target.value, error: '' }))}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition"
                />
                <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-1.5">
                  Görev panosunda takma adınız yerine burada yazdığınız gerçek isim görünecektir.
                </p>
                {nameModal.error && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {nameModal.error}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNameModal({ isOpen: false, subtask: null, nameInput: '', error: '' })}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 dark:border-slate-700 text-xs font-semibold text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-800 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Tamamla</span>
                </button>
              </div>
            </form>

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
