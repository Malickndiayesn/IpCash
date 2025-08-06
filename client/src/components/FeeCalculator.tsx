import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign, TrendingDown, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FeeCalculatorProps {
  amount: string;
  fromOperator: any;
  toOperator: any;
  showDetails?: boolean;
}

export function FeeCalculator({ 
  amount, 
  fromOperator, 
  toOperator, 
  showDetails = true 
}: FeeCalculatorProps) {
  const numericAmount = parseFloat(amount) || 0;
  
  // Calculer les frais selon l'opérateur
  const calculateFees = () => {
    if (!fromOperator || !toOperator || numericAmount === 0) {
      return {
        transferFee: 0,
        exchangeFee: 0,
        totalFees: 0,
        netAmount: numericAmount,
        feePercentage: 0
      };
    }

    let transferFee = 0;
    let exchangeFee = 0;

    // Frais de transfert selon l'opérateur source
    if (fromOperator.id === "ipcash-wallet") {
      transferFee = Math.max(100, numericAmount * 0.005); // Min 100 FCFA ou 0.5%
    } else if (fromOperator.id === "orange-money") {
      transferFee = Math.max(150, numericAmount * 0.01); // Min 150 FCFA ou 1%
    } else if (fromOperator.id === "wave-senegal") {
      transferFee = 0; // Wave gratuit
    }

    // Frais de change si différents opérateurs
    if (fromOperator.id !== toOperator.id) {
      exchangeFee = numericAmount * 0.002; // 0.2% pour les transferts inter-opérateurs
    }

    const totalFees = transferFee + exchangeFee;
    const netAmount = numericAmount - totalFees;
    const feePercentage = numericAmount > 0 ? (totalFees / numericAmount) * 100 : 0;

    return {
      transferFee,
      exchangeFee,
      totalFees,
      netAmount: Math.max(0, netAmount),
      feePercentage
    };
  };

  const fees = calculateFees();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
  };

  const getFeeLevel = () => {
    if (fees.feePercentage <= 1) return { level: "low", color: "text-green-600", bg: "bg-green-50" };
    if (fees.feePercentage <= 3) return { level: "medium", color: "text-orange-600", bg: "bg-orange-50" };
    return { level: "high", color: "text-red-600", bg: "bg-red-50" };
  };

  const feeLevel = getFeeLevel();

  if (!showDetails) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">Frais totaux:</span>
        <span className="font-medium">{formatCurrency(fees.totalFees)} FCFA</span>
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator size={16} className="text-green-500" />
            <span>Détail des frais</span>
          </div>
          <Badge 
            variant="secondary" 
            className={`${feeLevel.color} ${feeLevel.bg}`}
          >
            {fees.feePercentage.toFixed(2)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Montant à envoyer:</span>
            <span className="font-medium">{formatCurrency(numericAmount)} FCFA</span>
          </div>
          
          {fees.transferFee > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">Frais transfert:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-0">
                      <Info size={12} className="text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 text-xs">
                    <p>Frais appliqués par {fromOperator?.name} pour le transfert.</p>
                  </PopoverContent>
                </Popover>
              </div>
              <span className="text-red-600">-{formatCurrency(fees.transferFee)} FCFA</span>
            </div>
          )}
          
          {fees.exchangeFee > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">Frais inter-opérateur:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-0">
                      <Info size={12} className="text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 text-xs">
                    <p>Frais pour les transferts entre différents opérateurs (0.2%).</p>
                  </PopoverContent>
                </Popover>
              </div>
              <span className="text-red-600">-{formatCurrency(fees.exchangeFee)} FCFA</span>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between items-center font-medium">
            <span>Montant reçu:</span>
            <span className="text-green-600">{formatCurrency(fees.netAmount)} FCFA</span>
          </div>
        </div>

        {/* Fee Optimization Tips */}
        {fees.totalFees > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <TrendingDown size={16} className="text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">💡 Pour réduire les frais:</p>
                <ul className="list-disc list-inside space-y-1">
                  {fromOperator?.id !== "wave-senegal" && (
                    <li>Utilisez Wave (frais gratuits)</li>
                  )}
                  {fees.exchangeFee > 0 && (
                    <li>Transférez via le même opérateur</li>
                  )}
                  <li>Groupez vos transferts pour économiser</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Free Transfer Notice */}
        {fees.totalFees === 0 && fromOperator?.id === "wave-senegal" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Transfert gratuit avec Wave!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}