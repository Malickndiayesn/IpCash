import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  type: "stripe" | "paypal" | "mobile_money";
  description: string;
  fees: string;
  processingTime: string;
  icon: any;
  available: boolean;
  secure: boolean;
}

interface PaymentProcessorProps {
  amount: string;
  currency: string;
  onPaymentSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
}

export default function PaymentProcessor({ 
  amount, 
  currency, 
  onPaymentSelect, 
  selectedMethod 
}: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "stripe_card",
      name: "Carte bancaire",
      type: "stripe",
      description: "Visa, Mastercard, American Express",
      fees: "2.9% + 30¢",
      processingTime: "Instantané",
      icon: CreditCard,
      available: true,
      secure: true
    },
    {
      id: "paypal",
      name: "PayPal",
      type: "paypal", 
      description: "Compte PayPal ou carte via PayPal",
      fees: "3.4% + 0.35€",
      processingTime: "Instantané",
      icon: Shield,
      available: true,
      secure: true
    },
    {
      id: "orange_money",
      name: "Orange Money",
      type: "mobile_money",
      description: "Mobile Money Orange",
      fees: "Gratuit",
      processingTime: "Instantané",
      icon: CreditCard,
      available: true,
      secure: true
    }
  ];

  const formatAmount = (amount: string) => {
    return parseInt(amount).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Lock size={20} />
            <span>Paiement sécurisé</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">
              {formatAmount(amount)} {currency}
            </p>
            <p className="text-sm text-gray-600 mt-1">Montant à payer</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-300 ${
              selectedMethod?.id === method.id
                ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
            onClick={() => onPaymentSelect(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  method.type === 'stripe' 
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                    : method.type === 'paypal'
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                    : 'bg-gradient-to-br from-orange-400 to-orange-600'
                }`}>
                  <method.icon size={20} className="text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-gray-900">{method.name}</h4>
                    {method.secure && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Sécurisé
                      </Badge>
                    )}
                    {!method.available && (
                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                        Indisponible
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      method.fees === 'Gratuit' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      Frais: {method.fees}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{method.processingTime}</span>
                    </span>
                  </div>
                </div>

                {selectedMethod?.id === method.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMethod && (
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-blue-600" size={20} />
              <div>
                <h4 className="font-medium text-blue-900">Méthode sélectionnée</h4>
                <p className="text-sm text-blue-700">
                  {selectedMethod.name} - {selectedMethod.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="text-green-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-green-900">Protection garantie</h4>
            <p className="text-sm text-green-700 mt-1">
              Vos informations de paiement sont sécurisées par un chiffrement SSL 256-bit. 
              Nous ne stockons jamais vos données bancaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}