import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Star, 
  Sparkles, 
  Filter, 
  LogIn, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';
import { tasksService } from '../lib/supabase';

export default function TaskBoard({ userProfile, onOpenAuth }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const isAdmin = userProfile?.role === 'admin';

  // Load tasks from Supabase
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tasksService.fetchTasks();
      setTasks(data || []);
    } catch (err) {
      console.error('Görevler yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle Subtask Toggle (Check / Uncheck)
  const handleToggleSubtask = async ({ subtaskId, taskId, isCompleted }) => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    // Optimistic UI update
    setTasks((prevTasks) => {
      return prevTasks.map((t) => {
        if (t.id !== taskId) return t;

        const updatedSubtasks = (t.subtasks || []).map((st) => {
          if (st.id !== subtaskId) return st;
          return {
            ...st,
            is_completed: isCompleted,
            completed_by: isCompleted ? userProfile.id : null,
            profiles: isCompleted ? userProfile : null
          };
        });

        const allFinished = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.is_completed);

        return {
          ...t,
          status: allFinished ? 'done' : 'todo',
          subtasks: updatedSubtasks
        };
      });
    });

    try {
      await tasksService.toggleSubtask({
        subtaskId,
        taskId,
        isCompleted,
        userId: userProfile.id
      });

      // Check if this action completed the entire task -> fire confetti!
      const currentTask = tasks.find((t) => t.id === taskId);
      if (currentTask && isCompleted) {
        const otherSubtasks = (currentTask.subtasks || []).filter((s) => s.id !== subtaskId);
        const willBeAllDone = otherSubtasks.length > 0 && otherSubtasks.every((s) => s.is_completed);
        if (willBeAllDone) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error('Alt görev güncellenirken hata:', err);
      // Rollback on error
      await loadTasks();
    }
  };

  // Handle Save Task (Create or Edit)
  const handleSaveTask = async ({ taskId, title, description, difficulty, subtasks }) => {
    if (taskId) {
      await tasksService.updateTask(taskId, {
        title,
        description,
        difficulty,
        subtasks
      });
    } else {
      await tasksService.createTask({
        title,
        description,
        difficulty,
        subtaskTitles: subtasks.map((s) => s.title),
        userId: userProfile?.id
      });
    }
    await loadTasks();
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId) => {
    try {
      await tasksService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Görev silinirken hata:', err);
      await loadTasks();
    }
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (difficultyFilter !== 'all' && task.difficulty !== Number(difficultyFilter)) {
        return false;
      }
      return true;
    });
  }, [tasks, difficultyFilter]);

  const todoTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.status !== 'done');
  }, [filteredTasks]);

  const doneTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.status === 'done');
  }, [filteredTasks]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, percentage };
  }, [tasks]);

  return (
    <div className="space-y-6">

      {/* Top Banner / Actions Bar */}
      <div className="paper-card dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-stone-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2.5 rounded-2xl bg-sage-50 dark:bg-emerald-500/10 text-sage-700 dark:text-emerald-400 border border-sage-200/80 dark:border-emerald-500/20">
                <ClipboardList className="h-6 w-6" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-white tracking-tight">
                Ortak Görev Panosu
              </h2>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" /> Yönetici Modu
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400 mt-1 max-w-2xl">
              Halkamız için belirlenen ortak mütalaa, hatim ve okuma vazifeleri. Tamamlanan alt görevler anlık olarak tüm katılımcılar tarafından görülür.
            </p>
          </div>

          {/* Admin "+ Yeni Görev Ekle" Button */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setTaskToEdit(null);
                  setModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sage-700 dark:bg-emerald-600 hover:bg-sage-800 dark:hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-sm hover:shadow active:scale-98"
              >
                <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
                Yeni Görev Ekle
              </button>
            ) : !userProfile ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sage-700 dark:bg-emerald-600 hover:bg-sage-800 dark:hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                Giriş Yaparak Katıl
              </button>
            ) : null}
          </div>

        </div>

        {/* Board KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-stone-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/70 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Toplam Görev
            </span>
            <div className="text-xl font-bold font-serif text-stone-900 dark:text-white mt-1">
              {stats.total}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Yapılacaklar
            </span>
            <div className="text-xl font-bold font-serif text-amber-700 dark:text-amber-400 mt-1">
              {stats.pending}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Tamamlanan
            </span>
            <div className="text-xl font-bold font-serif text-emerald-700 dark:text-emerald-400 mt-1">
              {stats.completed}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-blue-500/10 border border-sky-200/70 dark:border-blue-500/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-800 dark:text-blue-400">
              Tamamlanma Oranı
            </span>
            <div className="text-xl font-bold font-serif text-sky-700 dark:text-blue-400 mt-1">
              %{stats.percentage}
            </div>
          </div>
        </div>

        {/* Filter Bar (Difficulty) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-stone-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-stone-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5" /> Zorluk Filtresi:
            </span>
            <button
              type="button"
              onClick={() => setDifficultyFilter('all')}
              className={`px-3 py-1 rounded-xl font-semibold transition ${
                difficultyFilter === 'all'
                  ? 'bg-sage-700 dark:bg-emerald-600 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200'
              }`}
            >
              Tümü ({tasks.length})
            </button>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setDifficultyFilter(String(star))}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-semibold transition ${
                  difficultyFilter === String(star)
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200'
                }`}
              >
                <span>{star}</span>
                <Star className="h-3 w-3 fill-current" />
              </button>
            ))}
          </div>

          {!userProfile && (
            <div className="text-amber-800 dark:text-amber-400 flex items-center gap-1 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Görev işaretlemek için giriş yapınız.</span>
            </div>
          )}
        </div>

      </div>

      {/* Main Two-Column Board (Yapılacaklar vs Tamamlananlar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Yapılacak Görevler */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-white">
                Yapılacak Vazifeler
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              {todoTasks.length} Görev
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 text-stone-400">
              Görevler yükleniyor...
            </div>
          ) : todoTasks.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-stone-200/80 dark:border-slate-800/80 space-y-2">
              <Sparkles className="h-8 w-8 text-sage-600 dark:text-emerald-400 mx-auto opacity-70" />
              <p className="text-sm font-semibold text-stone-800 dark:text-slate-200">
                Harika! Bekleyen aktif görev bulunmuyor.
              </p>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                {isAdmin ? 'Yukarıdaki butondan yeni bir vazife oluşturabilirsiniz.' : 'Yeni vazifeler eklendiğinde burada listelenecektir.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  userProfile={userProfile}
                  onToggleSubtask={handleToggleSubtask}
                  onEdit={(t) => {
                    setTaskToEdit(t);
                    setModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                  onOpenAuth={onOpenAuth}
                />
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Tamamlanan Görevler */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-white">
                Tamamlanan Vazifeler
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              {doneTasks.length} Görev
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 text-stone-400">
              Yükleniyor...
            </div>
          ) : doneTasks.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-stone-200/80 dark:border-slate-800/80 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-stone-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-stone-700 dark:text-slate-300">
                Henüz tamamlanmış görev yok.
              </p>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Bir karttaki tüm alt görevler bitirildiğinde görev otomatik olarak buraya taşınır.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  userProfile={userProfile}
                  onToggleSubtask={handleToggleSubtask}
                  onEdit={(t) => {
                    setTaskToEdit(t);
                    setModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                  onOpenAuth={onOpenAuth}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Task Create / Edit Modal (Admin Only) */}
      <TaskFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

    </div>
  );
}
