import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { University, Smartphone, Shield, Globe, Banknote, CreditCard } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="mobile-container bg-gray-50">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="banking-gradient px-6 pt-16 pb-12 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/attached_assets/lgogo-ipcash_-02 light_1754420424054.png" 
              alt="IPCASH" 
              className="w-32 h-auto"
            />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Bienvenue sur IPCASH</h1>
          <p className="text-blue-100 text-lg">Votre néobanque panafricaine</p>
          <p className="text-blue-100 text-sm mt-2">
            Powered by Interprest • Moderne • Inclusive • Mobile-first
          </p>
        </div>

        {/* Features */}
        <div className="flex-1 px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Banking made simple
            </h2>
            <p className="text-gray-600 text-center">
              Accédez aux services financiers modernes où que vous soyez en Afrique
            </p>
          </div>

          <div className="grid gap-4 mb-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mobile Money</h3>
                  <p className="text-gray-600 text-sm">
                    Connectez vos comptes Orange Money, Wave et Free Money
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-success" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Carte Visa</h3>
                  <p className="text-gray-600 text-sm">
                    Carte virtuelle et physique pour tous vos paiements
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Shield className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sécurisé</h3>
                  <p className="text-gray-600 text-sm">
                    Chiffrement AES, authentification biométrique, conformité PCI-DSS
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Globe className="text-purple-500" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Panafricain</h3>
                  <p className="text-gray-600 text-sm">
                    Zone UEMOA, diaspora et populations non bancarisées
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Banknote className="text-warning" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Crédit Intelligent</h3>
                  <p className="text-gray-600 text-sm">
                    IA pour évaluation de crédit et épargne automatisée
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleLogin}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl text-lg transition-colors duration-200"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => window.location.href = '/admin'}
                variant="outline"
                className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-4 rounded-xl text-lg transition-colors duration-200"
              >
                Administration
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Nouveau sur IPCASH ? Votre compte sera créé automatiquement lors de la première connexion.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 text-center border-t border-gray-200">
          <p className="text-gray-500 text-sm">Version 1.0.0</p>
          <p className="text-gray-400 text-xs mt-1">© 2025 IPCASH. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
