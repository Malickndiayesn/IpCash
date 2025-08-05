import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing' | 'payment' | 'mobile';
  title: string;
  subtitle: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  icon: LucideIcon;
}

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'transaction-incoming';
      case 'outgoing':
        return 'transaction-outgoing';
      case 'payment':
        return 'transaction-payment';
      case 'mobile':
        return 'transaction-mobile';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getAmountColor = (amount: string) => {
    if (amount.startsWith('+')) {
      return 'text-success';
    } else if (amount.startsWith('-')) {
      return 'text-gray-900';
    }
    return 'text-gray-900';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En cours';
      case 'failed':
        return 'Échoué';
      default:
        return status;
    }
  };

  return (
    <Card className="border border-gray-100 hover:shadow-sm transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconBgColor(transaction.type)}`}>
              <transaction.icon size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{transaction.title}</p>
              <p className="text-sm text-gray-500">{transaction.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${getAmountColor(transaction.amount)}`}>
              {transaction.amount}
            </p>
            <p className={`text-xs ${getStatusColor(transaction.status)}`}>
              {getStatusText(transaction.status)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
