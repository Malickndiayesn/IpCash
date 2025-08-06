import { Button } from "@/components/ui/button";
import { Home, List, Send, CreditCard, User, TrendingUp, PiggyBank, Brain, MessageCircle, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface MobileNavProps {
  currentPage: 'dashboard' | 'transactions' | 'transfer' | 'cards' | 'profile' | 'analytics' | 'savings' | 'credit' | 'support';
}

export function MobileNav({ currentPage }: MobileNavProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    {
      key: 'dashboard',
      icon: Home,
      label: 'Accueil',
      path: '/',
    },
    {
      key: 'transactions', 
      icon: List,
      label: 'Historique',
      path: '/transactions',
    },
    {
      key: 'transfer',
      icon: Zap,
      label: 'Transfert',
      path: '/instant-transfer',
    },
    {
      key: 'cards',
      icon: CreditCard,
      label: 'Cartes',
      path: '/cards',
    },
    {
      key: 'profile',
      icon: User,
      label: 'Profil', 
      path: '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 bottom-nav">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => (
          <Button
            key={item.key}
            variant="ghost"
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center space-y-1 h-auto p-2 ${
              currentPage === item.key 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon size={20} />
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
