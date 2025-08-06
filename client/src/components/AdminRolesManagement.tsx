import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AdminRolesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const { data: roles, isLoading } = useQuery({
    queryKey: ["/api/admin/roles"],
    queryFn: () => apiRequest("GET", "/api/admin/roles").then(res => res.json()),
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: typeof newRole) => {
      return apiRequest("POST", "/api/admin/roles", {
        ...roleData,
        permissions: JSON.stringify(roleData.permissions)
      });
    },
    onSuccess: () => {
      toast({
        title: "Rôle créé",
        description: "Le nouveau rôle a été créé avec succès",
      });
      setNewRole({ name: "", description: "", permissions: [] });
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le rôle",
        variant: "destructive",
      });
      console.error("Error creating role:", error);
    },
  });

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    createRoleMutation.mutate(newRole);
  };

  const availablePermissions = [
    "admin_full_access",
    "user_management",
    "transaction_view",
    "transaction_manage",
    "kyc_review",
    "reports_access",
    "settings_manage"
  ];

  const togglePermission = (permission: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion des Rôles
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Rôle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Rôle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du rôle *</Label>
                  <Input
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Opérateur"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez le rôle et ses responsabilités"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <Button
                        key={permission}
                        variant={newRole.permissions.includes(permission) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePermission(permission)}
                      >
                        {permission}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
                    {createRoleMutation.isPending ? "Création..." : "Créer"}
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
          <div className="grid gap-4">
            {roles?.map((role: any) => (
              <div key={role.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{role.name}</h3>
                  <Badge variant={role.isActive ? "default" : "secondary"}>
                    {role.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(role.permissions || "[]").map((permission: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}