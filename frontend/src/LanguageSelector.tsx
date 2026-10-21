import { useState, useRef, useEffect, useMemo } from "react";
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
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
      // Auto-focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
    setSearch("");
    const chosen = languages.find((l) => l.code === code);
    if (onLanguageChange && chosen) {
      onLanguageChange(code, chosen.name);
    }
  };

  // Filtered lists based on search
  const filteredIndian = useMemo(() => {
    if (!search.trim()) return indianLanguages;
    const q = search.trim().toLowerCase();
    return indianLanguages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [indianLanguages, search]);

  const filteredGlobal = useMemo(() => {
    if (!search.trim()) return globalLanguages;
    const q = search.trim().toLowerCase();
    return globalLanguages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [globalLanguages, search]);

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
          <optgroup label="🌐 Global Languages">
            {globalLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} ({l.name})
              </option>
            ))}
          </optgroup>
          <optgroup label="🇮🇳 Indian Languages (भारतीय भाषाएं)">
            {indianLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} — {l.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    );
  }

  const renderDropdownItem = (item: LanguageOption) => {
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
  };

  const renderDropdownList = () => {
    const hasAnyResults = filteredIndian.length > 0 || filteredGlobal.length > 0;

    return (
      <div className="aarva-lang-dropdown" role="listbox">
        {/* Quick Search Input */}
        <div className="aarva-lang-search-box">
          <svg
            className="search-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="aarva-lang-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search language / भाषा..."
            aria-label="Search language"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="aarva-lang-dropdown-list">
          {filteredGlobal.length > 0 && (
            <>
              <div className="aarva-lang-dropdown-header">
                <span>🌐 {t("globalLanguages")}</span>
              </div>
              {filteredGlobal.map(renderDropdownItem)}
            </>
          )}

          {filteredIndian.length > 0 && (
            <>
              <div
                className="aarva-lang-dropdown-header"
                style={{ borderTop: filteredGlobal.length > 0 ? "1px solid #f1f0f7" : "none" }}
              >
                <span>🇮🇳 {t("indianLanguages")}</span>
              </div>
              {filteredIndian.map(renderDropdownItem)}
            </>
          )}

          {!hasAnyResults && (
            <div className="aarva-lang-no-results">
              <span>No language found matching "{search}"</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Single dropdown button trigger: Only ONE language visible at any time, English default
  return (
    <div className={`aarva-lang-pill-container ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`aarva-lang-pill-btn ${open ? "open" : ""} ${variant === "minimal" ? "minimal" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="AI Response Language"
      >
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
