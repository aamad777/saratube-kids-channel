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
    "hero.welcome": "Welcome to",
    "hero.description": "The most fun place for kids to watch, create, and share amazing videos! Learn, play, and make new friends!",
    "hero.start.watching": "Start Watching",
    "hero.upload.video": "Upload Video",
    "hero.stat.videos": "Videos",
    "hero.stat.creators": "Creators",
    "hero.stat.happy.kids": "Happy Kids",
    // Watch Page
    "watch.back": "Back to Home",
    "watch.views": "views",
    "watch.ago": "2 days ago",
    "watch.subscribers": "subscribers",
    "watch.subscribe": "Subscribe",
    "watch.share": "Share",
    "watch.save": "Save",
    "watch.next": "Watch Next",
    // Child Select
    "child.whos.watching": "Who's Watching? 👀",
    "child.choose.profile": "Choose your profile to start watching!",
    "child.no.profiles": "No profiles yet!",
    "child.ask.parent": "Ask your parent to create your profile.",
    "child.go.parent": "Go to Parent Dashboard",
    "child.back": "Back",
    "child.hi": "Hi,",
    "child.enter.pin": "Enter your secret PIN 🔐",
    "child.wrong.pin": "Oops! Wrong PIN. Try again! 🙈",
    "child.loading": "Loading profiles...",
    // General
    "language": "Language",
    // Sign In
    "signin.welcome": "Welcome Back!",
    "signin.subtitle": "Sign in to SARATUBE! ✨",
    "signin.email": "Your email 📧",
    "signin.password": "Your secret password 🔐",
    "signin.button": "Let's Play! 🎮",
    "signin.signing.in": "Signing in...",
    "signin.forgot": "Forgot your password? 🔑",
    "signin.no.account": "Don't have an account?",
    "signin.join": "Join the fun! 🎉",
    "signin.reset.title": "Check Your Email!",
    "signin.reset.desc": "We sent a password reset link to",
    "signin.reset.back": "Back to Sign In",
    "signin.reset.prompt": "Enter your email and we'll send you a reset link 🔗",
    "signin.reset.button": "Send Reset Link 📧",
    "signin.reset.sending": "Sending...",
    // Sign Up
    "signup.title": "Parent Sign Up",
    "signup.subtitle": "Create a safe space for your kids! ✨",
    "signup.name": "Your name",
    "signup.email": "Email address",
    "signup.password": "Create a password (min 6 characters)",
    "signup.button": "Create Parent Account 🎉",
    "signup.creating": "Creating Account... ✨",
    "signup.has.account": "Already have an account?",
    "signup.signin": "Sign In",
    "signup.note": "After signing up, you'll be able to create PIN-protected profiles for your children.",
    "signup.feature.profiles": "Create Kid Profiles",
    "signup.feature.upload": "Upload Videos",
    "signup.feature.monitor": "Monitor Activity",
    "signup.feature.limits": "Set Time Limits",
    // Upload Page
    "upload.title": "Upload Your Video! 🎬",
    "upload.subtitle": "Share your awesome creations with friends!",
    "upload.file": "Upload File",
    "upload.paste.url": "Paste URL",
    "upload.drag": "Drag & Drop Your Video Here",
    "upload.browse": "or click to browse files",
    "upload.paste.title": "Paste Video URL",
    "upload.paste.desc": "YouTube, Vimeo, or direct video link",
    "upload.continue.url": "Continue with URL",
    "upload.thumbnail": "Thumbnail 🖼️ (optional)",
    "upload.thumbnail.add": "Add a thumbnail image for your video",
    "upload.video.title": "Video Title ✨",
    "upload.title.placeholder": "Give your video an awesome title!",
    "upload.description": "Description 📝",
    "upload.desc.placeholder": "Tell everyone what your video is about...",
    "upload.category": "Category 🎨",
    "upload.who.watch": "Who can watch? 👀",
    "upload.select.all": "Select All",
    "upload.no.children": "No linked children found.",
    "upload.link.child": "Link a child account",
    "upload.when.watch": "When can they watch? ⏰",
    "upload.available.from": "Available from (optional)",
    "upload.available.until": "Available until (optional)",
    "upload.no.restrict": "Leave empty for no time restrictions",
    "upload.cancel": "Cancel",
    "upload.publish": "Publish Video!",
    "upload.add.video": "Add Video!",
    "upload.uploading": "Uploading...",
    "upload.saving": "Saving...",
    "upload.signin.prompt": "Please sign in to upload videos.",
    "upload.video.url": "Video URL",
    // Parent Dashboard
    "parent.title": "Parent Dashboard",
    "parent.subtitle": "Monitor and manage your children's viewing experience 👨‍👩‍👧‍👦",
    "parent.my.kids": "My Kids",
    "parent.kids.pin": "Kids with PIN 🔐",
    "parent.linked.accounts": "Linked Accounts",
    "parent.no.children": "No children added yet",
    "parent.create.child": "Create Child Profile",
    "parent.link.account": "Link Existing Account",
    "parent.my.videos": "My Videos",
    "parent.photos": "Photos",
    "parent.ai.advisor": "AI Advisor",
    "parent.activity": "Activity",
    "parent.time.limits": "Time Limits",
    "parent.categories": "Categories",
    "parent.years.old": "years old",
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
    "hero.welcome": "مرحباً بك في",
    "hero.description": "أروع مكان للأطفال لمشاهدة وإنشاء ومشاركة فيديوهات رائعة! تعلم والعب وكوّن أصدقاء جدد!",
    "hero.start.watching": "ابدأ المشاهدة",
    "hero.upload.video": "رفع فيديو",
    "hero.stat.videos": "فيديوهات",
    "hero.stat.creators": "مبدعين",
    "hero.stat.happy.kids": "أطفال سعداء",
    // General
    "language": "اللغة",
    // Sign In
    "signin.welcome": "!مرحباً بعودتك",
    "signin.subtitle": "سجل الدخول إلى سارا تيوب! ✨",
    "signin.email": "بريدك الإلكتروني 📧",
    "signin.password": "كلمة المرور السرية 🔐",
    "signin.button": "!هيا نلعب 🎮",
    "signin.signing.in": "...جارٍ تسجيل الدخول",
    "signin.forgot": "نسيت كلمة المرور؟ 🔑",
    "signin.no.account": "ليس لديك حساب؟",
    "signin.join": "!انضم للمرح 🎉",
    "signin.reset.title": "!تحقق من بريدك",
    "signin.reset.desc": "أرسلنا رابط إعادة تعيين كلمة المرور إلى",
    "signin.reset.back": "العودة لتسجيل الدخول",
    "signin.reset.prompt": "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين 🔗",
    "signin.reset.button": "إرسال رابط إعادة التعيين 📧",
    "signin.reset.sending": "...جارٍ الإرسال",
    // Sign Up
    "signup.title": "تسجيل ولي الأمر",
    "signup.subtitle": "أنشئ مساحة آمنة لأطفالك! ✨",
    "signup.name": "اسمك",
    "signup.email": "البريد الإلكتروني",
    "signup.password": "أنشئ كلمة مرور (6 أحرف على الأقل)",
    "signup.button": "إنشاء حساب ولي الأمر 🎉",
    "signup.creating": "...جارٍ إنشاء الحساب ✨",
    "signup.has.account": "لديك حساب بالفعل؟",
    "signup.signin": "تسجيل الدخول",
    "signup.note": "بعد التسجيل، ستتمكن من إنشاء ملفات محمية برمز PIN لأطفالك.",
    "signup.feature.profiles": "إنشاء ملفات الأطفال",
    "signup.feature.upload": "رفع الفيديوهات",
    "signup.feature.monitor": "مراقبة النشاط",
    "signup.feature.limits": "تعيين حدود الوقت",
    // Upload Page
    "upload.title": "ارفع الفيديو الخاص بك! 🎬",
    "upload.subtitle": "شارك إبداعاتك الرائعة مع الأصدقاء!",
    "upload.file": "رفع ملف",
    "upload.paste.url": "لصق رابط",
    "upload.drag": "اسحب وأفلت الفيديو هنا",
    "upload.browse": "أو انقر لتصفح الملفات",
    "upload.paste.title": "لصق رابط الفيديو",
    "upload.paste.desc": "يوتيوب أو فيميو أو رابط فيديو مباشر",
    "upload.continue.url": "متابعة بالرابط",
    "upload.thumbnail": "صورة مصغرة 🖼️ (اختياري)",
    "upload.thumbnail.add": "أضف صورة مصغرة للفيديو",
    "upload.video.title": "عنوان الفيديو ✨",
    "upload.title.placeholder": "أعطِ فيديوك عنواناً رائعاً!",
    "upload.description": "الوصف 📝",
    "upload.desc.placeholder": "أخبر الجميع عن ماذا يتحدث الفيديو...",
    "upload.category": "الفئة 🎨",
    "upload.who.watch": "من يمكنه المشاهدة؟ 👀",
    "upload.select.all": "تحديد الكل",
    "upload.no.children": "لم يتم العثور على أطفال مرتبطين.",
    "upload.link.child": "ربط حساب طفل",
    "upload.when.watch": "متى يمكنهم المشاهدة؟ ⏰",
    "upload.available.from": "متاح من (اختياري)",
    "upload.available.until": "متاح حتى (اختياري)",
    "upload.no.restrict": "اتركه فارغاً بدون قيود زمنية",
    "upload.cancel": "إلغاء",
    "upload.publish": "!نشر الفيديو",
    "upload.add.video": "!إضافة فيديو",
    "upload.uploading": "...جارٍ الرفع",
    "upload.saving": "...جارٍ الحفظ",
    "upload.signin.prompt": "يرجى تسجيل الدخول لرفع الفيديوهات.",
    "upload.video.url": "رابط الفيديو",
    // Parent Dashboard
    "parent.title": "لوحة تحكم الوالدين",
    "parent.subtitle": "راقب وأدِر تجربة المشاهدة لأطفالك 👨‍👩‍👧‍👦",
    "parent.my.kids": "أطفالي",
    "parent.kids.pin": "أطفال برمز PIN 🔐",
    "parent.linked.accounts": "الحسابات المرتبطة",
    "parent.no.children": "لم تتم إضافة أطفال بعد",
    "parent.create.child": "إنشاء ملف طفل",
    "parent.link.account": "ربط حساب موجود",
    "parent.my.videos": "فيديوهاتي",
    "parent.photos": "الصور",
    "parent.ai.advisor": "مستشار الذكاء الاصطناعي",
    "parent.activity": "النشاط",
    "parent.time.limits": "حدود الوقت",
    "parent.categories": "الفئات",
    "parent.years.old": "سنوات",
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
