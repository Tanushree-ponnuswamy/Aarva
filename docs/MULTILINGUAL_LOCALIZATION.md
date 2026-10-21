# AARVA Multilingual Architecture & Localization Guide

**Last Updated:** 2026-10-21  
**Status:** Implemented & Verified  

---

## 1. Overview

AARVA now features full end-to-end multilingual localization tailored to user preference. The localization system encompasses:
1. **Frontend UI Localization:** Navigation menus, headers, buttons, cards, dashboard overviews, study plans, workspace tabs, settings, and profile views.
2. **Global Language Switcher:** Interactive glassmorphic pill dropdown available on both the public Landing Page, the main Dashboard top bar, and form controls.
3. **Database & User Preference Persistence:** Automatically syncs the user's chosen language with `localStorage` and persists via `PUT /api/student/preferences/{user_id}` to PostgreSQL.
4. **AI Summaries & Multi-turn Chat Adaptation:** Propagates the user's preferred language to `/api/summary/chat`, `/api/chat`, and `/api/summary/{book_id}`, instructing the underlying LLM to respond and summarize in the selected language.

---

## 2. Supported Languages

### Indian Languages (भारतीय भाषाएं / இந்திய மொழிகள்)
| Code | Language | Native Name | Flag | Regional Context |
| :--- | :--- | :--- | :---: | :--- |
| `ta` | **Tamil** | **தமிழ்** | 🇮🇳 | Tamil Nadu, Puducherry, Sri Lanka |
| `hi` | **Hindi** | **हिन्दी** | 🇮🇳 | Pan-India National Official Language |
| `te` | **Telugu** | **తెలుగు** | 🇮🇳 | Andhra Pradesh, Telangana |
| `kn` | **Kannada** | **ಕನ್ನಡ** | 🇮🇳 | Karnataka |
| `ml` | **Malayalam** | **മലയാളം** | 🇮🇳 | Kerala, Lakshadweep |
| `bn` | **Bengali** | **বাংলা** | 🇮🇳 | West Bengal, Tripura, Assam |
| `mr` | **Marathi** | **मराठी** | 🇮🇳 | Maharashtra, Goa |
| `gu` | **Gujarati** | **ગુજરાતી** | 🇮🇳 | Gujarat, Daman and Diu |
| `pa` | **Punjabi** | **ਪੰਜਾਬੀ** | 🇮🇳 | Punjab, Delhi, Haryana |
| `or` | **Odia** | **ଓଡ଼ିଆ** | 🇮🇳 | Odisha |

### Global Languages
| Code | Language | Native Name | Flag | Regional Context |
| :--- | :--- | :--- | :---: | :--- |
| `en` | English | English | 🇬🇧 | Global / Default |
| `es` | Spanish | Español | 🇪🇸 | International |
| `fr` | French | Français | 🇫🇷 | International |
| `de` | German | Deutsch | 🇩🇪 | International |

---

## 3. Architecture & Implementation

### 3.1. Frontend Modules
- **[i18n.ts](file:///d:/Aarva/frontend/src/i18n.ts):**
  - Defines `SUPPORTED_LANGUAGES`, types, translation dictionaries, and the `useTranslation()` React hook.
  - Automatically initializes from `localStorage.getItem("aarva_language")`, `aarva_user.preferred_language`, or the browser navigator language.
  - Handles automatic synchronization and backend persistence.
- **[LanguageSelector.tsx](file:///d:/Aarva/frontend/src/LanguageSelector.tsx):**
  - Reusable dropdown component with flag icons, native titles, active checkmarks, and outside-click dismiss.
  - Supports `"pill"` (for headers/navbars) and `"select"` (for Settings form inputs).
- **[App.tsx](file:///d:/Aarva/frontend/src/App.tsx):**
  - Integrated `LanguageSelector` into the Landing Page navigation bar, Dashboard header actions, and Settings -> Learning Preferences.
  - Dynamically localizes sidebar menu items, welcome cards, metrics, study plans, and workspace study tabs.
  - Transmits `selectedLang` to all AI endpoints (`/api/summary/chat`, `/api/chat`, `/api/summary/{book_id}`).
- **[index.css](file:///d:/Aarva/frontend/src/index.css):**
  - Styled with glassmorphic aesthetics, backdrop blurs, violet focus outlines, and smooth fade-in animations.

### 3.2. Backend Integration
- **[routes/students.py](file:///d:/Aarva/backend/routes/students.py):**
  - `GET /api/student/dashboard/{user_id}` returns user preferences including `preferred_language`.
  - `PUT /api/student/preferences/{user_id}` saves `preferred_language` to PostgreSQL.
- **[routes/summary.py](file:///d:/Aarva/backend/routes/summary.py):**
  - `GET /api/summary/{textbook_id}` accepts query parameter `language` to return localized summaries.
  - `POST /api/summary/chat` accepts `language` to prompt the LLM to reply in the user's preferred language.
- **[services/llama_service.py](file:///d:/Aarva/backend/services/llama_service.py):**
  - `chat_response` and `generate_structured_summary` enforce language instructions in LLM prompts.
