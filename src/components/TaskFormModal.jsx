import React, { useState, useEffect } from 'react';
import { X, Star, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

export default function TaskFormModal({ isOpen, onClose, onSave, taskToEdit = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [subtasks, setSubtasks] = useState(['']);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(taskToEdit);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setDifficulty(taskToEdit.difficulty || 1);
      setSubtasks(
        taskToEdit.subtasks && taskToEdit.subtasks.length > 0
          ? taskToEdit.subtasks.map((st) => ({ id: st.id, title: st.title }))
          : []
      );
    } else {
      setTitle('');
      setDescription('');
      setDifficulty(1);
      setSubtasks([]);
    }
    setNewSubtaskInput('');
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    if (e) e.preventDefault();
    const trimmed = newSubtaskInput.trim();
    if (!trimmed) return;
    setSubtasks((prev) => [...prev, { id: null, title: trimmed }]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubtaskChange = (index, value) => {
    setSubtasks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], title: value };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lütfen bir görev başlığı girin.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Collect any pending input in newSubtaskInput
      let currentSubtasks = [...subtasks];
      if (newSubtaskInput.trim()) {
        currentSubtasks.push({ id: null, title: newSubtaskInput.trim() });
      }

      await onSave({
        taskId: taskToEdit?.id,
        title: title.trim(),
        description: description.trim(),
        difficulty,
        subtasks: currentSubtasks.filter((st) => st.title && st.title.trim().length > 0)
      });

      onClose();
    } catch (err) {
      console.error('Görev kaydedilirken hata:', err);
      setError(err.message || 'Görev kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
              {isEditing ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Tüm okuma halkası katılımcıları için ortak görev ve alt adımlar tanımlayın.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Görev Başlığı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Örn: 23. Söz 1. Mebhası Mütalaa Et ve Not Çıkar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 dark:focus:ring-emerald-500"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Açıklama / Notlar <span className="text-stone-400 font-normal lowercase">(isteğe bağlı)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Göreve dair detaylar, tavsiye edilen bölümler veya kaynaklar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-800 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 dark:focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* 5-Star Difficulty Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Zorluk Derecesi (1 - 5 Yıldız)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDifficulty(star)}
                    className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                    title={`${star} Yıldız`}
                  >
                    <Star
                      className={`h-5 w-5 transition-colors ${
                        star <= difficulty
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300 dark:text-slate-600 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1.5 rounded-xl">
                {difficulty === 1 && '⭐ Kolay'}
                {difficulty === 2 && '⭐⭐ Orta-Hafif'}
                {difficulty === 3 && '⭐⭐⭐ Standart'}
                {difficulty === 4 && '⭐⭐⭐⭐ Zorlu'}
                {difficulty === 5 && '⭐⭐⭐⭐⭐ İleri Düzey'}
              </span>
            </div>
          </div>

          {/* Subtasks Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300 uppercase tracking-wider">
                Alt Görevler ({subtasks.length})
              </label>
              <span className="text-[11px] text-stone-500 dark:text-slate-400">
                Kullanıcılar bu maddeleri tek tek tamamlayacaktır
              </span>
            </div>

            {/* Existing Subtasks List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {subtasks.map((st, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-400 dark:text-slate-500 w-5 text-right">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    placeholder="Alt görev adı..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-[#FAF8F5] dark:bg-slate-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition"
                    title="Alt görevi kaldır"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Subtask Input */}
            <div className="flex items-center gap-2 mt-2.5">
              <input
                type="text"
                placeholder="+ Yeni alt görev yazın ve Enter'a basın..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-dashed border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition shrink-0"
              >
                <Plus className="h-4 w-4" /> Ekle
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-300 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sage-700 dark:bg-emerald-600 hover:bg-sage-800 dark:hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Kaydediliyor...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{isEditing ? 'Güncelle' : 'Görevi Yayınla'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
