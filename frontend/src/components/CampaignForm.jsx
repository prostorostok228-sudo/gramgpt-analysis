import React, { useState, useEffect } from 'react';
import BehaviorModes from './BehaviorModes';
import '../styles/CampaignForm.css';

export default function CampaignForm({ campaign, onSave, onCancel }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    target_channels: '',
    accounts_pool: '',
    prompt_context: '',
    tone: 'friendly',
    style: 'medium',
    use_emoji: 1,
    emoji_count: '1-2',
    banned_words: '',
    min_post_length: 50,
    max_post_age_hours: 24,
    max_per_day: 50,
    max_per_account_per_day: 15,
    delay_min_minutes: 5,
    delay_max_minutes: 30,
    active_hours_start: '09:00',
    active_hours_end: '23:00',
    active_days: [1,2,3,4,5,6,7],
    behavior_mode: 'natural',
    behavior_custom_settings: null,
    ...campaign
  });

  useEffect(() => {
    if (campaign) {
      setFormData(prev => ({
        ...prev,
        ...campaign,
        active_days: Array.isArray(campaign.active_days) 
          ? campaign.active_days 
          : JSON.parse(campaign.active_days || '[1,2,3,4,5,6,7]')
      }));
    }
  }, [campaign]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      active_days: prev.active_days.includes(day)
        ? prev.active_days.filter(d => d !== day)
        : [...prev.active_days, day].sort()
    }));
  };

  const handleBehaviorModeSelect = (mode, customSettings = null) => {
    setFormData(prev => ({
      ...prev,
      behavior_mode: mode,
      behavior_custom_settings: customSettings ? JSON.stringify(customSettings) : null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      active_days: JSON.stringify(formData.active_days)
    };
    onSave(dataToSend);
  };

  return (
    <div className="campaign-form">
      <h2>{campaign ? '✏️ Редактировать кампанию' : '➕ Новая кампания'}</h2>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          📋 Основное
        </button>
        <button 
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI параметры
        </button>
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          ⏱️ Расписание
        </button>
        <button 
          className={`tab ${activeTab === 'behavior' ? 'active' : ''}`}
          onClick={() => setActiveTab('behavior')}
        >
          🎯 Режимы поведения
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* ВКЛАДКА: Основное */}
        {activeTab === 'basic' && (
          <div className="tab-content">
            <div className="form-group">
              <label>📛 Название кампании *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Например: Привлечение в канал #1"
              />
            </div>

            <div className="form-group">
              <label>📡 Целевые каналы *</label>
              <textarea
                name="target_channels"
                value={formData.target_channels}
                onChange={handleInputChange}
                required
                placeholder="Каналы через запятую или переносом строки&#10;Например:&#10;https://t.me/channel1&#10;https://t.me/channel2"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>👥 Пул аккаунтов для комментирования *</label>
              <textarea
                name="accounts_pool"
                value={formData.accounts_pool}
                onChange={handleInputChange}
                required
                placeholder="ID аккаунтов через запятую&#10;Например: 1,2,3,5,7"
                rows="3"
              />
            </div>
          </div>
        )}

        {/* ВКЛАДКА: AI параметры */}
        {activeTab === 'ai' && (
          <div className="tab-content">
            <div className="form-group">
              <label>💭 Контекст для AI</label>
              <textarea
                name="prompt_context"
                value={formData.prompt_context}
                onChange={handleInputChange}
                placeholder="Например: Мы маркетолог и пишем в контексте рынка недвижимости. Комментарии должны быть профессиональные но дружелюбные"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🎭 Тон голоса</label>
                <select name="tone" value={formData.tone} onChange={handleInputChange}>
                  <option value="friendly">Дружелюбный</option>
                  <option value="professional">Профессиональный</option>
                  <option value="casual">Разговорный</option>
                  <option value="formal">Формальный</option>
                  <option value="humorous">Юмористический</option>
                </select>
              </div>

              <div className="form-group">
                <label>🎨 Стиль письма</label>
                <select name="style" value={formData.style} onChange={handleInputChange}>
                  <option value="short">Короткие (1-2 предл)</option>
                  <option value="medium">Средние (3-5 предл)</option>
                  <option value="long">Развёрнутые (6+ предл)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>😀 Использовать эмодзи</label>
                <select name="use_emoji" value={formData.use_emoji} onChange={handleInputChange}>
                  <option value="1">Да</option>
                  <option value="0">Нет</option>
                </select>
              </div>

              <div className="form-group">
                <label>📊 Кол-во эмодзи в комментарии</label>
                <select name="emoji_count" value={formData.emoji_count} onChange={handleInputChange}>
                  <option value="0">Без эмодзи</option>
                  <option value="1-2">1-2</option>
                  <option value="2-3">2-3</option>
                  <option value="3-5">3-5</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>🚫 Запретные слова</label>
              <input
                type="text"
                name="banned_words"
                value={formData.banned_words}
                onChange={handleInputChange}
                placeholder="Слова через запятую (их не будет в комментариях)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>📝 Мин. длина поста для ответа (символов)</label>
                <input
                  type="number"
                  name="min_post_length"
                  value={formData.min_post_length}
                  onChange={handleInputChange}
                  min="10"
                />
              </div>

              <div className="form-group">
                <label>⏰ Макс. возраст поста (часов)</label>
                <input
                  type="number"
                  name="max_post_age_hours"
                  value={formData.max_post_age_hours}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: Расписание */}
        {activeTab === 'schedule' && (
          <div className="tab-content">
            <div className="form-row">
              <div className="form-group">
                <label>🚀 Макс. комментариев в день (все аккаунты)</label>
                <input
                  type="number"
                  name="max_per_day"
                  value={formData.max_per_day}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>👤 Макс. в день на аккаунт</label>
                <input
                  type="number"
                  name="max_per_account_per_day"
                  value={formData.max_per_account_per_day}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>⏱️ Мин. задержка между комментариями (мин)</label>
                <input
                  type="number"
                  name="delay_min_minutes"
                  value={formData.delay_min_minutes}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>⏱️ Макс. задержка между комментариями (мин)</label>
                <input
                  type="number"
                  name="delay_max_minutes"
                  value={formData.delay_max_minutes}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>🌅 Начало активных часов</label>
                <input
                  type="time"
                  name="active_hours_start"
                  value={formData.active_hours_start}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>🌙 Конец активных часов</label>
                <input
                  type="time"
                  name="active_hours_end"
                  value={formData.active_hours_end}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>📅 Активные дни недели</label>
              <div className="days-selector">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
                  <label key={idx} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.active_days.includes(idx + 1)}
                      onChange={() => handleDayToggle(idx + 1)}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА: Режимы поведения */}
        {activeTab === 'behavior' && (
          <BehaviorModes
            selectedMode={formData.behavior_mode}
            customSettings={formData.behavior_custom_settings ? JSON.parse(formData.behavior_custom_settings) : null}
            onSelect={handleBehaviorModeSelect}
          />
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-success">
            💾 Сохранить кампанию
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            ❌ Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
