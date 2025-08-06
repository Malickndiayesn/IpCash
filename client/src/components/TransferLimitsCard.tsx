import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, TrendingUp } from "lucide-react";

interface TransferLimitsProps {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  operatorName?: string;
}

export function TransferLimitsCard({ 
  dailyUsed, 
  dailyLimit, 
  monthlyUsed, 
  monthlyLimit, 
  operatorName 
}: TransferLimitsProps) {
  const dailyPercentage = (dailyUsed / dailyLimit) * 100;
  const monthlyPercentage = (monthlyUsed / monthlyLimit) * 100;
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getDailyLimitColor = () => {
    if (dailyPercentage >= 90) return "text-red-500";
    if (dailyPercentage >= 70) return "text-orange-500";
    return "text-green-500";
  };

  const getMonthlyLimitColor = () => {
    if (monthlyPercentage >= 90) return "text-red-500";
    if (monthlyPercentage >= 70) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Shield size={16} className="text-blue-500" />
          <span>Limites de transfert</span>
          {operatorName && (
            <span className="text-xs text-gray-500">({operatorName})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Limits */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">Limite journalière</span>
            <span className={`text-xs font-medium ${getDailyLimitColor()}`}>
              {formatAmount(dailyUsed)} / {formatAmount(dailyLimit)} FCFA
            </span>
          </div>
          <Progress 
            value={Math.min(dailyPercentage, 100)} 
            className="h-2"
          />
          {dailyPercentage >= 80 && (
            <div className="flex items-center space-x-1 mt-1">
              <AlertTriangle size={12} className="text-orange-500" />
              <span className="text-xs text-orange-600">
                Attention: {Math.round(100 - dailyPercentage)}% restant
              </span>
            </div>
          )}
        </div>

        {/* Monthly Limits */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600">Limite mensuelle</span>
            <span className={`text-xs font-medium ${getMonthlyLimitColor()}`}>
              {formatAmount(monthlyUsed)} / {formatAmount(monthlyLimit)} FCFA
            </span>
          </div>
          <Progress 
            value={Math.min(monthlyPercentage, 100)} 
            className="h-2"
          />
          {monthlyPercentage >= 80 && (
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp size={12} className="text-blue-500" />
              <span className="text-xs text-blue-600">
                {Math.round(100 - monthlyPercentage)}% restant ce mois
              </span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {(dailyPercentage >= 70 || monthlyPercentage >= 70) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-3">
            <p className="text-xs text-yellow-800">
              💡 <strong>Conseil:</strong> Planifiez vos gros transferts pour éviter 
              d'atteindre vos limites. Contactez le support pour augmenter vos plafonds.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}