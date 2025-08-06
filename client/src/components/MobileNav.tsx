import { Link, useLocation } from "wouter";
import { 
  Home, 
  CreditCard, 
  ArrowLeftRight, 
  BarChart3, 
  User,
  QrCode
} from "lucide-react";

interface MobileNavProps {
  currentPage?: string;
}

export function MobileNav({ currentPage }: MobileNavProps) {
  const [location] = useLocation();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Accueil",
      active: location === "/" || currentPage === "dashboard"
    },
    {
      href: "/cards",
      icon: CreditCard,
      label: "Cartes",
      active: location === "/cards" || currentPage === "cards"
    },
    {
      href: "/transfer",
      icon: ArrowLeftRight,
      label: "Virement",
      active: location === "/transfer" || currentPage === "transfer"
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "Analytics",
      active: location === "/analytics" || currentPage === "analytics"
    },
    {
      href: "/profile",
      icon: User,
      label: "Profil",
      active: location === "/profile" || location === "/kyc" || currentPage === "profile"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 ${
                  item.active
                    ? "text-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}