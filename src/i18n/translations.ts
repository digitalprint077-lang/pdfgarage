import type { Locale } from "./languages";

export type TranslationKey =
  | "appTitle"
  | "homeTitle"
  | "homeSubtitle"
  | "tools"
  | "pricing"
  | "selectFileTitle"
  | "selectFileHint"
  | "selectFile"
  | "selectFiles"
  | "fromUrl"
  | "load"
  | "convertTo"
  | "working"
  | "convert"
  | "mergePdfs"
  | "compress"
  | "extractArchive"
  | "createZip"
  | "runOcr"
  | "translateDoc"
  | "ocrLanguage"
  | "outputFormat"
  | "translateFrom"
  | "translateTo"
  | "engines"
  | "limitedMode"
  | "popularConversions"
  | "formatCatalog"
  | "formatCatalogDesc"
  | "commonConversionTypes"
  | "formatsListed"
  | "browseFormats"
  | "securityTitle"
  | "securityDesc"
  | "footerLocal"
  | "toolGroups.convert"
  | "toolGroups.optimize"
  | "toolGroups.merge"
  | "toolGroups.archives"
  | "toolGroups.ocr"
  | "toolGroups.translate"
  | "login"
  | "signup"
  | "logout"
  | "loginTitle"
  | "loginSubtitle"
  | "signupTitle"
  | "signupSubtitle"
  | "email"
  | "password"
  | "name"
  | "optional"
  | "passwordHint"
  | "passwordMinLength"
  | "noAccount"
  | "haveAccount"
  | "loginFailed"
  | "signupFailed"
  | "emailOrUsername"
  | "forgotPassword"
  | "continue"
  | "profile"
  | "profileWelcome"
  | "profileAccount"
  | "profileDetails"
  | "profileQuickActions"
  | "profileSaveChanges"
  | "profileSaved"
  | "profileSaveFailed"
  | "profileNamePlaceholder"
  | "profileSignInMethod"
  | "profileGoogleAccount"
  | "profileEmailAccount"
  | "profileUserId"
  | "profileStartConverting"
  | "profileContactSupport"
  | "profileSecurityInfo"
  | "profilePrivacyNote"
  | "profilePrivacyDesc"
  | "memberSince"
  | "backToHome"
  | "dashOverview"
  | "dashActivity"
  | "dashSecurity"
  | "dashPlan"
  | "dashTotalConversions"
  | "dashThisMonth"
  | "dashOcrJobs"
  | "dashTranslateJobs"
  | "dashUsageThisMonth"
  | "dashRemaining"
  | "dashRecentActivity"
  | "dashNoActivity"
  | "dashNoActivityHint"
  | "dashFile"
  | "dashOperation"
  | "dashFormat"
  | "dashDate"
  | "dashStatus"
  | "dashSuccess"
  | "dashCurrentPlan"
  | "dashFreePlan"
  | "dashPlanDesc"
  | "dashMonthlyLimit"
  | "dashMaxFileSize"
  | "dashUnlimitedLocal"
  | "dashUpgradeSoon"
  | "dashBreakdown"
  | "dashLastActive"
  | "dashNever"
  | "dashSupportTickets"
  | "dashChangePassword"
  | "dashCurrentPassword"
  | "dashNewPassword"
  | "dashPasswordUpdated"
  | "dashPasswordFailed"
  | "dashGoogleConnected"
  | "dashEmailVerified"
  | "dashAccountStatus"
  | "dashActive"
  | "dashLoading";

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  appTitle: "PDF Garage",
  homeTitle: "Convert Any File",
  homeSubtitle:
    "Drop a file and pick what to turn it into. Supports documents, images, audio, video, OCR, translation, archives and more.",
  tools: "Tools",
  pricing: "Pricing",
  selectFileTitle: "Select your file here to get started",
  selectFileHint: "or drop your file here.",
  selectFile: "Select File",
  selectFiles: "Select Files",
  fromUrl: "From URL",
  load: "Load",
  convertTo: "Convert to",
  working: "Working…",
  convert: "Convert",
  mergePdfs: "Merge PDFs",
  compress: "Compress",
  extractArchive: "Extract Archive",
  createZip: "Create ZIP",
  runOcr: "Run OCR",
  translateDoc: "Translate",
  ocrLanguage: "OCR language",
  outputFormat: "Output format",
  translateFrom: "From language",
  translateTo: "To language",
  engines: "Engines",
  limitedMode: "Some conversion engines are temporarily unavailable.",
  popularConversions: "Popular conversions",
  formatCatalog: "Format Catalog",
  formatCatalogDesc:
    "Handles {total} formats across {categories} categories — documents, images, audio, video, archives and more.",
  commonConversionTypes: "Common conversion types",
  formatsListed: "listed",
  browseFormats: "Browse by category",
  securityTitle: "Your files stay private",
  securityDesc:
    "Files are transferred over encrypted connections, processed on secure servers, and automatically deleted after conversion.",
  footerLocal: "Secure cloud file conversion — files are deleted automatically after processing.",
  "toolGroups.convert": "Convert Files",
  "toolGroups.optimize": "Optimize Files",
  "toolGroups.merge": "Merge Files",
  "toolGroups.archives": "Archives",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "Translate",
  login: "Log in",
  signup: "Sign up",
  logout: "Log out",
  loginTitle: "Welcome back",
  loginSubtitle: "Sign in to your account to continue converting files.",
  signupTitle: "Create your account",
  signupSubtitle: "Sign up free — convert, OCR, and translate your files.",
  email: "Email",
  password: "Password",
  name: "Name",
  optional: "optional",
  passwordHint: "At least 8 characters",
  passwordMinLength: "Password must be at least 8 characters",
  noAccount: "Don't have an account?",
  haveAccount: "Already have an account?",
  loginFailed: "Login failed. Please try again.",
  signupFailed: "Sign up failed. Please try again.",
  emailOrUsername: "Email or Username",
  forgotPassword: "Forgot password?",
  continue: "Continue",
  profile: "Profile",
  profileWelcome: "Welcome back,",
  profileAccount: "Account settings",
  profileDetails: "Account details",
  profileQuickActions: "Quick actions",
  profileSaveChanges: "Save changes",
  profileSaved: "Profile updated.",
  profileSaveFailed: "Could not save profile.",
  profileNamePlaceholder: "Your display name",
  profileSignInMethod: "Sign-in method",
  profileGoogleAccount: "Google account",
  profileEmailAccount: "Email & password",
  profileUserId: "User ID",
  profileStartConverting: "Start converting files",
  profileContactSupport: "Contact support",
  profileSecurityInfo: "Security & privacy",
  profilePrivacyNote: "Your privacy",
  profilePrivacyDesc:
    "PDF Garage processes your files on secure cloud infrastructure. Converted files are not kept after your job completes.",
  memberSince: "Member since",
  backToHome: "Back to PDF Garage",
  dashOverview: "Overview",
  dashActivity: "Activity",
  dashSecurity: "Security",
  dashPlan: "Plan & usage",
  dashTotalConversions: "Total conversions",
  dashThisMonth: "This month",
  dashOcrJobs: "OCR jobs",
  dashTranslateJobs: "Translations",
  dashUsageThisMonth: "Monthly usage",
  dashRemaining: "remaining",
  dashRecentActivity: "Recent activity",
  dashNoActivity: "No activity yet",
  dashNoActivityHint: "Convert a file while signed in to see your history here.",
  dashFile: "File",
  dashOperation: "Operation",
  dashFormat: "Format",
  dashDate: "Date",
  dashStatus: "Status",
  dashSuccess: "Success",
  dashCurrentPlan: "Current plan",
  dashFreePlan: "Free",
  dashPlanDesc: "Cloud conversions with generous monthly limits.",
  dashMonthlyLimit: "Conversions per month",
  dashMaxFileSize: "Max file size",
  dashUnlimitedLocal: "Secure cloud processing",
  dashUpgradeSoon: "Paid plans coming soon",
  dashBreakdown: "By operation type",
  dashLastActive: "Last activity",
  dashNever: "Never",
  dashSupportTickets: "Support messages sent",
  dashChangePassword: "Change password",
  dashCurrentPassword: "Current password",
  dashNewPassword: "New password",
  dashPasswordUpdated: "Password updated successfully.",
  dashPasswordFailed: "Could not change password.",
  dashGoogleConnected: "Google account connected",
  dashEmailVerified: "Email verified",
  dashAccountStatus: "Account status",
  dashActive: "Active",
  dashLoading: "Loading dashboard…",
};

const es: Dict = {
  ...en,
  homeTitle: "Convierte cualquier archivo",
  homeSubtitle:
    "Sube un archivo y elige el formato. Documentos, imágenes, audio, video, OCR, traducción y más.",
  tools: "Herramientas",
  selectFileTitle: "Selecciona tu archivo para comenzar",
  selectFileHint: "o suelta tu archivo aquí.",
  selectFile: "Seleccionar archivo",
  selectFiles: "Seleccionar archivos",
  fromUrl: "Desde URL",
  load: "Cargar",
  convertTo: "Convertir a",
  working: "Procesando…",
  mergePdfs: "Combinar PDFs",
  runOcr: "Ejecutar OCR",
  translateDoc: "Traducir",
  ocrLanguage: "Idioma OCR",
  outputFormat: "Formato de salida",
  translateFrom: "Idioma origen",
  translateTo: "Idioma destino",
  popularConversions: "Conversiones populares",
  browseFormats: "Explorar por categoría",
  securityTitle: "Tus archivos son privados",
  securityDesc:
    "Los archivos se transfieren de forma cifrada, se procesan en servidores seguros y se eliminan automáticamente.",
  footerLocal: "Conversión segura en la nube — los archivos se eliminan tras procesarse.",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "Traducir",
};

const fr: Dict = {
  ...en,
  homeTitle: "Convertir n'importe quel fichier",
  homeSubtitle: "Déposez un fichier et choisissez le format. Documents, images, OCR, traduction et plus.",
  tools: "Outils",
  selectFileTitle: "Sélectionnez votre fichier pour commencer",
  selectFileHint: "ou déposez votre fichier ici.",
  selectFile: "Choisir un fichier",
  fromUrl: "Depuis URL",
  load: "Charger",
  convertTo: "Convertir en",
  working: "En cours…",
  runOcr: "Lancer l'OCR",
  translateDoc: "Traduire",
  ocrLanguage: "Langue OCR",
  translateFrom: "Langue source",
  translateTo: "Langue cible",
  popularConversions: "Conversions populaires",
  securityTitle: "Vos fichiers restent privés",
  footerLocal: "Conversion cloud sécurisée — fichiers supprimés après traitement.",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "Traduire",
};

const de: Dict = {
  ...en,
  homeTitle: "Beliebige Datei konvertieren",
  homeSubtitle: "Datei hochladen und Zielformat wählen. Dokumente, Bilder, OCR, Übersetzung und mehr.",
  tools: "Werkzeuge",
  selectFileTitle: "Datei auswählen zum Starten",
  selectFileHint: "oder Datei hier ablegen.",
  selectFile: "Datei wählen",
  fromUrl: "Von URL",
  load: "Laden",
  convertTo: "Konvertieren zu",
  working: "Arbeitet…",
  runOcr: "OCR starten",
  translateDoc: "Übersetzen",
  ocrLanguage: "OCR-Sprache",
  translateFrom: "Ausgangssprache",
  translateTo: "Zielsprache",
  popularConversions: "Beliebte Konvertierungen",
  securityTitle: "Ihre Dateien bleiben privat",
  footerLocal: "Sichere Cloud-Konvertierung — Dateien werden nach der Verarbeitung gelöscht.",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "Übersetzen",
};

const zh: Dict = {
  ...en,
  homeTitle: "转换任意文件",
  homeSubtitle: "上传文件并选择目标格式。支持文档、图片、OCR、翻译等。",
  tools: "工具",
  selectFileTitle: "选择文件开始",
  selectFileHint: "或将文件拖放到此处。",
  selectFile: "选择文件",
  fromUrl: "从 URL",
  load: "加载",
  convertTo: "转换为",
  working: "处理中…",
  runOcr: "运行 OCR",
  translateDoc: "翻译",
  ocrLanguage: "OCR 语言",
  translateFrom: "源语言",
  translateTo: "目标语言",
  popularConversions: "热门转换",
  securityTitle: "您的文件保持私密",
  footerLocal: "安全云端转换 — 处理完成后自动删除文件。",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "翻译",
};

const ar: Dict = {
  ...en,
  homeTitle: "تحويل أي ملف",
  homeSubtitle: "ارفع ملفاً واختر الصيغة. مستندات، صور، OCR، ترجمة والمزيد.",
  tools: "الأدوات",
  selectFileTitle: "اختر ملفك للبدء",
  selectFileHint: "أو أسقط ملفك هنا.",
  selectFile: "اختر ملف",
  fromUrl: "من رابط",
  load: "تحميل",
  convertTo: "تحويل إلى",
  working: "جاري العمل…",
  runOcr: "تشغيل OCR",
  translateDoc: "ترجمة",
  ocrLanguage: "لغة OCR",
  translateFrom: "من اللغة",
  translateTo: "إلى اللغة",
  popularConversions: "تحويلات شائعة",
  securityTitle: "ملفاتك تبقى خاصة",
  footerLocal: "تحويل آمن عبر السحابة — تُحذف الملفات بعد المعالجة.",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "ترجمة",
};

const hi: Dict = {
  ...en,
  homeTitle: "कोई भी फ़ाइल कन्वर्ट करें",
  homeSubtitle: "फ़ाइल अपलोड करें और प्रारूप चुनें। दस्तावेज़, OCR, अनुवाद और अधिक।",
  tools: "टूल्स",
  selectFileTitle: "शुरू करने के लिए फ़ाइल चुनें",
  selectFileHint: "या फ़ाइल यहाँ छोड़ें।",
  selectFile: "फ़ाइल चुनें",
  fromUrl: "URL से",
  load: "लोड",
  convertTo: "में बदलें",
  working: "काम हो रहा है…",
  runOcr: "OCR चलाएँ",
  translateDoc: "अनुवाद",
  ocrLanguage: "OCR भाषा",
  translateFrom: "स्रोत भाषा",
  translateTo: "लक्ष्य भाषा",
  popularConversions: "लोकप्रिय रूपांतरण",
  securityTitle: "आपकी फ़ाइलें निजी रहती हैं",
  footerLocal: "सुरक्षित क्लाउड रूपांतरण — प्रोसेसिंग के बाद फ़ाइलें हटा दी जाती हैं।",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "अनुवाद",
};

const ur: Dict = {
  ...en,
  homeTitle: "کoi بھی فائل تبدیل کریں",
  homeSubtitle: "فائل اپ لوڈ کریں اور فارمیٹ منتخب کریں۔ دستاویزات، OCR، ترجمہ اور مزید۔",
  tools: "اوزار",
  selectFileTitle: "شروع کرنے کے لیے فائل منتخب کریں",
  selectFileHint: "یا فائل یہاں چھوڑیں۔",
  selectFile: "فائل منتخب کریں",
  fromUrl: "URL سے",
  load: "لوڈ",
  convertTo: "میں تبدیل",
  working: "کam جاری…",
  runOcr: "OCR چلائیں",
  translateDoc: "ترجمہ",
  ocrLanguage: "OCR زبان",
  translateFrom: "ماخذ زبان",
  translateTo: "ہدف زبان",
  popularConversions: "مشہور تبدیلیاں",
  securityTitle: "آپ ki فائلیں محفوظ",
  footerLocal: "محفوظ کلاؤڈ کنورژن — فائلیں پروسیسنگ کے بعد حذف ہو جاتی ہیں۔",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "ترجمہ",
};

const pt: Dict = {
  ...en,
  homeTitle: "Converta qualquer arquivo",
  homeSubtitle: "Envie um arquivo e escolha o formato. Documentos, OCR, tradução e mais.",
  tools: "Ferramentas",
  selectFileTitle: "Selecione seu arquivo para começar",
  selectFileHint: "ou solte seu arquivo aqui.",
  selectFile: "Selecionar arquivo",
  fromUrl: "De URL",
  load: "Carregar",
  convertTo: "Converter para",
  working: "Processando…",
  runOcr: "Executar OCR",
  translateDoc: "Traduzir",
  ocrLanguage: "Idioma OCR",
  translateFrom: "Idioma origem",
  translateTo: "Idioma destino",
  popularConversions: "Conversões populares",
  securityTitle: "Seus arquivos ficam privados",
  footerLocal: "Conversão segura na nuvem — arquivos excluídos após o processamento.",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "Traduzir",
};

const ja: Dict = {
  ...en,
  homeTitle: "あらゆるファイルを変換",
  homeSubtitle: "ファイルをアップロードして形式を選択。文書、OCR、翻訳などに対応。",
  tools: "ツール",
  selectFileTitle: "ファイルを選択して開始",
  selectFileHint: "またはここにドロップ。",
  selectFile: "ファイルを選択",
  fromUrl: "URLから",
  load: "読み込み",
  convertTo: "変換先",
  working: "処理中…",
  runOcr: "OCR実行",
  translateDoc: "翻訳",
  ocrLanguage: "OCR言語",
  translateFrom: "翻訳元",
  translateTo: "翻訳先",
  popularConversions: "人気の変換",
  securityTitle: "ファイルは非公開のまま",
  footerLocal: "安全なクラウド変換 — 処理後にファイルは自動削除されます。",
  "toolGroups.ocr": "OCR",
  "toolGroups.translate": "翻訳",
};

export const translations: Record<Locale, Dict> = { en, es, fr, de, zh, ar, hi, ur, pt, ja };

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}
