"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { translate, type Locale } from "./locales";

interface Ctx {
  locale: Locale;
  t: (key: string) => string;
}

const LocaleContext = createContext<Ctx>({
  locale: "ka",
  t: (k) => k,
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = useCallback((key: string) => translate(locale, key), [locale]);
  const value = useMemo(() => ({ locale, t }), [locale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation() {
  return useContext(LocaleContext);
}
