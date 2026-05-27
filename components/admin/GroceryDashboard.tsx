'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
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
  DollarSign,
  ShoppingCart,
  Layers,
  RefreshCw,
  Edit3,
  TrendingUp,
  TrendingDown,
  Award,
  X,
  ChevronDown,
  Globe,
  AlertTriangle,
  Loader2,
  Sparkles,
  Heart,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Category = 'groceries' | 'fresh' | 'utensils' | 'misc';
type EventType = 'engagement' | 'wedding' | 'reception';

interface GroceryItem {
  id: string;        // Firestore document ID
  serial: string;
  name: string;
  bengaliName?: string;
  qty: string;
  category: Category;
  expected: number;
  actual: number;
  bought: boolean;
  active: boolean;   // false = crossed-out in original list
  notes: string;
  event: EventType;
}

type Lang = 'en' | 'bn';

// ─── Translations ──────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    appTitle: 'Bazar Dashboard', subTitle: 'Grocery & Budget Tracker · Live via Firebase',
    searchPlaceholder: 'Search items, quantities, categories...',
    all: 'All Status', pending: 'Pending', bought: 'Purchased',
    allCategories: 'All', groceries: 'Grocery & Spices', fresh: 'Fresh & Meats',
    utensils: 'Utensils', misc: 'Miscellaneous',
    totalExpected: 'Total Budget', totalActual: 'Amount Spent',
    savings: 'Total Savings', costOverrun: 'Budget Overrun',
    itemCount: 'Total Items', boughtCount: 'Purchased',
    addItem: 'Add Item', exportCsv: 'Export CSV', resetToDefault: 'Restore Defaults',
    shoppingMode: 'Shopping Mode', exitShoppingMode: 'Exit Mode',
    tableNo: 'No.', tableName: 'Item', tableQty: 'Qty', tableCategory: 'Category',
    tableExpected: 'Expected (₹)', tableActual: 'Actual (₹)', tableSavings: 'Savings',
    tableStatus: 'Status', tableActions: 'Actions',
    noItemsFound: 'No items match your filter.',
    markAllBought: 'Mark All Purchased', resetAll: 'Reset All', clearAll: 'Clear List',
    editItem: 'Edit Item', cancel: 'Cancel', save: 'Save Changes',
    bargainMeter: 'Bargain Meter',
    excellentBargain: 'Bargain King! Great savings.',
    goodBargain: 'Excellent budget control.',
    neutralBargain: 'Perfectly on budget.',
    overspending: 'Warning: Over budget target.',
    loading: 'Loading from Firebase...',
    engagement: 'Engagement', wedding: 'Wedding', reception: 'Reception',
  },
  bn: {
    appTitle: 'বাজার ড্যাশবোর্ড', subTitle: 'মুদি তালিকা ও বাজেট ট্র্যাকার · Firebase লাইভ',
    searchPlaceholder: 'আইটেম, পরিমাণ বা ক্যাটাগরি খুঁজুন...',
    all: 'সব', pending: 'বাকি', bought: 'কেনা হয়েছে',
    allCategories: 'সব', groceries: 'মুদি ও মসলা', fresh: 'কাঁচা বাজার',
    utensils: 'বাসনপত্র', misc: 'অন্যান্য',
    totalExpected: 'মোট বাজেট', totalActual: 'মোট খরচ',
    savings: 'মোট সাশ্রয়', costOverrun: 'অতিরিক্ত খরচ',
    itemCount: 'মোট আইটেম', boughtCount: 'কেনা হয়েছে',
    addItem: 'নতুন যোগ', exportCsv: 'CSV ডাউনলোড', resetToDefault: 'রিসেট করুন',
    shoppingMode: 'বাজার মোড', exitShoppingMode: 'বন্ধ করুন',
    tableNo: 'ক্রমিক', tableName: 'বিবরণ', tableQty: 'পরিমাণ', tableCategory: 'ক্যাটাগরি',
    tableExpected: 'আনুমানিক (₹)', tableActual: 'প্রকৃত (₹)', tableSavings: 'সাশ্রয়',
    tableStatus: 'অবস্থা', tableActions: 'অ্যাকশন',
    noItemsFound: 'কোনো আইটেম পাওয়া যায়নি।',
    markAllBought: 'সব কেনা হয়েছে', resetAll: 'সব রিসেট', clearAll: 'সব মুছুন',
    editItem: 'আইটেম পরিবর্তন', cancel: 'বাতিল', save: 'সংরক্ষণ',
    bargainMeter: 'দরদাম মিটার',
    excellentBargain: 'দরদাম সম্রাট!', goodBargain: 'দারুণ সাশ্রয়।',
    neutralBargain: 'বাজেট অনুযায়ী।', overspending: 'সাবধান! বাজেট অতিক্রম।',
    loading: 'Firebase থেকে লোড হচ্ছে...',
    engagement: 'বাগদান', wedding: 'বিবাহ', reception: 'প্রীতিভোজ',
  },
} as const;

const CATEGORY_COLORS: Record<Category, string> = {
  groceries: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  fresh:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  utensils:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  misc:      'text-purple-400 bg-purple-400/10 border-purple-400/20',
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
function EditModal({ item, t, onSave, onClose }: { item: GroceryItem; t: typeof TRANSLATIONS[Lang]; onSave: (item: GroceryItem) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState<GroceryItem>({ ...item });
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
          {([
            { label: 'Item Name', field: 'name', type: 'text', colSpan: 2 },
            { label: 'Quantity', field: 'qty', type: 'text', colSpan: 1 },
            { label: 'Serial', field: 'serial', type: 'text', colSpan: 1 },
            { label: 'Expected (₹)', field: 'expected', type: 'number', colSpan: 1 },
            { label: 'Actual (₹)', field: 'actual', type: 'number', colSpan: 1 },
            { label: 'Notes', field: 'notes', type: 'text', colSpan: 2 },
          ] as const).map(({ label, field, type, colSpan }) => (
            <div key={field} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">{label}</label>
              <input
                type={type}
                value={String(draft[field as keyof GroceryItem])}
                onChange={(e) => setDraft(prev => ({ ...prev, [field]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors"
              />
            </div>
          ))}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Category</label>
              <select value={draft.category} onChange={(e) => setDraft(prev => ({ ...prev, category: e.target.value as Category }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
                {(['groceries', 'fresh', 'utensils', 'misc'] as Category[]).map(c => (
                  <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Dashboard / Event</label>
              <select value={draft.event} onChange={(e) => setDraft(prev => ({ ...prev, event: e.target.value as EventType }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
                {(['engagement', 'wedding', 'reception'] as EventType[]).map(ev => (
                  <option key={ev} value={ev} className="bg-[#0a0a0a]">{t[ev]}</option>
                ))}
              </select>
            </div>
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

// ─── Add Item Modal ────────────────────────────────────────────────────────────
function AddItemModal({ t, itemCount, activeEvent, onAdd, onClose }: { t: typeof TRANSLATIONS[Lang]; itemCount: number; activeEvent: EventType; onAdd: (item: Omit<GroceryItem, 'id'>) => Promise<void>; onClose: () => void }) {
  const [draft, setDraft] = useState({ name: '', bengaliName: '', qty: '1 pc', category: 'groceries' as Category, expected: '', actual: '', notes: '', serial: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setSaving(true);
    await onAdd({
      serial: draft.serial || String(itemCount + 1),
      name: draft.name,
      bengaliName: draft.bengaliName || '',
      qty: draft.qty || '1 pc',
      category: draft.category,
      expected: parseFloat(draft.expected) || 0,
      actual: parseFloat(draft.actual) || 0,
      bought: false,
      notes: draft.notes,
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
          <input required placeholder="Item name *" value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
          <input placeholder="Bengali name (optional)" value={draft.bengaliName} onChange={e => setDraft(p => ({ ...p, bengaliName: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Qty (e.g. 2 kg)" value={draft.qty} onChange={e => setDraft(p => ({ ...p, qty: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
            <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value as Category }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors">
              {(['groceries', 'fresh', 'utensils', 'misc'] as Category[]).map(c => (
                <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
              ))}
            </select>
            <input type="number" placeholder="Expected ₹" value={draft.expected} onChange={e => setDraft(p => ({ ...p, expected: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
            <input type="number" placeholder="Actual ₹" value={draft.actual} onChange={e => setDraft(p => ({ ...p, actual: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 placeholder-white/20 transition-colors" />
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
export default function GroceryDashboard() {
  const [lang, setLang] = useState<Lang>('en');
  const [activeEvent, setActiveEvent] = useState<EventType>('wedding');
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Category>('all');
  const [selectedStatus, setSelectedStatus]     = useState<'all' | 'pending' | 'bought'>('all');
  const [showCrossedOut, setShowCrossedOut]     = useState(false);
  const [sortBy, setSortBy]                     = useState<keyof GroceryItem>('serial');
  const [sortOrder, setSortOrder]               = useState<'asc' | 'desc'>('asc');
  const [shoppingMode, setShoppingMode]         = useState(false);
  const [editingItem, setEditingItem]           = useState<GroceryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen]     = useState(false);
  const [confirmModal, setConfirmModal]         = useState<{ isOpen: boolean; title: string; message: string; onConfirm: (() => void) | null }>({ isOpen: false, title: '', message: '', onConfirm: null });

  const t = TRANSLATIONS[lang];

  // ─── Firestore real-time listener ────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'groceryItems'));
    const unsub = onSnapshot(q, (snap) => {
      const data: GroceryItem[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<GroceryItem, 'id'>),
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
  const toggleBought = useCallback(async (item: GroceryItem) => {
    const newBought = !item.bought;
    const newActual = newBought && item.actual === 0 ? item.expected : item.actual;
    await updateDoc(doc(db, 'groceryItems', item.id), {
      bought: newBought,
      actual: newActual,
      updatedAt: new Date(),
    });
  }, []);

  const updatePrice = useCallback(async (id: string, field: 'expected' | 'actual', value: string) => {
    await updateDoc(doc(db, 'groceryItems', id), {
      [field]: parseFloat(value) || 0,
      updatedAt: new Date(),
    });
  }, []);

  const saveEdit = useCallback(async (updated: GroceryItem) => {
    const { id, ...data } = updated;
    await updateDoc(doc(db, 'groceryItems', id), { ...data, updatedAt: new Date() });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'groceryItems', id));
  }, []);

  const addItem = useCallback(async (item: Omit<GroceryItem, 'id'>) => {
    await addDoc(collection(db, 'groceryItems'), { ...item, active: true, updatedAt: new Date() });
  }, []);

  const markAllBought = useCallback(async () => {
    const batch = writeBatch(db);
    items.filter(i => !i.bought && i.active !== false && i.event === activeEvent).forEach(item => {
      batch.update(doc(db, 'groceryItems', item.id), {
        bought: true,
        actual: item.actual === 0 ? item.expected : item.actual,
        updatedAt: new Date(),
      });
    });
    await batch.commit();
  }, [items, activeEvent]);

  const resetAll = useCallback(async () => {
    const batch = writeBatch(db);
    items.filter(i => i.bought && i.event === activeEvent).forEach(item => {
      batch.update(doc(db, 'groceryItems', item.id), { bought: false, updatedAt: new Date() });
    });
    await batch.commit();
  }, [items, activeEvent]);

  const deleteAll = useCallback(async () => {
    const batch = writeBatch(db);
    items.filter(i => i.event === activeEvent).forEach(item => batch.delete(doc(db, 'groceryItems', item.id)));
    await batch.commit();
  }, [items, activeEvent]);

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  // ─── Export CSV ───────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    let csv = '\uFEFFNo,Item,Qty,Category,Expected (₹),Actual (₹),Status,Notes\n';
    items.filter(i => i.event === activeEvent).forEach(item => {
      csv += [`"${item.serial}"`, `"${item.name}"`, `"${item.qty}"`, `"${t[item.category]}"`,
        item.expected, item.actual, `"${item.bought ? 'Bought' : 'Pending'}"`, `"${item.notes || ''}"`].join(',') + '\n';
    });
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + csv);
    link.download = `${activeEvent}_bazar_budget_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ─── Stats (only active items for current event) ───────────────────────────────
  const stats = useMemo(() => {
    const activeItems = items.filter(i => i.active !== false && i.event === activeEvent);
    let totalExpected = 0, totalActualBought = 0, totalExpectedBought = 0, boughtCount = 0;
    activeItems.forEach(item => {
      totalExpected += item.expected;
      if (item.bought) { boughtCount++; totalActualBought += item.actual; totalExpectedBought += item.expected; }
    });
    const crossedOutCount = items.filter(i => i.active === false && i.event === activeEvent).length;
    return { totalExpected, totalActualBought, totalExpectedBought, savings: totalExpectedBought - totalActualBought, itemsCount: activeItems.length, boughtCount, crossedOutCount };
  }, [items, activeEvent]);

  const bargainInfo = useMemo(() => {
    if (stats.boughtCount === 0) return { text: 'Start Shopping!', color: 'text-white/40' };
    if (stats.savings > 0)       return { text: t.excellentBargain, color: 'text-emerald-400' };
    if (stats.savings === 0)     return { text: t.neutralBargain,   color: 'text-[#d4af37]' };
    return                              { text: t.overspending,     color: 'text-red-400' };
  }, [stats, t]);

  // ─── Filtered & sorted ────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        // ONLY show items belonging to the currently active dashboard event!
        if (item.event !== activeEvent) return false;
        // Hide crossed-out unless toggle is on
        if (!showCrossedOut && item.active === false) return false;
        const s = searchTerm.toLowerCase();
        return (
          (item.name.toLowerCase().includes(s) ||
           (item.bengaliName && item.bengaliName.toLowerCase().includes(s)) ||
           item.qty.toLowerCase().includes(s) ||
           item.serial.includes(s) ||
           (item.notes && item.notes.toLowerCase().includes(s))) &&
          (selectedCategory === 'all' || item.category === selectedCategory) &&
          (selectedStatus === 'all' || (selectedStatus === 'pending' && !item.bought) || (selectedStatus === 'bought' && item.bought))
        );
      })
      .sort((a, b) => {
        // Crossed-out always last
        if (a.active === false && b.active !== false) return 1;
        if (a.active !== false && b.active === false) return -1;
        if (sortBy === 'serial') {
          // Sort g- before u-
          const aIsG = a.id.startsWith('g-'), bIsG = b.id.startsWith('g-');
          if (aIsG !== bIsG) return aIsG ? -1 : 1;
          const na = parseInt(a.serial), nb = parseInt(b.serial);
          if (!isNaN(na) && !isNaN(nb)) return sortOrder === 'asc' ? na - nb : nb - na;
        }
        const va = a[sortBy], vb = b[sortBy];
        if (typeof va === 'string' && typeof vb === 'string')
          return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return sortOrder === 'asc' ? (Number(va) - Number(vb)) : (Number(vb) - Number(va));
      });
  }, [items, activeEvent, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder, showCrossedOut]);

  const handleSort = (field: keyof GroceryItem) => {
    if (sortBy === field) setSortOrder(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const pct = stats.itemsCount > 0 ? Math.round((stats.boughtCount / stats.itemsCount) * 100) : 0;

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
        <AddItemModal t={t} itemCount={items.length} activeEvent={activeEvent} onAdd={addItem} onClose={() => setIsAddModalOpen(false)} />
      )}

      {/* ── Sub-header ──────────────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-[#050505]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[10px] text-[#d4af37] tracking-[0.4em] uppercase mb-1 flex items-center gap-2">
              {t.subTitle}
              {/* Live indicator */}
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
            <button onClick={() => setShoppingMode(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${shoppingMode ? 'bg-[#d4af37] text-black' : 'border border-white/10 text-white/60 hover:border-[#d4af37]/40 hover:text-[#d4af37]'}`}>
              <ShoppingCart size={12} />{shoppingMode ? t.exitShoppingMode : t.shoppingMode}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel rounded-2xl p-5 border border-white/8 hover:border-[#d4af37]/20 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{t.totalExpected}</div>
              <Layers size={16} className="text-[#d4af37]/60" />
            </div>
            <div className="font-serif text-2xl text-[#d4af37]">₹{stats.totalExpected.toLocaleString('en-IN')}</div>
            <div className="text-white/30 text-[11px] mt-2">{stats.itemsCount} {t.itemCount}</div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/8 hover:border-[#d4af37]/20 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{t.totalActual}</div>
              <DollarSign size={16} className="text-emerald-400/60" />
            </div>
            <div className="font-serif text-2xl text-emerald-400">₹{stats.totalActualBought.toLocaleString('en-IN')}</div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-white/30 mb-1">
                <span>{stats.boughtCount}/{stats.itemsCount} {t.boughtCount}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400/70 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/8 hover:border-[#d4af37]/20 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{stats.savings >= 0 ? t.savings : t.costOverrun}</div>
              {stats.savings >= 0 ? <TrendingUp size={16} className="text-emerald-400/60" /> : <TrendingDown size={16} className="text-red-400/60" />}
            </div>
            <div className={`font-serif text-2xl ${stats.savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.savings >= 0 ? '+' : ''}₹{stats.savings.toLocaleString('en-IN')}
            </div>
            <div className="text-white/30 text-[11px] mt-2">vs ₹{stats.totalExpectedBought.toLocaleString('en-IN')} target</div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/8 hover:border-[#d4af37]/20 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{t.bargainMeter}</div>
              <Award size={16} className="text-[#d4af37]/60" />
            </div>
            <div className={`text-sm font-semibold leading-snug ${bargainInfo.color}`}>{bargainInfo.text}</div>
            <div className="text-white/30 text-[11px] mt-2">
              {stats.savings > 1000 ? 'Bargain Master' : stats.savings >= 0 ? 'Smart Buyer' : 'Over Budget'}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? <LoadingScreen text={t.loading} /> : (

          shoppingMode ? (
            /* ── Shopping Mode ────────────────────────────────────────── */
            <div className="glass-panel rounded-2xl border border-[#d4af37]/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart size={18} className="text-[#d4af37]" />
                <h3 className="font-serif text-xl">Fast Checklist</h3>
                <span className="ml-auto text-[10px] text-[#d4af37] tracking-widest uppercase border border-[#d4af37]/30 px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                {(['all', 'groceries', 'fresh', 'utensils', 'misc'] as const).map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat ? 'bg-[#d4af37] text-black' : 'border border-white/10 text-white/50 hover:border-[#d4af37]/30'}`}>
                    {cat === 'all' ? t.allCategories : t[cat]}
                  </button>
                ))}
              </div>
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3.5 top-3.5 text-white/30" />
                <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#d4af37]/40 transition-colors" />
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredItems.filter(i => i.active !== false).map(item => (
                  <div key={item.id} onClick={() => toggleBought(item)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      item.bought
                        ? 'border-emerald-400/30 bg-emerald-400/5'
                        : 'border-white/8 bg-white/3 hover:border-[#d4af37]/30'
                    }`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.bought
                        ? <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
                        : <Circle size={20} className="text-white/20 flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${item.bought ? 'line-through text-white/30' : 'text-white'}`}>{item.name}</p>
                        {item.bengaliName && (
                          <p className="text-[10px] text-white/20 truncate">{item.bengaliName}</p>
                        )}
                        <span className="text-[10px] text-white/30">{item.qty || '—'} · {t[item.category]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2" onClick={e => e.stopPropagation()}>
                      <div className="text-right">
                        <span className="text-[9px] text-white/30 block mb-1">Actual ₹</span>
                        <input type="number" placeholder="0" value={item.actual || ''} onChange={e => updatePrice(item.id, 'actual', e.target.value)}
                          className="w-20 text-center bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-xs text-white outline-none focus:border-[#d4af37]/40" />
                      </div>
                    </div>
                  </div>
                ))}
                {filteredItems.filter(i => i.active !== false).length === 0 && (
                  <div className="text-center py-12 text-white/30 text-sm">{t.noItemsFound}</div>
                )}
              </div>
            </div>
          ) : (
            /* ── Full Table View ───────────────────────────────────────── */
            <div>
              <div className="glass-panel rounded-2xl border border-white/8 p-4 mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-3.5 text-white/30" />
                  <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#d4af37]/40 transition-colors" />
                </div>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as 'all' | Category)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 transition-colors">
                  <option value="all" className="bg-[#0a0a0a]">{t.allCategories}</option>
                  {(['groceries', 'fresh', 'utensils', 'misc'] as Category[]).map(c => (
                    <option key={c} value={c} className="bg-[#0a0a0a]">{t[c]}</option>
                  ))}
                </select>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as 'all' | 'pending' | 'bought')}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 transition-colors">
                  <option value="all" className="bg-[#0a0a0a]">{t.all}</option>
                  <option value="pending" className="bg-[#0a0a0a]">{t.pending}</option>
                  <option value="bought" className="bg-[#0a0a0a]">{t.bought}</option>
                </select>
                {/* Crossed-out toggle */}
                <button
                  onClick={() => setShowCrossedOut(p => !p)}
                  title={`${stats.crossedOutCount} items were crossed out in the original list`}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    showCrossedOut
                      ? 'bg-white/10 border border-white/20 text-white/70'
                      : 'border border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
                  }`}>
                  <span className="line-through">A</span>
                  {showCrossedOut ? `Hide crossed out` : `Show crossed out (${stats.crossedOutCount})`}
                </button>
                <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 max-w-full">
                  <button onClick={() => openConfirm('Mark All Purchased', 'Mark every active item as purchased?', markAllBought)}
                    className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:border-emerald-400/30 hover:text-emerald-400 transition-all whitespace-nowrap">
                    ✓ {t.markAllBought}
                  </button>
                  <button onClick={() => openConfirm('Reset All', 'Reset all items to Pending?', resetAll)}
                    className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:border-white/20 transition-all whitespace-nowrap">
                    <RefreshCw size={12} />
                  </button>
                  <button onClick={() => openConfirm('Clear All Items', 'Delete ALL items from Firebase? This cannot be undone.', deleteAll)}
                    className="px-3 py-2 rounded-xl border border-red-400/20 text-xs text-red-400/60 hover:border-red-400/40 hover:text-red-400 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
                {/* Mobile view (fits in screen, no horizontal scroll) */}
                <div className="block md:hidden max-h-[60vh] overflow-y-auto divide-y divide-white/5">
                  {filteredItems.map((item, idx) => {
                    const isCrossed = item.active === false;
                    return (
                      <div key={item.id} className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                        isCrossed ? 'opacity-40 bg-white/1' : item.bought ? 'bg-emerald-400/3' : idx % 2 === 0 ? 'bg-white/1' : ''
                      }`}>
                        {/* Left: Serial, name, Bengali name, category, qty */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-[10px] text-white/30 font-mono">#{item.serial}</span>
                            <span className={`text-sm font-semibold truncate ${item.bought ? 'line-through text-white/30' : 'text-white'}`}>
                              {item.name}
                            </span>
                          </div>
                          {item.bengaliName && (
                            <div className="text-[11px] text-white/40 mb-1">{item.bengaliName}</div>
                          )}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${
                              isCrossed ? 'text-white/20 bg-white/5 border-white/10' : CATEGORY_COLORS[item.category]
                            }`}>{t[item.category]}</span>
                            <span className="text-[10px] text-white/40 font-medium">{item.qty || '—'}</span>
                            {item.notes && !isCrossed && (
                              <span className="text-[9px] text-white/20 italic truncate max-w-[120px]">({item.notes})</span>
                            )}
                          </div>
                        </div>

                        {/* Right: Est & Act prices, bought check, edit & delete */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {!isCrossed ? (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-center">
                                <span className="text-[8px] text-white/30 uppercase tracking-widest text-shadow">Est ₹</span>
                                <input type="number" value={item.expected || ''} onChange={e => updatePrice(item.id, 'expected', e.target.value)}
                                  className="w-16 bg-white/5 border border-white/10 rounded-md py-0.5 px-1.5 text-center text-xs text-white outline-none focus:border-[#d4af37]/40" />
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[8px] text-white/30 uppercase tracking-widest text-shadow">Act ₹</span>
                                <input type="number" value={item.actual || ''} onChange={e => updatePrice(item.id, 'actual', e.target.value)}
                                  className="w-16 bg-white/5 border border-white/10 rounded-md py-0.5 px-1.5 text-center text-xs text-white outline-none focus:border-[#d4af37]/40" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/25 italic">crossed out</span>
                          )}

                          <div className="flex items-center gap-2">
                            {!isCrossed && (
                              <button onClick={() => toggleBought(item)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                                  item.bought
                                    ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/20'
                                    : 'border border-white/10 text-white/40 hover:border-[#d4af37]/30 hover:text-[#d4af37]'
                                }`}>
                                {item.bought ? <CheckCircle size={8} /> : <Circle size={8} />}
                                {item.bought ? t.bought : t.pending}
                              </button>
                            )}
                            <div className="flex items-center gap-1">
                              {!isCrossed && (
                                <button onClick={() => setEditingItem(item)} className="p-1 rounded-md border border-white/10 text-white/40 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all">
                                  <Edit3 size={10} />
                                </button>
                              )}
                              <button onClick={() => openConfirm('Delete Item', `Delete "${item.name}" from Firebase?`, () => { deleteItem(item.id); setConfirmModal(p => ({ ...p, isOpen: false })); })}
                                className="p-1 rounded-md border border-white/10 text-white/40 hover:border-red-400/30 hover:text-red-400 transition-all">
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View (Full table with standard width) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        {[
                          { label: t.tableNo,       field: 'serial'   },
                          { label: t.tableName,      field: 'name'     },
                          { label: t.tableQty,       field: 'qty'      },
                          { label: t.tableCategory,  field: 'category' },
                          { label: t.tableExpected,  field: 'expected' },
                          { label: t.tableActual,    field: 'actual'   },
                          { label: t.tableSavings,   field: null       },
                          { label: t.tableStatus,    field: 'bought'   },
                          { label: t.tableActions,   field: null       },
                        ].map(({ label, field }) => (
                          <th key={label}
                            onClick={() => field && handleSort(field as keyof GroceryItem)}
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
                      {filteredItems.map((item, idx) => {
                        const savings = item.bought ? item.expected - item.actual : null;
                        const isCrossed = item.active === false;
                        return (
                          <tr key={item.id}
                            className={`border-b border-white/5 transition-colors group ${
                              isCrossed
                                ? 'opacity-40 bg-white/1 hover:opacity-60'
                                : item.bought
                                  ? 'bg-emerald-400/3 hover:bg-[#d4af37]/5'
                                  : `${idx % 2 === 0 ? 'bg-white/1' : ''} hover:bg-[#d4af37]/5`
                            }`}>
                            <td className="px-4 py-3.5 text-white/30 text-xs font-mono">
                              {item.serial}
                              {isCrossed && <span className="ml-1 text-[9px] text-white/20">✕</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className={`font-medium ${
                                isCrossed ? 'line-through text-white/40' : item.bought ? 'line-through text-white/30' : 'text-white'
                              }`}>{item.name}</div>
                              {item.bengaliName && (
                                <div className="text-[10px] text-white/25 mt-0.5 font-normal">{item.bengaliName}</div>
                              )}
                              {item.notes && !isCrossed && (
                                <div className="text-[10px] text-white/20 mt-0.5 truncate max-w-[220px] italic">{item.notes}</div>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-white/50 text-xs whitespace-nowrap">{item.qty || '—'}</td>
                            <td className="px-4 py-3.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                isCrossed ? 'text-white/20 bg-white/5 border-white/10' : CATEGORY_COLORS[item.category]
                              }`}>{t[item.category]}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              {isCrossed ? (
                                <span className="text-white/20 text-xs">—</span>
                              ) : (
                                <input type="number" value={item.expected || ''} onChange={e => updatePrice(item.id, 'expected', e.target.value)}
                                  className="w-24 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 outline-none focus:border-[#d4af37]/40 text-center" />
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {isCrossed ? (
                                <span className="text-white/20 text-xs">—</span>
                              ) : (
                                <input type="number" value={item.actual || ''} onChange={e => updatePrice(item.id, 'actual', e.target.value)}
                                  className="w-24 bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 outline-none focus:border-[#d4af37]/40 text-center" />
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {!isCrossed && savings !== null ? (
                                <span className={`text-xs font-medium ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {savings >= 0 ? '+' : ''}₹{savings.toLocaleString('en-IN')}
                                </span>
                              ) : <span className="text-white/20 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              {isCrossed ? (
                                <span className="text-[10px] text-white/20 italic">crossed out</span>
                              ) : (
                                <button onClick={() => toggleBought(item)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    item.bought
                                      ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/20'
                                      : 'border border-white/10 text-white/30 hover:border-[#d4af37]/30 hover:text-[#d4af37]'
                                  }`}>
                                  {item.bought ? <CheckCircle size={10} /> : <Circle size={10} />}
                                  {item.bought ? t.bought : t.pending}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isCrossed && (
                                  <button onClick={() => setEditingItem(item)} className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all">
                                    <Edit3 size={12} />
                                  </button>
                                )}
                                <button onClick={() => openConfirm('Delete Item', `Delete "${item.name}" from Firebase?`, () => { deleteItem(item.id); setConfirmModal(p => ({ ...p, isOpen: false })); })}
                                  className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:border-red-400/30 hover:text-red-400 transition-all">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-16 text-white/30 text-sm">{t.noItemsFound}</div>
                )}

                {filteredItems.length > 0 && (
                  <div className="border-t border-white/8 px-4 py-3 flex flex-wrap gap-4 text-xs text-white/40">
                    <span>Showing <strong className="text-white/60">{filteredItems.filter(i => i.active !== false).length}</strong> active · <strong className="text-white/30">{filteredItems.filter(i => i.active === false).length}</strong> crossed out</span>
                    <span>·</span>
                    <span>Expected: <strong className="text-[#d4af37]/80">₹{filteredItems.filter(i => i.active !== false).reduce((s, i) => s + i.expected, 0).toLocaleString('en-IN')}</strong></span>
                    <span>·</span>
                    <span>Spent: <strong className="text-emerald-400/80">₹{filteredItems.filter(i => i.bought && i.active !== false).reduce((s, i) => s + i.actual, 0).toLocaleString('en-IN')}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
