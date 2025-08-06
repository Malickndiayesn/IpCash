import { useState, useEffect, createContext, useContext, createElement, ReactNode } from 'react';

export type SupportedLanguage = 'fr' | 'en' | 'es' | 'ar';

interface TranslationKeys {
  // Common
  loading: string;
  save: string;
  cancel: string;
  continue: string;
  back: string;
  next: string;
  confirm: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Navigation
  dashboard: string;
  transfer: string;
  transactions: string;
  cards: string;
  profile: string;
  analytics: string;
  savings: string;
  credit: string;
  support: string;
  kyc: string;
  
  // KYC System
  kyc_title: string;
  kyc_description: string;
  identity_verification: string;
  complete_kyc: string;
  kyc_progress: string;
  security_score: string;
  document_selection: string;
  information_entry: string;
  document_capture: string;
  selfie_capture: string;
  
  // Document Types
  national_id: string;
  passport: string;
  cni_description: string;
  passport_description: string;
  recommended: string;
  fast_processing: string;
  
  // Form Fields
  document_number: string;
  expiry_date: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  email: string;
  phone: string;
  address: string;
  profession: string;
  
  // Validation Messages
  invalid_format: string;
  field_required: string;
  invalid_email: string;
  invalid_phone: string;
  document_expired: string;
  
  // Security Scores
  excellent_security: string;
  good_security: string;
  needs_improvement: string;
  
  // Notifications
  security_excellent_title: string;
  security_excellent_msg: string;
  security_good_title: string;
  security_good_msg: string;
  security_low_title: string;
  security_low_msg: string;
  validation_errors_title: string;
  validation_errors_msg: string;
}

const translations: Record<SupportedLanguage, TranslationKeys> = {
  fr: {
    // Common
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    continue: 'Continuer',
    back: 'Retour',
    next: 'Suivant',
    confirm: 'Confirmer',
    success: 'Succès',
    error: 'Erreur',
    warning: 'Attention',
    info: 'Information',
    
    // Navigation
    dashboard: 'Tableau de bord',
    transfer: 'Transfert',
    transactions: 'Transactions',
    cards: 'Cartes',
    profile: 'Profil',
    analytics: 'Analyses',
    savings: 'Épargne',
    credit: 'Crédit',
    support: 'Support',
    kyc: 'Vérification KYC',
    
    // KYC System
    kyc_title: 'Vérification d\'Identité (KYC)',
    kyc_description: 'Sécurisez votre compte IPCASH en vérifiant votre identité',
    identity_verification: 'Vérification d\'identité',
    complete_kyc: 'Complétez votre KYC pour débloquer toutes les fonctionnalités',
    kyc_progress: 'Progression KYC',
    security_score: 'Score de sécurité',
    document_selection: 'Sélection du document d\'identité',
    information_entry: 'Saisie des informations',
    document_capture: 'Capture photo du document',
    selfie_capture: 'Selfie avec document',
    
    // Document Types
    national_id: 'Carte Nationale d\'Identité',
    passport: 'Passeport',
    cni_description: 'CNI ivoirienne ou d\'un pays UEMOA',
    passport_description: 'Passeport international valide',
    recommended: 'Recommandé',
    fast_processing: 'Traitement rapide',
    
    // Form Fields
    document_number: 'Numéro de document',
    expiry_date: 'Date d\'expiration',
    first_name: 'Prénom(s)',
    last_name: 'Nom de famille',
    date_of_birth: 'Date de naissance',
    place_of_birth: 'Lieu de naissance',
    nationality: 'Nationalité',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse complète',
    profession: 'Profession',
    
    // Validation Messages
    invalid_format: 'Format invalide',
    field_required: 'Ce champ est requis',
    invalid_email: 'Email invalide',
    invalid_phone: 'Numéro de téléphone invalide',
    document_expired: 'Document expiré - Veuillez renouveler votre document',
    
    // Security Scores
    excellent_security: 'Excellent - Profil très sécurisé',
    good_security: 'Bon - Quelques améliorations possibles',
    needs_improvement: 'À améliorer - Complétez plus d\'informations',
    
    // Notifications
    security_excellent_title: 'Sécurité Excellente',
    security_excellent_msg: 'Votre profil atteint un niveau de sécurité optimal',
    security_good_title: 'Bon Niveau de Sécurité',
    security_good_msg: 'Complétez quelques informations supplémentaires',
    security_low_title: 'Améliorez Votre Sécurité',
    security_low_msg: 'Votre score de sécurité est faible',
    validation_errors_title: 'Erreurs de Validation',
    validation_errors_msg: 'champ(s) contiennent des erreurs',
  },
  
  en: {
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    
    // Navigation
    dashboard: 'Dashboard',
    transfer: 'Transfer',
    transactions: 'Transactions',
    cards: 'Cards',
    profile: 'Profile',
    analytics: 'Analytics',
    savings: 'Savings',
    credit: 'Credit',
    support: 'Support',
    kyc: 'KYC Verification',
    
    // KYC System
    kyc_title: 'Identity Verification (KYC)',
    kyc_description: 'Secure your IPCASH account by verifying your identity',
    identity_verification: 'Identity verification',
    complete_kyc: 'Complete your KYC to unlock all features',
    kyc_progress: 'KYC Progress',
    security_score: 'Security Score',
    document_selection: 'Identity document selection',
    information_entry: 'Information entry',
    document_capture: 'Document photo capture',
    selfie_capture: 'Selfie with document',
    
    // Document Types
    national_id: 'National Identity Card',
    passport: 'Passport',
    cni_description: 'Ivorian CNI or WAEMU country',
    passport_description: 'Valid international passport',
    recommended: 'Recommended',
    fast_processing: 'Fast processing',
    
    // Form Fields
    document_number: 'Document number',
    expiry_date: 'Expiry date',
    first_name: 'First name(s)',
    last_name: 'Last name',
    date_of_birth: 'Date of birth',
    place_of_birth: 'Place of birth',
    nationality: 'Nationality',
    email: 'Email',
    phone: 'Phone',
    address: 'Full address',
    profession: 'Profession',
    
    // Validation Messages
    invalid_format: 'Invalid format',
    field_required: 'This field is required',
    invalid_email: 'Invalid email',
    invalid_phone: 'Invalid phone number',
    document_expired: 'Document expired - Please renew your document',
    
    // Security Scores
    excellent_security: 'Excellent - Very secure profile',
    good_security: 'Good - Some improvements possible',
    needs_improvement: 'Needs improvement - Complete more information',
    
    // Notifications
    security_excellent_title: 'Excellent Security',
    security_excellent_msg: 'Your profile reaches optimal security level',
    security_good_title: 'Good Security Level',
    security_good_msg: 'Complete some additional information',
    security_low_title: 'Improve Your Security',
    security_low_msg: 'Your security score is low',
    validation_errors_title: 'Validation Errors',
    validation_errors_msg: 'field(s) contain errors',
  },
  
  es: {
    // Common
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    continue: 'Continuar',
    back: 'Atrás',
    next: 'Siguiente',
    confirm: 'Confirmar',
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
    
    // Navigation
    dashboard: 'Panel de Control',
    transfer: 'Transferencia',
    transactions: 'Transacciones',
    cards: 'Tarjetas',
    profile: 'Perfil',
    analytics: 'Análisis',
    savings: 'Ahorros',
    credit: 'Crédito',
    support: 'Soporte',
    kyc: 'Verificación KYC',
    
    // KYC System
    kyc_title: 'Verificación de Identidad (KYC)',
    kyc_description: 'Asegure su cuenta IPCASH verificando su identidad',
    identity_verification: 'Verificación de identidad',
    complete_kyc: 'Complete su KYC para desbloquear todas las funciones',
    kyc_progress: 'Progreso KYC',
    security_score: 'Puntuación de Seguridad',
    document_selection: 'Selección de documento de identidad',
    information_entry: 'Entrada de información',
    document_capture: 'Captura de foto del documento',
    selfie_capture: 'Selfie con documento',
    
    // Document Types
    national_id: 'Cédula de Identidad Nacional',
    passport: 'Pasaporte',
    cni_description: 'CNI marfileña o país UEMOA',
    passport_description: 'Pasaporte internacional válido',
    recommended: 'Recomendado',
    fast_processing: 'Procesamiento rápido',
    
    // Form Fields
    document_number: 'Número de documento',
    expiry_date: 'Fecha de vencimiento',
    first_name: 'Nombre(s)',
    last_name: 'Apellido',
    date_of_birth: 'Fecha de nacimiento',
    place_of_birth: 'Lugar de nacimiento',
    nationality: 'Nacionalidad',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    address: 'Dirección completa',
    profession: 'Profesión',
    
    // Validation Messages
    invalid_format: 'Formato inválido',
    field_required: 'Este campo es obligatorio',
    invalid_email: 'Correo electrónico inválido',
    invalid_phone: 'Número de teléfono inválido',
    document_expired: 'Documento vencido - Por favor renueve su documento',
    
    // Security Scores
    excellent_security: 'Excelente - Perfil muy seguro',
    good_security: 'Bueno - Algunas mejoras posibles',
    needs_improvement: 'Necesita mejoras - Complete más información',
    
    // Notifications
    security_excellent_title: 'Seguridad Excelente',
    security_excellent_msg: 'Su perfil alcanza un nivel de seguridad óptimo',
    security_good_title: 'Buen Nivel de Seguridad',
    security_good_msg: 'Complete información adicional',
    security_low_title: 'Mejore Su Seguridad',
    security_low_msg: 'Su puntuación de seguridad es baja',
    validation_errors_title: 'Errores de Validación',
    validation_errors_msg: 'campo(s) contienen errores',
  },
  
  ar: {
    // Common
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    continue: 'متابعة',
    back: 'رجوع',
    next: 'التالي',
    confirm: 'تأكيد',
    success: 'نجح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    
    // Navigation
    dashboard: 'لوحة القيادة',
    transfer: 'تحويل',
    transactions: 'المعاملات',
    cards: 'البطاقات',
    profile: 'الملف الشخصي',
    analytics: 'التحليلات',
    savings: 'المدخرات',
    credit: 'الائتمان',
    support: 'الدعم',
    kyc: 'التحقق من الهوية',
    
    // KYC System
    kyc_title: 'التحقق من الهوية (KYC)',
    kyc_description: 'أمِّن حساب IPCASH الخاص بك عن طريق التحقق من هويتك',
    identity_verification: 'التحقق من الهوية',
    complete_kyc: 'أكمل التحقق من الهوية لإلغاء قفل جميع الميزات',
    kyc_progress: 'تقدم التحقق من الهوية',
    security_score: 'نقاط الأمان',
    document_selection: 'اختيار وثيقة الهوية',
    information_entry: 'إدخال المعلومات',
    document_capture: 'التقاط صورة الوثيقة',
    selfie_capture: 'صورة شخصية مع الوثيقة',
    
    // Document Types
    national_id: 'بطاقة الهوية الوطنية',
    passport: 'جواز السفر',
    cni_description: 'هوية إيفوارية أو دولة UEMOA',
    passport_description: 'جواز سفر دولي صالح',
    recommended: 'موصى به',
    fast_processing: 'معالجة سريعة',
    
    // Form Fields
    document_number: 'رقم الوثيقة',
    expiry_date: 'تاريخ انتهاء الصلاحية',
    first_name: 'الاسم الأول',
    last_name: 'اسم العائلة',
    date_of_birth: 'تاريخ الميلاد',
    place_of_birth: 'مكان الميلاد',
    nationality: 'الجنسية',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان الكامل',
    profession: 'المهنة',
    
    // Validation Messages
    invalid_format: 'تنسيق غير صحيح',
    field_required: 'هذا الحقل مطلوب',
    invalid_email: 'بريد إلكتروني غير صحيح',
    invalid_phone: 'رقم هاتف غير صحيح',
    document_expired: 'وثيقة منتهية الصلاحية - يرجى تجديد وثيقتك',
    
    // Security Scores
    excellent_security: 'ممتاز - ملف شخصي آمن جداً',
    good_security: 'جيد - بعض التحسينات ممكنة',
    needs_improvement: 'يحتاج تحسين - أكمل المزيد من المعلومات',
    
    // Notifications
    security_excellent_title: 'أمان ممتاز',
    security_excellent_msg: 'يصل ملفك الشخصي إلى مستوى أمان مثالي',
    security_good_title: 'مستوى أمان جيد',
    security_good_msg: 'أكمل بعض المعلومات الإضافية',
    security_low_title: 'حسِّن أمانك',
    security_low_msg: 'نقاط الأمان الخاصة بك منخفضة',
    validation_errors_title: 'أخطاء التحقق',
    validation_errors_msg: 'حقل (حقول) تحتوي على أخطاء',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationKeys) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: () => '',
  isRTL: false,
});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem('ipcash_language') as SupportedLanguage;
    return stored && Object.keys(translations).includes(stored) ? stored : 'fr';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('ipcash_language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: keyof TranslationKeys): string => {
    return translations[language][key] || key;
  };

  const contextValue = {
    language,
    setLanguage,
    t,
    isRTL
  };

  return createElement(LanguageContext.Provider, { value: contextValue }, children);
};

export { translations };