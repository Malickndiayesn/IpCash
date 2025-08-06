import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AdminTransferFees() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFee, setNewFee] = useState({
    operatorFrom: "",
    operatorTo: "",
    minAmount: "",
    maxAmount: "",
    feeType: "",
    feeValue: "",
    currency: "XOF"
  });

  const { data: fees, isLoading } = useQuery({
    queryKey: ["/api/admin/transfer-fees"],
    queryFn: () => apiRequest("GET", "/api/admin/transfer-fees").then(res => res.json()),
  });

  const createFeeMutation = useMutation({
    mutationFn: async (feeData: typeof newFee) => {
      return apiRequest("POST", "/api/admin/transfer-fees", feeData);
    },
    onSuccess: () => {
      toast({
        title: "Frais de transfert créé",
        description: "La nouvelle configuration de frais a été créée",
      });
      setNewFee({
        operatorFrom: "",
        operatorTo: "",
        minAmount: "",
        maxAmount: "",
        feeType: "",
        feeValue: "",
        currency: "XOF"
      });
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transfer-fees"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la configuration de frais",
        variant: "destructive",
      });
      console.error("Error creating fee:", error);
    },
  });

  const handleCreateFee = () => {
    if (!newFee.operatorFrom || !newFee.operatorTo || !newFee.minAmount || !newFee.maxAmount || !newFee.feeType || !newFee.feeValue) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    createFeeMutation.mutate(newFee);
  };

  const operators = [
    { value: "IPCASH", label: "IPCASH Wallet" },
    { value: "ORANGE", label: "Orange Money" },
    { value: "WAVE", label: "Wave" },
    { value: "MOOV", label: "Moov Money" },
    { value: "MTN", label: "MTN Mobile Money" }
  ];

  const feeTypes = [
    { value: "fixed", label: "Fixe" },
    { value: "percentage", label: "Pourcentage" },
    { value: "tiered", label: "Par palier" }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Frais de Transfert
        </CardTitle>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Frais
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurer les Frais de Transfert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opérateur source *</Label>
                  <Select value={newFee.operatorFrom} onValueChange={(value) => setNewFee(prev => ({ ...prev, operatorFrom: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Opérateur destination *</Label>
                  <Select value={newFee.operatorTo} onValueChange={(value) => setNewFee(prev => ({ ...prev, operatorTo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant min *</Label>
                  <Input
                    type="number"
                    value={newFee.minAmount}
                    onChange={(e) => setNewFee(prev => ({ ...prev, minAmount: e.target.value }))}
                    placeholder="500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Montant max *</Label>
                  <Input
                    type="number"
                    value={newFee.maxAmount}
                    onChange={(e) => setNewFee(prev => ({ ...prev, maxAmount: e.target.value }))}
                    placeholder="1000000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Type de frais *</Label>
                <Select value={newFee.feeType} onValueChange={(value) => setNewFee(prev => ({ ...prev, feeType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Valeur des frais *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newFee.feeValue}
                  onChange={(e) => setNewFee(prev => ({ ...prev, feeValue: e.target.value }))}
                  placeholder={newFee.feeType === "percentage" ? "2.5" : "100"}
                />
                <p className="text-xs text-gray-500">
                  {newFee.feeType === "percentage" ? "Pourcentage (ex: 2.5 pour 2.5%)" : "Montant en XOF"}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateFee} disabled={createFeeMutation.isPending}>
                  {createFeeMutation.isPending ? "Création..." : "Créer"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Montant Min</TableHead>
              <TableHead>Montant Max</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees?.map((fee: any) => (
              <TableRow key={fee.id}>
                <TableCell>{fee.operatorFrom}</TableCell>
                <TableCell>{fee.operatorTo}</TableCell>
                <TableCell>{Number(fee.minAmount).toLocaleString()} {fee.currency}</TableCell>
                <TableCell>{Number(fee.maxAmount).toLocaleString()} {fee.currency}</TableCell>
                <TableCell>{fee.feeType}</TableCell>
                <TableCell>
                  {fee.feeType === 'percentage' 
                    ? `${fee.feeValue}%` 
                    : `${Number(fee.feeValue).toLocaleString()} ${fee.currency}`
                  }
                </TableCell>
                <TableCell>
                  <Badge variant={fee.isActive ? "default" : "secondary"}>
                    {fee.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}