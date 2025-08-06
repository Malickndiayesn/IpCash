import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  CreditCard, 
  ArrowUpDown, 
  AlertCircle, 
  Eye, 
  Check, 
  X,
  RefreshCw,
  Download,
  Shield,
  Settings,
  Database,
  TrendingUp,
  UserPlus,
  BarChart3,
  DollarSign,
  Activity
} from "lucide-react";
import { AdminUserCreation } from "@/components/AdminUserCreation";
import { AdminRolesManagement } from "@/components/AdminRolesManagement";
import { AdminTransferFees } from "@/components/AdminTransferFees";
import { AdminProfitsTracking } from "@/components/AdminProfitsTracking";
import { AdminOperationDiagrams } from "@/components/AdminOperationDiagrams";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalAmount: string;
  pendingKYC: number;
  activeCards: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
}

interface KYCDocument {
  id: string;
  userId: string;
  documentType: string;
  documentUrl: string;
  status: string;
  createdAt: string;
  user?: User;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedKYC, setSelectedKYC] = useState<KYCDocument | null>(null);

  // Temporarily disabled authentication check for testing
  // if (!isLoading && !isAuthenticated) {
  //   window.location.href = '/api/login';
  //   return null;
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
  });

  // Fetch pending KYC documents
  const { data: kycDocuments, isLoading: kycLoading } = useQuery<KYCDocument[]>({
    queryKey: ["/api/admin/kyc/pending"],
  });

  // KYC approval mutation
  const kycMutation = useMutation({
    mutationFn: async ({ documentId, status, reason }: { documentId: string; status: string; reason?: string }) => {
      const response = await apiRequest('PUT', `/api/admin/kyc/${documentId}`, { status, rejectionReason: reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document KYC mis à jour",
        description: "Le statut du document a été modifié avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedKYC(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le document",
        variant: "destructive",
      });
    },
  });

  // User suspension mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, suspend }: { userId: string; suspend: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/suspend`, { suspend });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.suspend ? "Utilisateur suspendu" : "Utilisateur réactivé",
        description: "Le statut de l'utilisateur a été modifié",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    },
  });

  const exportData = async (type: string) => {
    try {
      const response = await apiRequest('GET', `/api/admin/export/${type}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export réussi",
        description: `Les données ${type} ont été exportées`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'export",
        description: error.message || "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'completed': 'default',
      'pending': 'secondary',
      'failed': 'destructive',
      'cancelled': 'outline',
      'approved': 'default',
      'rejected': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Interface Administration IPCASH
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tableau de bord pour gérer les utilisateurs, transactions et validations KYC
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers || 0} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalAmount || "0"} FCFA
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">KYC en attente</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.pendingKYC || 0}</div>
              <p className="text-xs text-muted-foreground">
                Documents à valider
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartes Actives</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeCards || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cartes virtuelles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database size={16} />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="create-user" className="flex items-center gap-2">
              <UserPlus size={16} />
              Créer Utilisateur
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield size={16} />
              Rôles
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center gap-2">
              <Settings size={16} />
              Frais
            </TabsTrigger>
            <TabsTrigger value="profits" className="flex items-center gap-2">
              <DollarSign size={16} />
              Profits
            </TabsTrigger>
            <TabsTrigger value="diagrams" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Diagrammes
            </TabsTrigger>
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              <AlertCircle size={16} />
              KYC
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <Download size={16} />
              Exports
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>
                  Liste des utilisateurs enregistrés sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <img
                                src={user.profileImageUrl || "/default-avatar.png"}
                                alt={user.firstName}
                                className="h-8 w-8 rounded-full"
                              />
                              <span>{user.firstName} {user.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye size={16} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Détails Utilisateur</DialogTitle>
                                  <DialogDescription>
                                    Informations et actions pour {user.firstName} {user.lastName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Email:</Label>
                                    <p>{user.email}</p>
                                  </div>
                                  <div>
                                    <Label>ID Utilisateur:</Label>
                                    <p className="font-mono text-sm">{user.id}</p>
                                  </div>
                                  <div>
                                    <Label>Date d'inscription:</Label>
                                    <p>{new Date(user.createdAt).toLocaleString('fr-FR')}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => suspendUserMutation.mutate({ userId: user.id, suspend: true })}
                                      disabled={suspendUserMutation.isPending}
                                    >
                                      Suspendre
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => suspendUserMutation.mutate({ userId: user.id, suspend: false })}
                                      disabled={suspendUserMutation.isPending}
                                    >
                                      Réactiver
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Créer Utilisateur Tab */}
          <TabsContent value="create-user" className="space-y-4">
            <AdminUserCreation />
          </TabsContent>

          {/* Gestion des Rôles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <AdminRolesManagement />
          </TabsContent>

          {/* Frais de Transfert Tab */}
          <TabsContent value="fees" className="space-y-4">
            <AdminTransferFees />
          </TabsContent>

          {/* Suivi des Profits Tab */}
          <TabsContent value="profits" className="space-y-4">
            <AdminProfitsTracking />
          </TabsContent>

          {/* Diagrammes Opérationnels Tab */}
          <TabsContent value="diagrams" className="space-y-4">
            <AdminOperationDiagrams />
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transactions Récentes</CardTitle>
                <CardDescription>
                  Historique des transactions sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Transaction</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">{transaction.id.substring(0, 8)}...</TableCell>
                          <TableCell>{transaction.amount} {transaction.currency}</TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>{new Date(transaction.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Tab */}
          <TabsContent value="kyc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents KYC en Attente</CardTitle>
                <CardDescription>
                  Validation des documents d'identité des utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {kycLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Type Document</TableHead>
                        <TableHead>Date Soumission</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kycDocuments?.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.user?.firstName} {doc.user?.lastName}</TableCell>
                          <TableCell>{doc.documentType}</TableCell>
                          <TableCell>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedKYC(doc)}
                                >
                                  <Eye size={16} />
                                  Valider
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Validation Document KYC</DialogTitle>
                                  <DialogDescription>
                                    Document soumis par {doc.user?.firstName} {doc.user?.lastName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Type de document:</Label>
                                    <p>{doc.documentType}</p>
                                  </div>
                                  <div>
                                    <Label>Document:</Label>
                                    <img 
                                      src={doc.documentUrl} 
                                      alt="Document KYC" 
                                      className="max-w-full h-auto border rounded"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => kycMutation.mutate({ documentId: doc.id, status: 'approved' })}
                                      disabled={kycMutation.isPending}
                                      className="flex items-center gap-2"
                                    >
                                      <Check size={16} />
                                      Approuver
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => kycMutation.mutate({ documentId: doc.id, status: 'rejected', reason: 'Document non conforme' })}
                                      disabled={kycMutation.isPending}
                                      className="flex items-center gap-2"
                                    >
                                      <X size={16} />
                                      Rejeter
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports Tab */}
          <TabsContent value="exports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export de Données</CardTitle>
                <CardDescription>
                  Télécharger les données de la plateforme en format CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => exportData('users')}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export Utilisateurs
                  </Button>
                  <Button
                    onClick={() => exportData('transactions')}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export Transactions
                  </Button>
                  <Button
                    onClick={() => exportData('kyc')}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export Documents KYC
                  </Button>
                  <Button
                    onClick={() => exportData('analytics')}
                    className="flex items-center gap-2"
                  >
                    <TrendingUp size={16} />
                    Export Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}