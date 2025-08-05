import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Plus, Eye, Lock, Wifi, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Cards() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
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

  const cardData = cards?.[0] || mockCard;
  const userFullName = user?.firstName && user?.lastName 
    ? `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`
    : user?.email?.toUpperCase() || "UTILISATEUR";

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

        {/* Card Display */}
        <div className="px-6 py-6">
          {/* Virtual Card */}
          <div className="card-gradient rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-300 text-sm">Carte virtuelle</p>
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
                <p className="text-gray-300 text-xs">Titulaire</p>
                <p className="font-semibold">{userFullName}</p>
              </div>
              <div>
                <p className="text-gray-300 text-xs">Expire</p>
                <p className="font-semibold">{cardData.expiryMonth?.toString().padStart(2, '0')}/{cardData.expiryYear?.toString().slice(-2)}</p>
              </div>
              <div className="text-right">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Wifi className="text-white text-sm" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Card Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 bg-white"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="text-primary" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Voir les détails</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2 bg-white"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Lock className="text-accent" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Bloquer</span>
            </Button>
          </div>

          {/* Card Settings */}
          <Card className="shadow-sm mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de la carte</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Paiements en ligne</p>
                    <p className="text-sm text-gray-500">Autoriser les achats sur internet</p>
                  </div>
                  <Switch
                    checked={cardData.onlinePayments}
                    onCheckedChange={(checked) => handleCardSettingChange('onlinePayments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Paiements contactless</p>
                    <p className="text-sm text-gray-500">Paiements sans contact (NFC)</p>
                  </div>
                  <Switch
                    checked={cardData.contactlessPayments}
                    onCheckedChange={(checked) => handleCardSettingChange('contactlessPayments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Retraits ATM</p>
                    <p className="text-sm text-gray-500">Autoriser les retraits aux distributeurs</p>
                  </div>
                  <Switch
                    checked={cardData.atmWithdrawals}
                    onCheckedChange={(checked) => handleCardSettingChange('atmWithdrawals', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spending Limits */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Limites de dépenses</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Quotidien</span>
                    <span className="text-sm text-gray-600">75,000 / {parseFloat(cardData.dailyLimit || '100000').toLocaleString()} FCFA</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary rounded-full w-3/4"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Mensuel</span>
                    <span className="text-sm text-gray-600">245,000 / {parseFloat(cardData.monthlyLimit || '500000').toLocaleString()} FCFA</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary rounded-full w-1/2"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <MobileNav currentPage="cards" />
      </div>
    </div>
  );
}
