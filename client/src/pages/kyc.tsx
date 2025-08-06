import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertCircle 
} from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { PhotoCapture } from "@/components/PhotoCapture";

interface DocumentData {
  documentNumber: string;
  expiryDate: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
}

export default function KYCPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
    placeOfBirth: ""
  });

  // Mock KYC status data - will be replaced with real API data
  const mockKycStatus = {
    status: 'pending',
    completionPercentage: 33,
    requiredDocuments: [
      {
        type: 'cni',
        name: 'Carte Nationale d\'Identité',
        status: 'none', // none, pending, approved, rejected
        uploadedAt: null
      },
      {
        type: 'passport',
        name: 'Passeport',
        status: 'none',
        uploadedAt: null
      },
      {
        type: 'selfie',
        name: 'Selfie avec document',
        status: 'none',
        uploadedAt: null
      }
    ],
    benefits: [
      {
        title: 'Virements illimités',
        description: 'Effectuez des virements sans restriction de montant',
        unlocked: false
      },
      {
        title: 'Carte virtuelle premium',
        description: 'Accès aux cartes Visa premium avec assurances',
        unlocked: false
      },
      {
        title: 'Crédit et épargne',
        description: 'Solutions de crédit et comptes d\'épargne',
        unlocked: false
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
        placeOfBirth: ""
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
          <h1 className="text-2xl font-bold mb-2">Vérification d'identité</h1>
          <p className="text-white/90 text-sm">
            Complétez votre KYC pour débloquer toutes les fonctionnalités
          </p>
        </div>

        <div className="p-6 space-y-6 pb-24">
          {/* Progress Card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
                <Badge className={getStatusColor(mockKycStatus.status)}>
                  {mockKycStatus.completionPercentage}% terminé
                </Badge>
              </div>
              
              <Progress value={mockKycStatus.completionPercentage} className="mb-4" />
              
              {mockKycStatus.status === 'pending' && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Vos documents sont en cours de vérification. Vous recevrez une notification une fois la vérification terminée.
                  </p>
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
                        <div className="space-y-2">
                          {(doc.type === 'cni' || doc.type === 'passport') ? (
                            <Button 
                              size="sm" 
                              className="w-full flex items-center space-x-2"
                              onClick={() => {
                                setDocumentType(doc.type as "cni" | "passport");
                                setCurrentStep(1);
                              }}
                            >
                              <Camera size={16} />
                              <span>Photographier {doc.type === 'cni' ? 'CNI' : 'Passeport'}</span>
                            </Button>
                          ) : doc.type === 'selfie' ? (
                            <Button 
                              size="sm" 
                              className="w-full flex items-center space-x-2"
                              onClick={handleCaptureSelfie}
                            >
                              <Camera size={16} />
                              <span>Prendre un selfie</span>
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="w-full flex items-center space-x-2"
                              onClick={() => {
                                setDocumentType(doc.type as "cni" | "passport");
                                setCurrentStep(1);
                              }}
                            >
                              <Upload size={16} />
                              <span>Télécharger</span>
                            </Button>
                          )}
                        </div>
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

          {/* Document Type Selection */}
          {documentType && currentStep === 1 && (
            <Card className="shadow-sm border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="text-primary" size={20} />
                  <span>Choisir le type de document</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Sélectionnez le type de document d'identité que vous souhaitez utiliser pour votre vérification.
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex items-start space-x-4 hover:border-primary"
                    onClick={() => handleDocumentTypeSelection("cni")}
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CreditCard className="text-blue-600" size={24} />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-gray-900">Carte Nationale d'Identité</h3>
                      <p className="text-sm text-gray-600">CNI ivoirienne ou d'un pays UEMOA</p>
                      <p className="text-xs text-green-600 mt-1">✓ Recommandé • Traitement rapide</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex items-start space-x-4 hover:border-primary"
                    onClick={() => handleDocumentTypeSelection("passport")}
                  >
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <FileText className="text-purple-600" size={24} />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-gray-900">Passeport</h3>
                      <p className="text-sm text-gray-600">Passeport biométrique valide</p>
                      <p className="text-xs text-blue-600 mt-1">✓ International • Très sécurisé</p>
                    </div>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setDocumentType("");
                    setCurrentStep(1);
                  }}
                  className="w-full"
                >
                  Annuler
                </Button>
              </CardContent>
            </Card>
          )}

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

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="documentNumber">
                      Numéro de {documentType === "cni" ? "CNI" : "passeport"}
                    </Label>
                    <Input
                      id="documentNumber"
                      value={documentData.documentNumber}
                      onChange={(e) => setDocumentData(prev => ({
                        ...prev,
                        documentNumber: e.target.value
                      }))}
                      placeholder={documentType === "cni" ? "Ex: CI2023123456" : "Ex: 23PA12345"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiryDate">Date d'expiration</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={documentData.expiryDate}
                      onChange={(e) => setDocumentData(prev => ({
                        ...prev,
                        expiryDate: e.target.value
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom(s)</Label>
                      <Input
                        id="firstName"
                        value={documentData.firstName}
                        onChange={(e) => setDocumentData(prev => ({
                          ...prev,
                          firstName: e.target.value
                        }))}
                        placeholder="Ex: Jean Pierre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom de famille</Label>
                      <Input
                        id="lastName"
                        value={documentData.lastName}
                        onChange={(e) => setDocumentData(prev => ({
                          ...prev,
                          lastName: e.target.value
                        }))}
                        placeholder="Ex: KOUASSI"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={documentData.dateOfBirth}
                      onChange={(e) => setDocumentData(prev => ({
                        ...prev,
                        dateOfBirth: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="placeOfBirth">Lieu de naissance</Label>
                    <Input
                      id="placeOfBirth"
                      value={documentData.placeOfBirth}
                      onChange={(e) => setDocumentData(prev => ({
                        ...prev,
                        placeOfBirth: e.target.value
                      }))}
                      placeholder="Ex: Abidjan, Côte d'Ivoire"
                    />
                  </div>
                </div>

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
                    disabled={!documentData.documentNumber || !documentData.expiryDate}
                  >
                    Continuer
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
                  <span>Photographier le document</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Instructions pour une photo de qualité :
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Assurez-vous d'avoir un bon éclairage</li>
                    <li>• Placez le document sur une surface plane</li>
                    <li>• Évitez les reflets et les ombres</li>
                    <li>• Cadrez bien tout le document</li>
                    <li>• Vérifiez que les textes sont lisibles</li>
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleCaptureDocument}
                    className="flex-1"
                  >
                    <Camera className="mr-2" size={16} />
                    Prendre la photo
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