import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  RotateCcw, 
  Check, 
  X, 
  Upload,
  Eye,
  FileImage,
  RefreshCw
} from "lucide-react";

interface PhotoCaptureProps {
  title: string;
  description: string;
  documentType: "cni" | "passport" | "selfie";
  onPhotoCapture: (file: File) => void;
  onCancel?: () => void;
  isUploading?: boolean;
}

export function PhotoCapture({ 
  title, 
  description, 
  documentType, 
  onPhotoCapture, 
  onCancel,
  isUploading = false
}: PhotoCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: documentType === "selfie" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  }, [documentType]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (!capturedPhoto) return;

    // Convert data URL to File
    fetch(capturedPhoto)
      .then(res => res.blob())
      .then(blob => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${documentType}_${timestamp}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });
        onPhotoCapture(file);
      });
  }, [capturedPhoto, documentType, onPhotoCapture]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoCapture(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onPhotoCapture]);

  const getDocumentInstructions = () => {
    switch (documentType) {
      case "cni":
        return {
          icon: "🪪",
          instructions: [
            "Placez votre CNI sur une surface plane",
            "Assurez-vous que tous les textes sont lisibles",
            "Évitez les reflets et les ombres",
            "Cadrez bien toute la carte"
          ]
        };
      case "passport":
        return {
          icon: "📖",
          instructions: [
            "Ouvrez votre passeport à la page d'identité",
            "Placez-le sur une surface plane et bien éclairée",
            "Assurez-vous que la photo et les informations sont nettes",
            "Évitez les reflets sur la page plastifiée"
          ]
        };
      case "selfie":
        return {
          icon: "🤳",
          instructions: [
            "Tenez votre document d'identité près de votre visage",
            "Assurez-vous que votre visage et le document sont visibles",
            "Regardez directement la caméra",
            "Choisissez un éclairage naturel si possible"
          ]
        };
      default:
        return {
          icon: "📷",
          instructions: ["Suivez les instructions à l'écran"]
        };
    }
  };

  const docInstructions = getDocumentInstructions();

  if (capturedPhoto) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center space-x-2">
            <span>{docInstructions.icon}</span>
            <span>Vérifier la photo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <img 
              src={capturedPhoto} 
              alt="Photo capturée" 
              className="w-full rounded-lg border"
            />
            <Badge className="absolute top-2 right-2 bg-green-500">
              <Check size={12} className="mr-1" />
              Capturée
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Vérifiez que :</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {docInstructions.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={retakePhoto}
              className="flex-1"
              disabled={isUploading}
            >
              <RotateCcw size={16} className="mr-2" />
              Reprendre
            </Button>
            <Button 
              onClick={confirmPhoto}
              className="flex-1"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Confirmer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center space-x-2">
          <span>{docInstructions.icon}</span>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center">{description}</p>
        
        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="font-medium text-sm mb-2 text-blue-800">Instructions :</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-blue-700">
            {docInstructions.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>

        {/* Camera Stream */}
        {isStreaming && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border"
            />
            <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
              <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                Positionnez le document dans le cadre
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isStreaming ? (
            <>
              <Button 
                onClick={startCamera} 
                className="w-full"
                disabled={isUploading}
              >
                <Camera size={16} className="mr-2" />
                Ouvrir la caméra
              </Button>
              
              {/* File Upload Option */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isUploading}
                >
                  <Upload size={16} className="mr-2" />
                  Choisir une photo
                </Button>
              </div>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={stopCamera}
                className="flex-1"
              >
                <X size={16} className="mr-2" />
                Annuler
              </Button>
              <Button 
                onClick={capturePhoto}
                className="flex-1"
              >
                <Camera size={16} className="mr-2" />
                Capturer
              </Button>
            </div>
          )}
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="w-full"
            disabled={isUploading}
          >
            Retour
          </Button>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
}