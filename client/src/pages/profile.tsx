import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Edit,
  User,
  Shield,
  Bell,
  PieChart,
  Coins,
  Smartphone,
  HelpCircle,
  MessageCircle,
  Phone,
  LogOut,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const userInitials = (user as any)?.firstName && (user as any)?.lastName 
    ? `${(user as any).firstName[0]}${(user as any).lastName[0]}` 
    : (user as any)?.email?.[0]?.toUpperCase() || "U";

  const userFullName = (user as any)?.firstName && (user as any)?.lastName 
    ? `${(user as any).firstName} ${(user as any).lastName}`
    : (user as any)?.email || "Utilisateur";

  const userPhone = (user as any)?.phone || "+221 77 123 45 67";
  const userEmail = (user as any)?.email || "utilisateur@exemple.com";

  const menuSections = [
    {
      title: "Paramètres du compte",
      items: [
        {
          icon: User,
          title: "Informations personnelles",
          iconBg: "bg-blue-100",
          iconColor: "text-primary",
        },
        {
          icon: Shield,
          title: "Vérification KYC",
          subtitle: "Augmentez vos limites",
          iconBg: "bg-green-100", 
          iconColor: "text-success",
          action: () => setLocation('/kyc'),
        },
        {
          icon: Bell,
          title: "Notifications",
          subtitle: "Push, SMS, Email",
          iconBg: "bg-orange-100",
          iconColor: "text-accent",
        },
      ],
    },
    {
      title: "Services",
      items: [
        {
          icon: PieChart,
          title: "Analyse financière",
          subtitle: "IA • Insights personnalisés",
          iconBg: "bg-purple-100",
          iconColor: "text-purple-500",
          action: () => setLocation('/analytics'),
        },
        {
          icon: Coins,
          title: "Crédit intelligent",
          subtitle: "Prêts avec IA",
          iconBg: "bg-yellow-100",
          iconColor: "text-warning",
          action: () => setLocation('/credit'),
        },
        {
          icon: Smartphone,
          title: "Comptes Mobile Money",
          iconBg: "bg-blue-100",
          iconColor: "text-primary",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          title: "FAQ",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
        },
        {
          icon: MessageCircle,
          title: "Support client",
          subtitle: "Chat • Tickets • Urgences",
          iconBg: "bg-green-100",
          iconColor: "text-success",
          action: () => setLocation('/support'),
        },
        {
          icon: Phone,
          title: "Nous contacter",
          subtitle: "+221 33 123 45 67",
          iconBg: "bg-red-100",
          iconColor: "text-error",
        },
      ],
    },
  ];

  return (
    <div className="mobile-container bg-gray-50">
      <div className="min-h-screen flex flex-col pb-20">
        {/* Header */}
        <div className="banking-gradient px-6 pt-16 pb-6">
          <div className="flex items-center">
            <button onClick={() => setLocation('/')} className="text-white mr-4">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">Mon profil</h1>
              <p className="text-blue-100 text-sm">Gérez votre compte</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 py-6">
          {/* User Card */}
          <Card className="shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{userInitials}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{userFullName}</h3>
                  <p className="text-gray-600">{userPhone}</p>
                  <p className="text-gray-600">{userEmail}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit size={20} />
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-success" size={16} />
                  <span className="text-success font-medium">Compte vérifié</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-gray-500">Niveau Gold</span>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                          <item.icon className={item.iconColor} size={20} />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium text-gray-900 block">{item.title}</span>
                          {item.subtitle && (
                            <span className="text-sm text-gray-500">{item.subtitle}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            ))}

            {/* Logout */}
            <div className="pt-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-red-200 text-error hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="mr-2" size={20} />
                Se déconnecter
              </Button>
            </div>

            {/* App Info */}
            <div className="text-center pt-6 pb-4">
              <p className="text-gray-500 text-sm">Version 1.0.0</p>
              <p className="text-gray-400 text-xs mt-1">© 2025 IPCASH. Tous droits réservés.</p>
            </div>
          </div>
        </div>

        <MobileNav currentPage="profile" />
      </div>
    </div>
  );
}
