import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import type { SupportedLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "default" | "compact" | "mobile";
  showLabel?: boolean;
}

export function LanguageSwitcher({ variant = "default", showLabel = true }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'fr' as SupportedLanguage, name: 'Français', flag: '🇫🇷' },
    { code: 'en' as SupportedLanguage, name: 'English', flag: '🇬🇧' },
    { code: 'es' as SupportedLanguage, name: 'Español', flag: '🇪🇸' },
    { code: 'ar' as SupportedLanguage, name: 'العربية', flag: '🇸🇦' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  if (variant === "compact") {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-white hover:bg-white/10"
        onClick={() => {
          const currentIndex = languages.findIndex(lang => lang.code === language);
          const nextIndex = (currentIndex + 1) % languages.length;
          setLanguage(languages[nextIndex].code);
        }}
      >
        <Globe className="h-4 w-4 mr-1" />
        {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
      </Button>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="flex items-center justify-center">
        <Select value={language} onValueChange={(value: SupportedLanguage) => setLanguage(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span className="text-xs">{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <Globe className="h-4 w-4" />
          Langue
        </span>
      )}
      <Select value={language} onValueChange={(value: SupportedLanguage) => setLanguage(value)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}