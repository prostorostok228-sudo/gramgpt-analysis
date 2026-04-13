#!/usr/bin/env node
import Database from 'better-sqlite3';

console.log('🔧 Добавление полей для режимов поведения...\n');

const db = new Database('/root/creonix/backend/creonix.db');

const accountsInfo = db.pragma('table_info(neuro_comment_campaigns)');
const accountsColumns = accountsInfo.map(c => c.name);

const columnsToAdd = [
  { name: 'behavior_mode', type: 'TEXT', default: "'natural'" },
  { name: 'behavior_custom_settings', type: 'TEXT', default: 'NULL' },
];

for (const col of columnsToAdd) {
  if (!accountsColumns.includes(col.name)) {
    try {
      db.exec(`ALTER TABLE neuro_comment_campaigns ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`);
      console.log(`✅ Добавлено поле: ${col.name}`);
    } catch (err) {
      console.log(`⚠️ Поле ${col.name} уже существует или ошибка: ${err.message}`);
    }
  } else {
    console.log(`ℹ️ Поле ${col.name} уже существует`);
  }
}

console.log('\n✅ Миграция завершена!');
db.close();
