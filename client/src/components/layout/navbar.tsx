import { Button } from "@/components/ui/button";
import { Bell, Settings, University } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export function Navbar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="banking-gradient px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <University className="text-primary" size={20} />
          </div>
          <span className="text-white font-bold text-lg">IPCASH</span>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white relative">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
          </button>
          
          <button onClick={() => setLocation('/profile')} className="text-white">
            <Settings size={20} />
          </button>

          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">{userInitials}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
