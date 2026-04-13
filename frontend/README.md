# Creonix Frontend — Нейро Комментирование

## 📋 Структура проекта

```
/root/creonix/frontend/
├── src/
│   ├── App.jsx                 # Главный компонент
│   ├── main.jsx                # Точка входа React
│   ├── components/
│   │   ├── CampaignList.jsx    # Список кампаний
│   │   ├── CampaignForm.jsx    # Форма создания/редактирования кампаний с вкладками
│   │   ├── BehaviorModes.jsx   # Предустановки режимов поведения (⚡ Агрессивный, 🧑 Естественный, 🐢 Осторожный, 🎲 Случайный)
│   │   └── CustomBehavior.jsx  # Создание собственного пресета с полной кастомизацией
│   └── styles/
│       ├── index.css           # Глобальные стили
│       ├── App.css
│       ├── CampaignForm.css
│       ├── CampaignList.css
│       ├── BehaviorModes.css
│       └── CustomBehavior.css
├── index.html                  # HTML шаблон
├── package.json                # Зависимости (React, Vite)
└── vite.config.js              # Конфиг Vite
```

## 🚀 Установка и запуск

### Локально (для разработки)
```bash
cd /root/creonix/frontend
npm install
npm run dev
# Откроется на http://localhost:5173
```

### Сборка для production
```bash
cd /root/creonix/frontend
npm run build
# Файлы соберутся в ../backend/public
```

## 🎯 Новая вкладка "Режимы поведения"

### Предустановленные режимы:

**⚡ Агрессивный**
- Быстрое комментирование (0.2-0.5 сек чтения, 0.3-1 сек думания)
- До 200 комментариев/день
- Минимальные задержки между аккаунтами
- ⚠️ Высокий риск блокировки

**🧑 Естественный** (РЕКОМЕНДУЕТСЯ)
- Имитирует реального человека (0.5-2.5 сек чтения, 1-5 сек думания)
- До 50 комментариев/день
- Задержки 5-10 сек между аккаунтами
- ✅ Самый безопасный режим

**🐢 Осторожный**
- Очень медленное комментирование (2-4 сек чтения, 3-8 сек думания)
- До 20 комментариев/день
- Большие паузы между действиями
- 🔒 Максимально безопасный

**🎲 Случайный**
- Непредсказуемое поведение (вся вариативность)
- До 80 комментариев/день
- Очень сложно отследить паттерн
- 👁️ Очень человечное

### ⚙️ Создание собственного пресета

Кнопка "Создать свой пресет" открывает полную форму с параметрами:

**⏱️ Временные параметры:**
- Время чтения сообщения (мин-макс сек)
- Время раздумья перед комментарием (мин-макс сек)

**👥 Задержки между аккаунтами:**
- Базовая задержка (мин-макс сек)
- Случайное смещение (jitter) в сек

**📊 Ограничения:**
- Макс комментариев/день (все аккаунты)
- Макс на один аккаунт/день
- Задержка между комментариями (мин-макс мин)

## 📝 Что хранится в БД

```sql
ALTER TABLE neuro_comment_campaigns ADD COLUMN behavior_mode TEXT DEFAULT 'natural';
ALTER TABLE neuro_comment_campaigns ADD COLUMN behavior_custom_settings TEXT;
```

**behavior_mode:** одно из значений:
- `natural` (по умолчанию)
- `aggressive`
- `cautious`
- `random`
- `custom`

**behavior_custom_settings:** JSON с кастомными настройками (только если mode='custom')
```json
{
  "read_delay_min": 0.5,
  "read_delay_max": 2.5,
  "think_delay_min": 1,
  "think_delay_max": 5,
  "account_offset_min": 5,
  "account_offset_max": 10,
  "jitter_min": 0,
  "jitter_max": 30,
  "max_per_day": 50,
  "max_per_account": 15,
  "delay_min_minutes": 5,
  "delay_max_minutes": 30
}
```

## 🔌 API эндпоинты

### Получить кампании
```
GET /api/campaigns/neuro-comment
```

### Создать кампанию
```
POST /api/campaigns/neuro-comment
Body: { name, target_channels, accounts_pool, ..., behavior_mode, behavior_custom_settings }
```

### Обновить кампанию
```
PUT /api/campaigns/neuro-comment/:id
Body: { updated fields }
```

## 🛠️ Использованые технологии

- **React 18** — UI фреймворк
- **Vite 4** — быстрая сборка и dev сервер
- **CSS3** — стилизация с переменными и grid/flexbox

## 📱 Адаптивность

Все компоненты полностью адаптивны для мобильных, планшетов и десктопов.

## 🔐 Безопасность

- Все запросы к API используют fetch с правильными headers
- CORS настроены в Vite конфиге для проксирования на http://localhost:3001
- Нет hardcoded секретов

## 📦 Размер бандла

После сборки (npm run build):
- ~750KB JavaScript (минифицирован + GZIP: ~200KB)
- ~27KB CSS (минифицирован + GZIP: ~5KB)

## 🤝 Интеграция с backend

Backend должен обрабатывать новые поля:
1. **behavior_mode** — сохранять в БД
2. **behavior_custom_settings** — сохранять как JSON строку

При запуске кампании backend использует эти параметры для определения задержек.

---

**Готово к использованию!** 🎉
