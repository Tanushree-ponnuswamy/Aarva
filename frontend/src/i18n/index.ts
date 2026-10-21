import i18n from "i18next";
import { initReactI18next, useTranslation as useReactI18nTranslation } from "react-i18next";

import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";
import te from "./locales/te.json";
import mr from "./locales/mr.json";
import ml from "./locales/ml.json";
import or from "./locales/or.json";
import bn from "./locales/bn.json";

export type LanguageCode = "en" | "ta" | "hi" | "te" | "mr" | "ml" | "or" | "bn";

export interface LanguageOption {
  code: LanguageCode;
  name: string;        // English name
  nativeName: string;  // Native script name
  flag: string;        // Flag icon
  region: "indian" | "global";
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", region: "global" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", region: "indian" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", region: "indian" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", region: "indian" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", region: "indian" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", region: "indian" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳", region: "indian" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", region: "indian" },
];

// Helper to determine initial language from user profile or cache
export const getInitialLanguage = (): LanguageCode => {
  if (typeof window === "undefined") return "en";

  try {
    const rawUser = localStorage.getItem("aarva_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u?.id) {
        const userScopedLang = localStorage.getItem(`aarva_language_user_${u.id}`) as LanguageCode;
        if (userScopedLang && SUPPORTED_LANGUAGES.some((l) => l.code === userScopedLang)) {
          return userScopedLang;
        }
      }
      if (u?.preferred_language) {
        const found = SUPPORTED_LANGUAGES.find(
          (l) =>
            l.code === u.preferred_language ||
            l.name.toLowerCase() === u.preferred_language.toLowerCase() ||
            l.nativeName === u.preferred_language
        );
        if (found) return found.code;
      }
    }
  } catch {
    // Fall back to default
  }

  return "en";
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
    hi: { translation: hi },
    te: { translation: te },
    mr: { translation: mr },
    ml: { translation: ml },
    or: { translation: or },
    bn: { translation: bn }
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

// Sync HTML document language and script attribute on change
if (typeof document !== "undefined") {
  const currentLang = i18n.resolvedLanguage || "en";
  document.documentElement.lang = currentLang;
  document.documentElement.setAttribute("data-lang", currentLang);

  i18n.on("languageChanged", (lng) => {
    document.documentElement.lang = lng;
    document.documentElement.setAttribute("data-lang", lng);
  });
}

// React custom hook for ergonomic use across dashboard components
export function useTranslation() {
  const { t, i18n: instance } = useReactI18nTranslation();
  const currentCode = (instance.resolvedLanguage || instance.language || "en") as LanguageCode;
  const currentObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0];

  const setLanguage = (newCode: LanguageCode) => {
    instance.changeLanguage(newCode);

    // 1. Scoped localStorage persistence
    try {
      const rawUser = localStorage.getItem("aarva_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u?.id) {
          localStorage.setItem(`aarva_language_user_${u.id}`, newCode);

          // 2. Persist to backend database
          fetch(`/api/student/preferences/${u.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ preferred_language: newCode }),
          }).catch(() => {
            // Non-blocking network sync
          });
        }
      }
      localStorage.setItem("aarva_language", newCode);
      window.dispatchEvent(new CustomEvent("aarva-language-change", { detail: { lang: newCode } }));
    } catch {
      // Safe fallback
    }
  };

  return {
    lang: currentCode,
    languageObj: currentObj,
    setLanguage,
    t: (key: string, defaultText?: string) => t(key, defaultText || key) as string,
    languages: SUPPORTED_LANGUAGES,
    indianLanguages: SUPPORTED_LANGUAGES.filter((l) => l.region === "indian"),
    globalLanguages: SUPPORTED_LANGUAGES.filter((l) => l.region === "global"),
    i18n: instance
  };
}

export default i18n;
