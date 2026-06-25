/**
 * UI translation dictionaries for the HMS.
 *
 * To translate a new string: add the key to the EN dictionary first (treat it
 * as the source-of-truth shape via `Dict`), then provide KA/RU copies.
 * Calls go through `t(...)` from src/lib/i18n/context.tsx which falls back
 * to the EN value (and finally the key itself) on any missing translation.
 */
export const LOCALES = ["ka", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ka";

export const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  ka: { label: "ქართული", flag: "🇬🇪" },
  en: { label: "English",  flag: "🇬🇧" },
  ru: { label: "Русский",  flag: "🇷🇺" },
};

const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading…",
    back: "Back",
    print: "Print",
    addUser: "Add User",
    logout: "Logout",
  },
  nav: {
    dashboard: "Dashboard",
    frontdesk: "Frontdesk",
    reservations: "Reservations",
    rooms: "Rooms",
    housekeeping: "Housekeeping",
    invoice: "Invoice",
    reports: "Reports",
  },
  auth: {
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    invalidCredentials: "Invalid email or password",
  },
  language: {
    label: "Language",
  },
};

export type Dict = typeof en;

const ka: Dict = {
  common: {
    save: "შენახვა",
    cancel: "გაუქმება",
    delete: "წაშლა",
    edit: "რედაქტირება",
    loading: "იტვირთება…",
    back: "უკან",
    print: "ბეჭდვა",
    addUser: "მომხმარებლის დამატება",
    logout: "გასვლა",
  },
  nav: {
    dashboard: "მთავარი",
    frontdesk: "რეცეფცია",
    reservations: "ჯავშნები",
    rooms: "ნომრები",
    housekeeping: "დასუფთავება",
    invoice: "ანგარიში-ფაქტურა",
    reports: "ანგარიშები",
  },
  auth: {
    email: "ელ. ფოსტა",
    password: "პაროლი",
    signIn: "შესვლა",
    invalidCredentials: "არასწორი ელ. ფოსტა ან პაროლი",
  },
  language: {
    label: "ენა",
  },
};

const ru: Dict = {
  common: {
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    edit: "Изменить",
    loading: "Загрузка…",
    back: "Назад",
    print: "Печать",
    addUser: "Добавить пользователя",
    logout: "Выход",
  },
  nav: {
    dashboard: "Главная",
    frontdesk: "Ресепшен",
    reservations: "Бронирования",
    rooms: "Номера",
    housekeeping: "Уборка",
    invoice: "Счёт-фактура",
    reports: "Отчёты",
  },
  auth: {
    email: "Эл. почта",
    password: "Пароль",
    signIn: "Войти",
    invalidCredentials: "Неверная эл. почта или пароль",
  },
  language: {
    label: "Язык",
  },
};

export const DICTIONARIES: Record<Locale, Dict> = { ka, en, ru };

// Walk a dot-path like 'nav.dashboard' through the dictionary, falling back to
// the EN dictionary on miss, and finally to the key string itself.
export function translate(locale: Locale, key: string): string {
  const fromActive = walk(DICTIONARIES[locale], key);
  if (fromActive !== undefined) return fromActive;
  const fromEn = walk(DICTIONARIES.en, key);
  return fromEn ?? key;
}

function walk(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cursor: unknown = obj;
  for (const p of parts) {
    if (typeof cursor !== "object" || cursor === null) return undefined;
    cursor = (cursor as Record<string, unknown>)[p];
  }
  return typeof cursor === "string" ? cursor : undefined;
}
