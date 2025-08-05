import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BalanceCard } from "@/components/ui/balance-card";
import { TransactionItem } from "@/components/ui/transaction-item";
import { MobileNav } from "@/components/ui/mobile-nav";
import { 
  Bell, 
  Settings, 
  Send, 
  Plus, 
  CreditCard, 
  TrendingUp,
  ArrowDown,
  ShoppingCart,
  Smartphone,
  Target,
  Brain,
  PiggyBank
} from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const userInitials = (user as any)?.firstName && (user as any)?.lastName 
    ? `${(user as any).firstName[0]}${(user as any).lastName[0]}` 
    : (user as any)?.email?.[0]?.toUpperCase() || "U";

  const mockTransactions = [
    {
      id: "1",
      type: "incoming" as const,
      title: "Salaire mensuel",
      subtitle: "Aujourd'hui, 14:30",
      amount: "+75,000 FCFA",
      status: "completed" as const,
      icon: ArrowDown,
    },
    {
      id: "2", 
      type: "payment" as const,
      title: "Auchan Dakar",
      subtitle: "Hier, 18:45",
      amount: "-12,500 FCFA", 
      status: "completed" as const,
      icon: ShoppingCart,
    },
    {
      id: "3",
      type: "mobile" as const,
      title: "Transfert Orange Money",
      subtitle: "Hier, 12:20", 
      amount: "-5,000 FCFA",
      status: "completed" as const,
      icon: Smartphone,
    }
  ];

  return (
    <div className="mobile-container bg-gray-50">
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="banking-gradient px-6 pt-16 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">{userInitials}</span>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Bonjour,</p>
                <h2 className="text-white font-semibold">{(user as any)?.firstName || 'Utilisateur'}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-white relative">
                <Bell size={20} />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </button>
              <button onClick={() => setLocation('/profile')} className="text-white">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <BalanceCard 
            balance={(dashboardData as any)?.account?.balance || "125,430"}
            currency="FCFA"
            monthlyGain="+5,250 FCFA"
            savingsProgress={75}
          />
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation('/transfer')}
              className="flex flex-col items-center space-y-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 h-auto"
            >
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Send className="text-white" size={20} />
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">Envoyer</span>
            </Button>
            
            <Button
              variant="ghost"
              className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 h-auto"
            >
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                <Plus className="text-white" size={20} />
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">Recharger</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setLocation('/cards')}
              className="flex flex-col items-center space-y-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 h-auto"
            >
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <CreditCard className="text-white" size={20} />
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">Ma carte</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setLocation('/savings')}
              className="flex flex-col items-center space-y-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 h-auto"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={20} />
              </div>
              <span className="text-xs text-gray-700 font-medium text-center">Épargne</span>
            </Button>
          </div>

          {/* Recent Transactions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transactions récentes</h3>
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/transactions')}
                className="text-primary text-sm font-medium p-0 h-auto hover:bg-transparent"
              >
                Voir tout
              </Button>
            </div>
            
            <div className="space-y-3">
              {mockTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </div>

          {/* AI-Powered Features */}
          <Card className="bg-gradient-to-r from-purple-500 to-blue-500 border-none text-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-lg mb-1">Intelligence Artificielle</h4>
                  <p className="text-purple-100 text-sm">Fonctionnalités avancées avec IA</p>
                </div>
                <Brain className="text-purple-100" size={32} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setLocation('/analytics')}
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white border-none h-auto p-3 flex flex-col items-center space-y-2"
                >
                  <TrendingUp size={20} />
                  <span className="text-xs font-medium">Analyse financière</span>
                </Button>
                <Button
                  onClick={() => setLocation('/credit')}
                  variant="ghost"
                  className="bg-white/20 hover:bg-white/30 text-white border-none h-auto p-3 flex flex-col items-center space-y-2"
                >
                  <CreditCard size={20} />
                  <span className="text-xs font-medium">Crédit intelligent</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Money Integration */}
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-none text-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg mb-1">Mobile Money</h4>
                  <p className="text-orange-100 text-sm">Connectez vos comptes</p>
                </div>
                <Smartphone className="text-3xl text-orange-100" size={32} />
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-orange-500 font-bold text-xs">OM</span>
                  </div>
                  <span className="text-sm">Orange Money</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">WV</span>
                  </div>
                  <span className="text-sm">Wave</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <MobileNav currentPage="dashboard" />
      </div>
    </div>
  );
}
