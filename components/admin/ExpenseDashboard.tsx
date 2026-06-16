'use client';

import { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, writeBatch,
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Search, Plus, Trash2, FileDown, DollarSign, TrendingDown,
  Edit3, X, AlertTriangle, Loader2, Globe, RefreshCw, Receipt,
  ArrowUpDown, ArrowUp, ArrowDown, CreditCard, IndianRupee, User,
  ChevronDown, Pencil, Check, Image, ExternalLink, Paperclip,
} from 'lucide-react';

type SortField = 'name' | 'category' | 'actual' | 'totalPaid' | 'balance' | 'status';
type SortDir = 'asc' | 'desc';

// ─── Types ──────────────────────────────────────────────────────────────────────
type ExpenseCategory = 'venue' | 'catering' | 'decor' | 'photography' | 'attire' | 'transport' | 'misc';
type EventType = 'engagement' | 'wedding' | 'reception';
type Lang = 'en' | 'bn';

interface Payment {
  amount: number;
  date: string;
  note: string;
  paidBy: string;
  receiptUrl?: string;
}

const PAYER_OPTIONS = ['Rocky', 'Swarupa', 'Rocky\'s Family', 'Swarupa\'s Family'] as const;

interface ExpenseItem {
  id: string;
  serial: string;
  name: string;
  bengaliName?: string;
  category: ExpenseCategory;
  actual: number;
  payments: Payment[];
  notes: string;
  event: EventType;
  active: boolean;
  // Legacy field — if true and no payments, treat as fully paid
  paid?: boolean;
  // Legacy field — ignored in new UI
  expected?: number;
}

function getTotalPaid(item: ExpenseItem): number {
  if (item.payments && item.payments.length > 0) {
    return item.payments.reduce((sum, p) => sum + p.amount, 0);
  }
  // Legacy: if paid boolean was true, treat as fully paid
  if (item.paid === true) return item.actual;
  return 0;
}

function getBalance(item: ExpenseItem): number {
  return item.actual - getTotalPaid(item);
}

type PaymentStatus = 'unpaid' | 'partial' | 'paid';

function getPaymentStatus(item: ExpenseItem): PaymentStatus {
  const totalPaid = getTotalPaid(item);
  if (totalPaid <= 0) return 'unpaid';
  if (totalPaid >= item.actual) return 'paid';
  return 'partial';
}

// ─── Translations ───────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    appTitle: 'Expense Dashboard', subTitle: 'Expense & Payment Tracker · Live via Firebase',
    searchPlaceholder: 'Search expenses, categories...',
    all: 'All Status', unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid',
    allCategories: 'All Categories',
    venue: 'Venue', catering: 'Catering', decor: 'Decor & Flowers',
    photography: 'Photography', attire: 'Attire & Jewellery',
    transport: 'Transport', misc: 'Miscellaneous',
    totalCost: 'Total Cost', totalPaid: 'Total Paid',
    remaining: 'Remaining', progress: 'Progress',
    itemCount: 'Total Items', paidCount: 'Paid',
    addItem: 'Add Expense', exportCsv: 'Export CSV',
    tableNo: 'No.', tableName: 'Expense', tableCategory: 'Category',
    tableAmount: 'Amount (₹)', tablePaid: 'Paid (₹)',
    tableBalance: 'Balance', tablePaidBy: 'Paid By', tableStatus: 'Status', tableActions: 'Actions',
    noItemsFound: 'No expenses match your filter.',
    markAllPaid: 'Mark All Paid', resetAll: 'Reset All', clearAll: 'Clear All',
    editItem: 'Edit Expense', cancel: 'Cancel', save: 'Save Changes',
    loading: 'Loading from Firebase...',
    engagement: 'Engagement', wedding: 'Wedding', reception: 'Reception',
    addPayment: 'Add Payment', paymentHistory: 'Payment History',
    paymentAmount: 'Amount (₹)', paymentNote: 'Note (optional)',
    paidBy: 'Paid By', selectPayer: 'Select who paid',
    noPayments: 'No payments recorded.',
  },
  bn: {
    appTitle: 'ব্যয় ড্যাশবোর্ড', subTitle: 'ব্যয় ও পেমেন্ট ট্র্যাকার · Firebase লাইভ',
    searchPlaceholder: 'ব্যয়, ক্যাটেগরি খুঁজুন...',
    all: 'সব', unpaid: 'বাকি', partial: 'আংশিক', paid: 'পরিশোধিত',
    allCategories: 'সব ক্যাটেগরি',
    venue: 'স্থান', catering: 'ক্যাটারিং', decor: 'সাজসজ্জা',
    photography: 'ফটোগ্রাফি', attire: 'পোশাক ও গহনা',
    transport: 'পরিবহন', misc: 'অন্যান্য',
    totalCost: 'মোট খরচ', totalPaid: 'মোট পরিশোধ',
    remaining: 'বাকি', progress: 'অগ্রগতি',
    itemCount: 'মোট আইটেম', paidCount: 'পরিশোধিত',
    addItem: 'খরচ যোগ করুন', exportCsv: 'CSV ডাউনলোড',
    tableNo: 'ক্রমিক', tableName: 'ব্যয়', tableCategory: 'ক্যাটেগরি',
    tableAmount: 'পরিমাণ (₹)', tablePaid: 'প্রদত্ত (₹)',
    tableBalance: 'বাকি', tablePaidBy: 'কে দিয়েছে', tableStatus: 'অবস্থা', tableActions: 'অ্যাকশন',
    noItemsFound: 'কোনো ব্যয় পাওয়া যায়নি।',
    markAllPaid: 'সব পরিশোধিত', resetAll: 'সব রিসেট', clearAll: 'সব মুছুন',
    editItem: 'ব্যয় সম্পাদনা', cancel: 'বাতিল', save: 'সংরক্ষণ',
    loading: 'Firebase থেকে লোড হচ্ছে...',
    engagement: 'বাগদান', wedding: 'বিবাহ', reception: 'প্রীতিভোজ',
    addPayment: 'পেমেন্ট যোগ', paymentHistory: 'পেমেন্ট ইতিহাস',
    paymentAmount: 'পরিমাণ (₹)', paymentNote: 'নোট (ঐচ্ছিক)',
    paidBy: 'কে দিয়েছে', selectPayer: 'কে পেমেন্ট করেছে নির্বাচন করুন',
    noPayments: 'কোনো পেমেন্ট নেই।',
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

const STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid:  'border-white/15 text-white/40',
  partial: 'border-amber-400/30 text-amber-400 bg-amber-400/10',
  paid:    'border-emerald-400/30 text-emerald-400 bg-emerald-400/10',
};

const STATUS_DOT: Record<PaymentStatus, string> = {
  unpaid:  'bg-white/20',
  partial: 'bg-amber-400',
  paid:    'bg-emerald-400',
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

// ─── Payment Modal ──────────────────────────────────────────────────────────────
function PaymentModal({ item, t, onAddPayment, onClose }: {
  item: ExpenseItem;
  t: typeof TRANSLATIONS[Lang];
  onAddPayment: (itemId: string, payment: Payment) => Promise<void>;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paidBy, setPaidBy] = useState(PAYER_OPTIONS[0] as string);
  const [customPayer, setCustomPayer] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const totalPaid = getTotalPaid(item);
  const balance = item.actual - totalPaid;

  const effectivePayer = paidBy === '__custom__' ? customPayer.trim() : paidBy;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleAdd = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || !effectivePayer) return;
    setSaving(true);
    let receiptUrl: string | undefined;
    if (receiptFile) {
      const storageRef = ref(storage, `receipts/${item.id}/${Date.now()}_${receiptFile.name}`);
      const snapshot = await uploadBytes(storageRef, receiptFile);
      receiptUrl = await getDownloadURL(snapshot.ref);
    }
    await onAddPayment(item.id, {
      amount: val,
      date: new Date().toISOString(),
      note: note.trim(),
      paidBy: effectivePayer,
      ...(receiptUrl ? { receiptUrl } : {}),
    });
    setSaving(false);
    setAmount('');
    setNote('');
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-md w-full border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl text-white">{item.name}</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{t.paymentHistory}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Amount</p>
            <p className="text-sm font-medium text-white">₹{item.actual.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">{t.totalPaid}</p>
            <p className="text-sm font-medium text-emerald-400">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">{t.remaining}</p>
            <p className={`text-sm font-medium ${balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>₹{Math.max(0, balance).toLocaleString()}</p>
          </div>
        </div>

        {/* Progress bar */}
        {item.actual > 0 && (
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(100, (totalPaid / item.actual) * 100)}%` }} />
          </div>
        )}

        {/* Payment history */}
        <div className="mb-6 space-y-2">
          {item.payments && item.payments.length > 0 ? (
            item.payments.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-400/10 flex items-center justify-center">
                    <IndianRupee size={12} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white">₹{p.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.paidBy && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-[#d4af37]/80 bg-[#d4af37]/10 px-1.5 py-0.5 rounded-full border border-[#d4af37]/15">
                          <User size={8} /> {p.paidBy}
                        </span>
                      )}
                      {p.note && <span className="text-[10px] text-white/30">{p.note}</span>}
                      {p.receiptUrl && (
                        <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[9px] text-blue-400/80 bg-blue-400/10 px-1.5 py-0.5 rounded-full border border-blue-400/15 hover:bg-blue-400/20 transition-colors">
                          <Image size={8} /> Receipt
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-white/30 font-mono whitespace-nowrap ml-3">
                  {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-white/20 text-sm py-4">{t.noPayments}</p>
          )}
        </div>

        {/* Add payment form */}
        {balance > 0 && (
          <div className="border-t border-white/8 pt-6">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">{t.addPayment}</p>
            <div className="flex gap-3 mb-3">
              <input
                type="number"
                placeholder={t.paymentAmount}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors"
              />
              <button
                onClick={() => setAmount(String(balance))}
                className="px-3 py-2 rounded-xl border border-white/10 text-[10px] text-white/40 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all whitespace-nowrap"
              >
                Full ₹{balance.toLocaleString()}
              </button>
            </div>
            {/* Paid By selector */}
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{t.paidBy}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {PAYER_OPTIONS.map(name => (
                  <button
                    key={name}
                    onClick={() => { setPaidBy(name); setCustomPayer(''); }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${
                      paidBy === name
                        ? 'border-[#d4af37]/50 text-[#d4af37] bg-[#d4af37]/15'
                        : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {name}
                  </button>
                ))}
                <button
                  onClick={() => setPaidBy('__custom__')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${
                    paidBy === '__custom__'
                      ? 'border-[#d4af37]/50 text-[#d4af37] bg-[#d4af37]/15'
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  Other...
                </button>
              </div>
              {paidBy === '__custom__' && (
                <input
                  placeholder="Enter name..."
                  value={customPayer}
                  onChange={e => setCustomPayer(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors"
                />
              )}
            </div>
            <input
              placeholder={t.paymentNote}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#d4af37]/50 transition-colors mb-3"
            />
            {/* Receipt upload */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-white/5 border border-dashed border-white/15 rounded-xl hover:border-[#d4af37]/30 transition-colors">
                <Paperclip size={14} className="text-white/40" />
                <span className="text-xs text-white/40">{receiptFile ? receiptFile.name : 'Attach receipt (image/PDF)'}</span>
                <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
              </label>
              {receiptPreview && (
                <div className="mt-2 relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={receiptPreview} alt="Receipt preview" className="max-h-32 rounded-lg border border-white/10" />
                  <button onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
                    <X size={10} />
                  </button>
                </div>
              )}
              {receiptFile && !receiptPreview && (
                <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                  <Receipt size={12} /> {receiptFile.name}
                  <button onClick={() => { setReceiptFile(null); setReceiptPreview(null); }} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                </div>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !amount || parseFloat(amount) <= 0 || !effectivePayer}
              className="w-full py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : t.addPayment}
            </button>
          </div>
        )}
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
            { label: 'Amount (₹)', field: 'actual', type: 'number', colSpan: 2 },
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
  const [draft, setDraft] = useState({ name: '', bengaliName: '', category: 'misc' as ExpenseCategory, actual: '', notes: '', serial: '', event: activeEvent });
  const [saving, setSaving] = useState(false);
  const handleAdd = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    await onAdd({ ...draft, actual: parseFloat(draft.actual) || 0, payments: [], notes: draft.notes, active: true });
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
          <div className="col-span-2"><label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Amount (₹) *</label>
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
  const [selectedStatus, setSelectedStatus] = useState<'all' | PaymentStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [paymentItemId, setPaymentItemId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<{ itemId: string; idx: number; payment: Payment } | null>(null);
  const [editReceiptFile, setEditReceiptFile] = useState<File | null>(null);
  const [savingPaymentEdit, setSavingPaymentEdit] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; action: () => Promise<void> } | null>(null);

  // Derive paymentItem from live items so the modal always shows fresh data
  const paymentItem = paymentItemId ? items.find(i => i.id === paymentItemId) ?? null : null;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'expenses'), (snap) => {
      const list: ExpenseItem[] = [];
      snap.forEach((d) => {
        const data = d.data() as Omit<ExpenseItem, 'id'>;
        list.push({ ...{ payments: [] }, ...data, id: d.id });
      });
      setItems(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return field; }
      setSortDir('asc'); return field;
    });
  }, []);

  const filteredItems = useMemo(() => {
    const filtered = items.filter(i => {
      if (i.event !== activeEvent) return false;
      if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && getPaymentStatus(i) !== selectedStatus) return false;
      const s = searchTerm.toLowerCase();
      return !s || i.name.toLowerCase().includes(s) || (i.bengaliName || '').toLowerCase().includes(s) || i.category.toLowerCase().includes(s);
    });
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name')      cmp = a.name.localeCompare(b.name);
      if (sortField === 'category')  cmp = a.category.localeCompare(b.category);
      if (sortField === 'actual')    cmp = a.actual - b.actual;
      if (sortField === 'totalPaid') cmp = getTotalPaid(a) - getTotalPaid(b);
      if (sortField === 'balance')   cmp = getBalance(a) - getBalance(b);
      if (sortField === 'status') {
        const order: Record<PaymentStatus, number> = { unpaid: 0, partial: 1, paid: 2 };
        cmp = order[getPaymentStatus(a)] - order[getPaymentStatus(b)];
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, activeEvent, selectedCategory, selectedStatus, searchTerm, sortField, sortDir]);

  const stats = useMemo(() => {
    const active = filteredItems.filter(i => i.active !== false);
    const totalCost = active.reduce((a, b) => a + b.actual, 0);
    const totalPaid = active.reduce((a, b) => a + getTotalPaid(b), 0);
    const paidCount = active.filter(i => getPaymentStatus(i) === 'paid').length;
    return { totalCost, totalPaid, remaining: totalCost - totalPaid, itemCount: active.length, paidCount };
  }, [filteredItems]);

  const payerStats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredItems.forEach(item => {
      (item.payments || []).forEach(p => {
        const name = p.paidBy || 'Unknown';
        map[name] = (map[name] || 0) + p.amount;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredItems]);

  const updateAmount = useCallback(async (id: string, value: string) => {
    await updateDoc(doc(db, 'expenses', id), { actual: parseFloat(value) || 0, updatedAt: new Date() });
  }, []);

  const addPayment = useCallback(async (itemId: string, payment: Payment) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const updatedPayments = [...(item.payments || []), payment];
    const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0);
    await updateDoc(doc(db, 'expenses', itemId), {
      payments: updatedPayments,
      paid: totalPaid >= item.actual,
      updatedAt: new Date(),
    });
  }, [items]);

  const updatePayment = useCallback(async (itemId: string, paymentIdx: number, updated: Payment) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const updatedPayments = [...(item.payments || [])];
    updatedPayments[paymentIdx] = updated;
    const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0);
    await updateDoc(doc(db, 'expenses', itemId), {
      payments: updatedPayments,
      paid: totalPaid >= item.actual,
      updatedAt: new Date(),
    });
  }, [items]);

  const deletePayment = useCallback(async (itemId: string, paymentIdx: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const updatedPayments = (item.payments || []).filter((_, i) => i !== paymentIdx);
    const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0);
    await updateDoc(doc(db, 'expenses', itemId), {
      payments: updatedPayments,
      paid: totalPaid >= item.actual,
      updatedAt: new Date(),
    });
  }, [items]);

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
    items.filter(i => getPaymentStatus(i) !== 'paid' && i.event === activeEvent).forEach(i => {
      const totalPaid = getTotalPaid(i);
      const remaining = i.actual - totalPaid;
      if (remaining > 0) {
        const updatedPayments = [...(i.payments || []), { amount: remaining, date: new Date().toISOString(), note: 'Marked as paid', paidBy: '' }];
        batch.update(doc(db, 'expenses', i.id), { payments: updatedPayments, paid: true, updatedAt: new Date() });
      }
    });
    await batch.commit();
  }, [items, activeEvent]);

  const resetAll = useCallback(async () => {
    const batch = writeBatch(db);
    items.filter(i => i.event === activeEvent).forEach(i => {
      batch.update(doc(db, 'expenses', i.id), { payments: [], paid: false, updatedAt: new Date() });
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
    let csv = '\uFEFFNo,Expense,Category,Amount (₹),Paid (₹),Balance (₹),Status,Notes\n';
    filteredItems.filter(i => i.active !== false).forEach((item, idx) => {
      const totalPaid = getTotalPaid(item);
      csv += [`"${idx + 1}"`, `"${item.name}"`, `"${t[item.category]}"`,
        item.actual, totalPaid, Math.max(0, item.actual - totalPaid),
        `"${getPaymentStatus(item)}"`, `"${item.notes}"`].join(',') + '\n';
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
      {paymentItem && (
        <PaymentModal item={paymentItem} t={t} onAddPayment={addPayment} onClose={() => setPaymentItemId(null)} />
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
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t.totalCost}</span>
            <DollarSign size={16} className="text-[#d4af37]/60" />
          </div>
          <p className="text-2xl font-light text-white">₹{stats.totalCost.toLocaleString()}</p>
          <p className="text-[11px] text-white/30 mt-1">{stats.itemCount} {t.itemCount.toLowerCase()}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t.totalPaid}</span>
            <CreditCard size={16} className="text-emerald-400/60" />
          </div>
          <p className="text-2xl font-light text-emerald-400">₹{stats.totalPaid.toLocaleString()}</p>
          <p className="text-[11px] text-white/30 mt-1">{stats.paidCount}/{stats.itemCount} {t.paidCount.toLowerCase()}</p>
          {stats.totalCost > 0 && (
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(100, (stats.totalPaid / stats.totalCost) * 100)}%` }} />
            </div>
          )}
        </div>
        <div className={`glass-panel rounded-2xl p-5 border ${stats.remaining > 0 ? 'border-amber-400/20' : 'border-emerald-400/20'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t.remaining}</span>
            <TrendingDown size={16} className={stats.remaining > 0 ? 'text-amber-400/60' : 'text-emerald-400/60'} />
          </div>
          <p className={`text-2xl font-light ${stats.remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            ₹{Math.max(0, stats.remaining).toLocaleString()}
          </p>
          <p className="text-[11px] text-white/30 mt-1">of ₹{stats.totalCost.toLocaleString()} total</p>
        </div>
        <div className="glass-panel rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t.progress}</span>
          </div>
          <p className="text-2xl font-light text-white">
            {stats.totalCost > 0 ? Math.round((stats.totalPaid / stats.totalCost) * 100) : 0}%
          </p>
          <p className="text-[11px] text-white/30 mt-1">of total cost paid</p>
        </div>
      </div>

      {/* Who Paid How Much */}
      {payerStats.length > 0 && (
        <div className="glass-panel rounded-2xl border border-white/8 p-4 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-white/30 mr-1">
            <User size={10} className="inline -mt-0.5 mr-1" />Paid By
          </span>
          {payerStats.map(([name, amount]) => (
            <div key={name} className="flex items-center gap-2 bg-white/5 rounded-xl px-3.5 py-2 border border-white/8">
              <span className="text-xs text-[#d4af37] font-medium">{name}</span>
              <span className="text-xs text-emerald-400 font-mono">₹{amount.toLocaleString()}</span>
              {stats.totalPaid > 0 && (
                <span className="text-[9px] text-white/25">({Math.round((amount / stats.totalPaid) * 100)}%)</span>
              )}
            </div>
          ))}
        </div>
      )}

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
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as 'all' | PaymentStatus)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 transition-colors">
          <option value="all" className="bg-[#0a0a0a]">{t.all}</option>
          <option value="unpaid" className="bg-[#0a0a0a]">{t.unpaid}</option>
          <option value="partial" className="bg-[#0a0a0a]">{t.partial}</option>
          <option value="paid" className="bg-[#0a0a0a]">{t.paid}</option>
        </select>
        <select value={`${sortField}_${sortDir}`}
          onChange={e => { const [f, d] = e.target.value.split('_'); setSortField(f as SortField); setSortDir(d as SortDir); }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/40 transition-colors">
          <option value="name_asc"      className="bg-[#0a0a0a]">Name A→Z</option>
          <option value="name_desc"     className="bg-[#0a0a0a]">Name Z→A</option>
          <option value="actual_asc"    className="bg-[#0a0a0a]">Amount ↑</option>
          <option value="actual_desc"   className="bg-[#0a0a0a]">Amount ↓</option>
          <option value="totalPaid_asc" className="bg-[#0a0a0a]">Paid ↑</option>
          <option value="totalPaid_desc" className="bg-[#0a0a0a]">Paid ↓</option>
          <option value="balance_asc"   className="bg-[#0a0a0a]">Balance ↑</option>
          <option value="balance_desc"  className="bg-[#0a0a0a]">Balance ↓</option>
          <option value="category_asc"  className="bg-[#0a0a0a]">Category A→Z</option>
          <option value="status_asc"    className="bg-[#0a0a0a]">Unpaid First</option>
          <option value="status_desc"   className="bg-[#0a0a0a]">Paid First</option>
        </select>
        <div className="flex gap-2">
          <button onClick={() => openConfirm('Mark All Paid', 'Mark every active expense as fully paid?', markAllPaid)}
            className="px-3 py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:border-emerald-400/30 hover:text-emerald-400 transition-all whitespace-nowrap">
            ✓ {t.markAllPaid}
          </button>
          <button onClick={() => openConfirm('Reset All Payments', 'Clear all payment records? This cannot be undone.', resetAll)}
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
                {([
                  ['name', t.tableName],
                  ['category', t.tableCategory],
                  ['actual', t.tableAmount],
                  ['totalPaid', t.tablePaid],
                  ['balance', t.tableBalance],
                ] as [SortField, string][]).map(([field, label]) => (
                  <th key={field} onClick={() => toggleSort(field)}
                    className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest font-medium cursor-pointer select-none transition-colors hover:text-white/60 group"
                  >
                    <span className={`flex items-center gap-1.5 ${sortField === field ? 'text-[#d4af37]' : 'text-white/30'}`}>
                      {label}
                      {sortField === field
                        ? (sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)
                        : <ArrowUpDown size={10} className="opacity-30 group-hover:opacity-60" />}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableStatus}</th>
                <th className="px-4 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/30 font-medium">{t.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const totalPaid = getTotalPaid(item);
                const balance = Math.max(0, item.actual - totalPaid);
                const status = getPaymentStatus(item);
                const isExpanded = expandedId === item.id;
                const hasPayments = item.payments && item.payments.length > 0;
                return (
                  <Fragment key={item.id}>
                    <tr
                      className={`border-t border-white/5 transition-colors cursor-pointer ${status === 'paid' ? 'bg-emerald-400/3' : status === 'partial' ? 'bg-amber-400/3' : idx % 2 === 0 ? 'bg-white/1' : ''} ${isExpanded ? 'bg-white/3' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <td className="px-4 py-3.5 text-white/30 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <ChevronDown size={12} className={`text-white/20 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`text-sm font-medium ${status === 'paid' ? 'line-through text-white/30' : 'text-white'}`}>{item.name}</p>
                        {item.bengaliName && <p className="text-[10px] text-white/30 mt-0.5">{item.bengaliName}</p>}
                        {item.notes && <p className="text-[10px] text-white/20 mt-0.5 italic">{item.notes}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${CATEGORY_COLORS[item.category]}`}>
                          {t[item.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <input type="number" value={item.actual || ''}
                          onChange={e => updateAmount(item.id, e.target.value)}
                          className="w-24 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white text-center outline-none focus:border-[#d4af37]/40 transition-colors" />
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setPaymentItemId(item.id)}
                          className="flex items-center gap-1.5 group/pay"
                        >
                          <span className={`text-xs font-mono ${totalPaid > 0 ? 'text-emerald-400' : 'text-white/20'}`}>
                            ₹{totalPaid.toLocaleString()}
                          </span>
                          <span className="w-5 h-5 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] opacity-0 group-hover/pay:opacity-100 transition-opacity">
                            <Plus size={10} />
                          </span>
                        </button>
                        {hasPayments && (
                          <p className="text-[9px] text-white/20 mt-0.5">{item.payments.length} payment{item.payments.length > 1 ? 's' : ''}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono">
                        {item.actual > 0 ? (
                          <span className={balance > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                            ₹{balance.toLocaleString()}
                          </span>
                        ) : <span className="text-white/20">—</span>}
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPaymentItemId(item.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${STATUS_COLORS[status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                          {status === 'partial' ? t.partial : status === 'paid' ? t.paid : t.unpaid}
                        </button>
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setPaymentItemId(item.id)} className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all" title="Add Payment">
                            <IndianRupee size={13} />
                          </button>
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

                    {/* Expanded transaction row */}
                    {isExpanded && (
                      <tr className="bg-white/2">
                        <td colSpan={9} className="px-0 py-0">
                          <div className="px-6 py-5 ml-8 mr-4 border-l-2 border-[#d4af37]/20">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Receipt size={10} className="text-[#d4af37]/50" />
                                {t.paymentHistory} — {item.name}
                              </p>
                              {balance > 0 && (
                                <button
                                  onClick={() => setPaymentItemId(item.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all"
                                >
                                  <Plus size={10} /> {t.addPayment}
                                </button>
                              )}
                            </div>

                            {/* Summary bar */}
                            <div className="flex items-center gap-6 mb-4 text-xs">
                              <span className="text-white/40">Total: <span className="text-white font-medium">₹{item.actual.toLocaleString()}</span></span>
                              <span className="text-white/40">Paid: <span className="text-emerald-400 font-medium">₹{totalPaid.toLocaleString()}</span></span>
                              <span className="text-white/40">Balance: <span className={`font-medium ${balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>₹{balance.toLocaleString()}</span></span>
                              {item.actual > 0 && (
                                <div className="flex-1 max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(100, (totalPaid / item.actual) * 100)}%` }} />
                                </div>
                              )}
                            </div>

                            {hasPayments ? (
                              <div className="space-y-1.5">
                                {item.payments.map((p, pidx) => {
                                  const isEditing = editingPayment?.itemId === item.id && editingPayment?.idx === pidx;
                                  if (isEditing) {
                                    const ep = editingPayment!.payment;
                                    const setEp = (patch: Partial<Payment>) => setEditingPayment({ ...editingPayment!, payment: { ...ep, ...patch } });
                                    return (
                                      <div key={pidx} className="bg-white/5 rounded-xl px-4 py-3 border border-[#d4af37]/20 space-y-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-6 h-6 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] text-[10px] font-mono font-bold">{pidx + 1}</div>
                                          <input type="number" value={ep.amount || ''} onChange={e => setEp({ amount: Number(e.target.value) })}
                                            className="w-28 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-[#d4af37]/40" placeholder="Amount" />
                                          <input type="text" value={ep.note} onChange={e => setEp({ note: e.target.value })}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-[#d4af37]/40" placeholder="Note" />
                                        </div>
                                        <div className="flex items-center gap-2 ml-9 flex-wrap">
                                          <span className="text-[10px] text-white/30 mr-1">Paid by:</span>
                                          {PAYER_OPTIONS.map(name => (
                                            <button key={name} type="button" onClick={() => setEp({ paidBy: name })}
                                              className={`px-2.5 py-1 rounded-full text-[10px] border transition-all ${ep.paidBy === name ? 'bg-[#d4af37]/15 border-[#d4af37]/30 text-[#d4af37]' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
                                              {name}
                                            </button>
                                          ))}
                                        </div>
                                        {/* Receipt in edit mode */}
                                        <div className="flex items-center gap-2 ml-9 flex-wrap">
                                          {ep.receiptUrl && !editReceiptFile && (
                                            <>
                                              <a href={ep.receiptUrl} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border border-blue-400/15 text-blue-400/80 bg-blue-400/10 hover:bg-blue-400/20 transition-colors">
                                                <Image size={8} /> Current receipt <ExternalLink size={8} />
                                              </a>
                                              <button onClick={() => { setEp({ receiptUrl: '' }); setEditReceiptFile(null); }}
                                                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-red-400/15 text-red-400/50 hover:text-red-400 hover:border-red-400/30 transition-all">
                                                <Trash2 size={8} /> Remove
                                              </button>
                                            </>
                                          )}
                                          <label className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/30 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all cursor-pointer">
                                            <Paperclip size={8} /> {editReceiptFile ? editReceiptFile.name : (ep.receiptUrl ? 'Replace receipt' : 'Add receipt')}
                                            <input type="file" accept="image/*,.pdf" className="hidden"
                                              onChange={e => { if (e.target.files?.[0]) setEditReceiptFile(e.target.files[0]); }} />
                                          </label>
                                          {editReceiptFile && (
                                            <button onClick={() => setEditReceiptFile(null)}
                                              className="text-red-400/50 hover:text-red-400 transition-colors">
                                              <X size={10} />
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-9">
                                          <button disabled={savingPaymentEdit} onClick={async () => {
                                            setSavingPaymentEdit(true);
                                            try {
                                              let updatedEp = ep;
                                              if (editReceiptFile) {
                                                const storageRef = ref(storage, `receipts/${item.id}/${Date.now()}_${editReceiptFile.name}`);
                                                const snapshot = await uploadBytes(storageRef, editReceiptFile);
                                                const url = await getDownloadURL(snapshot.ref);
                                                updatedEp = { ...ep, receiptUrl: url };
                                              }
                                              await updatePayment(item.id, pidx, updatedEp);
                                              setEditingPayment(null);
                                              setEditReceiptFile(null);
                                            } finally {
                                              setSavingPaymentEdit(false);
                                            }
                                          }}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-emerald-400/15 border border-emerald-400/25 text-emerald-400 hover:bg-emerald-400/25 transition-all disabled:opacity-50">
                                            {savingPaymentEdit ? <><Loader2 size={10} className="animate-spin" /> Saving...</> : <><Check size={10} /> Save</>}
                                          </button>
                                          <button disabled={savingPaymentEdit} onClick={() => { setEditingPayment(null); setEditReceiptFile(null); }}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/10 text-white/40 hover:text-white/60 transition-all disabled:opacity-50">
                                            Cancel
                                          </button>
                                          <button disabled={savingPaymentEdit} onClick={() => { openConfirm('Delete Payment', `Delete payment #${pidx + 1} (₹${p.amount.toLocaleString()})?`, async () => { await deletePayment(item.id, pidx); setEditingPayment(null); setEditReceiptFile(null); }); }}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-red-400/15 text-red-400/50 hover:text-red-400 hover:border-red-400/30 transition-all ml-auto disabled:opacity-50">
                                            <Trash2 size={10} /> Delete
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={pidx} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-2.5 border border-white/5 group/tx">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 text-[10px] font-mono font-bold">
                                          {pidx + 1}
                                        </div>
                                        <div>
                                          <span className="text-sm text-white font-medium">₹{p.amount.toLocaleString()}</span>
                                          {p.note && <p className="text-[10px] text-white/25 italic mt-0.5">{p.note}</p>}
                                        </div>
                                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${p.paidBy ? 'text-[#d4af37]/80 bg-[#d4af37]/10 border-[#d4af37]/15' : 'text-white/20 bg-white/3 border-white/5'}`}>
                                          <User size={8} /> {p.paidBy || '—'}
                                        </span>
                                        {p.receiptUrl && (
                                          <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-blue-400/15 text-blue-400/80 bg-blue-400/10 hover:bg-blue-400/20 transition-colors">
                                            <Image size={8} /> Receipt
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingPayment({ itemId: item.id, idx: pidx, payment: { ...p } })}
                                          className="p-1.5 rounded-lg text-white/15 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all opacity-0 group-hover/tx:opacity-100">
                                          <Pencil size={11} />
                                        </button>
                                        <span className="text-[10px] text-white/25 font-mono whitespace-nowrap">
                                          {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-center text-white/15 text-xs py-4">{t.noPayments}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
