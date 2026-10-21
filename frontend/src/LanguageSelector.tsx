import { useState, useRef, useEffect } from "react";
import { useTranslation, LanguageCode, SUPPORTED_LANGUAGES, LanguageOption } from "./i18n";

interface LanguageSelectorProps {
  variant?: "pill" | "select" | "minimal" | "dashboard-bar";
  className?: string;
  onLanguageChange?: (langCode: LanguageCode, langName: string) => void;
}

export function LanguageSelector({
  variant = "pill",
  className = "",
  onLanguageChange,
}: LanguageSelectorProps) {
  const { lang, languageObj, setLanguage, languages, indianLanguages, globalLanguages, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
    const chosen = languages.find((l) => l.code === code);
    if (onLanguageChange && chosen) {
      onLanguageChange(code, chosen.name);
    }
  };

  // Render native select for form fields / settings
  if (variant === "select") {
    return (
      <div className={`aarva-lang-select-wrap ${className}`}>
        <select
          value={lang}
          onChange={(e) => handleSelect(e.target.value as LanguageCode)}
          className="aarva-lang-native-select"
          aria-label={t("preferredLanguage")}
        >
          <optgroup label="🇮🇳 Indian Languages (भारतीय भाषाएं)">
            {indianLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} — {l.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="🌐 Global Languages">
            {globalLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} ({l.name})
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    );
  }

  const renderDropdownList = () => (
    <div className="aarva-lang-dropdown" role="listbox">
      <div className="aarva-lang-dropdown-header">
        <span>🇮🇳 {t("indianLanguages")}</span>
      </div>
      <div className="aarva-lang-dropdown-list">
        {indianLanguages.map((item) => {
          const isSelected = item.code === lang;
          return (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`aarva-lang-item ${isSelected ? "selected" : ""}`}
              onClick={() => handleSelect(item.code)}
            >
              <span className="item-flag">{item.flag}</span>
              <div className="item-text">
                <span className="item-native">{item.nativeName}</span>
                <span className="item-en">{item.name}</span>
              </div>
              {isSelected && (
                <svg
                  className="item-check"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="aarva-lang-dropdown-header" style={{ borderTop: "1px solid #f1f0f7" }}>
        <span>🌐 {t("globalLanguages")}</span>
      </div>
      <div className="aarva-lang-dropdown-list">
        {globalLanguages.map((item) => {
          const isSelected = item.code === lang;
          return (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`aarva-lang-item ${isSelected ? "selected" : ""}`}
              onClick={() => handleSelect(item.code)}
            >
              <span className="item-flag">{item.flag}</span>
              <div className="item-text">
                <span className="item-native">{item.nativeName}</span>
                <span className="item-en">{item.name}</span>
              </div>
              {isSelected && (
                <svg
                  className="item-check"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Dedicated Dashboard Top Bar widget with quick Indian language buttons
  if (variant === "dashboard-bar") {
    const quickLangs: LanguageCode[] = ["ta", "hi", "te", "en"];
    return (
      <div className={`aarva-dashboard-lang-bar ${className}`} ref={dropdownRef}>
        <div className="quick-lang-group" role="group" aria-label="Quick language switch">
          <span className="lang-bar-kicker">
            <span className="lang-globe-pulse">🌐</span>
            <span className="lang-label-text">{t("language")}:</span>
          </span>

          {quickLangs.map((qCode) => {
            const item = languages.find((l) => l.code === qCode);
            if (!item) return null;
            const isActive = item.code === lang;
            return (
              <button
                key={item.code}
                type="button"
                className={`quick-lang-btn ${isActive ? "active" : ""}`}
                onClick={() => handleSelect(item.code)}
                title={`${item.name} (${item.nativeName})`}
              >
                <span className="quick-flag">{item.flag}</span>
                <span className="quick-native">{item.nativeName}</span>
              </button>
            );
          })}
        </div>

        {/* More languages dropdown trigger */}
        <div className="aarva-lang-pill-container">
          <button
            type="button"
            className={`aarva-lang-more-btn ${open ? "open" : ""}`}
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-haspopup="listbox"
            title={t("selectLanguage")}
          >
            <span>{languageObj.region === "indian" && !quickLangs.includes(lang) ? `${languageObj.flag} ${languageObj.nativeName}` : "+ More"}</span>
            <svg
              className={`lang-chevron ${open ? "rotate" : ""}`}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {open && renderDropdownList()}
        </div>
      </div>
    );
  }

  // Standard Pill variant
  return (
    <div className={`aarva-lang-pill-container ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`aarva-lang-pill-btn ${open ? "open" : ""} ${variant === "minimal" ? "minimal" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t("selectLanguage")}
      >
        <span className="lang-icon" aria-hidden="true">🌐</span>
        <span className="lang-flag">{languageObj.flag}</span>
        <span className="lang-name">{languageObj.nativeName}</span>
        <svg
          className={`lang-chevron ${open ? "rotate" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && renderDropdownList()}
    </div>
  );
}
