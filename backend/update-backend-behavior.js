#!/usr/bin/env node
const fs = require('fs');

const file = '/root/creonix/backend/server.js';
let content = fs.readFileSync(file, 'utf8');

// ===== УЛУЧШЕНИЕ 1: Обновить POST endpoint =====
const oldPost = `app.post('/api/neuro-comment', auth, (req, res) => {
  const c = req.body;
  const result = db.prepare(\`
    INSERT INTO neuro_comment_campaigns
    (name, target_channels, accounts_pool, prompt_context, tone, style, use_emoji, emoji_count,
     banned_words, min_post_length, max_post_age_hours, max_per_day, max_per_account_per_day,
     delay_min_minutes, delay_max_minutes, active_hours_start, active_hours_end, active_days, ai_model)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  \`).run(
    c.name, JSON.stringify(c.target_channels), JSON.stringify(c.accounts_pool),
    c.prompt_context, c.tone || 'friendly', c.style || 'medium',
    c.use_emoji ? 1 : 0, c.emoji_count || '1-2', c.banned_words || '',
    c.min_post_length || 50, c.max_post_age_hours || 24, c.max_per_day || 50,
    c.max_per_account_per_day || 15, c.delay_min_minutes || 5, c.delay_max_minutes || 30,
    c.active_hours_start || '09:00', c.active_hours_end || '23:00',
    JSON.stringify(c.active_days || [1,2,3,4,5,6,7]),
    c.ai_model || 'claude-haiku-4-5-20251001'
  );
  // Update new fields separately (migration-safe)
  if (result.lastInsertRowid) {
    db.prepare(\`UPDATE neuro_comment_campaigns SET join_delay_min=?, join_delay_max=?, comment_probability=? WHERE id=?\`)
      .run(c.join_delay_min ?? 2, c.join_delay_max ?? 4, c.comment_probability ?? 1.0, result.lastInsertRowid);
  }
  res.json({ id: result.lastInsertRowid });
});`;

const newPost = `app.post('/api/neuro-comment', auth, (req, res) => {
  const c = req.body;
  const result = db.prepare(\`
    INSERT INTO neuro_comment_campaigns
    (name, target_channels, accounts_pool, prompt_context, tone, style, use_emoji, emoji_count,
     banned_words, min_post_length, max_post_age_hours, max_per_day, max_per_account_per_day,
     delay_min_minutes, delay_max_minutes, active_hours_start, active_hours_end, active_days, ai_model,
     behavior_mode, behavior_custom_settings)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  \`).run(
    c.name, JSON.stringify(c.target_channels), JSON.stringify(c.accounts_pool),
    c.prompt_context, c.tone || 'friendly', c.style || 'medium',
    c.use_emoji ? 1 : 0, c.emoji_count || '1-2', c.banned_words || '',
    c.min_post_length || 50, c.max_post_age_hours || 24, c.max_per_day || 50,
    c.max_per_account_per_day || 15, c.delay_min_minutes || 5, c.delay_max_minutes || 30,
    c.active_hours_start || '09:00', c.active_hours_end || '23:00',
    JSON.stringify(c.active_days || [1,2,3,4,5,6,7]),
    c.ai_model || 'claude-haiku-4-5-20251001',
    c.behavior_mode || 'natural',
    c.behavior_custom_settings ? JSON.stringify(c.behavior_custom_settings) : null
  );
  // Update new fields separately (migration-safe)
  if (result.lastInsertRowid) {
    db.prepare(\`UPDATE neuro_comment_campaigns SET join_delay_min=?, join_delay_max=?, comment_probability=? WHERE id=?\`)
      .run(c.join_delay_min ?? 2, c.join_delay_max ?? 4, c.comment_probability ?? 1.0, result.lastInsertRowid);
  }
  res.json({ id: result.lastInsertRowid });
});`;

if (content.includes(oldPost)) {
  content = content.replace(oldPost, newPost);
  console.log('✅ Обновлен POST /api/neuro-comment');
} else {
  console.log('⚠️ POST endpoint не найден');
}

// ===== УЛУЧШЕНИЕ 2: Обновить PUT endpoint =====
const oldPut = `app.put('/api/neuro-comment/:id', auth, (req, res) => {
  const c = req.body;
  db.prepare(\`
    UPDATE neuro_comment_campaigns SET
      name=?, target_channels=?, accounts_pool=?, prompt_context=?, tone=?, style=?,
      use_emoji=?, emoji_count=?, banned_words=?, min_post_length=?, max_post_age_hours=?,
      max_per_day=?, max_per_account_per_day=?, delay_min_minutes=?, delay_max_minutes=?,
      active_hours_start=?, active_hours_end=?, ai_model=?
    WHERE id=?
  \`).run(
    c.name, JSON.stringify(c.target_channels), JSON.stringify(c.accounts_pool),
    c.prompt_context, c.tone || 'friendly', c.style || 'medium',
    c.use_emoji ? 1 : 0, c.emoji_count || '1-2', c.banned_words || '',
    c.min_post_length || 50, c.max_post_age_hours || 24, c.max_per_day || 50,
    c.max_per_account_per_day || 15, c.delay_min_minutes || 5, c.delay_max_minutes || 30,
    c.active_hours_start || '00:00', c.active_hours_end || '23:00',
    c.ai_model || 'claude-haiku-4-5-20251001',
    req.params.id
  );
  db.prepare(\`UPDATE neuro_comment_campaigns SET join_delay_min=?, join_delay_max=?, comment_probability=? WHERE id=?\`)
    .run(c.join_delay_min ?? 2, c.join_delay_max ?? 4, c.comment_probability ?? 1.0, req.params.id);
  res.json({ ok: true });
});`;

const newPut = `app.put('/api/neuro-comment/:id', auth, (req, res) => {
  const c = req.body;
  db.prepare(\`
    UPDATE neuro_comment_campaigns SET
      name=?, target_channels=?, accounts_pool=?, prompt_context=?, tone=?, style=?,
      use_emoji=?, emoji_count=?, banned_words=?, min_post_length=?, max_post_age_hours=?,
      max_per_day=?, max_per_account_per_day=?, delay_min_minutes=?, delay_max_minutes=?,
      active_hours_start=?, active_hours_end=?, ai_model=?, behavior_mode=?, behavior_custom_settings=?
    WHERE id=?
  \`).run(
    c.name, JSON.stringify(c.target_channels), JSON.stringify(c.accounts_pool),
    c.prompt_context, c.tone || 'friendly', c.style || 'medium',
    c.use_emoji ? 1 : 0, c.emoji_count || '1-2', c.banned_words || '',
    c.min_post_length || 50, c.max_post_age_hours || 24, c.max_per_day || 50,
    c.max_per_account_per_day || 15, c.delay_min_minutes || 5, c.delay_max_minutes || 30,
    c.active_hours_start || '00:00', c.active_hours_end || '23:00',
    c.ai_model || 'claude-haiku-4-5-20251001',
    c.behavior_mode || 'natural',
    c.behavior_custom_settings ? JSON.stringify(c.behavior_custom_settings) : null,
    req.params.id
  );
  db.prepare(\`UPDATE neuro_comment_campaigns SET join_delay_min=?, join_delay_max=?, comment_probability=? WHERE id=?\`)
    .run(c.join_delay_min ?? 2, c.join_delay_max ?? 4, c.comment_probability ?? 1.0, req.params.id);
  res.json({ ok: true });
});`;

if (content.includes(oldPut)) {
  content = content.replace(oldPut, newPut);
  console.log('✅ Обновлен PUT /api/neuro-comment/:id');
} else {
  console.log('⚠️ PUT endpoint не найден');
}

fs.writeFileSync(file, content);
console.log('\n✅ Backend обновлен для работы с режимами поведения!');
