import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TransactionItem } from "@/components/ui/transaction-item";
import { MobileNav } from "@/components/ui/mobile-nav";
import { ArrowLeft, Filter, ArrowDown, ShoppingCart, Send, Smartphone, PiggyBank, Coffee } from "lucide-react";
import { useLocation } from "wouter";

type FilterType = 'all' | 'sent' | 'received' | 'payments';

export default function Transactions() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const mockTransactions = [
    // Today
    {
      id: "1",
      type: "incoming",
      title: "Salaire mensuel",
      subtitle: "14:30 • Entreprise ABC",
      amount: "+75,000 FCFA",
      status: "completed",
      icon: ArrowDown,
      date: "Aujourd'hui",
    },
    {
      id: "2",
      type: "outgoing", 
      title: "Vers Aminata Sow",
      subtitle: "16:42 • IPCASH",
      amount: "-15,000 FCFA",
      status: "completed",
      icon: Send,
      date: "Aujourd'hui",
    },
    // Yesterday
    {
      id: "3",
      type: "payment",
      title: "Auchan Dakar", 
      subtitle: "18:45 • Carte VISA",
      amount: "-12,500 FCFA",
      status: "completed",
      icon: ShoppingCart,
      date: "Hier",
    },
    {
      id: "4",
      type: "mobile",
      title: "Transfert Orange Money",
      subtitle: "12:20 • Vers +221 70 XXX XX XX",
      amount: "-5,000 FCFA", 
      status: "completed",
      icon: Smartphone,
      date: "Hier",
    },
    {
      id: "5",
      type: "outgoing",
      title: "Épargne automatique",
      subtitle: "09:00 • Plan mensuel",
      amount: "-2,000 FCFA",
      status: "completed", 
      icon: PiggyBank,
      date: "Hier",
    },
    // This week
    {
      id: "6",
      type: "incoming",
      title: "De Ibrahima Diop",
      subtitle: "Lun 14:30 • Remboursement", 
      amount: "+8,500 FCFA",
      status: "completed",
      icon: ArrowDown,
      date: "Cette semaine",
    },
    {
      id: "7", 
      type: "payment",
      title: "Café de la Paix",
      subtitle: "Dim 16:20 • Carte VISA",
      amount: "-3,500 FCFA",
      status: "completed",
      icon: Coffee,
      date: "Cette semaine",
    },
  ];

  const filterTransactions = (transactions: any[], filter: FilterType) => {
    switch (filter) {
      case 'sent':
        return transactions.filter(t => t.type === 'outgoing' || t.type === 'mobile');
      case 'received':
        return transactions.filter(t => t.type === 'incoming');
      case 'payments':
        return transactions.filter(t => t.type === 'payment');
      default:
        return transactions;
    }
  };

  const groupTransactionsByDate = (transactions: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    transactions.forEach(transaction => {
      const date = transaction.date || "Aujourd'hui";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return groups;
  };

  const filteredTransactions = filterTransactions(mockTransactions, activeFilter);
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

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
              <h1 className="text-white text-xl font-bold">Historique</h1>
              <p className="text-blue-100 text-sm">Toutes vos transactions</p>
            </div>
            <button className="text-white">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              className="rounded-full text-sm font-medium whitespace-nowrap"
              size="sm"
            >
              Toutes
            </Button>
            <Button
              variant={activeFilter === 'sent' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('sent')}
              className="rounded-full text-sm font-medium whitespace-nowrap"
              size="sm"
            >
              Envoyés
            </Button>
            <Button
              variant={activeFilter === 'received' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('received')}
              className="rounded-full text-sm font-medium whitespace-nowrap"
              size="sm"
            >
              Reçus
            </Button>
            <Button
              variant={activeFilter === 'payments' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('payments')}
              className="rounded-full text-sm font-medium whitespace-nowrap"
              size="sm"
            >
              Achats
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 px-6 py-4">
          {Object.entries(groupedTransactions).map(([date, transactions]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">{date}</h3>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Filter className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune transaction</h3>
              <p className="text-gray-600">Aucune transaction trouvée pour ce filtre.</p>
            </div>
          )}
        </div>

        <MobileNav currentPage="transactions" />
      </div>
    </div>
  );
}
