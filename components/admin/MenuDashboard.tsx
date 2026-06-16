'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  CheckCircle,
  Circle,
  Search,
  Plus,
  Trash2,
  FileDown,
  Layers,
  Edit3,
  X,
  ChevronDown,
  Globe,
  AlertTriangle,
  Loader2,
  Sparkles,
  Heart,
  Award,
  UtensilsCrossed,
  Clock,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Course = 'starter' | 'main' | 'dessert' | 'beverage' | 'side';
type EventType = 'engagement' | 'wedding' | 'reception';

interface MenuItem {
  id: string;
  name: string;
  bengaliName?: string;
  course: Course;
  event: EventType;
  servings: string;
  notes: string;
  confirmed: boolean;
  active: boolean;
}

type Lang = 'en' | 'bn';

// ─── Translations ──────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    appTitle: 'Food Menu', subTitle: 'Wedding Menu Planner · Live via Firebase',
    searchPlaceholder: 'Search dishes, courses...',
    all: 'All Status', pending: 'Pending', confirmed: 'Confirmed',
    allCourses: 'All', starter: 'Starter', main: 'Main Course',
    dessert: 'Dessert', beverage: 'Beverage', side: 'Side Dish',
    totalDishes: 'Total Dishes', confirmedCount: 'Confirmed', pendingCount: 'Pending',
    addItem: 'Add Dish', exportCsv: 'Export CSV',
    tableNo: 'No.', tableName: 'Dish', tableCourse: 'Course',
    tableServings: 'Servings', tableStatus: 'Status', tableActions: 'Actions',
    noItemsFound: 'No dishes match your filter.',
    editItem: 'Edit Dish', cancel: 'Cancel', save: 'Save Changes',
    loading: 'Loading from Firebase...',
    engagement: 'Engagement', wedding: 'Wedding', reception: 'Reception',
  },
  bn: {
    appTitle: 'খাবারের মেনু', subTitle: 'বিবাহের মেনু পরিকল্পনা · Firebase লাইভ',
    searchPlaceholder: 'পদ বা কোর্স খুঁজুন...',
    all: 'সব', pending: 'বাকি', confirmed: 'নিশ্চিত',
    allCourses: 'সব', starter: 'স্টার্টার', main: 'মেইন কোর্স',
    dessert: 'মিষ্টি', beverage: 'পানীয়', side: 'সাইড ডিশ',
    totalDishes: 'মোট পদ', confirmedCount: 'নিশ্চিত', pendingCount: 'বাকি',
    addItem: 'নতুন পদ', exportCsv: 'CSV ডাউনলোড',
    tableNo: 'ক্রমিক', tableName: 'পদের নাম', tableCourse: 'কোর্স',
    tableServings: 'পরিবেশন', tableStatus: 'অবস্থা', tableActions: 'অ্যাকশন',
    noItemsFound: 'কোনো পদ পাওয়া যায়নি।',
    editItem: 'পদ পরিবর্তন', cancel: 'বাতিল', save: 'সংরক্ষণ',
    loading: 'Firebase থেকে লোড হচ্ছে...',
    engagement: 'বাগদান', wedding: 'বিবাহ', reception: 'প্রীতিভোজ',
  },
} as const;

const COURSE_COLORS: Record<Course, string> = {
  starter:  'text-amber-400 bg-amber-400/10 border-amber-400/20',
  main:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  dessert:  'text-pink-400 bg-pink-400/10 border-pink-400/20',
  beverage: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  side:     'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-sm w-full border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={20} className="text-[#d4af37] flex-shrink-0" />
          <h3 className="font-serif text-xl text-white">{title}</h3>
        </div>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:brightness-110 transition-all">Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ item, t, onSave, onClose }: { item: MenuItem; t: typeof TRANSLATIONS[Lang]; onSave: (item: MenuItem) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState<MenuItem>({ ...item });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-2xl text-white">{t.editItem}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Dish Name</label>
            <input type="text" value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Bengali Name</label>
            <input type="text" value={draft.bengaliName || ''} onChange={e => setDraft(p => ({ ...p, bengaliName: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Servings</label>
            <input type="text" value={draft.servings} onChange={e => setDraft(p => ({ ...p, servings: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Course</label>
            <select value={draft.course} onChange={e => setDraft(p => ({ ...p, course: e.target.value as Course }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
              {(['starter', 'main', 'dessert', 'beverage', 'side'] as Course[]).map(c => (
                <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Event</label>
            <select value={draft.event} onChange={e => setDraft(p => ({ ...p, event: e.target.value as EventType }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
              {(['engagement', 'wedding', 'reception'] as EventType[]).map(ev => (
                <option key={ev} value={ev} className="bg-[#0a0a0a]">{t[ev]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Status</label>
            <select value={draft.confirmed ? 'confirmed' : 'pending'} onChange={e => setDraft(p => ({ ...p, confirmed: e.target.value === 'confirmed' }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
              <option value="pending" className="bg-[#0a0a0a]">{t.pending}</option>
              <option value="confirmed" className="bg-[#0a0a0a]">{t.confirmed}</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Notes</label>
            <input type="text" value={draft.notes} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">{t.cancel}</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Dish Modal ────────────────────────────────────────────────────────────
function AddDishModal({ t, activeEvent, onAdd, onClose }: { t: typeof TRANSLATIONS[Lang]; activeEvent: EventType; onAdd: (item: Omit<MenuItem, 'id'>) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState({ name: '', bengaliName: '', course: 'main' as Course, servings: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setSaving(true);
    await onAdd({
      name: draft.name,
      bengaliName: draft.bengaliName || '',
      course: draft.course,
      servings: draft.servings || '',
      notes: draft.notes,
      confirmed: false,
      active: true,
      event: activeEvent,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-md w-full border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-2xl text-white">{t.addItem}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input required placeholder="Dish name *" value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
          <input placeholder="Bengali name (optional)" value={draft.bengaliName} onChange={e => setDraft(p => ({ ...p, bengaliName: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Servings (e.g. 50 plates)" value={draft.servings} onChange={e => setDraft(p => ({ ...p, servings: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
            <select value={draft.course} onChange={e => setDraft(p => ({ ...p, course: e.target.value as Course }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
              {(['starter', 'main', 'dessert', 'beverage', 'side'] as Course[]).map(c => (
                <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
              ))}
            </select>
          </div>
          <input placeholder="Notes (optional)" value={draft.notes} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">{t.cancel}</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {t.addItem}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#d4af37]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#d4af37] animate-spin" />
      </div>
      <p className="text-white/30 text-sm tracking-widest uppercase">{text}</p>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function MenuDashboard() {
  const [lang, setLang] = useState<Lang>('en');
  const [activeEvent, setActiveEvent] = useState<EventType>('engagement');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedCourse, setSelectedCourse]     = useState<'all' | Course>('all');
  const [selectedStatus, setSelectedStatus]     = useState<'all' | 'pending' | 'confirmed'>('all');
  const [sortBy, setSortBy]                     = useState<keyof MenuItem>('name');
  const [sortOrder, setSortOrder]               = useState<'asc' | 'desc'>('asc');
  const [editingItem, setEditingItem]           = useState<MenuItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen]     = useState(false);
  const [confirmModal, setConfirmModal]         = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });

  const t = TRANSLATIONS[lang];

  // ─── Firestore real-time listener ────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'menuItems'));
    const unsub = onSnapshot(q, (snap) => {
      const data: MenuItem[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<MenuItem, 'id'>),
      }));
      setItems(data);
      setLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ─── Firebase CRUD helpers ────────────────────────────────────────────────────
  const toggleConfirmed = useCallback(async (item: MenuItem) => {
    await updateDoc(doc(db, 'menuItems', item.id), {
      confirmed: !item.confirmed,
      updatedAt: new Date(),
    });
  }, []);

  const updateServings = useCallback(async (id: string, value: string) => {
    await updateDoc(doc(db, 'menuItems', id), { servings: value, updatedAt: new Date() });
  }, []);

  const saveEdit = useCallback(async (updated: MenuItem) => {
    const { id, ...data } = updated;
    await updateDoc(doc(db, 'menuItems', id), { ...data, updatedAt: new Date() });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'menuItems', id));
  }, []);

  const addItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    await addDoc(collection(db, 'menuItems'), { ...item, active: true, updatedAt: new Date() });
  }, []);

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  // ─── Export CSV ───────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    let csv = '\uFEFFNo,Dish,Bengali Name,Course,Servings,Status,Notes\n';
    items.filter(i => i.event === activeEvent && i.active !== false).forEach((item, idx) => {
      csv += [`"${idx + 1}"`, `"${item.name}"`, `"${item.bengaliName || ''}"`, `"${t[item.course]}"`,
        `"${item.servings || ''}"`, `"${item.confirmed ? 'Confirmed' : 'Pending'}"`, `"${item.notes || ''}"`].join(',') + '\n';
    });
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + csv);
    link.download = `${activeEvent}_menu_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ─── Stats (only active items for current event) ───────────────────────────────
  const stats = useMemo(() => {
    const activeItems = items.filter(i => i.active !== false && i.event === activeEvent);
    const confirmedCount = activeItems.filter(i => i.confirmed).length;
    const pendingCount = activeItems.length - confirmedCount;
    return { totalDishes: activeItems.length, confirmedCount, pendingCount };
  }, [items, activeEvent]);

  // ─── Filtered & sorted ────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        if (item.event !== activeEvent) return false;
        if (item.active === false) return false;
        const s = searchTerm.toLowerCase();
        return (
          (item.name.toLowerCase().includes(s) ||
           (item.bengaliName && item.bengaliName.toLowerCase().includes(s)) ||
           (item.notes && item.notes.toLowerCase().includes(s)) ||
           (item.servings && item.servings.toLowerCase().includes(s))) &&
          (selectedCourse === 'all' || item.course === selectedCourse) &&
          (selectedStatus === 'all' || (selectedStatus === 'pending' && !item.confirmed) || (selectedStatus === 'confirmed' && item.confirmed))
        );
      })
      .sort((a, b) => {
        const va = a[sortBy], vb = b[sortBy];
        if (typeof va === 'string' && typeof vb === 'string')
          return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return sortOrder === 'asc' ? (Number(va) - Number(vb)) : (Number(vb) - Number(va));
      });
  }, [items, activeEvent, searchTerm, selectedCourse, selectedStatus, sortBy, sortOrder]);

  const handleSort = (field: keyof MenuItem) => {
    if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const pct = stats.totalDishes > 0 ? Math.round((stats.confirmedCount / stats.totalDishes) * 100) : 0;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <div className="noise" />

      {/* Modals */}
      {confirmModal.isOpen && confirmModal.onConfirm && (
        <ConfirmModal title={confirmModal.title} message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))} />
      )}
      {editingItem && (
        <EditModal item={editingItem} t={t} onSave={saveEdit} onClose={() => setEditingItem(null)} />
      )}
      {isAddModalOpen && (
        <AddDishModal t={t} activeEvent={activeEvent} onAdd={addItem} onClose={() => setIsAddModalOpen(false)} />
      )}

      {/* ── Sub-header ──────────────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-[#050505]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[10px] text-[#d4af37] tracking-[0.4em] uppercase mb-1 flex items-center gap-2">
              {t.subTitle}
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <h2 className="font-serif text-2xl">{t.appTitle}</h2>
          </div>
          <div className="flex flex-nowrap overflow-x-auto items-center gap-2 max-w-full pb-1 scrollbar-none">
            <button onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/60 hover:border-[#d4af37]/40 hover:text-[#d4af37] transition-all">
              <Globe size={12} />{lang === 'en' ? 'বাংলা' : 'English'}
            </button>
            <button onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-xs hover:bg-[#d4af37]/10 transition-all">
              <Plus size={12} />{t.addItem}
            </button>
            <button onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/60 hover:border-white/20 transition-all">
              <FileDown size={12} />{t.exportCsv}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Event Selector Tabs ────────────────────────────────────────── */}
        <div className="flex border-b border-white/8 mb-8 overflow-x-auto scrollbar-none whitespace-nowrap gap-1">
          {([
            { id: 'engagement', label: t.engagement, icon: Sparkles },
            { id: 'wedding',    label: t.wedding,    icon: Heart    },
            { id: 'reception',  label: t.reception,  icon: Award    },
          ] as const).map(({ id, label, icon: Icon }) => {
            const isActive = activeEvent === id;
            return (
              <button
                key={id}
                onClick={() => setActiveEvent(id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-[#d4af37] text-[#d4af37] bg-white/[0.02]'
                    : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.01]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#d4af37]' : 'text-white/40'} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel rounded-2xl p-5 border border-white/8 hover:border-[#d4af37]/20 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{t.totalDishes}</div>
              <UtensilsCrossed size={16} className="text-[#d4af37]/60" />
            </div>
            <div className="font-serif text-2xl text-[#d4af37]">{stats.totalDishes}</div>
            <div className="text-white/30 text-[11px] mt-2">{t[activeEvent]}</div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/8 hover:border-[#d4af37]/20 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{t.confirmedCount}</div>
              <CheckCircle size={16} className="text-emerald-400/60" />
            </div>
            <div className="font-serif text-2xl text-emerald-400">{stats.confirmedCount}</div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-white/30 mb-1">
                <span>{stats.confirmedCount}/{stats.totalDishes} {t.confirmed}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400/70 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/8 hover:border-[#d4af37]/20 transition-all col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{t.pendingCount}</div>
              <Clock size={16} className="text-amber-400/60" />
            </div>
            <div className="font-serif text-2xl text-amber-400">{stats.pendingCount}</div>
            <div className="text-white/30 text-[11px] mt-2">
              {stats.pendingCount === 0 ? 'All dishes confirmed!' : `${stats.pendingCount} dish${stats.pendingCount !== 1 ? 'es' : ''} to finalize`}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? <LoadingScreen text={t.loading} /> : (
          /* ── Full Table View ───────────────────────────────────────── */
          <div>
            <div className="glass-panel rounded-2xl border border-white/8 p-4 mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-3.5 text-white/30" />
                <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#d4af37]/40 transition-colors" />
              </div>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value as 'all' | Course)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 transition-colors">
                <option value="all" className="bg-[#0a0a0a]">{t.allCourses}</option>
                {(['starter', 'main', 'dessert', 'beverage', 'side'] as Course[]).map(c => (
                  <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
                ))}
              </select>
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as 'all' | 'pending' | 'confirmed')}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 transition-colors">
                <option value="all" className="bg-[#0a0a0a]">{t.all}</option>
                <option value="pending" className="bg-[#0a0a0a]">{t.pending}</option>
                <option value="confirmed" className="bg-[#0a0a0a]">{t.confirmed}</option>
              </select>
            </div>

            <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
              {/* Mobile view */}
              <div className="block md:hidden max-h-[60vh] overflow-y-auto divide-y divide-white/5">
                {filteredItems.map((item, idx) => (
                  <div key={item.id} className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                    item.confirmed ? 'bg-emerald-400/3' : idx % 2 === 0 ? 'bg-white/1' : ''
                  }`}>
                    {/* Left: name, Bengali name, course, servings */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[10px] text-white/30 font-mono">#{idx + 1}</span>
                        <span className={`text-sm font-semibold truncate ${item.confirmed ? 'text-white/60' : 'text-white'}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.bengaliName && (
                        <div className="text-[11px] text-white/40 mb-1">{item.bengaliName}</div>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${COURSE_COLORS[item.course]}`}>
                          {t[item.course]}
                        </span>
                        <input type="text" value={item.servings || ''} placeholder="Servings"
                          onChange={e => updateServings(item.id, e.target.value)}
                          className="text-[10px] text-white/40 font-medium bg-transparent border-b border-white/10 focus:border-white/40 outline-none w-20" />
                        {item.notes && (
                          <span className="text-[9px] text-white/20 italic truncate max-w-[120px]">({item.notes})</span>
                        )}
                      </div>
                    </div>

                    {/* Right: status toggle, edit & delete */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button onClick={() => toggleConfirmed(item)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                          item.confirmed
                            ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/20'
                            : 'border border-white/10 text-white/40 hover:border-[#d4af37]/30 hover:text-[#d4af37]'
                        }`}>
                        {item.confirmed ? <CheckCircle size={8} /> : <Circle size={8} />}
                        {item.confirmed ? t.confirmed : t.pending}
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingItem(item)} className="p-1 rounded-md border border-white/10 text-white/40 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all">
                          <Edit3 size={10} />
                        </button>
                        <button onClick={() => openConfirm('Delete Dish', `Delete "${item.name}"?`, () => { deleteItem(item.id); setConfirmModal(p => ({ ...p, isOpen: false })); })}
                          className="p-1 rounded-md border border-white/10 text-white/40 hover:border-red-400/30 hover:text-red-400 transition-all">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {[
                        { label: t.tableNo,       field: null     },
                        { label: t.tableName,     field: 'name'   },
                        { label: t.tableCourse,   field: 'course' },
                        { label: t.tableServings, field: null     },
                        { label: t.tableStatus,   field: 'confirmed' },
                        { label: t.tableActions,  field: null     },
                      ].map(({ label, field }) => (
                        <th key={label}
                          onClick={() => field && handleSort(field as keyof MenuItem)}
                          className={`px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/40 font-medium ${field ? 'cursor-pointer hover:text-[#d4af37] transition-colors' : ''}`}>
                          <span className="flex items-center gap-1">
                            {label}
                            {field && sortBy === field && <ChevronDown size={10} className={sortOrder === 'desc' ? 'rotate-180' : ''} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => (
                      <tr key={item.id}
                        className={`border-b border-white/5 transition-colors group ${
                          item.confirmed
                            ? 'bg-emerald-400/3 hover:bg-[#d4af37]/5'
                            : `${idx % 2 === 0 ? 'bg-white/1' : ''} hover:bg-[#d4af37]/5`
                        }`}>
                        <td className="px-4 py-3.5 text-white/30 text-xs font-mono">{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className={`font-medium ${item.confirmed ? 'text-white/60' : 'text-white'}`}>{item.name}</div>
                          {item.bengaliName && (
                            <div className="text-[10px] text-white/25 mt-0.5 font-normal">{item.bengaliName}</div>
                          )}
                          {item.notes && (
                            <div className="text-[10px] text-white/20 mt-0.5 truncate max-w-[220px] italic">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${COURSE_COLORS[item.course]}`}>
                            {t[item.course]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <input type="text" value={item.servings || ''} placeholder="—"
                            onChange={e => updateServings(item.id, e.target.value)}
                            className="w-28 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 outline-none focus:border-[#d4af37]/40 text-center" />
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => toggleConfirmed(item)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                              item.confirmed
                                ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/20'
                                : 'border border-white/10 text-white/30 hover:border-[#d4af37]/30 hover:text-[#d4af37]'
                            }`}>
                            {item.confirmed ? <CheckCircle size={10} /> : <Circle size={10} />}
                            {item.confirmed ? t.confirmed : t.pending}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingItem(item)} className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all">
                              <Edit3 size={12} />
                            </button>
                            <button onClick={() => openConfirm('Delete Dish', `Delete "${item.name}"?`, () => { deleteItem(item.id); setConfirmModal(p => ({ ...p, isOpen: false })); })}
                              className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:border-red-400/30 hover:text-red-400 transition-all">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-16 text-white/30 text-sm">{t.noItemsFound}</div>
              )}

              {filteredItems.length > 0 && (
                <div className="border-t border-white/8 px-4 py-3 flex flex-wrap gap-4 text-xs text-white/40">
                  <span>Showing <strong className="text-white/60">{filteredItems.length}</strong> dishes</span>
                  <span>·</span>
                  <span>Confirmed: <strong className="text-emerald-400/80">{filteredItems.filter(i => i.confirmed).length}</strong></span>
                  <span>·</span>
                  <span>Pending: <strong className="text-amber-400/80">{filteredItems.filter(i => !i.confirmed).length}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
