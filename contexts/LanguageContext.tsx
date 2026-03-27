import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Language, translations } from "../utils/translations";

const LANG_STORAGE_KEY = "app_language";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  isThai: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "th",
  setLang: () => {},
  t: (key) => translations.th[key],
  isThai: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("th");

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((saved) => {
      if (saved === "en" || saved === "th") {
        setLangState(saved);
      }
    });
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    AsyncStorage.setItem(LANG_STORAGE_KEY, newLang);
  }, []);

  const t = useCallback(
    (key: keyof typeof translations.en): string => {
      return translations[lang][key] ?? translations.en[key] ?? key;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t, isThai: lang === "th" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
