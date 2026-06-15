'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Search, Plus, Trash2, FileDown, DollarSign, TrendingUp, TrendingDown,
  Edit3, X, AlertTriangle, Loader2, Globe, RefreshCw, Receipt,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────
type ExpenseCategory = 'venue' | 'catering' | 'decor' | 'photography' | 'attire' | 'transport' | 'misc';
type EventType = 'engagement' | 'wedding' | 'reception';
type Lang = 'en' | 'bn';

interface ExpenseItem {
  id: string;
  serial: string;
  name: string;
  bengaliName?: string;
  category: ExpenseCategory;
  expected: number;
  actual: number;
  paid: boolean;
  notes: string;
  event: EventType;
  active: boolean;
}

// ─── Translations ───────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    appTitle: 'Expense Dashboard', subTitle: 'Budget & Expense Tracker · Live via Firebase',
    searchPlaceholder: 'Search expenses, categories...',
    all: 'All Status', pending: 'Unpaid', paid: 'Paid',
    allCategories: 'All Categories',
    venue: 'Venue', catering: 'Catering', decor: 'Decor & Flowers',
    photography: 'Photography', attire: 'Attire & Jewellery',
    transport: 'Transport', misc: 'Miscellaneous',
    totalExpected: 'Total Budget', totalActual: 'Total Spent',
    savings: 'Total Savings', costOverrun: 'Over Budget',
    itemCount: 'Total Items', paidCount: 'Paid',
    addItem: 'Add Expense', exportCsv: 'Export CSV',
    tableNo: 'No.', tableName: 'Expense', tableCategory: 'Category',
    tableExpected: 'Budget (₹)', tableActual: 'Spent (₹)',
    tableSavings: 'Variance', tableStatus: 'Status', tableActions: 'Actions',
    noItemsFound: 'No expenses match your filter.',
    markAllPaid: 'Mark All Paid', resetAll: 'Reset All', clearAll: 'Clear All',
    editItem: 'Edit Expense', cancel: 'Cancel', save: 'Save Changes',
    loading: 'Loading from Firebase...',
    engagement: 'Engagement', wedding: 'Wedding', reception: 'Reception',
  },
  bn: {
    appTitle: 'ব্যয় ড্যাশবোর্ড', subTitle: 'বাজেট ও খরচ ট্র্যাকার · Firebase লাইভ',
    searchPlaceholder: 'ব্যয়, ক্যাটেগরি খুঁজুন...',
    all: 'সব', pending: 'বাকি', paid: 'পরিশোধিত',
    allCategories: 'সব ক্যাটেগরি',
    venue: 'স্থান', catering: 'ক্যাটারিং', decor: 'সাজসজ্জা',
    photography: 'ফটোগ্রাফি', attire: 'পোশাক ও গহনা',
    transport: 'পরিবহন', misc: 'অন্যান্য',
    totalExpected: 'মোট বাজেট', totalActual: 'মোট খরচ',
    savings: 'মোট সাশ্রয়', costOverrun: 'অতিরিক্ত খরচ',
    itemCount: 'মোট আইটেম', paidCount: 'পরিশোধিত',
    addItem: 'খরচ যোগ করুন', exportCsv: 'CSV ডাউনলোড',
    tableNo: 'ক্রমিক', tableName: 'ব্যয়', tableCategory: 'ক্যাটেগরি',
    tableExpected: 'বাজেট (₹)', tableActual: 'প্রকৃত (₹)',
    tableSavings: 'পার্থক্য', tableStatus: 'অবস্থা', tableActions: 'অ্যাকশন',
    noItemsFound: 'কোনো ব্যয় পাওয়া যায়নি।',
    markAllPaid: 'সব পরিশোধিত', resetAll: 'সব রিসেট', clearAll: 'সব মুছুন',
    editItem: 'ব্যয় সম্পাদনা', cancel: 'বাতিল', save: 'সংরক্ষণ',
    loading: 'Firebase থেকে লোড হচ্ছে...',
    engagement: 'বাগদান', wedding: 'বিবাহ', reception: 'প্রীতিভোজ',
  },
} as const;

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  venue:       'text-amber-400 bg-amber-400/10 border-amber-400/20',
  catering:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  decor:       'text-pink-400 bg-pink-400/10 border-pink-400/20',
  photography: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  attire:      'text-purple-400 bg-purple-400/10 border-purple-400/20',
  transport:   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  misc:        'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

// ─── Confirm Modal ──────────────────────────────────────────────────────────────
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

// ─── Edit Modal ─────────────────────────────────────────────────────────────────
function EditModal({ item, t, onSave, onClose }: { item: ExpenseItem; t: typeof TRANSLATIONS[Lang]; onSave: (item: ExpenseItem) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState<ExpenseItem>({ ...item });
  const [saving, setSaving] = useState(false);
  const handleSave = async () => { setSaving(true); await onSave(draft); setSaving(false); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-2xl text-white">{t.editItem}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([
            { label: 'Expense Name', field: 'name', type: 'text', colSpan: 2 },
            { label: 'Bengali Name', field: 'bengaliName', type: 'text', colSpan: 1 },
            { label: 'Serial', field: 'serial', type: 'text', colSpan: 1 },
            { label: 'Budget (₹)', field: 'expected', type: 'number', colSpan: 1 },
            { label: 'Spent (₹)', field: 'actual', type: 'number', colSpan: 1 },
            { label: 'Notes', field: 'notes', type: 'text', colSpan: 2 },
          ] as const).map(({ label, field, type, colSpan }) => (
            <div key={field} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">{label}</label>
              <input type={type} value={String(draft[field as keyof ExpenseItem] ?? '')}
                onChange={(e) => setDraft(prev => ({ ...prev, [field]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" />
            </div>
          ))}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Category</label>
              <select value={draft.category} onChange={(e) => setDraft(prev => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
                {(['venue', 'catering', 'decor', 'photography', 'attire', 'transport', 'misc'] as ExpenseCategory[]).map(c => (
                  <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Event</label>
              <select value={draft.event} onChange={(e) => setDraft(prev => ({ ...prev, event: e.target.value as EventType }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
                {(['engagement', 'wedding', 'reception'] as EventType[]).map(ev => (
                  <option key={ev} value={ev} className="bg-[#0a0a0a]">{t[ev as keyof typeof t]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">{t.cancel}</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Item Modal ─────────────────────────────────────────────────────────────
function AddModal({ t, activeEvent, onAdd, onClose }: { t: typeof TRANSLATIONS[Lang]; activeEvent: EventType; onAdd: (item: Omit<ExpenseItem, 'id'>) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState({ name: '', bengaliName: '', category: 'misc' as ExpenseCategory, expected: '', actual: '', notes: '', serial: '', event: activeEvent });
  const [saving, setSaving] = useState(false);
  const handleAdd = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    await onAdd({ ...draft, expected: parseFloat(draft.expected) || 0, actual: parseFloat(draft.actual) || 0, paid: false, active: true });
    setSaving(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-lg w-full border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-2xl text-white">{t.addItem}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Expense Name *</label>
            <input placeholder="e.g. Banquet Hall Booking" value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" /></div>
          <div><label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Budget (₹)</label>
            <input type="number" placeholder="0" value={draft.expected} onChange={e => setDraft(p => ({ ...p, expected: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" /></div>
          <div><label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Spent (₹)</label>
            <input type="number" placeholder="0" value={draft.actual} onChange={e => setDraft(p => ({ ...p, actual: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" /></div>
          <div><label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Category</label>
            <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value as ExpenseCategory }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
              {(['venue', 'catering', 'decor', 'photography', 'attire', 'transport', 'misc'] as ExpenseCategory[]).map(c => (
                <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
              ))}
            </select></div>
          <div><label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Event</label>
            <select value={draft.event} onChange={e => setDraft(p => ({ ...p, event: e.target.value as EventType }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
              {(['engagement', 'wedding', 'reception'] as EventType[]).map(ev => (
                <option key={ev} value={ev} className="bg-[#0a0a0a]">{t[ev as keyof typeof t]}</option>
              ))}
            </select></div>
          <div className="col-span-2"><label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Notes</label>
            <input placeholder="Optional notes..." value={draft.notes} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors" /></div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">{t.cancel}</button>
          <button onClick={handleAdd} disabled={saving || !draft.name.trim()} className="flex-1 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : t.addItem}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────────
export default function ExpenseDashboard() {
  const [lang, setLang] = useState<Lang>('en');
  const t = TRANSLATIONS[lang];
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<EventType>('wedding');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ExpenseCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; action: () => Promise<void> } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'expenses'), (snap) => {
      const list: ExpenseItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<ExpenseItem, 'id'>) }));
      setItems(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredItems = useMemo(() => items.filter(i => {
    if (i.event !== activeEvent) return false;
    if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;
    if (selectedStatus === 'pending' && i.paid) return false;
    if (selectedStatus === 'paid' && !i.paid) return false;
    const s = searchTerm.toLowerCase();
    return !s || i.name.toLowerCase().includes(s) || (i.bengaliName || '').toLowerCase().includes(s) || i.category.toLowerCase().includes(s);
  }), [items, activeEvent, selectedCategory, selectedStatus, searchTerm]);

  const stats = useMemo(() => {
    const active = filteredItems.filter(i => i.active !== false);
    const totalExpected = active.reduce((a, b) => a + b.expected, 0);
    const totalActual = active.reduce((a, b) => a + b.actual, 0);
    const paidCount = active.filter(i => i.paid).length;
    return { totalExpected, totalActual, savings: totalExpected - totalActual, itemCount: active.length, paidCount };
  }, [filteredItems]);

  const updatePrice = useCallback(async (id: string, field: 'expected' | 'actual', value: string) => {
    await updateDoc(doc(db, 'expenses', id), { [field]: parseFloat(value) || 0, updatedAt: new Date() });
  }, []);

  const togglePaid = useCallback(async (item: ExpenseItem) => {
    await updateDoc(doc(db, 'expenses', item.id), { paid: !item.paid, updatedAt: new Date() });
  }, []);

  const saveEdit = useCallback(async (updated: ExpenseItem) => {
    const { id, ...data } = updated;
    await updateDoc(doc(db, 'expenses', id), { ...data, updatedAt: new Date() });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'expenses', id));
  }, []);

  const addItem = useCallback(async (item: Omit<ExpenseItem, 'id'>) => {
    await addDoc(collection(db, 'expenses'), { ...item, updatedAt: new Date() });
  }, []);

  const markAllPaid = useCallback(async () => {
    const batch = writeBatch(db);
    items.filter(i => !i.paid && i.event === activeEvent).forEach(i => {
      batch.update(doc(db, 'expenses', i.id), { paid: true, updatedAt: new Date() });
    });
    await batch.commit();
  }, [items, activeEvent]);

  const resetAll = useCallback(async () => {
    const batch = writeBatch(db);
    items.filter(i => i.paid && i.event === activeEvent).forEach(i => {
      batch.update(doc(db, 'expenses', i.id), { paid: false, updatedAt: new Date() });
    });
    await batch.commit();
  }, [items, activeEvent]);

  const deleteAll = useCallback(async () => {
    const batch = writeBatch(db);
    items.filter(i => i.event === activeEvent).forEach(i => batch.delete(doc(db, 'expenses', i.id)));
    await batch.commit();
  }, [items, activeEvent]);

  const openConfirm = (title: string, message: string, action: () => Promise<void>) =>
    setConfirmModal({ title, message, action });

  const exportCsv = () => {
    let csv = '\uFEFFNo,Expense,Category,Budget (₹),Spent (₹),Variance,Status,Notes\n';
    filteredItems.filter(i => i.active !== false).forEach((item, idx) => {
      csv += [`"${idx + 1}"`, `"${item.name}"`, `"${t[item.category]}"`,
        item.expected, item.actual, item.expected - item.actual,
        `"${item.paid ? 'Paid' : 'Unpaid'}"`, `"${item.notes}"`].join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeEvent}_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-white/40">
      <Loader2 size={20} className="animate-spin" /> {t.loading}
    </div>
  );

  const overBudget = stats.savings < 0;

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      {/* Modals */}
      {confirmModal && (
        <ConfirmModal title={confirmModal.title} message={confirmModal.message}
          onConfirm={async () => { await confirmModal.action(); setConfirmModal(null); }}
          onCancel={() => setConfirmModal(null)} />
      )}
      {editingItem && (
        <EditModal item={editingItem} t={t} onSave={saveEdit} onClose={() => setEditingItem(null)} />
      )}
      {showAddModal && (
        <AddModal t={t} activeEvent={activeEvent} onAdd={addItem} onClose={() => setShowAddModal(false)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#d4af37]/70 mb-1 flex items-center gap-2">
            <Receipt size={10} /> {t.subTitle}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-white">{t.appTitle}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-white/50 text-xs hover:border-[#d4af37]/30 transition-all">
            <Globe size={13} /> {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-medium hover:bg-[#d4af37]/20 transition-all">
            <Plus size={13} /> {t.addItem}
          </button>
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-white/50 text-xs hover:border-white/20 transition-all">
            <FileDown size={13} /> {t.exportCsv}
          </button>
        </div>
      </div>

      {/* Event Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/8 pb-0">
        {(['engagement', 'wedding', 'reception'] as EventType[]).map(ev => (
          <button key={ev} onClick={() => setActiveEvent(ev)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeEvent === ev
                ? 'border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}>
            {t[ev as keyof typeof t] as string}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t.totalExpected}</span>
            <DollarSign size={16} className="text-[#d4af37]/60" />
          </div>
          <p className="text-2xl font-light text-white">₹{stats.totalExpected.toLocaleString()}</p>
          <p className="text-[11px] text-white/30 mt-1">{stats.itemCount} {t.itemCount.toLowerCase()}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t.totalActual}</span>
            <Receipt size={16} className="text-white/30" />
          </div>
          <p className="text-2xl font-light text-white">₹{stats.totalActual.toLocaleString()}</p>
          <p className="text-[11px] text-white/30 mt-1">{stats.paidCount}/{stats.itemCount} {t.paidCount.toLowerCase()}</p>
          {stats.totalExpected > 0 && (
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#d4af37] rounded-full transition-all" style={{ width: `${Math.min(100, (stats.totalActual / stats.totalExpected) * 100)}%` }} />
            </div>
          )}
        </div>
        <div className={`glass-panel rounded-2xl p-5 border ${overBudget ? 'border-red-400/20' : 'border-emerald-400/20'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">{overBudget ? t.costOverrun : t.savings}</span>
            {overBudget ? <TrendingUp size={16} className="text-red-400/60" /> : <TrendingDown size={16} className="text-emerald-400/60" />}
          </div>
          <p className={`text-2xl font-light ${overBudget ? 'text-red-400' : 'text-emerald-400'}`}>
            {overBudget ? '+' : ''}₹{Math.abs(stats.savings).toLocaleString()}
          </p>
          <p className="text-[11px] text-white/30 mt-1">vs ₹{stats.totalExpected.toLocaleString()} budget</p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">Progress</span>
          </div>
          <p className="text-2xl font-light text-white">
            {stats.totalExpected > 0 ? Math.round((stats.totalActual / stats.totalExpected) * 100) : 0}%
          </p>
          <p className="text-[11px] text-white/30 mt-1">of total budget used</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl border border-white/8 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-3.5 text-white/30" />
          <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#d4af37]/40 transition-colors" />
        </div>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as 'all' | ExpenseCategory)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 transition-colors">
          <option value="all" className="bg-[#0a0a0a]">{t.allCategories}</option>
          {(['venue', 'catering', 'decor', 'photography', 'attire', 'transport', 'misc'] as ExpenseCategory[]).map(c => (
            <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
          ))}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as 'all' | 'pending' | 'paid')}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 transition-colors">
          <option value="all" className="bg-[#0a0a0a]">{t.all}</option>
          <option value="pending" className="bg-[#0a0a0a]">{t.pending}</option>
          <option value="paid" className="bg-[#0a0a0a]">{t.paid}</option>
        </select>
        <div className="flex gap-2">
          <button onClick={() => openConfirm('Mark All Paid', 'Mark every active expense as paid?', markAllPaid)}
            className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:border-emerald-400/30 hover:text-emerald-400 transition-all whitespace-nowrap">
            ✓ {t.markAllPaid}
          </button>
          <button onClick={() => openConfirm('Reset All', 'Reset all expenses to Unpaid?', resetAll)}
            className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:border-white/20 transition-all">
            <RefreshCw size={12} />
          </button>
          <button onClick={() => openConfirm('Clear All Expenses', 'Delete ALL expenses? This cannot be undone.', deleteAll)}
            className="px-3 py-2 rounded-xl border border-red-400/20 text-xs text-red-400/60 hover:border-red-400/40 hover:text-red-400 transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium w-12">{t.tableNo}</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableName}</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableCategory}</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableExpected}</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableActual}</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableSavings}</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableStatus}</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const variance = item.expected - item.actual;
                const isOver = variance < 0;
                return (
                  <tr key={item.id} className={`border-t border-white/5 transition-colors ${item.paid ? 'bg-emerald-400/3' : idx % 2 === 0 ? 'bg-white/1' : ''}`}>
                    <td className="px-4 py-3.5 text-white/30 text-xs font-mono">{idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <p className={`text-sm font-medium ${item.paid ? 'line-through text-white/30' : 'text-white'}`}>{item.name}</p>
                      {item.bengaliName && <p className="text-[10px] text-white/30 mt-0.5">{item.bengaliName}</p>}
                      {item.notes && <p className="text-[10px] text-white/20 mt-0.5 italic">{item.notes}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${CATEGORY_COLORS[item.category]}`}>
                        {t[item.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <input type="number" value={item.expected || ''}
                        onChange={e => updatePrice(item.id, 'expected', e.target.value)}
                        className="w-24 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white text-center outline-none focus:border-[#d4af37]/40 transition-colors" />
                    </td>
                    <td className="px-4 py-3.5">
                      <input type="number" value={item.actual || ''}
                        onChange={e => updatePrice(item.id, 'actual', e.target.value)}
                        className="w-24 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white text-center outline-none focus:border-[#d4af37]/40 transition-colors" />
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono">
                      {item.expected > 0 || item.actual > 0 ? (
                        <span className={isOver ? 'text-red-400' : 'text-emerald-400'}>
                          {isOver ? '-' : '+'}₹{Math.abs(variance).toLocaleString()}
                        </span>
                      ) : <span className="text-white/20">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => togglePaid(item)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${
                          item.paid
                            ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20'
                            : 'border-white/15 text-white/40 hover:border-[#d4af37]/30 hover:text-[#d4af37]'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.paid ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        {item.paid ? t.paid : t.pending}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingItem(item)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => openConfirm('Delete Expense', `Delete "${item.name}"? This cannot be undone.`, () => deleteItem(item.id))}
                          className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-white/30 text-sm">{t.noItemsFound}</div>
          )}
        </div>
      </div>
    </div>
  );
}
