import { NotificationCenter } from "@/components/NotificationCenter";
import { MobileNav } from "@/components/ui/mobile-nav";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

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
              <h1 className="text-white text-xl font-bold">
                {language === 'fr' ? 'Notifications' : language === 'en' ? 'Notifications' : language === 'es' ? 'Notificaciones' : 'الإشعارات'}
              </h1>
              <p className="text-blue-100 text-sm">
                {language === 'fr' ? 'Centre de notifications et alertes' : language === 'en' ? 'Notification and alerts center' : language === 'es' ? 'Centro de notificaciones y alertas' : 'مركز الإشعارات والتنبيهات'}
              </p>
            </div>
          </div>
        </div>

        {/* Notification Center */}
        <div className="p-6 flex-1">
          <NotificationCenter />
        </div>
      </div>
      <MobileNav currentPage="notifications" />
    </div>
  );
}