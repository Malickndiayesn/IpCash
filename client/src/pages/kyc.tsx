import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Camera, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  FileText, 
  Shield, 
  Award, 
  Lock, 
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Home,
  Star,
  Zap,
  Info,
  Lightbulb
} from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { PhotoCapture } from "@/components/PhotoCapture";
import { KYCNotifications } from "@/components/KYCNotifications";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

interface DocumentData {
  documentNumber: string;
  expiryDate: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  address: string;
  phoneNumber: string;
  email: string;
  profession: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function KYCPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  
  // State for photo capture
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [captureType, setCaptureType] = useState<"cni" | "passport" | "selfie" | null>(null);
  
  // State for multi-step document process
  const [documentType, setDocumentType] = useState<"cni" | "passport" | "">("");
  const [currentStep, setCurrentStep] = useState(1);
  const [documentData, setDocumentData] = useState<DocumentData>({
    documentNumber: "",
    expiryDate: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    address: "",
    phoneNumber: "",
    email: "",
    profession: ""
  });

  // New state for enhanced features
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);
  const [securityScore, setSecurityScore] = useState(0);

  // Enhanced validation functions
  const validateDocumentNumber = (docType: string, number: string): boolean => {
    if (!number) return false;
    if (docType === "cni") {
      // CNI format validation (example for UEMOA countries)
      return /^[A-Z]{2}\d{8}[A-Z]?$/.test(number.toUpperCase());
    }
    if (docType === "passport") {
      // Passport format validation
      return /^[A-Z]{1,2}\d{6,8}$/.test(number.toUpperCase());
    }
    return false;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^[\+]?[0-9]{8,15}$/.test(phone.replace(/\s/g, ''));
  };

  const calculateSecurityScore = (): number => {
    let score = 0;
    const data = documentData;
    
    if (data.documentNumber && validateDocumentNumber(documentType, data.documentNumber)) score += 20;
    if (data.firstName && data.lastName) score += 15;
    if (data.dateOfBirth) score += 10;
    if (data.email && validateEmail(data.email)) score += 15;
    if (data.phoneNumber && validatePhone(data.phoneNumber)) score += 10;
    if (data.address) score += 10;
    if (data.nationality) score += 10;
    if (data.profession) score += 10;
    
    return Math.min(score, 100);
  };

  // Calculate completion status based on document selection and steps
  const getCompletionPercentage = () => {
    let percentage = 0;
    if (documentType) percentage += 20; // Document type selected
    if (currentStep >= 2) percentage += 20; // Information filled
    if (currentStep >= 3) percentage += 20; // Ready to capture
    
    // Add bonus for data quality
    const securityBonus = Math.floor(calculateSecurityScore() * 0.4);
    return Math.min(percentage + securityBonus, 100);
  };

  const mockKycStatus = {
    status: documentType ? 'in_progress' : 'none',
    completionPercentage: getCompletionPercentage(),
    currentDocument: documentType,
    currentStep,
    benefits: [
      {
        title: 'Virements illimités',
        description: 'Effectuez des virements sans restriction de montant',
        unlocked: false,
        requiredStep: 'document_verification'
      },
      {
        title: 'Carte virtuelle premium',
        description: 'Accès aux cartes Visa premium avec assurances',
        unlocked: false,
        requiredStep: 'selfie_verification'
      },
      {
        title: 'Crédit et épargne',
        description: 'Solutions de crédit et comptes d\'épargne',
        unlocked: false,
        requiredStep: 'full_kyc_completion'
      }
    ]
  };

  // Get upload parameters for KYC documents
  const getUploadParametersMutation = useMutation({
    mutationFn: async ({ documentType }: { documentType: string }) => {
      const response = await apiRequest("POST", `/api/kyc-documents/upload?type=${documentType}`);
      return response.json();
    }
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ documentType, documentUrl }: { 
      documentType: string; 
      documentUrl: string;
    }) => {
      const response = await apiRequest("POST", "/api/kyc-documents", {
        documentType,
        documentUrl,
        ...documentData
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document envoyé",
        description: "Votre document a été envoyé avec succès pour vérification.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/kyc-status"] });
      setDocumentType("");
      setCurrentStep(1);
      setDocumentData({
        documentNumber: "",
        expiryDate: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        placeOfBirth: "",
        nationality: "",
        address: "",
        phoneNumber: "",
        email: "",
        profession: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le document. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  });

  const handleDocumentDataChange = (field: keyof DocumentData, value: string) => {
    setDocumentData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'documentNumber':
        if (value && !validateDocumentNumber(documentType, value)) {
          errors[field] = documentType === 'cni' 
            ? 'Format CNI invalide (ex: CI12345678A)' 
            : 'Format passeport invalide (ex: A1234567)';
        } else {
          delete errors[field];
        }
        break;
      case 'email':
        if (value && !validateEmail(value)) {
          errors[field] = 'Format email invalide';
        } else {
          delete errors[field];
        }
        break;
      case 'phoneNumber':
        if (value && !validatePhone(value)) {
          errors[field] = 'Numéro de téléphone invalide';
        } else {
          delete errors[field];
        }
        break;
      case 'firstName':
      case 'lastName':
        if (value && value.length < 2) {
          errors[field] = 'Minimum 2 caractères requis';
        } else {
          delete errors[field];
        }
        break;
    }
    
    setValidationErrors(errors);
    setSecurityScore(calculateSecurityScore());
  };

  // Auto-suggestions based on document type
  const getNationalitySuggestions = () => {
    return [
      "Ivoirienne", "Sénégalaise", "Malienne", "Burkinabé", 
      "Nigérienne", "Béninoise", "Togolaise", "Guinéenne"
    ];
  };

  const getProfessionSuggestions = () => {
    return [
      "Étudiant(e)", "Fonctionnaire", "Commerçant(e)", "Agriculteur/trice",
      "Enseignant(e)", "Infirmier/ère", "Chauffeur", "Artisan(e)",
      "Entrepreneur(e)", "Technicien(ne)", "Employé(e) de bureau"
    ];
  };

  const handleDocumentTypeSelection = (type: "cni" | "passport") => {
    setDocumentType(type);
    setCurrentStep(2);
  };

  const handleCaptureDocument = () => {
    if (documentType) {
      setCaptureType(documentType);
      setShowPhotoCapture(true);
    }
  };

  const handleCaptureSelfie = () => {
    setCaptureType("selfie");
    setShowPhotoCapture(true);
  };

  const handlePhotoCapture = async (photoBlob: Blob) => {
    try {
      // Get upload URL
      const uploadParams = await getUploadParametersMutation.mutateAsync({ 
        documentType: captureType || "selfie" 
      });
      
      // Upload the photo
      const uploadResponse = await fetch(uploadParams.uploadURL, {
        method: 'PUT',
        body: photoBlob,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Save document info to database
      if (captureType === "selfie") {
        await uploadDocumentMutation.mutateAsync({
          documentType: "selfie",
          documentUrl: uploadParams.uploadURL
        });
      } else {
        await uploadDocumentMutation.mutateAsync({
          documentType: captureType!,
          documentUrl: uploadParams.uploadURL
        });
      }

      setShowPhotoCapture(false);
      setCaptureType(null);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la photo. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertCircle;
      default: return Upload;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-600';
      case 'pending': return 'bg-yellow-50 text-yellow-600';
      case 'rejected': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En cours';
      case 'rejected': return 'Rejeté';
      default: return 'Requis';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t('identity_verification')}</h1>
            <LanguageSwitcher variant="compact" />
          </div>
          <p className="text-white/90 text-sm">
            {t('kyc_description')}
          </p>
        </div>

        <div className="p-6 space-y-6 pb-24">
          {/* Smart Notifications */}
          <KYCNotifications
            securityScore={securityScore}
            currentStep={currentStep}
            documentType={documentType}
            validationErrors={validationErrors}
          />

          {/* Progress Card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{t('kyc_progress')}</h3>
                <Badge className={`${mockKycStatus.completionPercentage > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                  {mockKycStatus.completionPercentage}% {language === 'fr' ? 'terminé' : language === 'en' ? 'complete' : language === 'es' ? 'completo' : 'مكتمل'}
                </Badge>
              </div>
              
              <Progress value={mockKycStatus.completionPercentage} className="mb-4" />
              
              <div className="space-y-2 text-sm">
                <div className={`flex items-center space-x-2 ${documentType ? 'text-green-600' : 'text-gray-400'}`}>
                  {documentType ? <CheckCircle size={16} /> : <Clock size={16} />}
                  <span>{t('document_selection')}</span>
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                  {currentStep >= 2 ? <CheckCircle size={16} /> : <Clock size={16} />}
                  <span>{t('information_entry')}</span>
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                  {currentStep >= 3 ? <CheckCircle size={16} /> : <Clock size={16} />}
                  <span>{t('document_capture')}</span>
                </div>
                <div className={`flex items-center space-x-2 text-gray-400`}>
                  <Clock size={16} />
                  <span>{t('selfie_capture')}</span>
                </div>
              </div>
              
              {mockKycStatus.status === 'in_progress' && documentType && (
                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="text-blue-600" size={16} />
                    <p className="text-sm text-blue-800 font-medium">
                      Vérification en cours
                    </p>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Document sélectionné: {documentType === 'cni' ? 'Carte Nationale d\'Identité' : 'Passeport'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selfie Capture Section */}
          <Card className="shadow-sm border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="text-orange-500" size={20} />
                <span>Selfie avec document</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Prenez un selfie en tenant votre document d'identité près de votre visage pour la vérification croisée.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Instructions pour le selfie :
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tenez votre document près de votre visage</li>
                  <li>• Assurez-vous que votre visage est bien visible</li>
                  <li>• Le document doit être lisible sur la photo</li>
                  <li>• Évitez les lunettes de soleil ou masques</li>
                  <li>• Utilisez un éclairage naturel si possible</li>
                </ul>
              </div>

              {documentType ? (
                <Button
                  onClick={handleCaptureSelfie}
                  className="w-full flex items-center space-x-2 bg-orange-500 hover:bg-orange-600"
                >
                  <Camera size={16} />
                  <span>Prendre un selfie avec {documentType === 'cni' ? 'CNI' : 'Passeport'}</span>
                </Button>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="text-yellow-600" size={16} />
                    <p className="text-sm text-yellow-800">
                      Veuillez d'abord sélectionner votre type de document ci-dessus
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Capture Modal */}
          {showPhotoCapture && captureType && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <PhotoCapture
                title={
                  captureType === "cni" ? "Photographier votre CNI" :
                  captureType === "passport" ? "Photographier votre Passeport" :
                  "Prendre un selfie avec votre document"
                }
                description={
                  captureType === "cni" ? "Placez votre CNI dans un endroit bien éclairé" :
                  captureType === "passport" ? "Ouvrez votre passeport à la page d'identité" :
                  "Tenez votre document près de votre visage"
                }
                documentType={captureType}
                onPhotoCapture={handlePhotoCapture}
                onCancel={() => {
                  setShowPhotoCapture(false);
                  setCaptureType(null);
                }}
                isUploading={uploadDocumentMutation.isPending || getUploadParametersMutation.isPending}
              />
            </div>
          )}

          {/* Document Type Selection - Always visible */}
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="text-primary" size={20} />
                <span>Choisir votre document d'identité</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Sélectionnez le type de document d'identité que vous souhaitez utiliser pour votre vérification KYC.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={documentType === "cni" ? "default" : "outline"}
                  className="h-auto p-4 flex items-start space-x-4 hover:border-primary transition-all"
                  onClick={() => {
                    setDocumentType("cni");
                    setCurrentStep(2);
                  }}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    documentType === "cni" ? "bg-white/20" : "bg-blue-50"
                  }`}>
                    <CreditCard className={documentType === "cni" ? "text-white" : "text-blue-600"} size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-semibold ${documentType === "cni" ? "text-white" : "text-gray-900"}`}>
                      Carte Nationale d'Identité
                    </h3>
                    <p className={`text-sm ${documentType === "cni" ? "text-white/80" : "text-gray-600"}`}>
                      CNI ivoirienne ou d'un pays UEMOA
                    </p>
                    <p className={`text-xs mt-1 font-medium ${
                      documentType === "cni" ? "text-yellow-200" : "text-green-600"
                    }`}>
                      ✓ Recommandé • Traitement rapide
                    </p>
                  </div>
                  {documentType === "cni" && (
                    <CheckCircle className="text-white" size={20} />
                  )}
                </Button>

                <Button
                  variant={documentType === "passport" ? "default" : "outline"}
                  className="h-auto p-4 flex items-start space-x-4 hover:border-primary transition-all"
                  onClick={() => {
                    setDocumentType("passport");
                    setCurrentStep(2);
                  }}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    documentType === "passport" ? "bg-white/20" : "bg-purple-50"
                  }`}>
                    <FileText className={documentType === "passport" ? "text-white" : "text-purple-600"} size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-semibold ${documentType === "passport" ? "text-white" : "text-gray-900"}`}>
                      Passeport
                    </h3>
                    <p className={`text-sm ${documentType === "passport" ? "text-white/80" : "text-gray-600"}`}>
                      Passeport biométrique valide
                    </p>
                    <p className={`text-xs mt-1 font-medium ${
                      documentType === "passport" ? "text-yellow-200" : "text-blue-600"
                    }`}>
                      ✓ International • Très sécurisé
                    </p>
                  </div>
                  {documentType === "passport" && (
                    <CheckCircle className="text-white" size={20} />
                  )}
                </Button>
              </div>

              {documentType && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <p className="text-sm text-green-800 font-medium">
                      {documentType === "cni" ? "CNI sélectionnée" : "Passeport sélectionné"}
                    </p>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Vous pouvez maintenant remplir les informations du document
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Information Form */}
          {documentType && currentStep === 2 && (
            <Card className="shadow-sm border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="text-primary" size={20} />
                  <span>Informations du document</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Saisissez les informations de votre {documentType === "cni" ? "CNI" : "passeport"} avant de le photographier.
                </p>

                {/* Security Score Card */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="text-green-600" size={16} />
                        <span className="text-sm font-medium text-green-800">Score de sécurité KYC</span>
                      </div>
                      <Badge className={`${securityScore >= 80 ? 'bg-green-500' : 
                        securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                        {securityScore}%
                      </Badge>
                    </div>
                    <Progress value={securityScore} className="h-2 mb-2" />
                    <p className="text-xs text-gray-600">
                      {securityScore >= 80 ? "Excellent - Profil très sécurisé" : 
                       securityScore >= 60 ? "Bon - Quelques améliorations possibles" : 
                       "À améliorer - Complétez plus d'informations"}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  {/* Document Number with enhanced validation */}
                  <div>
                    <Label htmlFor="documentNumber" className="flex items-center space-x-2">
                      <CreditCard size={14} />
                      <span>Numéro de {documentType === "cni" ? "CNI" : "passeport"}</span>
                      {documentData.documentNumber && validateDocumentNumber(documentType, documentData.documentNumber) && (
                        <CheckCircle className="text-green-500" size={14} />
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="documentNumber"
                        value={documentData.documentNumber}
                        onChange={(e) => handleDocumentDataChange("documentNumber", e.target.value)}
                        placeholder={documentType === "cni" ? "Ex: CI12345678A" : "Ex: A1234567"}
                        className={validationErrors.documentNumber ? "border-red-300 bg-red-50" : 
                          documentData.documentNumber && validateDocumentNumber(documentType, documentData.documentNumber) ? 
                          "border-green-300 bg-green-50" : ""}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                          className="h-5 w-5 p-0"
                        >
                          {showSensitiveInfo ? <EyeOff size={12} /> : <Eye size={12} />}
                        </Button>
                      </div>
                    </div>
                    {validationErrors.documentNumber && (
                      <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                        <AlertCircle size={12} />
                        <span>{validationErrors.documentNumber}</span>
                      </p>
                    )}
                  </div>

                  {/* Expiry Date with validation */}
                  <div>
                    <Label htmlFor="expiryDate" className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>Date d'expiration</span>
                    </Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={documentData.expiryDate}
                      onChange={(e) => handleDocumentDataChange("expiryDate", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {documentData.expiryDate && new Date(documentData.expiryDate) < new Date() && (
                      <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                        <AlertCircle size={12} />
                        <span>Document expiré - Veuillez renouveler votre document</span>
                      </p>
                    )}
                  </div>

                  {/* Names with real-time validation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="flex items-center space-x-2">
                        <User size={14} />
                        <span>Prénom(s)</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={documentData.firstName}
                        onChange={(e) => handleDocumentDataChange("firstName", e.target.value)}
                        placeholder="Ex: Jean Pierre"
                        className={validationErrors.firstName ? "border-red-300" : 
                          documentData.firstName.length >= 2 ? "border-green-300" : ""}
                      />
                      {validationErrors.firstName && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="flex items-center space-x-2">
                        <User size={14} />
                        <span>Nom de famille</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={documentData.lastName}
                        onChange={(e) => handleDocumentDataChange("lastName", e.target.value)}
                        placeholder="Ex: KOUASSI"
                        className={validationErrors.lastName ? "border-red-300" : 
                          documentData.lastName.length >= 2 ? "border-green-300" : ""}
                      />
                      {validationErrors.lastName && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Birth Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth" className="flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>Date de naissance</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={documentData.dateOfBirth}
                        onChange={(e) => handleDocumentDataChange("dateOfBirth", e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="placeOfBirth" className="flex items-center space-x-2">
                        <MapPin size={14} />
                        <span>Lieu de naissance</span>
                      </Label>
                      <Input
                        id="placeOfBirth"
                        value={documentData.placeOfBirth}
                        onChange={(e) => handleDocumentDataChange("placeOfBirth", e.target.value)}
                        placeholder="Ex: Abidjan, Côte d'Ivoire"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nationality" className="flex items-center space-x-2">
                        <Award size={14} />
                        <span>Nationalité</span>
                      </Label>
                      <Select 
                        value={documentData.nationality} 
                        onValueChange={(value) => handleDocumentDataChange("nationality", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre nationalité" />
                        </SelectTrigger>
                        <SelectContent>
                          {getNationalitySuggestions().map((nat) => (
                            <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="email" className="flex items-center space-x-2">
                          <Mail size={14} />
                          <span>Email</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          value={documentData.email}
                          onChange={(e) => handleDocumentDataChange("email", e.target.value)}
                          className={validationErrors.email ? "border-red-300" : 
                            documentData.email && validateEmail(documentData.email) ? "border-green-300" : ""}
                        />
                        {validationErrors.email && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phoneNumber" className="flex items-center space-x-2">
                          <Phone size={14} />
                          <span>Téléphone</span>
                        </Label>
                        <Input
                          id="phoneNumber"
                          placeholder="+225 XX XX XX XX XX"
                          value={documentData.phoneNumber}
                          onChange={(e) => handleDocumentDataChange("phoneNumber", e.target.value)}
                          className={validationErrors.phoneNumber ? "border-red-300" : 
                            documentData.phoneNumber && validatePhone(documentData.phoneNumber) ? "border-green-300" : ""}
                        />
                        {validationErrors.phoneNumber && (
                          <p className="text-xs text-red-600 mt-1">{validationErrors.phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="flex items-center space-x-2">
                        <Home size={14} />
                        <span>Adresse complète</span>
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Rue, Quartier, Commune, Ville"
                        value={documentData.address}
                        onChange={(e) => handleDocumentDataChange("address", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="profession" className="flex items-center space-x-2">
                        <Award size={14} />
                        <span>Profession</span>
                      </Label>
                      <Select 
                        value={documentData.profession} 
                        onValueChange={(value) => handleDocumentDataChange("profession", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre profession" />
                        </SelectTrigger>
                        <SelectContent>
                          {getProfessionSuggestions().map((prof) => (
                            <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Smart Tips */}
                {securityScore < 80 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="text-blue-600" size={16} />
                      <p className="text-sm text-blue-800 font-medium">
                        Améliorez votre score de sécurité :
                      </p>
                    </div>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {!documentData.email && <li>• Ajoutez votre email pour +15 points</li>}
                      {!documentData.phoneNumber && <li>• Renseignez votre téléphone pour +10 points</li>}
                      {!documentData.address && <li>• Complétez votre adresse pour +10 points</li>}
                      {!documentData.profession && <li>• Sélectionnez votre profession pour +10 points</li>}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1"
                    disabled={!documentData.documentNumber || !documentData.expiryDate || 
                      !documentData.firstName || !documentData.lastName || 
                      Object.keys(validationErrors).length > 0}
                  >
                    Continuer ({securityScore}% sécurisé)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Capture Instructions */}
          {documentType && currentStep === 3 && (
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="text-green-500" size={20} />
                  <span>Photographier votre {documentType === 'cni' ? 'CNI' : 'Passeport'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Instructions pour une photo de qualité :
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Assurez-vous d'avoir un bon éclairage naturel</li>
                    <li>• Placez {documentType === 'cni' ? 'la CNI' : 'le passeport'} sur une surface plane</li>
                    <li>• Évitez les reflets et les ombres portées</li>
                    <li>• Cadrez bien tout le document dans l'image</li>
                    <li>• Vérifiez que tous les textes sont parfaitement lisibles</li>
                    {documentType === 'passport' && (
                      <li>• Ouvrez le passeport à la page d'identité avec votre photo</li>
                    )}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="text-green-600" size={16} />
                    <p className="text-sm text-green-800 font-medium">
                      Photo sécurisée et chiffrée
                    </p>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Vos données sont protégées selon les normes bancaires internationales
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Modifier les infos
                  </Button>
                  <Button
                    onClick={handleCaptureDocument}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Camera className="mr-2" size={16} />
                    Photographier
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-gray-50 text-gray-400'
                    }`}>
                      {benefit.unlocked ? <Award size={20} /> : <Lock size={20} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                      {benefit.unlocked && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ Activé</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="shadow-sm bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="text-blue-600 mt-1" size={20} />
                <div>
                  <h4 className="font-medium text-blue-900">Sécurité et confidentialité</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Vos documents sont chiffrés et stockés de manière sécurisée. 
                    Ils ne sont utilisés que pour la vérification d'identité conformément 
                    aux réglementations bancaires.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}