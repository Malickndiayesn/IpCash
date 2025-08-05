import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/ui/mobile-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  CreditCard, 
  Plus,
  TrendingUp,
  Brain,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Calculator,
  Zap,
  Star
} from "lucide-react";
import { useLocation } from "wouter";

export default function Credit() {
  const [, setLocation] = useLocation();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: creditData, isLoading } = useQuery({
    queryKey: ["/api/credit"],
  });

  const { data: loanRequests } = useQuery({
    queryKey: ["/api/loan-requests"],
  });

  const createLoanRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/loan-requests", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-requests"] });
      setIsNewRequestOpen(false);
      toast({
        title: "Demande envoyée",
        description: "Votre demande de crédit est en cours d'analyse IA",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de crédit",
        variant: "destructive",
      });
    },
  });

  // Mock data pour démonstration
  const mockCreditScore = {
    score: 742,
    level: "Excellent",
    factors: {
      transactionHistory: 85,
      savingsBehavior: 92,
      paymentReliability: 88,
      accountAge: 76,
    },
    lastCalculated: "2024-12-05",
    recommendations: [
      "Votre score est excellent ! Vous êtes éligible aux meilleurs taux.",
      "Maintenez vos habitudes d'épargne pour garder ce niveau.",
      "Diversifiez vos sources de revenus pour améliorer encore votre profil.",
    ]
  };

  const mockLoanOffers = [
    {
      id: "1",
      amount: 100000,
      duration: 12,
      interestRate: 8.5,
      monthlyPayment: 9168,
      purpose: "Personnel",
      type: "express",
      aiApproval: 95,
    },
    {
      id: "2",
      amount: 250000,
      duration: 24,
      interestRate: 9.2,
      monthlyPayment: 11875,
      purpose: "Équipement",
      type: "standard",
      aiApproval: 87,
    },
    {
      id: "3",
      amount: 500000,
      duration: 36,
      interestRate: 10.1,
      monthlyPayment: 16134,
      purpose: "Projet",
      type: "premium",
      aiApproval: 78,
    },
  ];

  const mockActiveLoans = [
    {
      id: "loan-1",
      amount: 150000,
      remainingAmount: 89500,
      monthlyPayment: 7200,
      nextPayment: "2024-12-15",
      status: "active",
      progress: 40.3,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 650) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 550) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getApprovalColor = (approval: number) => {
    if (approval >= 85) return "text-green-600";
    if (approval >= 70) return "text-blue-600";
    if (approval >= 60) return "text-orange-600";
    return "text-red-600";
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => setLocation('/')} className="text-white mr-4">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-white text-xl font-bold">Crédit intelligent</h1>
                <p className="text-blue-100 text-sm">IA • Analyse instantanée • Approbation rapide</p>
              </div>
            </div>
            <Brain className="text-white" size={24} />
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Credit Score */}
          <Card className={`shadow-sm border-2 ${getScoreColor(mockCreditScore.score)}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Score de crédit IA</h3>
                <div className="flex items-center space-x-2">
                  <Shield className="text-primary" size={20} />
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Mis à jour
                  </Badge>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(mockCreditScore.score / 850) * 283} 283`}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{mockCreditScore.score}</span>
                    <span className="text-sm text-gray-500">/ 850</span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{mockCreditScore.level}</p>
                <p className="text-sm text-gray-600">
                  Dernière mise à jour: {new Date(mockCreditScore.lastCalculated).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Historique transactions</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${mockCreditScore.factors.transactionHistory}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{mockCreditScore.factors.transactionHistory}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Comportement épargne</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-success rounded-full"
                        style={{ width: `${mockCreditScore.factors.savingsBehavior}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{mockCreditScore.factors.savingsBehavior}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fiabilité paiements</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${mockCreditScore.factors.paymentReliability}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{mockCreditScore.factors.paymentReliability}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Loans */}
          {mockActiveLoans.length > 0 && (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Crédit en cours</h3>
                
                {mockActiveLoans.map((loan) => (
                  <div key={loan.id} className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {loan.remainingAmount.toLocaleString()} FCFA restants
                        </p>
                        <p className="text-sm text-gray-600">
                          sur {loan.amount.toLocaleString()} FCFA initiaux
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <CheckCircle size={12} className="mr-1" />
                        À jour
                      </Badge>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full mb-3">
                      <div 
                        className="h-2 bg-success rounded-full transition-all duration-500"
                        style={{ width: `${loan.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Prochain paiement: {loan.monthlyPayment.toLocaleString()} FCFA
                      </span>
                      <span className="text-gray-600">
                        {new Date(loan.nextPayment).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Loan Offers */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Offres pré-approuvées IA</h3>
                <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center space-x-2">
                      <Plus size={14} />
                      <span>Demande</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mobile-container mx-4">
                    <DialogHeader>
                      <DialogTitle>Nouvelle demande de crédit</DialogTitle>
                    </DialogHeader>
                    <LoanRequestForm onSubmit={(data) => createLoanRequestMutation.mutate(data)} />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {mockLoanOffers.map((offer) => (
                  <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {offer.amount.toLocaleString()} FCFA
                          </h4>
                          <Badge variant={offer.type === 'express' ? 'default' : 'outline'} className="text-xs">
                            {offer.type === 'express' ? 'Express' : offer.type === 'premium' ? 'Premium' : 'Standard'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{offer.purpose}</p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center space-x-1 ${getApprovalColor(offer.aiApproval)}`}>
                          <Brain size={14} />
                          <span className="text-sm font-bold">{offer.aiApproval}%</span>
                        </div>
                        <p className="text-xs text-gray-500">Approbation IA</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-primary">{offer.interestRate}%</p>
                        <p className="text-xs text-gray-500">Taux annuel</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{offer.duration} mois</p>
                        <p className="text-xs text-gray-500">Durée</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-success">
                          {offer.monthlyPayment.toLocaleString()} FCFA
                        </p>
                        <p className="text-xs text-gray-500">Par mois</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        variant={offer.aiApproval >= 85 ? "default" : "outline"}
                      >
                        {offer.type === 'express' ? (
                          <>
                            <Zap className="mr-2" size={14} />
                            Accepter (2min)
                          </>
                        ) : (
                          <>
                            <Calculator className="mr-2" size={14} />
                            Simuler
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="shadow-sm bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Star className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Conseils IA personnalisés</h3>
                  <p className="text-sm text-gray-600">Optimisation de votre profil crédit</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {mockCreditScore.recommendations.map((rec, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 flex items-start space-x-3">
                    <TrendingUp className="text-success mt-1" size={16} />
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <MobileNav currentPage="credit" />
      </div>
    </div>
  );
}

function LoanRequestForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    duration: "12",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      duration: parseInt(formData.duration),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Montant souhaité (FCFA)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="100000"
          required
        />
      </div>

      <div>
        <Label htmlFor="purpose">Motif du crédit</Label>
        <Select
          value={formData.purpose}
          onValueChange={(value) => setFormData({ ...formData, purpose: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un motif" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personnel</SelectItem>
            <SelectItem value="business">Professionnel</SelectItem>
            <SelectItem value="education">Éducation</SelectItem>
            <SelectItem value="health">Santé</SelectItem>
            <SelectItem value="equipment">Équipement</SelectItem>
            <SelectItem value="emergency">Urgence</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="duration">Durée (mois)</Label>
        <Select
          value={formData.duration}
          onValueChange={(value) => setFormData({ ...formData, duration: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 mois</SelectItem>
            <SelectItem value="12">12 mois</SelectItem>
            <SelectItem value="18">18 mois</SelectItem>
            <SelectItem value="24">24 mois</SelectItem>
            <SelectItem value="36">36 mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        <Brain className="mr-2" size={16} />
        Analyser avec l'IA
      </Button>
    </form>
  );
}