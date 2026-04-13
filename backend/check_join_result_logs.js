import Database from 'better-sqlite3';

const db = new Database('/root/creonix/backend/creonix.db');

// Check for join success logs
console.log('=== Join Success Logs ===');
const logs1 = db.prepare(`SELECT datetime(created_at) as time, account_id, error_text FROM neuro_comment_logs
  WHERE campaign_id = 3 AND error_text LIKE '%Вступил в канал%'
  ORDER BY created_at DESC LIMIT 10`).all();
logs1.forEach(l => console.log(l.time, 'acc:' + l.account_id, l.error_text.substring(0, 50)));

// Check for delay logs
console.log('\n=== Delay Logs ===');
const logs2 = db.prepare(`SELECT datetime(created_at) as time, account_id, error_text FROM neuro_comment_logs
  WHERE campaign_id = 3 AND error_text LIKE '%задержка%'
  ORDER BY created_at DESC LIMIT 10`).all();
logs2.forEach(l => console.log(l.time, 'acc:' + l.account_id, l.error_text.substring(0, 50)));

// Check for API key skip logs
console.log('\n=== API Key Skip Logs ===');
const logs3 = db.prepare(`SELECT datetime(created_at) as time, account_id, error_text FROM neuro_comment_logs
  WHERE campaign_id = 3 AND error_text LIKE '%API key%'
  ORDER BY created_at DESC LIMIT 10`).all();
logs3.forEach(l => console.log(l.time, 'acc:' + l.account_id, l.error_text.substring(0, 50)));
