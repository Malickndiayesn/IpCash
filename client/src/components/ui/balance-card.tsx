import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

interface BalanceCardProps {
  balance: string;
  currency: string;
  monthlyGain: string;
  savingsProgress: number;
}

export function BalanceCard({ balance, currency, monthlyGain, savingsProgress }: BalanceCardProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const toggleBalance = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString('fr-FR');
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm">Solde disponible</p>
            <div className="flex items-center space-x-2">
              <h3 
                className={`text-3xl font-bold text-gray-900 ${!isBalanceVisible ? 'balance-hidden' : ''}`}
              >
                {isBalanceVisible ? formatBalance(balance) : '••••••'}
              </h3>
              <span className="text-xl text-gray-600">{currency}</span>
              <button 
                onClick={toggleBalance}
                className="text-gray-400 hover:text-gray-600 ml-2 transition-colors"
              >
                {isBalanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Ce mois</p>
            <p className="text-success font-semibold">{monthlyGain}</p>
          </div>
        </div>
        
        <div className="h-2 bg-gray-100 rounded-full">
          <div 
            className="h-2 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
            style={{ width: `${savingsProgress}%` }}
          ></div>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Objectif d'épargne: {savingsProgress}% atteint
        </p>
      </CardContent>
    </Card>
  );
}
