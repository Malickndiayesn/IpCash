import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/ui/mobile-nav";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Target,
  Brain,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Calendar,
  Zap
} from "lucide-react";
import { useLocation } from "wouter";

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '3months'>('month');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics", selectedPeriod],
  });

  // Mock data avec analyse IA
  const mockAnalytics = {
    currentMonth: {
      income: 185000,
      expenses: 142000,
      savings: 43000,
      savingsRate: 23.2,
    },
    categoryBreakdown: [
      { category: "Alimentation", amount: 45000, percentage: 31.7, color: "bg-red-500" },
      { category: "Transport", amount: 25000, percentage: 17.6, color: "bg-blue-500" },
      { category: "Logement", amount: 35000, percentage: 24.6, color: "bg-green-500" },
      { category: "Loisirs", amount: 20000, percentage: 14.1, color: "bg-purple-500" },
      { category: "Autres", amount: 17000, percentage: 12.0, color: "bg-orange-500" },
    ],
    aiRecommendations: [
      {
        type: "savings",
        title: "Optimisez vos dépenses alimentaires",
        description: "Vous dépensez 15% de plus que la moyenne. Essayez de cuisiner plus souvent.",
        impact: "+8,500 FCFA/mois",
        icon: Lightbulb,
      },
      {
        type: "investment",
        title: "Investissez votre excédent",
        description: "Avec votre épargne actuelle, vous pourriez générer +3% de rendement.",
        impact: "+1,290 FCFA/mois",
        icon: TrendingUp,
      },
      {
        type: "budget",
        title: "Créez un budget loisirs",
        description: "Vos dépenses loisirs varient beaucoup. Un budget vous aiderait.",
        impact: "Meilleur contrôle",
        icon: Target,
      },
    ],
    budgetAlerts: [
      {
        category: "Transport",
        spent: 25000,
        budget: 20000,
        percentage: 125,
        status: "exceeded",
      },
    ],
    trends: {
      savingsGrowth: 15.3,
      expenseGrowth: -5.2,
      incomeGrowth: 8.7,
    }
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
              <h1 className="text-white text-xl font-bold">Analyse financière</h1>
              <p className="text-blue-100 text-sm">Intelligence artificielle • Insights personnalisés</p>
            </div>
            <div className="text-white">
              <Brain size={24} />
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('week')}
              className="rounded-full text-sm font-medium whitespace-nowrap"
              size="sm"
            >
              7 jours
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('month')}
              className="rounded-full text-sm font-medium whitespace-nowrap"
              size="sm"
            >
              30 jours
            </Button>
            <Button
              variant={selectedPeriod === '3months' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('3months')}
              className="rounded-full text-sm font-medium whitespace-nowrap"
              size="sm"
            >
              3 mois
            </Button>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Financial Overview */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vue d'ensemble</h3>
                <BarChart3 className="text-primary" size={20} />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">
                    {mockAnalytics.currentMonth.income.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-gray-500">Revenus</p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="text-success text-xs mr-1" size={12} />
                    <span className="text-xs text-success font-medium">+{mockAnalytics.trends.incomeGrowth}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-error">
                    {mockAnalytics.currentMonth.expenses.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-gray-500">Dépenses</p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingDown className="text-success text-xs mr-1" size={12} />
                    <span className="text-xs text-success font-medium">{mockAnalytics.trends.expenseGrowth}%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {mockAnalytics.currentMonth.savings.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-gray-500">Épargne</p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="text-success text-xs mr-1" size={12} />
                    <span className="text-xs text-success font-medium">+{mockAnalytics.trends.savingsGrowth}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Taux d'épargne</span>
                  <span className="text-lg font-bold text-primary">{mockAnalytics.currentMonth.savingsRate}%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${mockAnalytics.currentMonth.savingsRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Excellent ! Au-dessus de la moyenne de 20%</p>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Répartition des dépenses</h3>
                <PieChart className="text-primary" size={20} />
              </div>
              
              <div className="space-y-3">
                {mockAnalytics.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                      <span className="font-medium text-gray-900">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{category.amount.toLocaleString()} FCFA</p>
                      <p className="text-sm text-gray-500">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Alerts */}
          {mockAnalytics.budgetAlerts.length > 0 && (
            <Card className="shadow-sm border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="text-warning" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Alertes budget</h3>
                </div>
                
                {mockAnalytics.budgetAlerts.map((alert, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{alert.category}</span>
                      <span className="text-sm text-warning font-bold">{alert.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full mb-2">
                      <div 
                        className="h-2 bg-warning rounded-full"
                        style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {alert.spent.toLocaleString()} FCFA sur {alert.budget.toLocaleString()} FCFA budgétés
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="text-primary" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Recommandations IA</h3>
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Nouveau</span>
              </div>
              
              <div className="space-y-4">
                {mockAnalytics.aiRecommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <rec.icon className="text-primary" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-success">Impact: {rec.impact}</span>
                          <Button size="sm" variant="outline" className="text-xs">
                            Appliquer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/savings')}
                  className="h-20 flex flex-col space-y-2 bg-green-50 border-green-200 hover:bg-green-100"
                >
                  <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
                    <Target className="text-white" size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Épargne auto</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setLocation('/credit')}
                  className="h-20 flex flex-col space-y-2 bg-purple-50 border-purple-200 hover:bg-purple-100"
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Zap className="text-white" size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Crédit IA</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <MobileNav currentPage="analytics" />
      </div>
    </div>
  );
}