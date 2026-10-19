import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Award, Brush, Check, ChevronRight, CircleHelp, Clock3, Gamepad2, Sparkles, Trophy, UserRound, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import './cleaning-game.css';

const ROOMS = {
  sohbet: { title: 'Sohbet Salonu', emoji: '🛋️', tasks: [['Yeri süpür', 'sweep', 15], ['Kürsü ve sahneyi sil', 'wipe', 20], ['Kitaplıkların tozunu al', 'wipe', 20], ['Balkonu süpür', 'sweep', 15]] },
  cafe: { title: 'Kafe', emoji: '☕', tasks: [['Yeri süpür', 'sweep', 15], ['Masaları sil', 'wipe', 15], ['Pencere önünü sil', 'wipe', 10], ['Balkondaki çay ocağını temizle', 'scrub', 20]] },
  antre: { title: 'Antre', emoji: '🚪', tasks: [['Yeri süpür', 'sweep', 10], ['Ayakkabılığın tozunu al', 'wipe', 10]] },
  abdest: { title: 'Abdesthane', emoji: '💧', tasks: [['Camları ve lavaboları sil', 'wipe', 20], ['Bataryaları parlat', 'polish', 15], ['Havlupan ve çamaşır makinesi dolabını sil', 'wipe', 15], ['Köşeleri temizle', 'scrub', 10]] },
  tuvalet: { title: 'Tuvalet', emoji: '🚽', tasks: [['Klozeti ve lavaboyu ovala', 'scrub', 25], ['Camı silip parlat', 'polish', 15], ['Köşe bucak temizle', 'scrub', 15]] },
  mutfak: { title: 'Mutfak', emoji: '🍵', tasks: [['Tezgâh üzerindeki eşyaları yerlerine kaldır', 'counter', 20], ['Tezgâhı sil ve parlat', 'polish', 20], ['Mutfağı süpür', 'sweep', 15], ['Çay köşesinin 3 rafını düzenle', 'shelves', 25], ['Buzdolabını düzenle', 'fridge', 25], ['Lavabo dolabını kontrol et', 'inspect', 15]] }
};

const CHARACTERS = [
  ['Emir', '🧑🏻‍🦱', 'Sakin'], ['Kerem', '🧔🏻', 'Titiz'], ['Yusuf', '🧑🏽‍🦱', 'Neşeli'], ['Mert', '👨🏻', 'Pratik'], ['Ali', '🧔🏽', 'Düzenli'],
  ['Ömer', '👨🏾‍🦱', 'Güçlü'], ['Hamza', '🧑🏼', 'Dikkatli'], ['Bilal', '🧔🏿', 'Çevik'], ['Selim', '👨🏼‍🦰', 'Sabırlı'], ['Mustafa', '👨🏽', 'Yardımsever']
];

const TIP = { sweep: 'Kir izlerine dokunup süpür.', wipe: 'Yüzeyi parmağınla veya farenle sil.', scrub: 'Dairesel hareketlerle ovalayıp temizle.', polish: 'Yüzeyi parlatana kadar gezdir.', counter: 'Eşyayı seç, sonra doğru gruba yerleştir.', shelves: 'Ürünleri seçip doğru rafa bırak.', fridge: 'Ürünleri seçip doğru bölmeye bırak.', inspect: 'Kontrol listesindeki maddeleri işaretle.' };
const ICONS = { sweep: '🧹', wipe: '🧽', scrub: '🫧', polish: '✨', counter: '📦', shelves: '🫖', fridge: '🥕', inspect: '🔎' };
const GAME_KEY = 'nurai-cleaning-game-v1';
const TOTAL_TASKS = Object.values(ROOMS).reduce((n, room) => n + room.tasks.length, 0);

function readLocal() {
  try { return JSON.parse(localStorage.getItem(GAME_KEY) || '{"players":{}}'); }
  catch { return { players: {} }; }
}

function cleanName(value) { return value.trim().replace(/[<>]/g, '').slice(0, 18); }

export default function CleaningGame({ userProfile, onOpenAuth }) {
  const [roomId, setRoomId] = useState('sohbet');
  const [nickname, setNickname] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [character, setCharacter] = useState(0);
  const [localPlayers, setLocalPlayers] = useState(() => readLocal().players);
  const [remoteRows, setRemoteRows] = useState([]);
  const [remoteReady, setRemoteReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [doneMarks, setDoneMarks] = useState([]);
  const [gameProgress, setGameProgress] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [checks, setChecks] = useState([]);
  const [toast, setToast] = useState('');
  const moveRef = useRef(false);

  useEffect(() => {
    if (userProfile?.id) setNameDraft(userProfile.color_nickname || '');
  }, [userProfile?.id, userProfile?.color_nickname]);

  const localKey = userProfile?.id ? `user:${userProfile.id}` : `guest:${nickname.toLocaleLowerCase('tr-TR')}`;
  const localPlayer = localPlayers[localKey] || { done: [], score: 0, character };
  const localMode = !isSupabaseConfigured || !userProfile?.id || !remoteReady;

  const loadRemote = useCallback(async () => {
    if (!isSupabaseConfigured || !userProfile?.id) { setRemoteReady(false); return; }
    try {
      const { data, error } = await supabase.from('cleaning_game_completions').select('user_id,task_key,nickname,character_index,completed_at');
      if (error) throw error;
      setRemoteRows(data || []);
      setRemoteReady(true);
    } catch (error) {
      console.warn('Ortak temizlik oyunu skorları yüklenemedi; yerel kayıt kullanılacak.', error);
      setRemoteReady(false);
    }
  }, [userProfile?.id]);

  useEffect(() => { loadRemote(); }, [loadRemote]);

  const remoteDone = useMemo(() => remoteRows.filter(row => row.user_id === userProfile?.id).map(row => row.task_key), [remoteRows, userProfile?.id]);
  const playerDone = useMemo(() => {
    if (remoteReady && userProfile?.id) return remoteDone;
    return localPlayer.done || [];
  }, [remoteReady, userProfile?.id, remoteDone, localPlayer.done]);
  const score = useMemo(() => {
    if (remoteReady && userProfile?.id) return remoteRows.filter(row => row.user_id === userProfile.id).reduce((total, row) => total + findPoints(row.task_key), 0);
    return localPlayer.score || 0;
  }, [remoteReady, remoteRows, userProfile?.id, localPlayer.score]);

  const leaderboard = useMemo(() => {
    if (remoteReady) {
      const rows = new Map();
      remoteRows.forEach(row => {
        const current = rows.get(row.user_id) || { name: row.nickname, character: row.character_index || 0, score: 0 };
        current.score += findPoints(row.task_key);
        rows.set(row.user_id, current);
      });
      return [...rows.values()].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'tr')).slice(0, 8);
    }
    return Object.values(localPlayers).filter(p => p.nickname).sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname, 'tr')).slice(0, 8);
  }, [remoteReady, remoteRows, localPlayers]);

  const totalDone = remoteReady && userProfile?.id ? remoteDone.length : (localPlayer.done || []).length;
  const room = ROOMS[roomId];
  const roomDone = room.tasks.filter((_, index) => playerDone.includes(`${roomId}-${index}`)).length;

  function chooseName(event) {
    event.preventDefault();
    const name = cleanName(nameDraft);
    if (!name) return;
    setNickname(name);
    const key = userProfile?.id ? `user:${userProfile.id}` : `guest:${name.toLocaleLowerCase('tr-TR')}`;
    const data = readLocal();
    data.players[key] = { ...(data.players[key] || { done: [], score: 0 }), nickname: name, character };
    localStorage.setItem(GAME_KEY, JSON.stringify(data));
    setLocalPlayers(data.players);
  }

  function startTask(index) {
    if (!nickname) {
      setToast(userProfile?.id ? 'Önce oyun takma adını kaydet.' : 'Önce bir takma ad seç.');
      window.setTimeout(() => setToast(''), 2200);
      return;
    }
    const key = `${roomId}-${index}`;
    if (playerDone.includes(key)) return;
    const [title, mode, points] = room.tasks[index];
    setActiveTask({ key, title, mode, points, roomId, index });
    setGameProgress(0); setSelectedItem(null); setChecks([]); setDoneMarks([]);
  }

  async function finishTask() {
    if (!activeTask || saving) return;
    setSaving(true);
    const completion = { key: activeTask.key, title: activeTask.title, mode: activeTask.mode, points: activeTask.points };
    if (remoteReady && userProfile?.id) {
      const { error } = await supabase.from('cleaning_game_completions').insert({ user_id: userProfile.id, task_key: completion.key, nickname, character_index: character });
      if (error && error.code !== '23505') {
        setSaving(false); setToast('Skor kaydedilemedi. Tekrar deneyebilirsin.'); window.setTimeout(() => setToast(''), 2500); return;
      }
      await loadRemote();
    } else {
      const data = readLocal();
      const key = userProfile?.id ? `user:${userProfile.id}` : `guest:${nickname.toLocaleLowerCase('tr-TR')}`;
      const player = data.players[key] || { nickname, character, done: [], score: 0 };
      if (!player.done.includes(completion.key)) { player.done.push(completion.key); player.score += completion.points; }
      player.nickname = nickname; player.character = character; data.players[key] = player;
      localStorage.setItem(GAME_KEY, JSON.stringify(data)); setLocalPlayers(data.players);
    }
    setSaving(false); setActiveTask(null);
  }

  function markClean(index) {
    setDoneMarks(old => {
      if (old.includes(index)) return old;
      const next = [...old, index]; if (next.length >= 5) setGameProgress(100); return next;
    });
  }

  function placeItem(target) {
    if (!selectedItem) return;
    if (selectedItem.group !== target) {
      setToast('Bu eşya başka bir bölüme ait.'); window.setTimeout(() => setToast(''), 1800); return;
    }
    const next = [...doneMarks, selectedItem.id]; setDoneMarks(next); setSelectedItem(null);
    if (next.length >= selectedItem.total) setGameProgress(100);
  }

  function checkPoint(index) {
    const next = checks.includes(index) ? checks : [...checks, index]; setChecks(next);
    if (next.length >= 4) setGameProgress(100);
  }

  function wipeMove(event) {
    if (!moveRef.current || !activeTask) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const col = Math.max(0, Math.min(9, Math.floor(((event.clientX - rect.left) / rect.width) * 10)));
    const row = Math.max(0, Math.min(5, Math.floor(((event.clientY - rect.top) / rect.height) * 6)));
    setDoneMarks(old => {
      const id = `${col}:${row}`; if (old.includes(id)) return old;
      const next = [...old, id]; const pct = Math.min(100, Math.round(next.length / 36 * 100)); setGameProgress(pct);
      return next;
    });
  }

  return (
    <section className="cleaning-game paper-card dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-slate-800 shadow-sm" aria-labelledby="clean-game-title">
      <div className="clean-game-heading">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-sage-700 dark:text-emerald-400"><Gamepad2 size={16} /> Ortak iyilik oyunu</div>
          <h2 id="clean-game-title" className="mt-2 text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-white">Mekânı birlikte güzelleştirelim</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-slate-400 max-w-2xl">Bir oda seç, mini görevi tamamla ve puanları ekibinle paylaş.</p>
        </div>
        <div className="clean-game-score"><Trophy size={17} /><span><b>{score}</b><small>puan</small></span></div>
      </div>

      <div className="clean-game-account mt-5">
        <form className="clean-game-name" onSubmit={chooseName}>
          <label htmlFor="clean-game-nickname">Takma adın</label>
          <div className="flex gap-2"><input id="clean-game-nickname" value={nameDraft || nickname} onChange={e => setNameDraft(e.target.value)} maxLength={18} placeholder="Örn. Yeşil Çınar" required /><button type="submit" className="clean-game-small-btn">Kaydet</button></div>
        </form>
        <div className="clean-game-cast-wrap"><span className="clean-game-label">Karakter seç</span><div className="clean-game-cast">{CHARACTERS.map(([name, face, trait], index) => <button type="button" key={name} onClick={() => setCharacter(index)} className={`clean-game-character ${character === index ? 'is-selected' : ''}`} title={`${name} • ${trait}`} aria-pressed={character === index}><span>{face}</span><small>{name}</small></button>)}</div></div>
      </div>

      {!localMode && <div className="clean-game-mode-note is-online"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Ortak skor tablosu açık — giriş yapan oyuncuların puanları paylaşılır.</div>}
      {localMode && <div className="clean-game-mode-note"><span className="h-2 w-2 rounded-full bg-amber-500" /> Yerel deneme modu — skorlar bu tarayıcıda saklanır. Ortak skor için Supabase şemasını uygulayıp giriş yapın.</div>}

      <div className="clean-game-layout mt-5">
        <div className="clean-game-map-panel">
          <div className="clean-game-panel-head"><div><h3>🗺️ Yerleşim haritası</h3><p>Bir alana dokunarak görevlerini gör.</p></div><div className="clean-game-progress"><b>{totalDone}</b><span>/{TOTAL_TASKS} görev</span></div></div>
          <CartoonMap selected={roomId} onSelect={setRoomId} />
        </div>
        <div className="clean-game-side">
          <div className="clean-game-task-panel">
            <div className="clean-game-panel-head"><div><h3>{room.emoji} {room.title}</h3><p>Görev tablosu • {roomDone}/{room.tasks.length} tamamlandı</p></div><span className="clean-game-room-progress">{Math.round(roomDone / room.tasks.length * 100)}%</span></div>
            <div className="clean-game-task-list">{room.tasks.map(([title, mode, points], index) => {
              const isDone = playerDone.includes(`${roomId}-${index}`);
              return <div key={`${roomId}-${index}`} className={`clean-game-task ${isDone ? 'is-done' : ''}`}><span className="clean-game-task-icon">{isDone ? '✓' : ICONS[mode]}</span><div className="min-w-0"><b>{title}</b><small>{isDone ? 'Tamamlandı' : `${points} puan · ${TIP[mode]}`}</small></div><button type="button" disabled={isDone} onClick={() => startTask(index)}>{isDone ? 'Bitti' : 'Oyna'}</button></div>;
            })}</div>
          </div>
          <div className="clean-game-leaderboard"><div className="clean-game-panel-head"><div><h3>🏆 Skor tablosu</h3><p>{remoteReady ? 'Oyuncuların toplam puanları' : 'Bu cihazdaki oyuncular'}</p></div><Award size={20} className="text-amber-500" /></div>
            {leaderboard.length ? leaderboard.map((entry, index) => <div className="clean-game-leader" key={`${entry.name}-${index}`}><span className={`clean-game-rank rank-${index + 1}`}>{index + 1}</span><span className="clean-game-leader-face">{CHARACTERS[entry.character || 0][1]}</span><b>{entry.name}</b><strong>⭐ {entry.score}</strong></div>) : <div className="clean-game-empty-score">İlk mini görevi bitirip puan tablosunu başlat!</div>}
          </div>
        </div>
      </div>

      {activeTask && <MiniGame task={activeTask} progress={gameProgress} doneMarks={doneMarks} setDoneMarks={setDoneMarks} setProgress={setGameProgress} selectedItem={selectedItem} setSelectedItem={setSelectedItem} placeItem={placeItem} checks={checks} checkPoint={checkPoint} wipeMove={wipeMove} moveRef={moveRef} onClose={() => setActiveTask(null)} onFinish={finishTask} saving={saving} />}
      {toast && <div role="status" className="clean-game-toast">{toast}</div>}
    </section>
  );
}

function findPoints(taskKey) {
  const [roomId, index] = taskKey.split('-');
  return ROOMS[roomId]?.tasks[Number(index)]?.[2] || 0;
}

function CartoonMap({ selected, onSelect }) {
  const zones = [
    { id: 'sohbet', x: 18, y: 10, w: 43, h: 53, label: 'SOHBET SALONU', color: '#e8c893', sub: 'kürsü · sahne · kitaplık' },
    { id: 'antre', x: 64, y: 10, w: 13, h: 53, label: 'ANTRE', color: '#d7e7dd', sub: 'ayakkabılık' },
    { id: 'abdest', x: 80, y: 10, w: 19, h: 23, label: 'ABDESTHANE', color: '#c9e1d8', sub: 'lavabo · batarya' },
    { id: 'tuvalet', x: 80, y: 38, w: 19, h: 25, label: 'WC', color: '#d7e7dd', sub: 'tuvalet · lavabo' },
    { id: 'cafe', x: 20, y: 69, w: 32, h: 13, label: 'KAFE', color: '#e8c893', sub: 'masalar · çay' },
    { id: 'mutfak', x: 57, y: 69, w: 42, h: 13, label: 'MUTFAK', color: '#ead8b2', sub: 'tezgâh · raflar' }
  ];
  return <div className="clean-map-scroller"><svg className="clean-map" viewBox="0 0 900 560" role="img" aria-label="Sohbet salonu, antre, abdesthane, tuvalet, kafe ve mutfağın üstten görünüşlü çizgi film haritası">
    <defs><pattern id="cleanWood" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#e8c893"/><path d="M0 8h24M0 20h24" stroke="#d8b579" strokeWidth="1"/></pattern><pattern id="cleanTile" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#d8e8df"/><path d="M0 0h24v24H0z" fill="none" stroke="#bdd2c6" strokeWidth="1"/></pattern></defs>
    <rect width="900" height="560" rx="22" fill="#dbead7"/><rect x="18" y="18" width="864" height="524" rx="22" fill="#d1ddc0" stroke="#80977f" strokeWidth="6"/>
    {zones.slice(0, 4).map(z => <g key={z.id} className={`clean-map-zone ${selected === z.id ? 'selected' : ''}`} onClick={() => onSelect(z.id)} role="button" tabIndex="0" aria-label={`${z.label} görevlerini aç`} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(z.id)}><rect x={`${z.x}%`} y={`${z.y}%`} width={`${z.w}%`} height={`${z.h}%`} rx="14" fill={z.id === 'sohbet' ? 'url(#cleanWood)' : 'url(#cleanTile)'} stroke="#756952" strokeWidth="5"/><text x={`${z.x + z.w / 2}%`} y={`${z.y + 10}%`} className="clean-map-title">{z.label}</text><text x={`${z.x + z.w / 2}%`} y={`${z.y + 14}%`} className="clean-map-sub">{z.sub}</text>{z.id === 'sohbet' && <><rect x="32%" y="45%" width="15%" height="14%" rx="12" fill="#c97559" stroke="#9a5948" strokeWidth="4"/><text x="39.5%" y="53%" className="clean-map-object">KÜRSÜ &amp; SAHNE</text><rect x="20%" y="52%" width="3%" height="20%" rx="5" fill="#936c49"/><rect x="56%" y="52%" width="3%" height="20%" rx="5" fill="#936c49"/></>}</g>)}
    {zones.slice(4).map(z => <g key={z.id} className={`clean-map-zone ${selected === z.id ? 'selected' : ''}`} onClick={() => onSelect(z.id)} role="button" tabIndex="0" aria-label={`${z.label} görevlerini aç`} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(z.id)}><rect x={`${z.x}%`} y={`${z.y}%`} width={`${z.w}%`} height={`${z.h}%`} rx="12" fill="url(#cleanWood)" stroke="#756952" strokeWidth="5"/><text x={`${z.x + z.w / 2}%`} y={`${z.y + 6}%`} className="clean-map-title">{z.label}</text><text x={`${z.x + z.w / 2}%`} y={`${z.y + 9.3}%`} className="clean-map-sub">{z.sub}</text></g>)}
    <rect x="3%" y="10%" width="12%" height="53%" rx="12" fill="#d1ddc0" stroke="#8b9d7f" strokeWidth="3"/><text x="9%" y="38%" className="clean-map-title">GİRİŞ</text>
    <rect x="2%" y="85%" width="96%" height="12%" rx="12" fill="#cbd9b9" stroke="#80977f" strokeWidth="3"/><text x="50%" y="92%" className="clean-map-title">🌿 TERAS • BAHÇE</text>
  </svg></div>;
}

const ITEMS = {
  counter: { intro: 'Tezgâhtaki eşyaları uygun gruba taşı.', targets: [['tools', '🍴 Mutfak araçları'], ['food', '🥕 Yiyecekler'], ['clean', '🧴 Temizlik']], items: [['Kaşık', 'tools'], ['Havuç', 'food'], ['Sünger', 'clean'], ['Tabak', 'tools'], ['Elma', 'food'], ['Deterjan', 'clean']] },
  shelves: { intro: 'Çay köşesinin üç rafını ağırdan hafife düzenle.', targets: [['top', 'Üst raf · Kaşıklar'], ['middle', 'Orta raf · Bardaklar'], ['bottom', 'Alt raf · Çay kutusu']], items: [['🍵 Çay kutusu', 'bottom'], ['🥛 Bardaklar', 'middle'], ['🥄 Kaşıklar', 'top']] },
  fridge: { intro: 'Ürünleri doğru buzdolabı bölümüne bırak.', targets: [['drink', 'Üst · İçecekler'], ['dairy', 'Orta · Süt ürünleri'], ['produce', 'Alt · Sebze ve meyve']], items: [['🧃 Meyve suyu', 'drink'], ['🥛 Süt', 'dairy'], ['🥕 Havuç', 'produce'], ['🧀 Peynir', 'dairy'], ['🍎 Elma', 'produce'], ['💧 Su', 'drink']] }
};

function MiniGame({ task, progress, doneMarks, setDoneMarks, setProgress, selectedItem, setSelectedItem, placeItem, checks, checkPoint, wipeMove, moveRef, onClose, onFinish, saving }) {
  const mode = task.mode;
  const type = ['sweep', 'scrub', 'wipe', 'polish'].includes(mode) ? 'Temizleme mini oyunu' : 'Düzenleme mini oyunu';
  const items = ITEMS[mode];
  const allItems = items?.items || [];
  useEffect(() => { if (mode === 'sweep') setProgress(0); }, [mode, setProgress]);
  return <div className="clean-game-modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="clean-game-modal" role="dialog" aria-modal="true" aria-labelledby="clean-mini-title">
    <div className="clean-game-modal-head"><div><span>{type}</span><h3 id="clean-mini-title">{task.title}</h3></div><button type="button" onClick={onClose} aria-label="Kapat"><X size={20} /></button></div>
    <p className="clean-game-modal-copy">{items?.intro || (mode === 'sweep' ? 'Kir izlerinin hepsine dokun.' : mode === 'inspect' ? 'Kontrol listesindeki maddeleri tek tek işaretle.' : 'Alanı tamamen temizle ve parlat.')} Görev tamamlanınca <b>{task.points} puan</b> kazanırsın.</p>
    <div className={`clean-game-board ${mode === 'sweep' ? 'is-floor' : ''}`}>
      {mode === 'sweep' && <><div className="clean-mini-board-title">🧹 Beş kir izini süpür</div>{Array.from({ length: 5 }, (_, index) => <button type="button" key={index} className={`clean-dirt dirt-${index + 1} ${doneMarks.includes(index) ? 'cleaned' : ''}`} aria-label="Kiri süpür" onClick={() => { const next = [...doneMarks, index]; setDoneMarks(next); setProgress(next.length / 5 * 100); }} />)}</>}
      {['wipe', 'polish', 'scrub'].includes(mode) && <><div className="clean-mini-board-title">{mode === 'polish' ? '✨ Parlatana kadar gezdir' : mode === 'scrub' ? '🫧 Dairesel hareketlerle ovala' : '🧽 Yüzeyin tamamını sil'}</div><div className="clean-wipe-pad" onPointerDown={e => { moveRef.current = true; e.currentTarget.setPointerCapture(e.pointerId); wipeMove(e); }} onPointerMove={wipeMove} onPointerUp={() => { moveRef.current = false; }} onPointerCancel={() => { moveRef.current = false; }}><div className="clean-wipe-shine" />{doneMarks.map((id, index) => <i key={id} className="clean-wipe-mark" style={{ left: `${(Number(id.split(':')[0]) + .5) * 10}%`, top: `${(Number(id.split(':')[1]) + .5) * 16.67}%`, animationDelay: `${index * 4}ms` }} />)}</div><div className="clean-wipe-progress"><span>Temizlenen alan</span><b>{progress}%</b></div><div className="clean-game-meter"><i style={{ width: `${progress}%` }} /></div></>}
      {items && <><div className="clean-mini-board-title">Önce eşyayı seç, sonra doğru bölmeye dokun.</div><div className={`clean-game-targets ${mode !== 'counter' ? 'vertical' : ''}`}>{items.targets.map(([id, label]) => <button type="button" key={id} className="clean-game-target" onClick={() => placeItem(id)}>{label}</button>)}</div><div className="clean-game-items">{allItems.map(([label, group], index) => <button type="button" key={label} disabled={doneMarks.includes(index)} className={`clean-game-item ${selectedItem?.id === index ? 'selected' : ''} ${doneMarks.includes(index) ? 'placed' : ''}`} onClick={() => setSelectedItem({ id: index, group, total: allItems.length })}>{doneMarks.includes(index) ? '✓ ' : ''}{label}</button>)}</div></>}
      {mode === 'inspect' && <><div className="clean-mini-board-title">🔎 Lavabo dolabını kontrol et</div><p className="clean-mini-help">Kapakları açıp kontrol listesini tamamla.</p><div className="clean-check-list">{['Kapak ve menteşeler sağlam', 'Temizlik malzemeleri düzenli', 'Sızıntı veya damlama yok', 'Dolap içi temiz'].map((label, index) => <button type="button" key={label} className={checks.includes(index) ? 'checked' : ''} onClick={() => checkPoint(index)}>{checks.includes(index) ? '✅' : '⬜'} {label}</button>)}</div></>}
    </div>
    <div className="clean-game-modal-foot"><span><CircleHelp size={15} /> {TIP[mode]}</span><button type="button" disabled={progress < 100 || saving} onClick={onFinish}>{saving ? 'Kaydediliyor…' : `Görevi tamamla · ${task.points} puan`} <ChevronRight size={16} /></button></div>
  </div></div>;
}
