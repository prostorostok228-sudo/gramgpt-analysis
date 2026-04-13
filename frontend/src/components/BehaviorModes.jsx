import React, { useState } from 'react';
import CustomBehavior from './CustomBehavior';
import '../styles/BehaviorModes.css';

const BEHAVIOR_PRESETS = {
  aggressive: {
    name: '⚡ Агрессивный',
    emoji: '⚡',
    description: 'Быстрое комментирование, много активности',
    color: '#ff6b6b',
    settings: {
      read_delay_min: 0.2,
      read_delay_max: 0.5,
      think_delay_min: 0.3,
      think_delay_max: 1,
      account_offset_min: 2,
      account_offset_max: 5,
      jitter_min: 0,
      jitter_max: 10,
      max_per_day: 200,
      max_per_account: 50,
      delay_min_minutes: 2,
      delay_max_minutes: 10,
    },
    details: [
      '⏱️ Чтение сообщения: 0.2-0.5 сек (очень быстрое)',
      '💭 Раздумье перед комментарием: 0.3-1 сек (минимальное)',
      '👥 Между аккаунтами: 2-5 сек (мало задержки)',
      '🎲 Случайное смещение: 0-10 сек',
      '📊 До 200 комментариев в день',
      '⚠️ Высокий риск блокировки — используйте осторожно!'
    ]
  },
  natural: {
    name: '🧑 Естественный',
    emoji: '🧑',
    description: 'Как реальный человек — самый безопасный режим',
    color: '#4ecdc4',
    settings: {
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
    },
    details: [
      '⏱️ Чтение сообщения: 0.5-2.5 сек (имитация чтения)',
      '💭 Раздумье перед комментарием: 1-5 сек (естественное)',
      '👥 Между аккаунтами: 5-10 сек + случайное смещение',
      '🎲 Случайное смещение: 0-30 сек (высокое)',
      '📊 До 50 комментариев в день (консервативно)',
      '✅ Наиболее безопасный режим — рекомендуется для начинающих'
    ]
  },
  cautious: {
    name: '🐢 Осторожный',
    emoji: '🐢',
    description: 'Очень медленное и осторожное комментирование',
    color: '#95e1d3',
    settings: {
      read_delay_min: 2,
      read_delay_max: 4,
      think_delay_min: 3,
      think_delay_max: 8,
      account_offset_min: 15,
      account_offset_max: 30,
      jitter_min: 10,
      jitter_max: 60,
      max_per_day: 20,
      max_per_account: 5,
      delay_min_minutes: 15,
      delay_max_minutes: 60,
    },
    details: [
      '⏱️ Чтение сообщения: 2-4 сек (очень внимательное)',
      '💭 Раздумье перед комментарием: 3-8 сек (глубокое размышление)',
      '👥 Между аккаунтами: 15-30 сек (большая пауза)',
      '🎲 Случайное смещение: 10-60 сек (максимальное)',
      '📊 До 20 комментариев в день (минимум)',
      '🔒 Максимально безопасный режим для избежания блокировок'
    ]
  },
  random: {
    name: '🎲 Случайный',
    emoji: '🎲',
    description: 'Непредсказуемое поведение — очень человечное',
    color: '#f38181',
    settings: {
      read_delay_min: 0.3,
      read_delay_max: 4,
      think_delay_min: 0.5,
      think_delay_max: 10,
      account_offset_min: 1,
      account_offset_max: 30,
      jitter_min: 0,
      jitter_max: 60,
      max_per_day: 80,
      max_per_account: 20,
      delay_min_minutes: 3,
      delay_max_minutes: 45,
    },
    details: [
      '⏱️ Чтение: 0.3-4 сек (полностью случайное)',
      '💭 Раздумье: 0.5-10 сек (от быстрого до долгого)',
      '👥 Между аккаунтами: 1-30 сек (очень непредсказуемо)',
      '🎲 Случайное смещение: 0-60 сек (максимальная вариативность)',
      '📊 До 80 комментариев в день (среднее)',
      '👁️ Почти невозможно отследить паттерн — очень человечное'
    ]
  }
};

export default function BehaviorModes({ selectedMode, customSettings, onSelect }) {
  const [showCustom, setShowCustom] = useState(selectedMode === 'custom');
  const [customData, setCustomData] = useState(customSettings || {});

  const handlePresetSelect = (presetKey) => {
    setShowCustom(false);
    onSelect(presetKey);
  };

  const handleCustomSave = (settings) => {
    setCustomData(settings);
    onSelect('custom', settings);
  };

  return (
    <div className="behavior-modes">
      <h3>🎯 Выберите режим поведения</h3>
      <p className="behavior-description">
        Режим определяет как быстро система будет комментировать и насколько человечно выглядеть.
      </p>

      <div className="presets-grid">
        {Object.entries(BEHAVIOR_PRESETS).map(([key, preset]) => (
          <div
            key={key}
            className={`preset-card ${selectedMode === key && !showCustom ? 'selected' : ''}`}
            onClick={() => handlePresetSelect(key)}
            style={{ borderLeftColor: preset.color }}
          >
            <div className="preset-header">
              <span className="preset-emoji">{preset.emoji}</span>
              <h4>{preset.name}</h4>
            </div>
            <p className="preset-desc">{preset.description}</p>
            
            <details className="preset-details">
              <summary>📋 Подробные параметры</summary>
              <ul>
                {preset.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </details>

            <button
              className={`select-btn ${selectedMode === key && !showCustom ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePresetSelect(key);
              }}
            >
              {selectedMode === key && !showCustom ? '✅ Выбран' : '⭕ Выбрать'}
            </button>
          </div>
        ))}

        {/* Кастомный пресет */}
        <div
          className={`preset-card custom-card ${selectedMode === 'custom' ? 'selected' : ''}`}
          onClick={() => setShowCustom(true)}
        >
          <div className="preset-header">
            <span className="preset-emoji">⚙️</span>
            <h4>Создать свой пресет</h4>
          </div>
          <p className="preset-desc">Полностью кастомизируйте все параметры поведения</p>
          
          <details className="preset-details">
            <summary>🔧 Что можно настроить?</summary>
            <ul>
              <li>⏱️ Время чтения сообщения (мин-макс сек)</li>
              <li>💭 Время раздумья перед комментарием (мин-макс сек)</li>
              <li>👥 Задержка между аккаунтами (базовая и случайная)</li>
              <li>🎲 Случайное смещение (jitter) в сек</li>
              <li>📊 Макс. комментариев в день</li>
              <li>📈 Макс. на один аккаунт в день</li>
              <li>⏰ Задержка между комментариями (мин-макс мин)</li>
            </ul>
          </details>

          <button
            className={`select-btn ${selectedMode === 'custom' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowCustom(true);
            }}
          >
            {selectedMode === 'custom' ? '✅ Редактируется' : '⚙️ Создать'}
          </button>
        </div>
      </div>

      {/* Форма кастомного пресета */}
      {showCustom && (
        <CustomBehavior 
          initialSettings={customData}
          onSave={handleCustomSave}
          onCancel={() => setShowCustom(false)}
        />
      )}

      {/* Информация о выбранном режиме */}
      {selectedMode !== 'custom' && (
        <div className="selected-info">
          <h4>✅ Выбран режим: {BEHAVIOR_PRESETS[selectedMode]?.name}</h4>
          <div className="info-grid">
            {Object.entries(BEHAVIOR_PRESETS[selectedMode]?.settings || {}).map(([key, value]) => (
              <div key={key} className="info-item">
                <span className="param-name">{key}:</span>
                <span className="param-value">{typeof value === 'number' ? value : value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
