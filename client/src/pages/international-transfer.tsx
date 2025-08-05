import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Globe,
  ArrowLeftRight,
  Calculator,
  Clock,
  Shield,
  ChevronLeft
} from "lucide-react";
import { useLocation } from "wouter";
import type { Currency, BankingPartner, InsertInternationalTransfer } from "@shared/schema";

export default function InternationalTransfer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    toCurrencyId: "",
    fromAmount: "",
    recipientName: "",
    recipientAccount: "",
    recipientBank: "",
    recipientCountry: "",
    swiftCode: "",
    purpose: "",
  });

  const { data: currencies } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
  });

  const { data: bankingPartners } = useQuery<BankingPartner[]>({
    queryKey: ["/api/banking-partners"],
  });

  const { data: exchangeRate, isLoading: isLoadingRate } = useQuery<{rate: number}>({
    queryKey: ["/api/exchange-rate", "FCFA", formData.toCurrencyId],
    enabled: !!formData.toCurrencyId,
  });

  const createTransferMutation = useMutation({
    mutationFn: async (data: InsertInternationalTransfer) => {
      return await apiRequest("/api/international-transfers", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Transfert initié",
        description: "Votre transfert international a été initié avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/international-transfers"] });
      setLocation("/transactions");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'initier le transfert",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.toCurrencyId || !formData.fromAmount || !formData.recipientName) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const transferData: InsertInternationalTransfer = {
      userId: (user as any)?.id,
      fromCurrencyId: "fcfa-currency-id", // Default FCFA currency
      toCurrencyId: formData.toCurrencyId,
      fromAmount: formData.fromAmount,
      toAmount: (parseFloat(formData.fromAmount) * (exchangeRate?.rate || 1)).toString(),
      exchangeRate: exchangeRate?.rate?.toString() || "1",
      recipientName: formData.recipientName,
      recipientAccount: formData.recipientAccount,
      recipientBank: formData.recipientBank,
      recipientCountry: formData.recipientCountry,
      swiftCode: formData.swiftCode,
      purpose: formData.purpose,

    };

    createTransferMutation.mutate(transferData);
  };

  const toAmount = formData.fromAmount && exchangeRate?.rate 
    ? (parseFloat(formData.fromAmount) * exchangeRate.rate).toFixed(2)
    : "0.00";

  const fees = formData.fromAmount 
    ? (parseFloat(formData.fromAmount) * 0.015).toFixed(2) // 1.5% fee
    : "0.00";

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/transfer")}
              className="p-2"
            >
              <ChevronLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Transfert International</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Info Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe size={24} />
                <div>
                  <h3 className="font-bold text-lg">Transferts Internationaux</h3>
                  <p className="text-blue-100 text-sm">Envoyez de l'argent partout dans le monde</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Clock size={16} className="mx-auto mb-1" />
                  <p className="text-xs">1-3 jours ouvrés</p>
                </div>
                <div>
                  <Shield size={16} className="mx-auto mb-1" />
                  <p className="text-xs">Sécurisé</p>
                </div>
                <div>
                  <Calculator size={16} className="mx-auto mb-1" />
                  <p className="text-xs">Taux compétitifs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowLeftRight size={20} />
                <span>Détails du transfert</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant à envoyer</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.fromAmount}
                      onChange={(e) => setFormData({ ...formData, fromAmount: e.target.value })}
                      className="text-right"
                    />
                    <p className="text-xs text-gray-500 mt-1">FCFA</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Devise de réception</Label>
                    <Select 
                      value={formData.toCurrencyId} 
                      onValueChange={(value) => setFormData({ ...formData, toCurrencyId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies?.map((currency: Currency) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Exchange Rate Info */}
                {exchangeRate && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Taux de change:</span>
                        <span className="font-medium">1 FCFA = {exchangeRate.rate} {formData.toCurrencyId}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Montant reçu:</span>
                        <span className="font-medium text-green-600">{toAmount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Frais (1.5%):</span>
                        <span className="font-medium">{fees} FCFA</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recipient Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Informations du bénéficiaire</h4>
                  
                  <div>
                    <Label htmlFor="recipientName">Nom complet du bénéficiaire *</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      placeholder="Nom et prénom"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipientAccount">Numéro de compte *</Label>
                    <Input
                      id="recipientAccount"
                      value={formData.recipientAccount}
                      onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })}
                      placeholder="Numéro de compte bancaire"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipientBank">Banque du bénéficiaire</Label>
                    <Input
                      id="recipientBank"
                      value={formData.recipientBank}
                      onChange={(e) => setFormData({ ...formData, recipientBank: e.target.value })}
                      placeholder="Nom de la banque"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipientCountry">Pays</Label>
                      <Input
                        id="recipientCountry"
                        value={formData.recipientCountry}
                        onChange={(e) => setFormData({ ...formData, recipientCountry: e.target.value })}
                        placeholder="Pays de destination"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="swiftCode">Code SWIFT</Label>
                      <Input
                        id="swiftCode"
                        value={formData.swiftCode}
                        onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                        placeholder="SWIFT/BIC"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Motif du transfert *</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="Ex: Soutien familial, paiement de services..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createTransferMutation.isPending || isLoadingRate}
                >
                  {createTransferMutation.isPending ? "Traitement..." : "Initier le transfert"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Banking Partners */}
          {bankingPartners && bankingPartners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Partenaires bancaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {bankingPartners.slice(0, 4).map((partner: BankingPartner) => (
                    <div key={partner.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold">{partner.name.substring(0, 2)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{partner.name}</p>
                        <p className="text-xs text-gray-500">{partner.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <MobileNav currentPage="transfer" />
      </div>
    </div>
  );
}