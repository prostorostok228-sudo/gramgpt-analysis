#!/usr/bin/env node
import Database from 'better-sqlite3';

console.log('🔧 Обновление схемы БД для улучшений...\n');

const db = new Database('/root/creonix/backend/creonix.db');

// Добавить поля в таблицу accounts если их нет
const accountsInfo = db.pragma('table_info(accounts)');
const accountsColumns = accountsInfo.map(c => c.name);

const columnsToAdd = [
  { name: 'blocked_channels', type: 'TEXT', default: "''" },
  { name: 'slowmode_wait_until', type: 'DATETIME', default: 'NULL' },
  { name: 'proxy_failed_count', type: 'INTEGER', default: '0' },
  { name: 'proxy_failed_at', type: 'DATETIME', default: 'NULL' },
];

for (const col of columnsToAdd) {
  if (!accountsColumns.includes(col.name)) {
    try {
      db.exec(`ALTER TABLE accounts ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`);
      console.log(`✅ Добавлено поле: ${col.name}`);
    } catch (err) {
      console.log(`⚠️ Поле ${col.name} уже существует или ошибка: ${err.message}`);
    }
  } else {
    console.log(`ℹ️ Поле ${col.name} уже существует`);
  }
}

// Создать индекс для быстрого поиска по flood_wait_until
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_accounts_flood_wait ON accounts(flood_wait_until)`);
  console.log(`✅ Создан индекс для flood_wait_until`);
} catch (err) {
  console.log(`ℹ️ Индекс уже существует`);
}

// Создать индекс для быстрого поиска активных аккаунтов
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status, flood_wait_until)`);
  console.log(`✅ Создан индекс для поиска активных аккаунтов`);
} catch (err) {
  console.log(`ℹ️ Индекс уже существует`);
}

console.log('\n✅ Обновление БД завершено!');
db.close();
