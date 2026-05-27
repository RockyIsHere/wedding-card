/**
 * Seed script: reads seed.data.json and uploads ALL items to Firestore.
 * Run: node scripts/seed-firestore.mjs
 *
 * Strategy:
 *  - grocery_list  → collection "groceryItems", category auto-detected
 *  - utensils_and_equipment_list → collection "groceryItems", category = "utensils"
 *  - "Crossed Out" items are stored with active:false (they can be filtered in the UI)
 *  - "Selected" items are active:true
 *  - "Not Specified" items are active:true with no quantity
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, '../service-account.json'), 'utf8'));
const seedData = JSON.parse(readFileSync(join(__dirname, '../seed.data.json'), 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ─── Category detection for grocery items ─────────────────────────────────────
function detectCategory(item) {
  const n = item.english_name.toLowerCase();
  const i = item.item_number;

  // Fish & meat (items 9–19 in original)
  if (i >= 9 && i <= 19) return 'fresh';

  // Vegetables & fruits
  const freshWords = ['fish', 'mutton', 'chicken', 'potato', 'gourd', 'cauliflower',
    'cabbage', 'pumpkin', 'jackfruit', 'drumstick', 'radish', 'papaya', 'pineapple',
    'mango', 'chilli', 'ginger', 'onion', 'garlic', 'tamarind', 'cucumber', 'tomato',
    'beetroot', 'carrot', 'lemon', 'coriander leaves', 'capsicum', 'french beans',
    'paneer', 'milk', 'butter', 'curd', 'yogurt', 'peas', 'spinach', 'bitter gourd',
    'eggplant', 'brinjal', 'ridge gourd', 'amaranth', 'hog plum', 'olive', 'plum',
    'amla', 'banana', 'pomegranate', 'apple', 'orange', 'featherback', 'carp',
    'rohu', 'hilsa', 'catfish', 'barramundi'];
  if (freshWords.some(w => n.includes(w))) return 'fresh';

  // Oils, spices, dry goods → groceries
  return 'groceries';
}

// ─── Clear existing collection ────────────────────────────────────────────────
async function clearCollection(collectionName) {
  console.log(`\n🗑  Clearing existing "${collectionName}" collection...`);
  const snap = await db.collection(collectionName).get();
  if (snap.empty) { console.log('   (empty, nothing to delete)'); return; }

  const CHUNK = 400;
  for (let i = 0; i < snap.docs.length; i += CHUNK) {
    const batch = db.batch();
    snap.docs.slice(i, i + CHUNK).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  console.log(`   ✓ Deleted ${snap.docs.length} documents`);
}

// ─── Build unified item list ──────────────────────────────────────────────────
function buildItems() {
  const items = [];

  const events = [
    { idSuffix: '', eventName: 'wedding', clearQty: false },
    { idSuffix: '-engagement', eventName: 'engagement', clearQty: true },
    { idSuffix: '-reception', eventName: 'reception', clearQty: true }
  ];

  // 1. Grocery list
  for (const raw of seedData.grocery_list) {
    const active = raw.status !== 'Crossed Out';
    for (const ev of events) {
      items.push({
        id: `g-${raw.item_number}${ev.idSuffix}`,
        serial: String(raw.item_number),
        name: raw.english_name,
        bengaliName: raw.bengali_name || '',
        qty: ev.clearQty ? '' : (raw.quantity || ''),
        category: detectCategory(raw),
        expected: 0,
        actual: 0,
        bought: false,
        active,
        notes: [
          raw.handwritten_notes || '',
          raw.status === 'Crossed Out' ? '(crossed out in original list)' : '',
        ].filter(Boolean).join(' · '),
        source: 'grocery_list',
        event: ev.eventName,
        updatedAt: new Date(),
      });
    }
  }

  // 2. Utensils / equipment list
  for (const raw of seedData.utensils_and_equipment_list) {
    const active = raw.status !== 'Crossed Out';
    for (const ev of events) {
      items.push({
        id: `u-${raw.item_number}${ev.idSuffix}`,
        serial: String(raw.item_number),
        name: raw.english_name,
        bengaliName: raw.bengali_name || '',
        qty: ev.clearQty ? '' : (raw.quantity || ''),
        category: 'utensils',
        expected: 0,
        actual: 0,
        bought: false,
        active,
        notes: [
          raw.handwritten_notes || '',
          raw.status === 'Crossed Out' ? '(crossed out in original list)' : '',
        ].filter(Boolean).join(' · '),
        source: 'utensils_list',
        event: ev.eventName,
        updatedAt: new Date(),
      });
    }
  }

  return items;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await clearCollection('groceryItems');

  const items = buildItems();
  const selected = items.filter(i => i.active);
  const crossed  = items.filter(i => !i.active);

  console.log(`\n🔥 Seeding ${items.length} total items (${selected.length} active + ${crossed.length} crossed-out) to "groceryItems"...\n`);

  const CHUNK = 400;
  let written = 0;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = db.batch();
    const chunk = items.slice(i, i + CHUNK);
    chunk.forEach(item => {
      const { id, ...data } = item;
      batch.set(db.collection('groceryItems').doc(id), data);
    });
    await batch.commit();
    written += chunk.length;
    console.log(`  ✓ Written ${written}/${items.length}`);
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Seed complete!`);
  console.log(`   📦 Grocery items  : ${seedData.grocery_list.length}`);
  console.log(`   🔧 Utensils/equip : ${seedData.utensils_and_equipment_list.length}`);
  console.log(`   ✅ Active (Selected/Not Specified): ${selected.length}`);
  console.log(`   ❌ Crossed out (stored, hidden): ${crossed.length}`);
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
