import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Zap, 
  Shield, 
  Clock, 
  RefreshCcw, 
  Smartphone, 
  Wallet, 
  Building2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { MobileNav } from "@/components/ui/mobile-nav";
import type { RegisteredOperator, MobileMoneyAccount } from "@shared/schema";

const instantTransferSchema = z.object({
  recipientPhone: z.string().min(8, "Numéro de téléphone requis"),
  amount: z.string().refine((val) => parseFloat(val) > 0, {
    message: "Le montant doit être supérieur à 0"
  }),
  description: z.string().optional(),
  fromOperatorId: z.string().min(1, "Opérateur source requis"),
  toOperatorId: z.string().min(1, "Opérateur destination requis"),
  fromAccount: z.string().optional(),
  toAccount: z.string().min(8, "Compte destinataire requis"),
});

type InstantTransferForm = z.infer<typeof instantTransferSchema>;

export default function InstantTransfer() {
  const [, setLocation] = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [selectedFromOperator, setSelectedFromOperator] = useState<RegisteredOperator | null>(null);
  const [selectedToOperator, setSelectedToOperator] = useState<RegisteredOperator | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InstantTransferForm>({
    resolver: zodResolver(instantTransferSchema),
    defaultValues: {
      recipientPhone: '',
      amount: '',
      description: '',
      fromOperatorId: '',
      toOperatorId: '',
      fromAccount: '',
      toAccount: '',
    },
  });

  const { data: registeredOperators, isLoading: operatorsLoading } = useQuery<RegisteredOperator[]>({
    queryKey: ["/api/registered-operators"],
  });

  const { data: userMobileAccounts, isLoading: accountsLoading } = useQuery<MobileMoneyAccount[]>({
    queryKey: ["/api/mobile-money-accounts"],
  });

  const { data: frequentContacts } = useQuery({
    queryKey: ["/api/contacts/frequent"],
  });

  const instantTransferMutation = useMutation({
    mutationFn: async (data: InstantTransferForm) => {
      const response = await apiRequest('POST', '/api/instant-transfer', data);
      return response.json();
    },
    onSuccess: (data) => {
      setTransferResult(data);
      setShowConfirmation(false);
      setShowSuccess(true);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/mobile-money-accounts"] });
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de transfert",
        description: error.message || "Impossible d'effectuer le transfert",
        variant: "destructive",
      });
    },
  });

  const calculateFees = () => {
    if (!selectedFromOperator || !selectedToOperator) return "0.00";
    
    const amount = parseFloat(form.watch("amount") || "0");
    const fromFee = parseFloat(selectedFromOperator.transferFee || "0");
    const toFee = parseFloat(selectedToOperator.transferFee || "0");
    
    return (amount * (fromFee + toFee) / 100).toFixed(2);
  };

  const getOperatorIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <Smartphone className="text-blue-500" size={24} />;
      case 'wallet':
        return <Wallet className="text-green-500" size={24} />;
      case 'bank':
        return <Building2 className="text-purple-500" size={24} />;
      default:
        return <Wallet className="text-gray-500" size={24} />;
    }
  };

  const onSubmit = (data: InstantTransferForm) => {
    if (!selectedFromOperator || !selectedToOperator) {
      toast({
        title: "Opérateurs requis",
        description: "Veuillez sélectionner les opérateurs source et destination",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(data.amount);
    const minAmount = Math.max(
      parseFloat(selectedFromOperator.minTransferAmount || "100"),
      parseFloat(selectedToOperator.minTransferAmount || "100")
    );
    const maxAmount = Math.min(
      parseFloat(selectedFromOperator.maxTransferAmount || "1000000"),
      parseFloat(selectedToOperator.maxTransferAmount || "1000000")
    );

    if (amount < minAmount || amount > maxAmount) {
      toast({
        title: "Montant invalide",
        description: `Le montant doit être entre ${minAmount} et ${maxAmount} FCFA`,
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmTransfer = () => {
    const formData = form.getValues();
    instantTransferMutation.mutate(formData);
  };

  if (operatorsLoading || accountsLoading) {
    return (
      <div className="mobile-container">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="mobile-container">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Transfert réussi !
              </h2>
              <p className="text-gray-600 mb-6">
                Votre transfert instantané a été effectué avec succès
              </p>
              
              {transferResult && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Montant:</span>
                    <span className="font-medium">{transferResult.amount} FCFA</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Frais:</span>
                    <span className="font-medium">{transferResult.fees || "0.00"} FCFA</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Référence:</span>
                    <span className="font-medium text-sm">{transferResult.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut:</span>
                    <span className="text-green-600 font-medium">Complété</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full"
                >
                  Retour au tableau de bord
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccess(false);
                    form.reset();
                    setSelectedFromOperator(null);
                    setSelectedToOperator(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Nouveau transfert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (showConfirmation) {
    const formData = form.getValues();
    const fees = calculateFees();
    const totalAmount = (parseFloat(formData.amount) + parseFloat(fees)).toFixed(2);

    return (
      <div className="mobile-container">
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmation(false)}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold ml-4">Confirmer le transfert</h1>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  {selectedFromOperator && getOperatorIcon(selectedFromOperator.type)}
                  <RefreshCcw className="text-gray-400" size={20} />
                  {selectedToOperator && getOperatorIcon(selectedToOperator.type)}
                </div>
                <p className="text-gray-600">
                  {selectedFromOperator?.name} → {selectedToOperator?.name}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Destinataire:</span>
                  <span className="font-medium">{formData.toAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant:</span>
                  <span className="font-medium">{formData.amount} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frais de transfert:</span>
                  <span className="font-medium">{fees} FCFA</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total à débiter:</span>
                    <span className="font-bold text-lg">{totalAmount} FCFA</span>
                  </div>
                </div>
                {formData.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Description:</span>
                    <span className="font-medium">{formData.description}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Zap className="text-blue-500" size={16} />
                  <span className="text-sm font-medium text-blue-800">
                    Transfert instantané sécurisé
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Ce transfert sera traité instantanément entre les deux opérateurs
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={confirmTransfer}
                  disabled={instantTransferMutation.isPending}
                  className="w-full"
                >
                  {instantTransferMutation.isPending ? (
                    <>
                      <RefreshCcw className="animate-spin mr-2" size={16} />
                      Traitement en cours...
                    </>
                  ) : (
                    "Confirmer le transfert"
                  )}
                </Button>
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="outline"
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Transfert Instantané
            </h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Info Banner */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Zap size={24} />
                <div>
                  <h3 className="font-bold">Transferts instantanés</h3>
                  <p className="text-sm text-blue-100">
                    Entre Orange Money, Wave et IPCASH Wallet
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="p-3">
                <Zap className="mx-auto text-blue-500 mb-2" size={20} />
                <p className="text-xs font-medium">Instantané</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <Shield className="mx-auto text-green-500 mb-2" size={20} />
                <p className="text-xs font-medium">Sécurisé</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <Clock className="mx-auto text-purple-500 mb-2" size={20} />
                <p className="text-xs font-medium">24h/24</p>
              </CardContent>
            </Card>
          </div>

          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle>Nouveau transfert</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* From Operator Selection */}
                  <FormField
                    control={form.control}
                    name="fromOperatorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depuis</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              const operator = registeredOperators?.find(op => op.id === value);
                              setSelectedFromOperator(operator || null);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner l'opérateur source" />
                            </SelectTrigger>
                            <SelectContent>
                              {registeredOperators?.map((operator) => (
                                <SelectItem key={operator.id} value={operator.id}>
                                  <div className="flex items-center space-x-2">
                                    {getOperatorIcon(operator.type)}
                                    <span>{operator.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* To Operator Selection */}
                  <FormField
                    control={form.control}
                    name="toOperatorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vers</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              const operator = registeredOperators?.find(op => op.id === value);
                              setSelectedToOperator(operator || null);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner l'opérateur destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {registeredOperators?.filter(op => op.id !== form.watch("fromOperatorId")).map((operator) => (
                                <SelectItem key={operator.id} value={operator.id}>
                                  <div className="flex items-center space-x-2">
                                    {getOperatorIcon(operator.type)}
                                    <span>{operator.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recipient Phone */}
                  <FormField
                    control={form.control}
                    name="toAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro destinataire</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: 77 123 45 67"
                            type="tel"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant (FCFA)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0"
                            type="number"
                            min="100"
                            max="1000000"
                          />
                        </FormControl>
                        {selectedFromOperator && selectedToOperator && (
                          <p className="text-xs text-gray-500">
                            Frais estimés: {calculateFees()} FCFA
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Motif du transfert..."
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="mr-2" size={16} />
                    Continuer
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Frequent Contacts */}
          {frequentContacts && frequentContacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contacts fréquents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {frequentContacts.slice(0, 3).map((contact: any) => (
                    <Button
                      key={contact.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        form.setValue("toAccount", contact.phoneNumber);
                      }}
                    >
                      <User className="mr-2" size={16} />
                      {contact.name} - {contact.phoneNumber}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}