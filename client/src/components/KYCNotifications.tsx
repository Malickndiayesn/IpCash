import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Clock,
  Shield,
  Star,
  Zap
} from "lucide-react";

interface KYCNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'security';
  title: string;
  message: string;
  actionable?: boolean;
  dismissible?: boolean;
  timestamp: Date;
}

interface KYCNotificationsProps {
  securityScore: number;
  currentStep: number;
  documentType: string;
  validationErrors: Record<string, string>;
}

export function KYCNotifications({ 
  securityScore, 
  currentStep, 
  documentType,
  validationErrors 
}: KYCNotificationsProps) {
  const [notifications, setNotifications] = useState<KYCNotification[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Generate smart notifications based on KYC state
  useEffect(() => {
    const newNotifications: KYCNotification[] = [];

    // Security score notifications
    if (securityScore >= 90) {
      newNotifications.push({
        id: 'security-excellent',
        type: 'success',
        title: 'Sécurité Excellente',
        message: 'Votre profil atteint un niveau de sécurité optimal. Toutes les fonctionnalités premium seront bientôt disponibles.',
        dismissible: true,
        timestamp: new Date()
      });
    } else if (securityScore >= 70) {
      newNotifications.push({
        id: 'security-good',
        type: 'info',
        title: 'Bon Niveau de Sécurité',
        message: 'Complétez quelques informations supplémentaires pour atteindre l\'excellence.',
        actionable: true,
        dismissible: true,
        timestamp: new Date()
      });
    } else if (securityScore < 50) {
      newNotifications.push({
        id: 'security-low',
        type: 'warning',
        title: 'Améliorez Votre Sécurité',
        message: 'Votre score de sécurité est faible. Ajoutez plus d\'informations pour protéger votre compte.',
        actionable: true,
        dismissible: false,
        timestamp: new Date()
      });
    }

    // Document validation notifications
    if (documentType && Object.keys(validationErrors).length > 0) {
      newNotifications.push({
        id: 'validation-errors',
        type: 'warning',
        title: 'Erreurs de Validation',
        message: `${Object.keys(validationErrors).length} champ(s) contiennent des erreurs. Corrigez-les pour continuer.`,
        actionable: true,
        dismissible: false,
        timestamp: new Date()
      });
    }

    // Progress notifications
    if (currentStep === 2 && documentType) {
      newNotifications.push({
        id: 'progress-step2',
        type: 'info',
        title: 'Étape 2/4 en Cours',
        message: 'Remplissez soigneusement les informations de votre document. La précision est importante.',
        dismissible: true,
        timestamp: new Date()
      });
    }

    // Smart tips based on context
    if (currentStep === 1 && !documentType) {
      newNotifications.push({
        id: 'tip-document-choice',
        type: 'info',
        title: 'Conseil KYC',
        message: 'Choisissez la CNI si vous résidez dans un pays UEMOA, sinon utilisez votre passeport.',
        dismissible: true,
        timestamp: new Date()
      });
    }

    setNotifications(newNotifications);
  }, [securityScore, currentStep, documentType, validationErrors]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: KYCNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={16} />;
      case 'security':
        return <Shield className="text-blue-500" size={16} />;
      default:
        return <Info className="text-blue-500" size={16} />;
    }
  };

  const getNotificationStyle = (type: KYCNotification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'security':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (notifications.length === 0) return null;

  const visibleNotifications = showAll ? notifications : notifications.slice(0, 2);

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="text-indigo-500" size={18} />
            <h3 className="font-semibold text-indigo-900">Notifications KYC</h3>
            <Badge variant="outline" className="text-xs">
              {notifications.length}
            </Badge>
          </div>
          {notifications.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs"
            >
              {showAll ? 'Voir moins' : 'Tout voir'}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-3 ${getNotificationStyle(notification.type)} 
                transition-all duration-300 hover:shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-700 mt-1">
                      {notification.message}
                    </p>
                    {notification.actionable && (
                      <div className="mt-2">
                        <Button size="sm" className="text-xs h-6">
                          <Zap size={12} className="mr-1" />
                          Action requise
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {notification.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-5 w-5 p-0 hover:bg-gray-200"
                    >
                      <X size={12} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-500" size={12} />
                <span>Score: {securityScore}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="text-blue-500" size={12} />
                <span>Étape {currentStep}/4</span>
              </div>
            </div>
            <span className="text-indigo-600 font-medium">
              IPCASH KYC Smart Assistant
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}