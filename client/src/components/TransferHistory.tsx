import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCcw,
  Filter,
  Search,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransferHistoryProps {
  userId: string;
  compact?: boolean;
  limit?: number;
}

export function TransferHistory({ userId, compact = false, limit = 50 }: TransferHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: transfers, isLoading, error } = useQuery({
    queryKey: ["/api/instant-transfers", { userId, limit }],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-500" />;
      case "pending":
      case "processing":
        return <Clock size={16} className="text-yellow-500" />;
      case "failed":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <RefreshCcw size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('fr-FR').format(parseFloat(amount));
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const filteredTransfers = transfers?.filter((transfer: any) => {
    const matchesSearch = transfer.toAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromAccount.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter;
    const matchesType = typeFilter === "all" || transfer.transferMethod === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-gray-600">Erreur de chargement des transferts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Historique des transferts</CardTitle>
          {!compact && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter size={16} />
              </Button>
            </div>
          )}
        </div>
        
        {!compact && (
          <div className="flex space-x-2 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="completed">Réussi</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="manual">Manuel</SelectItem>
                <SelectItem value="qr_code">QR Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-8">
            <Search className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-gray-600">Aucun transfert trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransfers.slice(0, compact ? 5 : undefined).map((transfer: any) => (
              <div key={transfer.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {transfer.transferMethod === "qr_code" ? (
                    <ArrowUpRight className="text-blue-600" size={16} />
                  ) : (
                    <ArrowDownLeft className="text-green-600" size={16} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {transfer.toAccount}
                    </p>
                    {transfer.transferMethod === "qr_code" && (
                      <Badge variant="secondary" className="text-xs">QR</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(transfer.createdAt)}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(transfer.status)}
                    <p className="font-medium text-sm">
                      {formatAmount(transfer.amount)} FCFA
                    </p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(transfer.status)}`}>
                    {transfer.status === "completed" ? "Réussi" :
                     transfer.status === "pending" ? "En attente" :
                     transfer.status === "processing" ? "En cours" : "Échoué"}
                  </Badge>
                </div>
              </div>
            ))}
            
            {compact && filteredTransfers.length > 5 && (
              <Button variant="outline" className="w-full mt-3">
                Voir tout l'historique
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}