import React, { useState } from 'react';
import '../styles/CustomBehavior.css';

const DEFAULT_SETTINGS = {
  read_delay_min: 0.5,
  read_delay_max: 2.5,
  think_delay_min: 1,
  think_delay_max: 5,
  account_offset_min: 5,
  account_offset_max: 10,
  jitter_min: 0,
  jitter_max: 30,
  max_per_day: 50,
  max_per_account: 15,
  delay_min_minutes: 5,
  delay_max_minutes: 30,
};

const PARAMETER_DESCRIPTIONS = {
  read_delay_min: 'Минимальное время чтения сообщения (сек)',
  read_delay_max: 'Максимальное время чтения сообщения (сек)',
  think_delay_min: 'Минимальное время раздумья перед отправкой (сек)',
  think_delay_max: 'Максимальное время раздумья перед отправкой (сек)',
  account_offset_min: 'Минимальная задержка между аккаунтами (сек)',
  account_offset_max: 'Максимальная задержка между аккаунтами (сек)',
  jitter_min: 'Минимальное случайное смещение (сек)',
  jitter_max: 'Максимальное случайное смещение (сек)',
  max_per_day: 'Максимум комментариев в день (все аккаунты)',
  max_per_account: 'Максимум комментариев на аккаунт в день',
  delay_min_minutes: 'Минимальная задержка между комментариями (мин)',
  delay_max_minutes: 'Максимальная задержка между комментариями (мин)',
};

export default function CustomBehavior({ initialSettings, onSave, onCancel }) {
  const [settings, setSettings] = useState({
    ...DEFAULT_SETTINGS,
    ...initialSettings
  });

  const [expandedSection, setExpandedSection] = useState('timing');

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS });
  };

  const handleSave = () => {
    onSave(settings);
  };

  const sections = {
    timing: {
      title: '⏱️ Временные параметры',
      icon: '⏱️',
      fields: ['read_delay_min', 'read_delay_max', 'think_delay_min', 'think_delay_max']
    },
    accounts: {
      title: '👥 Задержки между аккаунтами',
      icon: '👥',
      fields: ['account_offset_min', 'account_offset_max', 'jitter_min', 'jitter_max']
    },
    limits: {
      title: '📊 Ограничения',
      icon: '📊',
      fields: ['max_per_day', 'max_per_account', 'delay_min_minutes', 'delay_max_minutes']
    }
  };

  const calculateEstimate = () => {
    const { read_delay_min, read_delay_max, think_delay_min, think_delay_max, delay_min_minutes } = settings;
    const avgDelay = (delay_min_minutes * 60 + (read_delay_min + read_delay_max) / 2 + (think_delay_min + think_delay_max) / 2);
    return Math.floor(86400 / avgDelay); // Approx per day
  };

  return (
    <div className="custom-behavior">
      <h3>⚙️ Создайте собственный пресет поведения</h3>
      
      <div className="custom-content">
        {Object.entries(sections).map(([sectionKey, section]) => (
          <div key={sectionKey} className="settings-section">
            <button
              className="section-header"
              onClick={() => setExpandedSection(expandedSection === sectionKey ? null : sectionKey)}
            >
              <span>{section.icon} {section.title}</span>
              <span className="arrow">{expandedSection === sectionKey ? '▼' : '▶'}</span>
            </button>

            {expandedSection === sectionKey && (
              <div className="section-content">
                {section.fields.map(fieldKey => (
                  <div key={fieldKey} className="param-control">
                    <div className="param-info">
                      <label>{fieldKey.replace(/_/g, ' ')}</label>
                      <span className="param-desc">{PARAMETER_DESCRIPTIONS[fieldKey]}</span>
                    </div>
                    <div className="param-input">
                      <input
                        type="number"
                        step="0.1"
                        value={settings[fieldKey]}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        min="0"
                      />
                      <span className="unit">
                        {fieldKey.includes('delay') || fieldKey.includes('read') || fieldKey.includes('think') ? 'сек' : 
                         fieldKey.includes('minutes') ? 'мин' : 
                         'шт'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Предпросмотр эффекта */}
        <div className="preview-section">
          <h4>📈 Примерный эффект этих настроек</h4>
          <div className="preview-content">
            <div className="preview-item">
              <span className="preview-label">⏱️ Чтение + раздумье:</span>
              <span className="preview-value">
                {((settings.read_delay_min + settings.think_delay_min) / 2).toFixed(1)} - 
                {((settings.read_delay_max + settings.think_delay_max) / 2).toFixed(1)} сек
              </span>
            </div>
            <div className="preview-item">
              <span className="preview-label">👥 Между аккаунтами (с jitter):</span>
              <span className="preview-value">
                {(settings.account_offset_min + settings.jitter_min).toFixed(1)} - 
                {(settings.account_offset_max + settings.jitter_max).toFixed(1)} сек
              </span>
            </div>
            <div className="preview-item">
              <span className="preview-label">📊 Макс комментариев/день:</span>
              <span className="preview-value">{settings.max_per_day}</span>
            </div>
            <div className="preview-item estimate">
              <span className="preview-label">🎯 Примерно {calculateEstimate()} комментариев/день:</span>
              <span className="preview-subtext">(расчёт на основе задержек)</span>
            </div>
          </div>
        </div>

        {/* Примеры использования */}
        <div className="usage-tips">
          <h4>💡 Советы по выбору параметров</h4>
          <ul>
            <li>🔵 Безопасные значения: чтение 1-3сек, раздумье 2-5сек, между аккаунтами 5-15сек</li>
            <li>🟡 Средние значения: чтение 0.5-2сек, раздумье 1-3сек, между аккаунтами 3-10сек</li>
            <li>🔴 Агрессивные: чтение 0.2-0.5сек, раздумье 0.3-1сек, между аккаунтами 1-5сек</li>
            <li>⚠️ Если max_per_day выше 100 - очень рискованно, может привести к блокировкам</li>
            <li>💚 Рекомендуется: max_per_day не более 50, max_per_account не более 15</li>
          </ul>
        </div>
      </div>

      <div className="custom-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          💾 Сохранить пресет
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          🔄 Сбросить на стандартные
        </button>
        <button className="btn btn-danger" onClick={onCancel}>
          ❌ Отмена
        </button>
      </div>
    </div>
  );
}
