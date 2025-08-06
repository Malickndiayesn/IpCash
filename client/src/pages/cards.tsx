import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileNav } from "@/components/ui/mobile-nav";
import { CardSecuritySettings } from "@/components/CardSecuritySettings";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Plus, Eye, Lock, Wifi, CreditCard, Settings, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Cards() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: cards, isLoading } = useQuery({
    queryKey: ["/api/cards"],
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ cardId, settings }: { cardId: string; settings: any }) => {
      const response = await apiRequest('PATCH', `/api/cards/${cardId}`, settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres de votre carte ont été modifiés avec succès.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres de la carte.",
        variant: "destructive",
      });
    },
  });

  // Mock card data if no cards from API
  const mockCard = {
    id: "mock-card-1",
    cardNumber: "****-****-****-4579",
    cardType: "virtual",
    cardBrand: "visa",
    expiryMonth: 12,
    expiryYear: 2027,
    onlinePayments: true,
    contactlessPayments: true,
    atmWithdrawals: true,
    dailyLimit: "100000.00",
    monthlyLimit: "500000.00",
  };

  const cardData = (cards as any)?.[0] || mockCard;
  const userFullName = (user as any)?.firstName && (user as any)?.lastName 
    ? `${(user as any).firstName.toUpperCase()} ${(user as any).lastName.toUpperCase()}`
    : (user as any)?.email?.toUpperCase() || "UTILISATEUR";

  const handleCardSettingChange = (setting: string, value: boolean) => {
    if (cardData.id === "mock-card-1") {
      toast({
        title: "Mode démonstration",
        description: "Cette fonctionnalité sera disponible avec une vraie carte.",
      });
      return;
    }

    updateCardMutation.mutate({
      cardId: cardData.id,
      settings: { [setting]: value },
    });
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-gray-50">
      <div className="min-h-screen flex flex-col pb-20">
        {/* Header */}
        <div className="banking-gradient px-6 pt-16 pb-6">
          <div className="flex items-center">
            <button onClick={() => setLocation('/')} className="text-white mr-4">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-white text-xl font-bold">Mes cartes</h1>
              <p className="text-blue-100 text-sm">Gérez vos cartes bancaires</p>
            </div>
            <button className="text-white">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Onglets pour les différentes sections */}
        <div className="px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white">
              <TabsTrigger value="overview">
                {language === 'fr' ? 'Aperçu' : language === 'en' ? 'Overview' : language === 'es' ? 'Resumen' : 'نظرة عامة'}
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Sécurité' : language === 'en' ? 'Security' : language === 'es' ? 'Seguridad' : 'الأمان'}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Paramètres' : language === 'en' ? 'Settings' : language === 'es' ? 'Configuración' : 'الإعدادات'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {/* Virtual Card */}
              <div className="card-gradient rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-gray-300 text-sm">
                      {language === 'fr' ? 'Carte virtuelle' : language === 'en' ? 'Virtual card' : language === 'es' ? 'Tarjeta virtual' : 'بطاقة افتراضية'}
                    </p>
                    <p className="text-white font-bold">IPCASH {cardData.cardBrand?.toUpperCase() || 'VISA'}</p>
                  </div>
                  <div className="text-3xl">
                    <CreditCard size={32} />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-2xl font-mono tracking-widest">{cardData.cardNumber}</p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-300 text-xs">
                      {language === 'fr' ? 'Titulaire' : language === 'en' ? 'Cardholder' : language === 'es' ? 'Titular' : 'حامل البطاقة'}
                    </p>
                    <p className="font-semibold">{userFullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs">
                      {language === 'fr' ? 'Expire' : language === 'en' ? 'Expires' : language === 'es' ? 'Expira' : 'تنتهي'}
                    </p>
                    <p className="font-semibold">
                      {cardData.expiryMonth?.toString().padStart(2, '0')}/{cardData.expiryYear?.toString().slice(-2)}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <CardSecuritySettings 
                card={cardData} 
                onUpdate={(settings) => {
                  if (cardData.id === "mock-card-1") {
                    toast({
                      title: language === 'fr' ? "Mode démonstration" : language === 'en' ? "Demo mode" : language === 'es' ? "Modo demostración" : "وضع العرض",
                      description: language === 'fr' ? "Cette fonctionnalité sera disponible avec une vraie carte." : language === 'en' ? "This feature will be available with a real card." : language === 'es' ? "Esta función estará disponible con una tarjeta real." : "ستكون هذه الميزة متاحة مع بطاقة حقيقية.",
                    });
                    return;
                  }
                  updateCardMutation.mutate({
                    cardId: cardData.id,
                    settings,
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'fr' ? 'Actions rapides' : language === 'en' ? 'Quick actions' : language === 'es' ? 'Acciones rápidas' : 'إجراءات سريعة'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20 flex flex-col space-y-2">
                        <Eye size={20} />
                        <span className="text-sm">
                          {language === 'fr' ? 'Voir détails' : language === 'en' ? 'View details' : language === 'es' ? 'Ver detalles' : 'عرض التفاصيل'}
                        </span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col space-y-2">
                        <Lock size={20} />
                        <span className="text-sm">
                          {language === 'fr' ? 'Bloquer' : language === 'en' ? 'Block' : language === 'es' ? 'Bloquear' : 'حظر'}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <MobileNav currentPage="cards" />
    </div>
  );
}
