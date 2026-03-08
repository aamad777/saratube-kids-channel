import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "search.placeholder": "Search fun videos...",
    "kids.zone": "Kids Zone",
    "upload": "Upload",
    "sign.in": "Sign In",
    "join.free": "Join Free!",
    "join": "Join",
    "notifications": "Notifications",
    "welcome.notification": "🎉 Welcome to KidsTube!",
    "welcome.notification.desc": "Start exploring fun videos for kids.",
    "themes.notification": "🎨 New themes available!",
    "themes.notification.desc": "Try out Robot, Fairy, and more themes.",
    "screentime.notification": "⏰ Screen time reminder",
    "screentime.notification.desc": "Set up daily limits in Parent Dashboard.",
    "no.more.notifications": "No more notifications",
    "my.profile": "My Profile",
    "parent.dashboard": "Parent Dashboard",
    "sign.out": "Sign Out",
    "change.theme": "Change Theme",
    "switch.profile": "Switch Profile",
    // Bottom Nav
    "nav.home": "Home",
    "nav.search": "Search",
    "nav.upload": "Upload",
    "nav.kids": "Kids",
    "nav.profile": "Profile",
    // Index / Hero
    "trending.now": "Trending Now ✨",
    // General
    "language": "Language",
  },
  ar: {
    // Header
    "search.placeholder": "ابحث عن فيديوهات ممتعة...",
    "kids.zone": "منطقة الأطفال",
    "upload": "رفع",
    "sign.in": "تسجيل الدخول",
    "join.free": "!انضم مجاناً",
    "join": "انضم",
    "notifications": "الإشعارات",
    "welcome.notification": "🎉 مرحباً بك في كيدز تيوب!",
    "welcome.notification.desc": "ابدأ باستكشاف فيديوهات ممتعة للأطفال.",
    "themes.notification": "🎨 ثيمات جديدة متاحة!",
    "themes.notification.desc": "جرب ثيمات الروبوت والجنية والمزيد.",
    "screentime.notification": "⏰ تذكير وقت الشاشة",
    "screentime.notification.desc": "اضبط الحدود اليومية في لوحة الوالدين.",
    "no.more.notifications": "لا توجد إشعارات أخرى",
    "my.profile": "ملفي الشخصي",
    "parent.dashboard": "لوحة الوالدين",
    "sign.out": "تسجيل الخروج",
    "change.theme": "تغيير الثيم",
    "switch.profile": "تبديل الملف الشخصي",
    // Bottom Nav
    "nav.home": "الرئيسية",
    "nav.search": "بحث",
    "nav.upload": "رفع",
    "nav.kids": "أطفال",
    "nav.profile": "الملف",
    // Index / Hero
    "trending.now": "الأكثر رواجاً ✨",
    // General
    "language": "اللغة",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("app-language") as Language) || "en";
  });

  const isRTL = language === "ar";

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  // Apply RTL direction to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
