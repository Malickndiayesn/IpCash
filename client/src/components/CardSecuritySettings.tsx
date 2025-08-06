import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Shield, CreditCard, Globe, Smartphone, Banknote, Info, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface CardSecuritySettingsProps {
  card: any;
  onUpdate: (settings: any) => void;
}

export function CardSecuritySettings({ card, onUpdate }: CardSecuritySettingsProps) {
  const { language } = useLanguage();

  const handleSettingChange = (setting: string, value: boolean) => {
    onUpdate({ [setting]: value });
  };

  const getSecurityScore = () => {
    let score = 0;
    if (card.onlinePayments) score += 25;
    if (card.contactlessPayments) score += 25; 
    if (card.atmWithdrawals) score += 25;
    if (card.dailyLimit && parseFloat(card.dailyLimit) < 200000) score += 25;
    return score;
  };

  const securityScore = getSecurityScore();

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      securitySettings: {
        fr: "Paramètres de sécurité",
        en: "Security settings",
        es: "Configuración de seguridad", 
        ar: "إعدادات الأمان"
      },
      securityScore: {
        fr: "Score de sécurité",
        en: "Security score",
        es: "Puntuación de seguridad",
        ar: "نقاط الأمان"
      },
      onlinePayments: {
        fr: "Paiements en ligne",
        en: "Online payments",
        es: "Pagos en línea",
        ar: "المدفوعات عبر الإنترنت"
      },
      onlinePaymentsDesc: {
        fr: "Autoriser les achats sur internet",
        en: "Allow internet purchases",
        es: "Permitir compras por internet",
        ar: "السماح بالمشتريات عبر الإنترنت"
      },
      contactlessPayments: {
        fr: "Paiements sans contact",
        en: "Contactless payments",
        es: "Pagos sin contacto",
        ar: "المدفوعات اللاتلامسية"
      },
      contactlessDesc: {
        fr: "Paiements NFC avec smartphone",
        en: "NFC payments with smartphone",
        es: "Pagos NFC con smartphone",
        ar: "مدفوعات NFC بالهاتف الذكي"
      },
      atmWithdrawals: {
        fr: "Retraits ATM",
        en: "ATM withdrawals",
        es: "Retiros de cajero",
        ar: "سحب من الصراف الآلي"
      },
      atmDesc: {
        fr: "Retraits aux distributeurs automatiques",
        en: "Withdrawals at ATMs",
        es: "Retiros en cajeros automáticos", 
        ar: "السحب من أجهزة الصراف الآلي"
      },
      spendingLimits: {
        fr: "Limites de dépenses",
        en: "Spending limits",
        es: "Límites de gasto",
        ar: "حدود الإنفاق"
      },
      dailyLimit: {
        fr: "Limite quotidienne",
        en: "Daily limit",
        es: "Límite diario",
        ar: "الحد اليومي"
      },
      monthlyLimit: {
        fr: "Limite mensuelle",
        en: "Monthly limit", 
        es: "Límite mensual",
        ar: "الحد الشهري"
      },
      securityTips: {
        fr: "Conseils de sécurité",
        en: "Security tips",
        es: "Consejos de seguridad",
        ar: "نصائح الأمان"
      }
    };
    return texts[key]?.[language] || texts[key]?.['fr'] || key;
  };

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{getText('securityScore')}</h3>
            </div>
            <Badge variant={securityScore >= 75 ? "default" : securityScore >= 50 ? "secondary" : "destructive"}>
              {securityScore}%
            </Badge>
          </div>
          <Progress value={securityScore} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {securityScore >= 75 
              ? (language === 'fr' ? "Excellent niveau de sécurité" : "Excellent security level")
              : securityScore >= 50 
              ? (language === 'fr' ? "Niveau de sécurité correct" : "Good security level")  
              : (language === 'fr' ? "Sécurité à améliorer" : "Security needs improvement")
            }
          </p>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            {getText('securitySettings')}
          </h3>
          
          <div className="space-y-6">
            {/* Online Payments */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{getText('onlinePayments')}</p>
                  <p className="text-sm text-muted-foreground">{getText('onlinePaymentsDesc')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">{getText('onlinePayments')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' 
                          ? "Permet d'utiliser votre carte pour des achats en ligne. Désactivez si vous ne faites pas d'achats sur internet."
                          : "Allows using your card for online purchases. Disable if you don't shop online."
                        }
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
                <Switch
                  checked={card.onlinePayments}
                  onCheckedChange={(checked) => handleSettingChange('onlinePayments', checked)}
                />
              </div>
            </div>

            {/* Contactless Payments */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{getText('contactlessPayments')}</p>
                  <p className="text-sm text-muted-foreground">{getText('contactlessDesc')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">{getText('contactlessPayments')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' 
                          ? "Permet les paiements sans contact via NFC. Plus rapide mais moins sécurisé pour de gros montants."
                          : "Enables contactless payments via NFC. Faster but less secure for large amounts."
                        }
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
                <Switch
                  checked={card.contactlessPayments}
                  onCheckedChange={(checked) => handleSettingChange('contactlessPayments', checked)}
                />
              </div>
            </div>

            {/* ATM Withdrawals */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Banknote className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">{getText('atmWithdrawals')}</p>
                  <p className="text-sm text-muted-foreground">{getText('atmDesc')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">{getText('atmWithdrawals')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fr' 
                          ? "Autorise les retraits d'espèces aux distributeurs automatiques. Désactivez si non nécessaire."
                          : "Allows cash withdrawals at ATMs. Disable if not needed."
                        }
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
                <Switch
                  checked={card.atmWithdrawals}
                  onCheckedChange={(checked) => handleSettingChange('atmWithdrawals', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Limits */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">{getText('spendingLimits')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{getText('dailyLimit')}</span>
                <span className="text-sm text-muted-foreground">
                  75,000 / {parseFloat(card.dailyLimit || '100000').toLocaleString()} FCFA
                </span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{getText('monthlyLimit')}</span>
                <span className="text-sm text-muted-foreground">
                  245,000 / {parseFloat(card.monthlyLimit || '500000').toLocaleString()} FCFA
                </span>
              </div>
              <Progress value={49} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">{getText('securityTips')}</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• {language === 'fr' ? "Ne partagez jamais votre PIN" : "Never share your PIN"}</li>
                <li>• {language === 'fr' ? "Vérifiez régulièrement vos transactions" : "Check your transactions regularly"}</li>
                <li>• {language === 'fr' ? "Activez les notifications pour chaque transaction" : "Enable notifications for each transaction"}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}