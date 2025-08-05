import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MobileNav } from "@/components/ui/mobile-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Target, 
  Plus,
  TrendingUp,
  Calendar,
  Coins,
  Zap,
  Settings,
  PiggyBank,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";

export default function Savings() {
  const [, setLocation] = useLocation();
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savingsGoals, isLoading } = useQuery({
    queryKey: ["/api/savings-goals"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/savings-goals", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      setIsNewGoalOpen(false);
      toast({
        title: "Objectif créé",
        description: "Votre objectif d'épargne a été créé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'objectif d'épargne",
        variant: "destructive",
      });
    },
  });

  // Mock data pour démonstration
  const mockSavingsGoals = [
    {
      id: "1",
      name: "Voyage au Maroc",
      targetAmount: 250000,
      currentAmount: 127500,
      targetDate: "2024-12-31",
      autoSaveAmount: 15000,
      autoSaveFrequency: "monthly",
      isActive: true,
      progress: 51,
    },
    {
      id: "2", 
      name: "Fonds d'urgence",
      targetAmount: 500000,
      currentAmount: 320000,
      targetDate: "2025-06-30",
      autoSaveAmount: 25000,
      autoSaveFrequency: "monthly",
      isActive: true,
      progress: 64,
    },
    {
      id: "3",
      name: "Nouvelle moto",
      targetAmount: 800000,
      currentAmount: 180000,
      targetDate: "2025-08-15",
      autoSaveAmount: 30000,
      autoSaveFrequency: "monthly",
      isActive: true,
      progress: 22.5,
    },
  ];

  const totalSavings = mockSavingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTargets = mockSavingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  const handleCreateGoal = (data: any) => {
    createGoalMutation.mutate(data);
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
                <h1 className="text-white text-xl font-bold">Épargne automatisée</h1>
                <p className="text-blue-100 text-sm">Intelligence • Objectifs • Automatisation</p>
              </div>
            </div>
            <PiggyBank className="text-white" size={24} />
          </div>
        </div>

        {/* Savings Overview */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {totalSavings.toLocaleString()} FCFA
              </p>
              <p className="text-sm text-gray-500">Total épargné</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {((totalSavings / totalTargets) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Progression globale</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex space-x-4">
            <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 flex items-center space-x-2">
                  <Plus size={16} />
                  <span>Nouvel objectif</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="mobile-container mx-4">
                <DialogHeader>
                  <DialogTitle>Créer un objectif d'épargne</DialogTitle>
                </DialogHeader>
                <NewGoalForm onSubmit={handleCreateGoal} />
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings size={16} />
              <span>Paramètres</span>
            </Button>
          </div>

          {/* Savings Goals */}
          <div className="space-y-4">
            {mockSavingsGoals.map((goal) => (
              <Card key={goal.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{goal.name}</h3>
                      <p className="text-sm text-gray-500">
                        Objectif: {new Date(goal.targetDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {goal.isActive && (
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      )}
                      <Target className="text-primary" size={20} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progression</span>
                        <span className="text-sm font-bold text-primary">{goal.progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">
                          {goal.currentAmount.toLocaleString()} FCFA
                        </span>
                        <span className="text-sm text-gray-600">
                          {goal.targetAmount.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Auto Save Info */}
                    {goal.autoSaveAmount && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="text-primary" size={16} />
                          <span className="text-sm font-medium text-gray-700">Épargne automatique active</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {goal.autoSaveAmount.toLocaleString()} FCFA par mois
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Prochaine épargne: 1er du mois prochain
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-success hover:bg-success/90"
                      >
                        <Coins className="mr-2" size={14} />
                        Alimenter
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="mr-2" size={14} />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights */}
          <Card className="shadow-sm bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Conseil IA</h3>
                  <p className="text-sm text-gray-600">Optimisation d'épargne</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-success mt-1" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Augmentez votre épargne automatique de 5,000 FCFA
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Basé sur vos revenus, vous pourriez atteindre vos objectifs 2 mois plus tôt
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="text-primary mt-1" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Créez un objectif pour les vacances 2025
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Avec 20,000 FCFA/mois, vous pourriez économiser 240,000 FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <MobileNav currentPage="savings" />
      </div>
    </div>
  );
}

function NewGoalForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    autoSaveAmount: "",
    autoSaveFrequency: "monthly",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      autoSaveAmount: formData.autoSaveAmount ? parseFloat(formData.autoSaveAmount) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom de l'objectif</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="ex: Voyage, Urgence, Voiture..."
          required
        />
      </div>

      <div>
        <Label htmlFor="targetAmount">Montant objectif (FCFA)</Label>
        <Input
          id="targetAmount"
          type="number"
          value={formData.targetAmount}
          onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          placeholder="100000"
          required
        />
      </div>

      <div>
        <Label htmlFor="targetDate">Date objectif</Label>
        <Input
          id="targetDate"
          type="date"
          value={formData.targetDate}
          onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="autoSaveAmount">Épargne automatique (FCFA)</Label>
        <Input
          id="autoSaveAmount"
          type="number"
          value={formData.autoSaveAmount}
          onChange={(e) => setFormData({ ...formData, autoSaveAmount: e.target.value })}
          placeholder="10000 (optionnel)"
        />
      </div>

      <div>
        <Label htmlFor="frequency">Fréquence</Label>
        <Select
          value={formData.autoSaveFrequency}
          onValueChange={(value) => setFormData({ ...formData, autoSaveFrequency: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Quotidienne</SelectItem>
            <SelectItem value="weekly">Hebdomadaire</SelectItem>
            <SelectItem value="monthly">Mensuelle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Créer l'objectif
      </Button>
    </form>
  );
}