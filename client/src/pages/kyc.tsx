import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/ui/mobile-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Shield, 
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  FileText,
  Camera,
  Scan,
  Award,
  Lock,
  Eye
} from "lucide-react";
import { useLocation } from "wouter";

export default function KYC() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [documentType, setDocumentType] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: kycStatus, isLoading } = useQuery({
    queryKey: ["/api/kyc-status"],
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/kyc-documents", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc-status"] });
      toast({
        title: "Document téléchargé",
        description: "Votre document est en cours de vérification",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    },
  });

  // Mock data pour démonstration
  const mockKycStatus = {
    status: "pending", // 'none', 'pending', 'approved', 'rejected'
    completionPercentage: 75,
    requiredDocuments: [
      {
        type: "id_card",
        name: "Carte d'identité nationale",
        status: "approved",
        uploadedAt: "2024-12-04",
      },
      {
        type: "proof_address",
        name: "Justificatif de domicile",
        status: "pending",
        uploadedAt: "2024-12-05",
      },
      {
        type: "selfie",
        name: "Photo avec pièce d'identité",
        status: "none",
        uploadedAt: null,
      },
    ],
    benefits: [
      {
        title: "Limite de transfert augmentée",
        description: "Jusqu'à 1,000,000 FCFA par jour",
        unlocked: true,
      },
      {
        title: "Carte virtuelle premium",
        description: "Carte Visa Gold avec avantages",
        unlocked: true,
      },
      {
        title: "Crédit intelligent",
        description: "Accès aux prêts avec IA",
        unlocked: false,
      },
      {
        title: "Épargne rémunérée",
        description: "Comptes d'épargne à 5% annuel",
        unlocked: false,
      },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-600 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return 'Non fourni';
    }
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => setLocation('/profile')} className="text-white mr-4">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-white text-xl font-bold">Vérification KYC</h1>
                <p className="text-blue-100 text-sm">Sécurisé • Confidentiel • Conformité bancaire</p>
              </div>
            </div>
            <Shield className="text-white" size={24} />
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Progress Overview */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Progression KYC</h3>
                <Badge className={getStatusColor(mockKycStatus.status)}>
                  {getStatusLabel(mockKycStatus.status)}
                </Badge>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm font-bold text-primary">{mockKycStatus.completionPercentage}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                    style={{ width: `${mockKycStatus.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {mockKycStatus.status === 'pending' && (
                <div className="bg-yellow-50 rounded-lg p-4 flex items-start space-x-3">
                  <Clock className="text-yellow-600 mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Vérification en cours</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Nos équipes examinent vos documents. Délai habituel: 24-48h
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents requis</h3>
              
              <div className="space-y-4">
                {mockKycStatus.requiredDocuments.map((doc, index) => {
                  const StatusIcon = getStatusIcon(doc.status);
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(doc.status)}`}>
                            <StatusIcon size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                            {doc.uploadedAt && (
                              <p className="text-sm text-gray-500">
                                Téléchargé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(doc.status)}>
                          {getStatusLabel(doc.status)}
                        </Badge>
                      </div>

                      {doc.status === 'none' && (
                        <Button 
                          size="sm" 
                          className="w-full flex items-center space-x-2"
                          onClick={() => {
                            setDocumentType(doc.type);
                            setCurrentStep(1);
                          }}
                        >
                          <Upload size={16} />
                          <span>Télécharger</span>
                        </Button>
                      )}

                      {doc.status === 'rejected' && (
                        <div className="space-y-2">
                          <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-sm text-red-800">
                              Document rejeté: qualité insuffisante ou informations illisibles
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full flex items-center space-x-2"
                          >
                            <Upload size={16} />
                            <span>Télécharger à nouveau</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upload Instructions */}
          {documentType && (
            <DocumentUploadWizard
              documentType={documentType}
              currentStep={currentStep}
              onNext={() => setCurrentStep(currentStep + 1)}
              onPrevious={() => setCurrentStep(Math.max(1, currentStep - 1))}
              onComplete={() => {
                uploadDocumentMutation.mutate({ documentType });
                setDocumentType("");
                setCurrentStep(1);
              }}
              onCancel={() => {
                setDocumentType("");
                setCurrentStep(1);
              }}
            />
          )}

          {/* KYC Benefits */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avantages KYC</h3>
              
              <div className="space-y-4">
                {mockKycStatus.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      benefit.unlocked 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {benefit.unlocked ? <CheckCircle size={20} /> : <Lock size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        benefit.unlocked ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {benefit.title}
                      </h4>
                      <p className={`text-sm ${
                        benefit.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {benefit.description}
                      </p>
                    </div>
                    {benefit.unlocked && (
                      <Badge className="bg-green-50 text-green-600 border-green-200">
                        <Award size={12} className="mr-1" />
                        Actif
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="shadow-sm bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="text-blue-600 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Sécurité et confidentialité</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Lock size={14} className="text-blue-600" />
                      <span>Chiffrement SSL 256-bit pour tous les transferts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye size={14} className="text-blue-600" />
                      <span>Vos documents ne sont vus que par nos équipes certifiées</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText size={14} className="text-blue-600" />
                      <span>Conformité aux réglementations BCEAO et UEMOA</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <MobileNav currentPage="profile" />
      </div>
    </div>
  );
}

function DocumentUploadWizard({ 
  documentType, 
  currentStep, 
  onNext, 
  onPrevious, 
  onComplete, 
  onCancel 
}: {
  documentType: string;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const getDocumentName = (type: string) => {
    switch (type) {
      case 'id_card': return 'Carte d\'identité';
      case 'proof_address': return 'Justificatif de domicile';
      case 'selfie': return 'Selfie avec pièce d\'identité';
      default: return 'Document';
    }
  };

  const getInstructions = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Préparez votre document",
          instructions: [
            "Assurez-vous que le document est valide et non expiré",
            "Nettoyez l'objectif de votre appareil photo",
            "Trouvez un endroit bien éclairé",
            "Évitez les reflets et les ombres",
          ]
        };
      case 2:
        return {
          title: "Photographiez le recto",
          instructions: [
            "Placez le document sur une surface plane",
            "Cadrez entièrement le document",
            "Assurez-vous que le texte est lisible",
            "Prenez la photo bien droite",
          ]
        };
      case 3:
        return {
          title: "Photographiez le verso",
          instructions: [
            "Retournez votre document",
            "Répétez les mêmes étapes que pour le recto",
            "Vérifiez que toutes les informations sont visibles",
            "La qualité doit être identique au recto",
          ]
        };
      default:
        return { title: "", instructions: [] };
    }
  };

  const stepInfo = getInstructions(currentStep);

  return (
    <Card className="shadow-sm border-2 border-primary">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {getDocumentName(documentType)}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-primary text-white'
                    : step < currentStep
                    ? 'bg-success text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? <CheckCircle size={16} /> : step}
              </div>
            ))}
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-3">{stepInfo.title}</h4>
          <ul className="space-y-2">
            {stepInfo.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Camera className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Appuyez pour prendre une photo
            </p>
            <p className="text-sm text-gray-500">
              ou glissez-déposez une image
            </p>
          </div>

          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={onPrevious} className="flex-1">
                Précédent
              </Button>
            )}
            <Button 
              onClick={currentStep === 3 ? onComplete : onNext} 
              className="flex-1"
            >
              {currentStep === 3 ? 'Terminer' : 'Suivant'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}