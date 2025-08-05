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
            <h1 className="text-xl font-semibold text-gray-900">Recharger mon compte</h1>
            <div className="w-8" />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Solde actuel</p>
                  <p className="text-2xl font-bold">
                    {(dashboardData as any)?.account?.balance || "0"} FCFA
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recharge Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Montant à recharger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Ex: 25000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="text-lg"
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {["5000", "10000", "25000", "50000", "100000", "250000"].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, amount })}
                      className="text-xs"
                    >
                      {parseInt(amount).toLocaleString()} FCFA
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recharge Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Méthode de recharge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rechargeMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handleMethodSelect(method)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedMethod?.id === method.id
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        method.type === 'card' ? 'bg-blue-100' :
                        method.type === 'mobile_money' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <method.icon size={20} className={
                          method.type === 'card' ? 'text-blue-600' :
                          method.type === 'mobile_money' ? 'text-green-600' : 'text-yellow-600'
                        } />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-500">{method.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">Frais: {method.fees}</span>
                          <span className="text-xs text-gray-500">• {method.processingTime}</span>
                        </div>
                      </div>
                      {selectedMethod?.id === method.id && (
                        <CheckCircle2 className="text-primary" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {formData.amount && selectedMethod && (
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant</span>
                    <span className="font-medium">{parseInt(formData.amount).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais</span>
                    <span className="font-medium">{parseInt(fees).toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total à débiter</span>
                      <span className="font-semibold text-lg">{parseInt(totalAmount).toLocaleString()} FCFA</span>
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
            className="w-full h-12 text-lg font-semibold"
          >
            {rechargeMutation.isPending ? "Traitement..." : "Confirmer la recharge"}
          </Button>

          {/* Security Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-blue-900">Sécurisé</h4>
                  <p className="text-sm text-blue-700">
                    Toutes les transactions sont sécurisées et chiffrées. 
                    Vos données financières sont protégées.
                  </p>
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