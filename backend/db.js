import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'creonix.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    session_string TEXT,
    status TEXT DEFAULT 'inactive',
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    user_id BIGINT,
    avatar_path TEXT,
    proxy_host TEXT,
    proxy_port INTEGER,
    proxy_user TEXT,
    proxy_pass TEXT,
    proxy_type TEXT DEFAULT 'socks5',
    warmup_enabled INTEGER DEFAULT 0,
    warmup_level INTEGER DEFAULT 0,
    warmup_actions_today INTEGER DEFAULT 0,
    warmup_last_reset TEXT,
    flood_wait_until TEXT,
    last_activity TEXT,
    daily_actions INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS proxies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT,
    password TEXT,
    type TEXT DEFAULT 'socks5',
    country TEXT,
    status TEXT DEFAULT 'unknown',
    last_check TEXT,
    account_id INTEGER REFERENCES accounts(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parsing_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT NOT NULL,
    sources TEXT NOT NULL,
    filters TEXT DEFAULT '{}',
    account_id INTEGER REFERENCES accounts(id),
    status TEXT DEFAULT 'pending',
    result_count INTEGER DEFAULT 0,
    error_text TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    started_at TEXT,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS parsed_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES parsing_tasks(id),
    user_id BIGINT NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_premium INTEGER DEFAULT 0,
    is_bot INTEGER DEFAULT 0,
    last_seen TEXT,
    lang_code TEXT,
    source_channel TEXT,
    status TEXT DEFAULT 'new',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(task_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS neuro_comment_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_channels TEXT NOT NULL,
    accounts_pool TEXT NOT NULL,
    prompt_context TEXT DEFAULT '',
    tone TEXT DEFAULT 'friendly',
    style TEXT DEFAULT 'medium',
    use_emoji INTEGER DEFAULT 1,
    emoji_count TEXT DEFAULT '1-2',
    banned_words TEXT DEFAULT '',
    min_post_length INTEGER DEFAULT 50,
    max_post_age_hours INTEGER DEFAULT 24,
    max_per_day INTEGER DEFAULT 50,
    max_per_account_per_day INTEGER DEFAULT 15,
    delay_min_minutes INTEGER DEFAULT 5,
    delay_max_minutes INTEGER DEFAULT 30,
    active_hours_start TEXT DEFAULT '09:00',
    active_hours_end TEXT DEFAULT '23:00',
    active_days TEXT DEFAULT '[1,2,3,4,5,6,7]',
    status TEXT DEFAULT 'paused',
    total_comments INTEGER DEFAULT 0,
    comments_today INTEGER DEFAULT 0,
    last_comment_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS neuro_comment_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL REFERENCES neuro_comment_campaigns(id),
    account_id INTEGER REFERENCES accounts(id),
    channel TEXT,
    message_id BIGINT,
    post_text TEXT,
    comment_text TEXT,
    status TEXT,
    error_text TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS neuro_chat_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parsing_task_id INTEGER REFERENCES parsing_tasks(id),
    custom_user_list TEXT,
    accounts_pool TEXT NOT NULL,
    message_template TEXT NOT NULL,
    channel_link TEXT,
    ai_reply_enabled INTEGER DEFAULT 1,
    ai_reply_prompt TEXT,
    insert_link_mode TEXT DEFAULT 'after_no_reply',
    max_dialog_messages INTEGER DEFAULT 5,
    max_per_day INTEGER DEFAULT 50,
    max_per_account_per_day INTEGER DEFAULT 20,
    delay_min_seconds INTEGER DEFAULT 30,
    delay_max_seconds INTEGER DEFAULT 120,
    reply_delay_minutes INTEGER DEFAULT 3,
    only_with_username INTEGER DEFAULT 1,
    status TEXT DEFAULT 'paused',
    total_sent INTEGER DEFAULT 0,
    total_replied INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    sent_today INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    last_run TEXT
  );

  CREATE TABLE IF NOT EXISTS neuro_chat_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL REFERENCES neuro_chat_campaigns(id),
    user_id BIGINT NOT NULL,
    username TEXT,
    first_name TEXT,
    account_id INTEGER REFERENCES accounts(id),
    status TEXT DEFAULT 'pending',
    sent_at TEXT,
    last_reply_at TEXT,
    messages_count INTEGER DEFAULT 0,
    subscribed INTEGER DEFAULT 0,
    error_text TEXT,
    UNIQUE(campaign_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS neuro_chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    user_id BIGINT NOT NULL,
    direction TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS warmup_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    channels_to_read TEXT DEFAULT '["@durov","@telegram","@tginfo"]',
    read_enabled INTEGER DEFAULT 1,
    react_enabled INTEGER DEFAULT 1,
    comment_enabled INTEGER DEFAULT 0,
    reactions TEXT DEFAULT '["👍","❤️","🔥","🤔","😮"]',
    daily_limit INTEGER DEFAULT 30,
    delay_min_seconds INTEGER DEFAULT 30,
    delay_max_seconds INTEGER DEFAULT 180,
    active_hours_start TEXT DEFAULT '09:00',
    active_hours_end TEXT DEFAULT '22:00',
    auto_increase INTEGER DEFAULT 1,
    status TEXT DEFAULT 'running',
    actions_today INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    last_run TEXT
  );

  CREATE TABLE IF NOT EXISTS warmup_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES warmup_tasks(id),
    account_id INTEGER REFERENCES accounts(id),
    action TEXT,
    channel TEXT,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mass_react_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_channels TEXT NOT NULL,
    accounts_pool TEXT NOT NULL,
    reactions TEXT DEFAULT '["👍","❤️","🔥"]',
    posts_count INTEGER DEFAULT 10,
    max_post_age_days INTEGER DEFAULT 7,
    delay_min_seconds INTEGER DEFAULT 3,
    delay_max_seconds INTEGER DEFAULT 15,
    mode TEXT DEFAULT 'manual',
    schedule_cron TEXT,
    status TEXT DEFAULT 'idle',
    total_reactions INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    last_run TEXT
  );

  CREATE TABLE IF NOT EXISTS mass_react_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL REFERENCES mass_react_campaigns(id),
    account_id INTEGER REFERENCES accounts(id),
    channel TEXT,
    message_id BIGINT,
    reaction TEXT,
    status TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pipelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    steps TEXT NOT NULL,
    trigger_type TEXT DEFAULT 'manual',
    trigger_cron TEXT,
    status TEXT DEFAULT 'paused',
    current_step INTEGER DEFAULT 0,
    last_run TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pipeline_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id),
    status TEXT DEFAULT 'running',
    step_results TEXT DEFAULT '[]',
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS agent_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    summary TEXT,
    problems TEXT,
    recommendations TEXT,
    auto_applied TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS channel_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    subscribers INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    dms_sent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(date)
  );

  CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT DEFAULT 'info',
    module TEXT,
    message TEXT,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS channel_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    keyword TEXT NOT NULL,
    min_members INTEGER DEFAULT 0,
    result_limit INTEGER DEFAULT 100,
    account_id INTEGER REFERENCES accounts(id),
    status TEXT DEFAULT 'pending',
    result_count INTEGER DEFAULT 0,
    error_text TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    started_at TEXT,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS parsed_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_id INTEGER NOT NULL REFERENCES channel_searches(id),
    channel_id BIGINT,
    title TEXT,
    username TEXT,
    description TEXT,
    members_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(search_id, channel_id)
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO system_settings (key, value) VALUES
    ('channel_link', ''),
    ('channel_name', ''),
    ('password_hash', ''),
    ('telegram_notify_bot_token', ''),
    ('telegram_notify_chat_id', ''),
    ('claude_api_key', ''),
    ('agent_interval_hours', '6'),
    ('agent_auto_apply', '0'),
    ('tg_api_id', '2040'),
    ('tg_api_hash', 'b18441a1ff607e10a989891a5462e627'),
    ('timezone', 'UTC');
`);

// Migrations for columns added after initial schema
try { db.prepare(`ALTER TABLE neuro_comment_campaigns ADD COLUMN ai_model TEXT DEFAULT 'claude-haiku-4-5-20251001'`).run(); } catch (_) {}
try { db.prepare(`ALTER TABLE neuro_comment_campaigns ADD COLUMN join_delay_min INTEGER DEFAULT 2`).run(); } catch (_) {}
try { db.prepare(`ALTER TABLE neuro_comment_campaigns ADD COLUMN join_delay_max INTEGER DEFAULT 4`).run(); } catch (_) {}
try { db.prepare(`ALTER TABLE neuro_comment_campaigns ADD COLUMN comment_probability REAL DEFAULT 1.0`).run(); } catch (_) {}

// Migration: add timezone setting
db.prepare("INSERT OR IGNORE INTO system_settings (key, value) VALUES ('timezone', 'UTC')").run();

export default db;
