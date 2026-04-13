# GramGPT.io — Полный Анализ Нейрокомментинга и Вступления в Каналы

**Дата анализа:** 2026-04-13  
**Аккаунт для исследования:** prosto_rostok (ID пользователя: 2056, профиль ID: 2048)

---

## 1. Технический стек

- **Frontend:** Nuxt.js 3 (Vite-сборка, CSS/JS чанки в `/_nuxt/`)
- **Backend API:** Django REST Framework на `api.gramgpt.io`
- **Auth:** NextAuth.js (`/api/authentication/`) + Django JWT (Bearer token)
- **WebSocket:** `wss://gramgpt.io`, `wss://api.gramgpt.io`
- **Хранилище сессий:** Cloudflare R2 (`.session` и `.json` файлы по URL вида `205ebf9bd417ab5590d1fac738f774fd.r2.cloudflarestorage.com/gramgpt/sessions/user_{id}/`)
- **Мониторинг ошибок:** Sentry

---

## 2. Авторизация

### NextAuth.js (Frontend)
```
GET  https://gramgpt.io/api/authentication/csrf
    → {"csrfToken": "..."}

POST https://gramgpt.io/api/authentication/callback/credentials
    Body (form-urlencoded): username=..., password=..., csrfToken=..., callbackUrl=...
    → 302 redirect на /dashboard (успех) или /api/auth/error?error=Login%20failed. (провал)

GET  https://gramgpt.io/api/authentication/session
    → {"user": {...}, "accessToken": "eyJ...", "expires": "..."}
```

### JWT для API вызовов
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Токен приходит в поле `accessToken` при получении сессии. **Время жизни: ~15 минут** (exp в payload).

### Структура пользователя
```json
{
  "id": 2048,               // профиль ID (используется в API)
  "user": {
    "id": 2056,             // Django user ID
    "username": "prosto_rostok"
  },
  "role": "customer",
  "subscription": {
    "plan": {"code": "month", "name": "Базовая лицензия", "price": "130.00"},
    "is_active": true
  },
  "oauth": {
    "telegram_id": 766576710,
    "is_telegram_linked": true
  }
}
```

---

## 3. API Endpoints

### Базовый URL: `https://api.gramgpt.io`

#### Аккаунты
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/telegram-accounts/` | Список аккаунтов (пагинация `?limit=&page=`) |
| POST | `/api/telegram-accounts/` | Добавить аккаунт |
| GET | `/api/telegram-accounts/get-for-manager/` | Полные данные включая metadata и string_session |
| PATCH | `/api/telegram-accounts/{id}/` | Обновить аккаунт |
| DELETE | `/api/telegram-accounts/{id}/` | Удалить аккаунт |

#### Скрипты (Задачи)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/scripts/` | Список всех скриптов/задач |
| POST | `/api/scripts/` | Создать и запустить скрипт |
| GET | `/api/scripts/{id}/` | Детали скрипта (включая результат) |
| PATCH | `/api/scripts/{id}/` | Обновить скрипт |
| DELETE | `/api/scripts/{id}/` | Удалить скрипт |

#### Прочее
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/modules/` | Список доступных модулей с описаниями |
| GET | `/api/users/me/` | Профиль текущего пользователя |
| GET | `/api/maintenance/status/` | Статус обслуживания |

---

## 4. Структура Аккаунта Telegram

```json
{
  "id": 45505,
  "name": "Алиса Федорова",
  "first_name": "Алиса Федорова",
  "last_name": "",
  "account_role": null,
  "note": "",
  "status": "valid",          // unchecked/valid/frozen/session_revoked/unauthorized/banned/...
  "geo": "US",               // Гео аккаунта (должно совпадать с прокси)
  "phone_number": "18572280405",
  "username": null,
  "spamblock": "unknown",    // unknown/clear/temporary/eternal
  "proxy": {
    "id": 6210,
    "ip": "172.121.48.194",
    "port": "64527",
    "protocol": "socks5",
    "login": "P34Mcimd",
    "password": "2ET692g3",
    "is_working": true,
    "last_latency_ms": null,
    "last_checked_at": "2026-04-12T...",
    "geo": "US"
  },
  "session_file": "https://...r2.cloudflarestorage.com/gramgpt/sessions/user_2056/{phone}.session?...",
  "json_file": "https://...r2.cloudflarestorage.com/gramgpt/sessions/user_2056/{phone}.json?...",
  "has_2fa": false,
  "two_fa_password": null,
  "metadata": {
    "telegram_id": 123456789,
    "first_name": "Алиса Федорова",
    "username": null,
    "is_bot": false,
    "is_premium": false,
    "has_2fa": false,
    "string_session": "1AZWarzUBu...",  // Telethon StringSession формат
    "status_history": [...]
  }
}
```

### Статусы аккаунтов (полный список из API)
- `unchecked` — Не проверен
- `valid` — Валидный ✅
- `frozen` — Заморожен ❄️
- `session_revoked` — Нужен повторный вход
- `unauthorized` — Разавторизирован
- `banned` — Забанен
- `spamblock` — Спамблок
- `quarantine` — На карантине
- `needs_reauth` — Требует реавторизации
- `session_expired` — Сессия истекла
- `deactivated` — Деактивирован
- `connection_failed` — Ошибка подключения
- `awaiting_proxy` — Ожидает настройки прокси

### Распределение у исследуемого пользователя (110 аккаунтов)
- valid: 68 (62%)
- frozen: 20 (18%)
- session_revoked: 17 (15%)
- unauthorized: 5 (5%)

---

## 5. Нейрокомментинг — Полная Схема Работы

### 5.1 Создание скрипта

```http
POST https://api.gramgpt.io/api/scripts/
Authorization: Bearer {token}
Content-Type: application/json

{
  "script_name": "neuro_commenting",
  "params": {
    "config": {
      // === КАНАЛЫ ===
      "channels": ["@username", "https://t.me/+invite_hash"],  // оба формата поддерживаются
      "channels_with_status": null,  // заполняется автоматически при работе
      
      // === АККАУНТЫ ===
      "account_ids": [45471, 45485, ...],  // ID аккаунтов для работы
      
      // === ЗАДЕРЖКИ ВСТУПЛЕНИЯ В КАНАЛЫ ===
      "avg_join_delay": 3,              // средняя задержка (минуты)
      "custom_join_delay_min": 2,       // минимальная задержка (минуты)
      "custom_join_delay_max": 4,       // максимальная задержка (минуты)
      
      // === ЗАДЕРЖКИ МЕЖДУ КОММЕНТАРИЯМИ ===
      "min_delay_seconds": 350,         // мин. задержка между комментариями (сек)
      "max_delay_seconds": 650,         // макс. задержка между комментариями (сек)
      
      // === КОММЕНТИРОВАНИЕ ===
      "use_ai": true,                   // использовать ИИ для генерации
      "ai_prompt_id": 419,              // ID промпта из базы (null = дефолтный)
      "comment_mode": "all",            // all / by_keywords
      "keywords": [],                   // ключевые слова (если comment_mode = by_keywords)
      "fallback_comments": null,        // список fallback комментариев
      "use_simple_message": false,      // использовать простое сообщение вместо ИИ
      "simple_message": "",             // текст простого сообщения
      "comment_probability": 0.3,       // вероятность комментирования (0-1)
      "edit_delay_seconds": 45,         // задержка перед редактированием комментария
      "language_mode": "auto",          // auto / manual
      "selected_language": "ru",
      
      // === ЛИМИТЫ ===
      "max_comments": 500,              // макс. комментариев за всё время
      "comments_per_account": 5,        // комментариев с одного аккаунта
      "max_comments_per_hour": 30,
      "max_comments_per_day": 200,
      "duration_minutes": 480,          // длительность работы в минутах (8 часов)
      "work_mode": "count",             // count / duration
      
      // === БЕЗОПАСНОСТЬ АККАУНТОВ ===
      "accountProtectionEnabled": true,
      "accountProtectionLevel": "balanced",  // safe / balanced / aggressive
      "enable_safety_limits": false,
      "pause_on_errors": true,
      "max_consecutive_errors": 5,
      
      // === ЛИЧНЫЕ СООБЩЕНИЯ ===
      "reply_to_pms": true,
      "pm_auto_reply_message": "Привет! Я сейчас занят...",
      "send_first_message": false,
      "first_message_text": "",
      
      // === РАСПРЕДЕЛЕНИЕ НАГРУЗКИ ===
      "execution_mode": "distributed",  // distributed / sequential
      "thread_count": 1,
      "concurrent_sends_per_thread": 3,
      
      // === ПРОЧЕЕ ===
      "folder_links": [],               // ссылки на папки для вступления
      "send_as_channels": null,
      "enable_send_as_channel": false,
      "strict_assignment": false,       // строгое назначение аккаунт→канал
      "target_assignments": {},         // {account_id: [channel1, channel2]}
      "enable_rotation": false,         // ротация аккаунтов
      "project_routes": null
    }
  }
}
```

**Ответ при успехе:**
```json
{
  "id": "uuid-...",
  "status": "queued",   // сразу становится "running"
  "script_name": "neuro_commenting",
  "created_at": "...",
  ...
}
```

### 5.2 Жизненный цикл скрипта

```
queued → running → completed/failed/cancelled
```

### 5.3 МЕХАНИЗМ ВСТУПЛЕНИЯ В КАНАЛЫ (КЛЮЧЕВОЕ!)

**Вступление происходит АВТОМАТИЧЕСКИ при старте скрипта.**

Алгоритм:
1. Скрипт берёт список `channels` из конфига
2. Каждый аккаунт из `account_ids` подключается через свой прокси (Telethon с StringSession)
3. Каждый аккаунт вступает в каждый канал из списка
4. Между вступлениями — случайная задержка от `custom_join_delay_min` до `custom_join_delay_max` минут
5. При успехе канал добавляется в `channels_with_status` как `{"username": "...", "has_comments": null}`
6. При ошибке вступления (приватный канал, бан, blacklist) — ошибка "Все каналы недоступны"

**Форматы каналов:**
- `@username` — публичный канал
- `https://t.me/+HASH` — приватный канал по инвайт-ссылке

**Задержки в реальном запуске пользователя:**
- `avg_join_delay: 3` (минуты)
- `custom_join_delay_min: 2`
- `custom_join_delay_max: 4`

### 5.4 Результат скрипта

```json
{
  "script_name": "neuro_commenting",
  "success_rate": 0.07,
  "total_accounts": 14,
  "failed_accounts": 0,
  "successful_accounts": 1,
  "account_results": [
    {
      "account_id": 41645,
      "account_name": "Таисия Виноградова",
      "success": true,
      "metrics": {
        "comments_posted": 0,
        "actions_count": 0,
        "successful_actions": 0,
        "failed_actions": 0
      },
      "execution_time": 61476.3   // миллисекунды
    }
  ],
  "execution_config": {
    "category": "neuro",
    "stagger_delay": 0.5,          // задержка между стартом аккаунтов (сек)
    "max_concurrent": 5,           // макс. одновременных аккаунтов
    "parallel_processing": false,
    "delay_between_accounts": 10,  // задержка между аккаунтами (сек)
    "max_concurrent_per_task": 1,
    "execution_time_per_account": 30
  }
}
```

### 5.5 Ошибки при вступлении

| Ошибка | Причина |
|--------|---------|
| "Все каналы недоступны (в чёрном списке или ошибка вступления)" | Канал закрыт для бота / забанил аккаунт / истекла инвайт-ссылка |

---

## 6. Прогрев Аккаунтов (account_auto_warming)

```json
{
  "script_name": "account_auto_warming",
  "params": {
    "config": {
      "active_hours_start": 9,
      "active_hours_end": 23,
      "timezone": "Europe/Moscow",
      "random_breaks": true,
      "warming_intensity": "normal",    // light / normal / aggressive
      "auto_adapt_intensity": true,
      "max_actions_per_hour": 15,
      "max_actions_per_day": 100,
      "max_joins_per_day": 8,
      "max_messages_per_day": 12,
      "progressive_limits": true,
      "session_duration_minutes": 30,
      "enable_channels": true,
      "channels_source": "subscriptions",  // subscriptions / custom
      "channels_to_read": [],
      "enable_groups": true,
      "groups_source": "random",
      "groups_to_join": [],
      "enable_reactions": true,
      "enable_stories": true,
      "enable_group_reading": true,
      "enable_inter_account_chat": true,
      "mute_joined_chats": false
    }
  }
}
```

---

## 7. Все Поддерживаемые Модули (script_name)

| script_name | Описание |
|-------------|----------|
| `neuro_commenting` | Нейрокомментинг в каналах |
| `account_auto_warming` | Автопрогрев аккаунтов |
| `mass_react` | Масс-реакции |
| `neuro_chatting` | Нейрочат (общение в группах) |
| `neuro_dialogs` | Нейродиалоги (ответы на ЛС) |
| `parsing` | Парсинг (базовый) |
| `parsing_comments` | Парсинг комментариев |
| `parsing_groups` | Парсинг групп |
| `parsing_messages` | Парсинг сообщений |
| `parsing_users` | Парсинг пользователей |

---

## 8. Технические Детали Сессий

### Форматы сессий
- **Telethon StringSession:** строка вида `1AZWarzUBu7...` — хранится в `metadata.string_session`
- **Файл сессии:** `.session` (SQLite Telethon) + `.json` (метаданные)
- **Хранилище:** Cloudflare R2 с временными подписанными URL (TTL: 7 дней)

### Прокси
- Протокол: SOCKS5
- Структура: `{ip, port, protocol, login, password, geo, is_working}`
- GEO прокси должен совпадать с GEO аккаунта

### API добавления аккаунта (POST /api/telegram-accounts/)
Поля для создания:
- `phone_number` — номер телефона
- `session_file` — upload .session файла
- `json_file` — upload .json файла  
- `proxy` — ID прокси
- `geo` — геолокация
- `has_2fa` — включена ли 2FA
- `two_fa_password` — пароль 2FA
- `name`, `first_name`, `last_name`
- `status` — начальный статус

---

## 9. Маршруты Приложения

```
/panel/modules/neuro-commenting   — Нейрокомментинг
/panel/modules/neuro-chatting     — Нейрочат  
/panel/modules/neuro-dialogs      — Нейродиалоги
/panel/modules/accounts/add-account — Добавление аккаунтов
/webapp/tasks                     — Активные задачи
/panel/accounts                   — Менеджер аккаунтов
/panel/account-viewer             — Просмотр аккаунта
/tools/channel-map                — Карта каналов
/panel/admin/user-tasks           — Задачи пользователей (admin)
/panel/admin/telegram-database    — База Telegram (admin)
```

---

## 10. Выводы и Применение к Creonix

### Ключевые Инсайты

1. **Вступление в каналы полностью автоматизировано** — при запуске скрипта аккаунты сами вступают в указанные каналы без отдельного шага.

2. **channels_with_status** — умный трекер. Показывает для каждого канала: вступили ли аккаунты, есть ли комментарии. Позволяет возобновлять прерванные сессии.

3. **target_assignments** — можно явно назначить какие аккаунты работают с какими каналами: `{"45471": ["@channel1"], "45472": ["@channel2"]}`. Это позволяет распределять нагрузку.

4. **Задержки вступления** хранятся в минутах (`custom_join_delay_min/max`), задержки комментирования — в секундах (`min/max_delay_seconds`).

5. **Защита аккаунтов:** три уровня — safe, balanced, aggressive. При `pause_on_errors: true` и `max_consecutive_errors: 5` скрипт паузится при подозрении на блокировку.

6. **execution_mode: "distributed"** — аккаунты работают распределённо, не одновременно. `stagger_delay: 0.5` сек между запуском каждого следующего аккаунта.

7. **Приватные каналы** (t.me/+HASH) поддерживаются наравне с публичными. Accounts вступают через инвайт-ссылку.

### Что Надо Улучшить в Creonix

1. **Авто-вступление в каналы при старте кампании** — сейчас нет механизма автоматического `JoinChannel` перед комментированием. Добавить: при старте кампании аккаунт вступает в канал если ещё не участник.

2. **channels_with_status поле** — добавить трекинг статуса для каждого канала в кампании (joined/not_joined/error).

3. **Поддержка invite-ссылок** — `https://t.me/+HASH` формат помимо `@username`.

4. **target_assignments** — назначение конкретных аккаунтов на конкретные каналы.

5. **Задержки вступления отдельно** от задержек комментирования — в Creonix это пока смешано.

6. **account_auto_warming** как отдельный модуль — настройки прогрева по расписанию.

7. **Уровни защиты аккаунтов** (safe/balanced/aggressive) вместо текущей простой заморозки.
