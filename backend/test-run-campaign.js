#!/usr/bin/env node
const path = require('path');

// Change to backend directory
process.chdir('/root/creonix/backend');

const Database = require('better-sqlite3');
const db = new Database('./creonix.db');

// Get campaign
const campaign = db.prepare("SELECT * FROM neuro_comment_campaigns WHERE id = 3").get();

console.log('========== TEST: Запуск функции runNeuroComment ==========');
console.log('Campaign:', {
  id: campaign.id,
  name: campaign.name,
  status: campaign.status,
  accounts_pool: campaign.accounts_pool,
  target_channels: campaign.target_channels.substring(0, 100)
});

// Try to get settings
try {
  console.log('\nТест 1: Чтение settings...');
  const settings = db.prepare('SELECT key, value FROM system_settings').all();
  console.log('✅ Settings загружены:', settings.length, 'записей');
} catch (e) {
  console.error('❌ Ошибка при чтении settings:', e.message);
  process.exit(1);
}

// Try to parse accounts_pool
try {
  console.log('\nТест 2: Парсинг accounts_pool...');
  const poolStr = campaign.accounts_pool;
  const accountIds = JSON.parse(poolStr);
  console.log('✅ Account IDs:', accountIds);

  const accounts = db.prepare('SELECT * FROM accounts WHERE id IN (' + accountIds.join(',') + ')').all();
  console.log('✅ Accounts найдены:', accounts.length);
  accounts.forEach(a => console.log('   -', a.id, a.phone, a.status));
} catch (e) {
  console.error('❌ Ошибка при парсинге accounts_pool:', e.message);
  process.exit(1);
}

// Try to parse target_channels
try {
  console.log('\nТест 3: Парсинг target_channels...');
  const channels = JSON.parse(campaign.target_channels);
  console.log('✅ Channels:', channels);
} catch (e) {
  console.error('❌ Ошибка при парсинге target_channels:', e.message);
  process.exit(1);
}

console.log('\n✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ - функция должна работать');
