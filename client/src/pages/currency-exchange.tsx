import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ChevronLeft,
  Calculator
} from "lucide-react";
import { useLocation } from "wouter";
import type { Currency, MultiCurrencyAccount, InsertCurrencyExchange } from "@shared/schema";

export default function CurrencyExchange() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    fromCurrencyId: "",
    toCurrencyId: "",
    fromAmount: "",
    type: "market" as "market" | "limit",
  });

  const { data: currencies } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
  });

  const { data: userAccounts } = useQuery<MultiCurrencyAccount[]>({
    queryKey: ["/api/multi-currency-accounts"],
  });

  const { data: exchangeRate, isLoading: isLoadingRate } = useQuery<{rate: number}>({
    queryKey: ["/api/exchange-rate", formData.fromCurrencyId, formData.toCurrencyId],
    enabled: !!formData.fromCurrencyId && !!formData.toCurrencyId && formData.fromCurrencyId !== formData.toCurrencyId,
  });

  const { data: rateHistory } = useQuery<any[]>({
    queryKey: ["/api/exchange-rate-history", formData.fromCurrencyId, formData.toCurrencyId],
    enabled: !!formData.fromCurrencyId && !!formData.toCurrencyId,
  });

  const exchangeMutation = useMutation({
    mutationFn: async (data: InsertCurrencyExchange) => {
      return await apiRequest("/api/currency-exchanges", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Échange effectué",
        description: "Votre échange de devises a été effectué avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/currency-exchanges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/multi-currency-accounts"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer l'échange",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromCurrencyId || !formData.toCurrencyId || !formData.fromAmount) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (formData.fromCurrencyId === formData.toCurrencyId) {
      toast({
        title: "Devises identiques",
        description: "Veuillez sélectionner des devises différentes",
        variant: "destructive",
      });
      return;
    }

    const exchangeData: InsertCurrencyExchange = {
      userId: (user as any)?.id,
      fromCurrencyId: formData.fromCurrencyId,
      toCurrencyId: formData.toCurrencyId,
      fromAmount: formData.fromAmount,
      toAmount: (parseFloat(formData.fromAmount) * (exchangeRate?.rate || 1)).toString(),
      exchangeRate: exchangeRate?.rate?.toString() || "1",
      type: formData.type,
    };

    exchangeMutation.mutate(exchangeData);
  };

  const swapCurrencies = () => {
    setFormData({
      ...formData,
      fromCurrencyId: formData.toCurrencyId,
      toCurrencyId: formData.fromCurrencyId,
    });
  };

  const toAmount = formData.fromAmount && exchangeRate?.rate 
    ? (parseFloat(formData.fromAmount) * exchangeRate.rate).toFixed(6)
    : "0.00";

  const fees = formData.fromAmount 
    ? (parseFloat(formData.fromAmount) * 0.005).toFixed(2) // 0.5% fee
    : "0.00";

  const fromCurrency = currencies?.find((c: Currency) => c.id === formData.fromCurrencyId);
  const toCurrency = currencies?.find((c: Currency) => c.id === formData.toCurrencyId);

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="p-2"
            >
              <ChevronLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Change de Devises</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Exchange Rates */}
          <Card className="bg-gradient-to-r from-green-500 to-blue-500 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Taux de Change</h3>
                  <p className="text-green-100 text-sm">Taux en temps réel</p>
                </div>
                <RefreshCcw className="text-green-100" size={24} />
              </div>
              {exchangeRate && fromCurrency && toCurrency && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>1 {fromCurrency.code}</span>
                    <span className="font-medium">{exchangeRate.rate} {toCurrency.code}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-100 text-sm">
                    {Math.random() > 0.5 ? (
                      <>
                        <TrendingUp size={16} />
                        <span>+0.25% aujourd'hui</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown size={16} />
                        <span>-0.18% aujourd'hui</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exchange Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator size={20} />
                <span>Calculateur d'échange</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* From Currency */}
                <div>
                  <Label>De</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Select 
                        value={formData.fromCurrencyId} 
                        onValueChange={(value) => setFormData({ ...formData, fromCurrencyId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Devise source" />
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
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.fromAmount}
                      onChange={(e) => setFormData({ ...formData, fromAmount: e.target.value })}
                      className="w-24 text-right"
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={swapCurrencies}
                    className="rounded-full p-2"
                    disabled={!formData.fromCurrencyId || !formData.toCurrencyId}
                  >
                    <ArrowUpDown size={16} />
                  </Button>
                </div>

                {/* To Currency */}
                <div>
                  <Label>Vers</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Select 
                        value={formData.toCurrencyId} 
                        onValueChange={(value) => setFormData({ ...formData, toCurrencyId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Devise cible" />
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
                    <div className="w-24 p-2 bg-gray-50 rounded border text-right text-sm">
                      {toAmount}
                    </div>
                  </div>
                </div>

                {/* Exchange Summary */}
                {exchangeRate && fromCurrency && toCurrency && formData.fromAmount && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Montant à échanger:</span>
                        <span>{formData.fromAmount} {fromCurrency.code}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taux de change:</span>
                        <span>1 {fromCurrency.code} = {exchangeRate.rate} {toCurrency.code}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frais (0.5%):</span>
                        <span>{fees} {fromCurrency.code}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Montant final:</span>
                          <span className="text-green-600">{toAmount} {toCurrency.code}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={exchangeMutation.isPending || isLoadingRate}
                >
                  {exchangeMutation.isPending ? "Échange en cours..." : "Effectuer l'échange"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User Accounts */}
          {userAccounts && userAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Vos comptes multi-devises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAccounts.map((account: MultiCurrencyAccount) => {
                    const currency = currencies?.find((c: Currency) => c.id === account.currencyId);
                    return (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {currency?.code?.substring(0, 2) || "??"}
                          </div>
                          <div>
                            <p className="font-medium">{currency?.name}</p>
                            <p className="text-sm text-gray-500">**** {account.accountNumber.slice(-4)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{account.balance} {currency?.code}</p>
                          <p className="text-sm text-gray-500">{account.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exchange History */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des taux</CardTitle>
            </CardHeader>
            <CardContent>
              {rateHistory && rateHistory.length > 0 ? (
                <div className="space-y-2">
                  {rateHistory.slice(0, 5).map((rate: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm py-2 border-b last:border-b-0">
                      <span>{new Date(rate.timestamp).toLocaleDateString('fr-FR')}</span>
                      <span className="font-medium">{rate.rate}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Aucun historique disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        <MobileNav currentPage="dashboard" />
      </div>
    </div>
  );
}