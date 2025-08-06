import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QrCode, Download, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeData {
  operatorId: string;
  operatorName: string;
  accountNumber: string;
  accountName?: string;
  amount?: string;
  description?: string;
}

interface QRCodeGeneratorProps {
  data: QRCodeData;
  onClose: () => void;
}

export function QRCodeGenerator({ data, onClose }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [amount, setAmount] = useState(data.amount || "");
  const [description, setDescription] = useState(data.description || "");
  const { toast } = useToast();

  const generateQRCode = async () => {
    const qrData = {
      type: "ipcash_transfer",
      version: "1.0",
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      amount: amount,
      description: description,
      timestamp: new Date().toISOString()
    };

    const qrString = JSON.stringify(qrData);
    
    // Générer QR code en utilisant une API publique
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
    setQrCodeUrl(qrApiUrl);
  };

  useEffect(() => {
    generateQRCode();
  }, [amount, description]);

  const copyQRData = async () => {
    const qrData = {
      type: "ipcash_transfer",
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      amount: amount,
      description: description
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
      toast({
        title: "Copié",
        description: "Données QR copiées dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier les données",
        variant: "destructive",
      });
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Transfert IPCASH - ${data.operatorName}`,
          text: `Transférer vers ${data.accountNumber} (${data.operatorName})`,
          url: qrCodeUrl,
        });
      } catch (error) {
        toast({
          title: "Partage non supporté",
          description: "Utilisez le bouton copier à la place",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Partage non supporté",
        description: "Utilisez le bouton copier à la place",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${data.operatorName}-${data.accountNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode size={24} />
            <span>QR Code de Transfert</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-64 h-64 border border-gray-200 rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Opérateur:</span>
              <span className="font-medium">{data.operatorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Compte:</span>
              <span className="font-medium">{data.accountNumber}</span>
            </div>
            {data.accountName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Nom:</span>
                <span className="font-medium">{data.accountName}</span>
              </div>
            )}
          </div>

          {/* Optional Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Montant (optionnel)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-center"
            />
          </div>

          {/* Optional Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description (optionnel)
            </label>
            <Input
              placeholder="Motif du transfert..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyQRData}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              <Copy size={16} />
              <span className="text-xs">Copier</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareQRCode}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              <Share2 size={16} />
              <span className="text-xs">Partager</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              <Download size={16} />
              <span className="text-xs">Télécharger</span>
            </Button>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}