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
  Wallet,
  Plus,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCcw,
  ChevronLeft,
  Globe
} from "lucide-react";
import { useLocation } from "wouter";
import type { Currency, MultiCurrencyAccount, InsertMultiCurrencyAccount } from "@shared/schema";

export default function MultiCurrency() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [showBalances, setShowBalances] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    currencyId: "",
    isDefault: false,
  });

  const { data: currencies, isLoading: currenciesLoading } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
    staleTime: 300000, // 5 minutes
  });

  const { data: userAccounts, refetch: refetchAccounts, isLoading: accountsLoading } = useQuery<MultiCurrencyAccount[]>({
    queryKey: ["/api/multi-currency-accounts"],
    staleTime: 60000, // 1 minute
  });

  const { data: exchangeRates, isLoading: ratesLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/exchange-rates/all"],
    staleTime: 30000, // 30 seconds
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertMultiCurrencyAccount) => {
      return await apiRequest("/api/multi-currency-accounts", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Compte créé",
        description: "Votre nouveau compte multi-devises a été créé",
      });
      // Use a timeout to prevent DOM manipulation conflicts
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/multi-currency-accounts"] });
        setShowAddForm(false);
        setFormData({ currencyId: "", isDefault: false });
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currencyId) {
      toast({
        title: "Devise manquante",
        description: "Veuillez sélectionner une devise",
        variant: "destructive",
      });
      return;
    }

    const accountData: InsertMultiCurrencyAccount = {
      userId: (user as any)?.id,
      currencyId: formData.currencyId,
      accountNumber: `${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      isDefault: formData.isDefault,
      balance: "0.00",
    };

    createAccountMutation.mutate(accountData);
  };

  const getTotalBalanceInFCFA = () => {
    if (!userAccounts || !exchangeRates) return "0.00";
    
    let total = 0;
    userAccounts.forEach((account: MultiCurrencyAccount) => {
      const rate = exchangeRates[account.currencyId] || 1;
      total += parseFloat(account.balance || "0") / rate;
    });
    
    return total.toFixed(2);
  };

  // Show loading state while data is being fetched
  if (currenciesLoading || accountsLoading || ratesLoading) {
    return (
      <div className="mobile-container">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-semibold text-gray-900">Comptes Multi-Devises</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
              className="p-2"
            >
              {showBalances ? <EyeOff size={20} /> : <Eye size={20} />}
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Portfolio Overview */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Portfolio Global</h3>
                  <p className="text-indigo-100 text-sm">Valeur totale en FCFA</p>
                </div>
                <Globe className="text-indigo-100" size={32} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {showBalances ? `${getTotalBalanceInFCFA()} FCFA` : "•••••••"}
                  </p>
                  <div className="flex items-center space-x-2 mt-2 text-indigo-100">
                    <TrendingUp size={16} />
                    <span className="text-sm">+2.5% ce mois</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => refetchAccounts()}
                  className="text-white hover:bg-white/20 p-2"
                >
                  <RefreshCcw size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setShowAddForm(true)}
              className="h-20 bg-green-500 hover:bg-green-600 text-white flex flex-col items-center justify-center space-y-2"
            >
              <Plus size={24} />
              <span className="text-sm">Nouveau compte</span>
            </Button>
            <Button
              onClick={() => setLocation('/currency-exchange')}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <RefreshCcw size={24} />
              <span className="text-sm">Échanger</span>
            </Button>
          </div>

          {/* Add Account Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Créer un nouveau compte</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Select 
                      value={formData.currencyId} 
                      onValueChange={(value) => setFormData({ ...formData, currencyId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une devise" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies?.map((currency: Currency) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.code} - {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault" className="text-sm">
                      Définir comme compte principal pour cette devise
                    </Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={createAccountMutation.isPending}
                    >
                      {createAccountMutation.isPending ? "Création..." : "Créer le compte"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Currency Accounts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Vos comptes</h3>
            
            {userAccounts && userAccounts.length > 0 ? (
              <div className="space-y-3">
                {userAccounts.map((account: MultiCurrencyAccount) => {
                  const currency = currencies?.find((c: Currency) => c.id === account.currencyId);
                  const rate = exchangeRates?.[account.currencyId] || 1;
                  const balanceInFCFA = parseFloat(account.balance || "0") / rate;
                  
                  return (
                    <Card key={account.id} className={account.isDefault ? "ring-2 ring-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {currency?.symbol || currency?.code?.substring(0, 2) || "??"}
                            </div>
                            <div>
                              <p className="font-medium">{currency?.name}</p>
                              <p className="text-sm text-gray-500">
                                **** {account.accountNumber.slice(-4)}
                                {account.isDefault && <span className="ml-2 text-primary">• Principal</span>}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {showBalances ? `${account.balance} ${currency?.code}` : "••••••"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {showBalances ? `≈ ${balanceInFCFA.toFixed(2)} FCFA` : "••••••"}
                            </p>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              account.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {account.status === 'active' ? 'Actif' : account.status}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Wallet className="mx-auto text-gray-400 mb-4" size={48} />
                  <h4 className="font-medium text-gray-900 mb-2">Aucun compte multi-devises</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Créez votre premier compte pour commencer à gérer plusieurs devises
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus size={16} className="mr-2" />
                    Créer un compte
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Exchange Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Taux de change actuels</CardTitle>
            </CardHeader>
            <CardContent>
              {currencies && exchangeRates ? (
                <div className="space-y-3">
                  {currencies.filter((c: Currency) => c.code !== 'FCFA').slice(0, 6).map((currency: Currency) => {
                    const rate = exchangeRates[currency.id] || 1;
                    const change = Math.random() > 0.5 ? '+' : '-';
                    const changeValue = (Math.random() * 2).toFixed(2);
                    
                    return (
                      <div key={currency.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                            {currency.symbol}
                          </div>
                          <div>
                            <p className="font-medium">{currency.code}</p>
                            <p className="text-sm text-gray-500">{currency.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{rate} FCFA</p>
                          <p className={`text-sm ${change === '+' ? 'text-green-600' : 'text-red-600'}`}>
                            {change}{changeValue}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Chargement des taux...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <MobileNav currentPage="dashboard" />
      </div>
    </div>
  );
}