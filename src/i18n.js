import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import uk from "./locales/uk.json";
import sk from "./locales/sk.json"

const LANGUAGE_KEY = "cfg-studio-language";
const SUPPORTED = ["en", "sk", "uk"];

// The language the user picked last time, if storage is available.
function savedLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    return SUPPORTED.includes(saved) ? saved : "en";
  } catch {
    return "en";
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
    sk: { translation: sk },
  },
  lng: savedLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Keep <html lang> in sync (screen readers, hyphenation) and remember the choice.
document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // choice just won't persist
  }
});

export default i18n;
