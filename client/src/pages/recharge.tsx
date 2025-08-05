import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  ChevronLeft,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import { useLocation } from "wouter";
import type { InsertTransaction } from "@shared/schema";

interface RechargeRequest {
  accountId: string;
  amount: string;
  method: string;
  description: string;
}

interface RechargeMethod {
  id: string;
  type: "card" | "mobile_money" | "bank_transfer";
  name: string;
  description: string;
  icon: any;
  fees: string;
  processingTime: string;
}

export default function Recharge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    amount: "",
    method: "",
    description: "Recharge de compte"
  });

  const [selectedMethod, setSelectedMethod] = useState<RechargeMethod | null>(null);

  const rechargeMethods: RechargeMethod[] = [
    {
      id: "visa_card",
      type: "card",
      name: "Carte Visa/Mastercard",
      description: "Ajoutez des fonds avec votre carte bancaire",
      icon: CreditCard,
      fees: "2.5%",
      processingTime: "Instantané"
    },
    {
      id: "orange_money",
      type: "mobile_money",
      name: "Orange Money",
      description: "Rechargez depuis votre compte Orange Money",
      icon: Smartphone,
      fees: "Gratuit",
      processingTime: "Instantané"
    },
    {
      id: "wave",
      type: "mobile_money", 
      name: "Wave",
      description: "Rechargez depuis votre compte Wave",
      icon: Smartphone,
      fees: "Gratuit",
      processingTime: "Instantané"
    },
    {
      id: "bank_transfer",
      type: "bank_transfer",
      name: "Virement bancaire",
      description: "Virement depuis votre banque",
      icon: Banknote,
      fees: "500 FCFA",
      processingTime: "1-2 jours ouvrés"
    }
  ];

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const rechargeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/recharge", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Recharge initiée",
        description: "Votre demande de recharge a été traitée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la recharge",
        variant: "destructive",
      });
    },
  });

  const handleMethodSelect = (method: RechargeMethod) => {
    setSelectedMethod(method);
    setFormData({ ...formData, method: method.id });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.method) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || amount > 1000000) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être entre 1 et 1,000,000 FCFA",
        variant: "destructive",
      });
      return;
    }

    const rechargeData = {
      amount: formData.amount,
      method: formData.method,
      description: `${formData.description} - ${selectedMethod?.name}`
    };

    rechargeMutation.mutate(rechargeData);
  };

  const calculateFees = (amount: string) => {
    if (!amount || !selectedMethod) return "0";
    const baseAmount = parseFloat(amount);
    
    switch (selectedMethod.id) {
      case "visa_card":
        return (baseAmount * 0.025).toFixed(0); // 2.5%
      case "bank_transfer":
        return "500"; // Fixed fee
      default:
        return "0"; // Free for mobile money
    }
  };

  const fees = calculateFees(formData.amount);
  const totalAmount = formData.amount ? (parseFloat(formData.amount) + parseFloat(fees)).toString() : "0";

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </Button>
            <div className="flex items-center space-x-2">
              <img 
                src="/attached_assets/lgogo-ipcash_-01 Color_1754420424053.png" 
                alt="IPCASH" 
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold text-gray-900">
                Recharger mon compte
              </h1>
            </div>
            <div className="w-8" />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 border-none text-white shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Solde actuel</p>
                  <p className="text-3xl font-bold mt-1">
                    {parseInt((dashboardData as any)?.account?.balance || "0").toLocaleString()} FCFA
                  </p>
                  <p className="text-blue-200 text-xs mt-1">Disponible immédiatement</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Plus size={28} className="text-white" />
                </div>
              </div>
            </CardContent>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>
          </Card>

          {/* Recharge Amount */}
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-800 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                  <Banknote size={16} className="text-white" />
                </div>
                <span>Montant à recharger</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="amount" className="text-gray-700 font-medium">Entrez le montant (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Ex: 25 000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="text-xl font-semibold h-14 mt-2 bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm text-gray-600 mb-3 font-medium">Montants rapides</p>
                  <div className="grid grid-cols-3 gap-3">
                    {["5000", "10000", "25000", "50000", "100000", "250000"].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, amount })}
                        className="text-sm font-medium py-3 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                      >
                        {parseInt(amount).toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recharge Methods */}
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-800 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <CreditCard size={16} className="text-white" />
                </div>
                <span>Choisissez votre méthode</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rechargeMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handleMethodSelect(method)}
                    className={`p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedMethod?.id === method.id
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg transform scale-[1.02]"
                        : "border-gray-200 bg-white/80 hover:border-gray-300 hover:shadow-md hover:transform hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                        method.type === 'card' 
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                          : method.type === 'mobile_money' 
                          ? 'bg-gradient-to-br from-green-400 to-green-600' 
                          : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      }`}>
                        <method.icon size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{method.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            method.fees === 'Gratuit' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            Frais: {method.fees}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {method.processingTime}
                          </span>
                        </div>
                      </div>
                      {selectedMethod?.id === method.id && (
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="text-white" size={18} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {formData.amount && selectedMethod && (
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-blue-200 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-800 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <AlertCircle size={16} className="text-white" />
                  </div>
                  <span>Récapitulatif de la transaction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Montant à recharger</span>
                    <span className="font-bold text-lg text-gray-900">{parseInt(formData.amount).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Frais de transaction</span>
                    <span className={`font-bold text-lg ${fees === '0' ? 'text-green-600' : 'text-orange-600'}`}>
                      {fees === '0' ? 'Gratuit' : `${parseInt(fees).toLocaleString()} FCFA`}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xl text-gray-900">Total à débiter</span>
                      <span className="font-bold text-2xl text-blue-600">{parseInt(totalAmount).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <selectedMethod.icon size={20} className="text-blue-600" />
                      <span className="text-blue-800 font-medium">via {selectedMethod.name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!formData.amount || !formData.method || rechargeMutation.isPending}
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-2xl"
          >
            {rechargeMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Traitement en cours...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={20} />
                <span>Confirmer la recharge</span>
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-green-900 text-lg">Transaction 100% Sécurisée</h4>
                  <p className="text-sm text-green-800 mt-2 leading-relaxed">
                    Vos paiements sont protégés par un chiffrement de niveau bancaire. 
                    Nous utilisons les dernières technologies de sécurité pour garantir 
                    la protection de vos données financières.
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-green-700">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>SSL 256-bit</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>PCI DSS</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>3D Secure</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav currentPage="dashboard" />
    </div>
  );
}