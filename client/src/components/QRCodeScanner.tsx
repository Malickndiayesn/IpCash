import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, X, Upload, Flashlight, FlashlightOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScanResult {
  type: string;
  operatorId: string;
  operatorName: string;
  accountNumber: string;
  accountName?: string;
  amount?: string;
  description?: string;
}

interface QRCodeScannerProps {
  onScan: (result: QRScanResult) => void;
  onClose: () => void;
}

export function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some(device => device.kind === 'videoinput');
      setHasCamera(hasVideoInput);
      
      if (hasVideoInput) {
        startCamera();
      }
    } catch (error) {
      console.error("Erreur d'accès à la caméra:", error);
      setHasCamera(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Erreur de démarrage de la caméra:", error);
      toast({
        title: "Accès caméra refusé",
        description: "Veuillez autoriser l'accès à la caméra ou utilisez la saisie manuelle",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      
      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !isFlashOn }]
        });
        setIsFlashOn(!isFlashOn);
      } else {
        toast({
          title: "Flash non disponible",
          description: "Votre appareil ne supporte pas le flash",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur flash:", error);
      toast({
        title: "Erreur flash",
        description: "Impossible de contrôler le flash",
        variant: "destructive",
      });
    }
  };

  const parseQRData = (data: string): QRScanResult | null => {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type === "ipcash_transfer" && parsed.operatorId && parsed.accountNumber) {
        return {
          type: parsed.type,
          operatorId: parsed.operatorId,
          operatorName: parsed.operatorName || "Opérateur inconnu",
          accountNumber: parsed.accountNumber,
          accountName: parsed.accountName,
          amount: parsed.amount,
          description: parsed.description
        };
      }
      
      return null;
    } catch (error) {
      // Essayer de parser comme URL ou format simple
      if (data.includes("ipcash://") || data.includes("transfer://")) {
        try {
          const url = new URL(data);
          return {
            type: "ipcash_transfer",
            operatorId: url.searchParams.get("operatorId") || "",
            operatorName: url.searchParams.get("operatorName") || "Opérateur",
            accountNumber: url.searchParams.get("account") || "",
            accountName: url.searchParams.get("name") || undefined,
            amount: url.searchParams.get("amount") || undefined,
            description: url.searchParams.get("description") || undefined
          };
        } catch (urlError) {
          return null;
        }
      }
      
      return null;
    }
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      toast({
        title: "Données requises",
        description: "Veuillez saisir les données QR",
        variant: "destructive",
      });
      return;
    }

    const result = parseQRData(manualInput);
    if (result) {
      onScan(result);
    } else {
      toast({
        title: "Format invalide",
        description: "Le format des données QR n'est pas reconnu",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simuler la lecture du QR code depuis un fichier
    toast({
      title: "Fonctionnalité en développement",
      description: "L'upload de fichier QR sera bientôt disponible",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Camera size={24} />
              <span>Scanner QR Code</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Preview */}
          {hasCamera ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* Overlay for QR detection area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                </div>
              </div>

              {/* Flash Toggle */}
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFlash}
                className="absolute top-2 right-2"
              >
                {isFlashOn ? (
                  <FlashlightOff size={16} />
                ) : (
                  <Flashlight size={16} />
                )}
              </Button>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Caméra non disponible</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-gray-600">
            {hasCamera ? (
              <p>Pointez la caméra vers le QR code de transfert</p>
            ) : (
              <p>Utilisez la saisie manuelle ou l'upload de fichier</p>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Saisie manuelle des données QR
            </label>
            <Input
              placeholder="Collez les données QR ici..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="text-sm"
            />
            <Button onClick={handleManualInput} className="w-full" size="sm">
              Valider les données
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" className="w-full" size="sm" asChild>
                <span className="cursor-pointer flex items-center justify-center space-x-2">
                  <Upload size={16} />
                  <span>Uploader une image QR</span>
                </span>
              </Button>
            </label>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Astuce:</strong> Demandez à la personne de générer un QR code 
              depuis son application IPCASH, Orange Money ou Wave.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}