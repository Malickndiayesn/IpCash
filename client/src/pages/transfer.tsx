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
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, User, Smartphone, Search, Send, Check, Zap, Shield, Clock, RefreshCcw } from "lucide-react";
import { useLocation } from "wouter";
import { MobileNav } from "@/components/ui/mobile-nav";
import type { RegisteredOperator, MobileMoneyAccount } from "@shared/schema";

const transferSchema = z.object({
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

type TransferForm = z.infer<typeof transferSchema>;

export default function Transfer() {
  const [, setLocation] = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pin, setPinValues] = useState(['', '', '', '']);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [selectedFromOperator, setSelectedFromOperator] = useState<RegisteredOperator | null>(null);
  const [selectedToOperator, setSelectedToOperator] = useState<RegisteredOperator | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
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

  const { data: frequentContacts } = useQuery({
    queryKey: ["/api/contacts/frequent"],
  });

  const { data: registeredOperators } = useQuery<RegisteredOperator[]>({
    queryKey: ["/api/registered-operators"],
  });

  const { data: userMobileAccounts } = useQuery<MobileMoneyAccount[]>({
    queryKey: ["/api/mobile-money-accounts"],
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferForm) => {
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
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du transfert",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferForm) => {
    const formData = {
      ...data,
      type: transferType,
      provider: transferType === 'mobile_money' ? mobileProvider : undefined,
    };
    form.reset();
    setShowConfirmation(true);
  };

  const handleConfirmTransfer = () => {
    const pinCode = pin.join('');
    if (pinCode.length !== 4) {
      toast({
        title: "PIN invalide",
        description: "Veuillez saisir votre PIN à 4 chiffres",
        variant: "destructive",
      });
      return;
    }

    const formData = form.getValues();
    transferMutation.mutate({
      ...formData,
      type: transferType,
      provider: transferType === 'mobile_money' ? mobileProvider : undefined,
    });
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPinValues(newPin);
      
      if (value && index < 3) {
        const nextInput = document.querySelector(`input[data-pin-index="${index + 1}"]`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const mockContacts = [
    { id: "1", name: "Aminata Sow", phoneNumber: "+221 77 234 56 78", initials: "AS" },
    { id: "2", name: "Ibrahima Diop", phoneNumber: "+221 70 123 45 67", initials: "ID" },
  ];

  if (showSuccess) {
    return (
      <div className="mobile-container bg-gray-50">
        <div className="min-h-screen flex flex-col justify-center items-center px-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-success rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-slow">
              <Check className="text-white text-3xl" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfert réussi !</h2>
            <p className="text-gray-600 mb-8">Votre argent a été envoyé avec succès</p>

            <Card className="shadow-lg mb-8 text-left">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant envoyé</span>
                    <span className="font-bold text-gray-900">{form.getValues('amount')} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">À</span>
                    <span className="font-semibold text-gray-900">{form.getValues('recipientPhone')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-semibold text-gray-900">Aujourd'hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Référence</span>
                    <span className="font-mono text-sm text-gray-900">{transferResult?.transaction?.reference || 'TXN-' + Date.now()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 w-full">
              <Button variant="outline" className="w-full">
                <span className="mr-2">📱</span>
                Partager le reçu
              </Button>
              <Button onClick={() => setLocation('/')} className="w-full bg-primary hover:bg-primary/90">
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    const fees = transferType === 'mobile_money' ? 150 : 0;
    const totalAmount = parseFloat(form.getValues('amount') || '0') + fees;

    return (
      <div className="mobile-container bg-gray-50">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="banking-gradient px-6 pt-16 pb-6">
            <div className="flex items-center">
              <button onClick={() => setShowConfirmation(false)} className="text-white mr-4">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-white text-xl font-bold">Confirmer le transfert</h1>
                <p className="text-blue-100 text-sm">Vérifiez les détails</p>
              </div>
            </div>
          </div>

          {/* Confirmation Details */}
          <div className="flex-1 px-6 py-6">
            <Card className="shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Send className="text-primary text-2xl" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{form.getValues('amount')} FCFA</h3>
                  <p className="text-gray-600">à envoyer</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Destinataire</span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{form.getValues('recipientPhone')}</p>
                      <p className="text-sm text-gray-500">{transferType === 'p2p' ? 'IPCASH' : mobileProvider.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Frais de transfert</span>
                    <span className="font-semibold text-gray-900">{fees} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Total à débiter</span>
                    <span className="font-bold text-lg text-gray-900">{totalAmount} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PIN Confirmation */}
            <Card className="bg-gray-50 mb-6">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-center">Confirmez avec votre PIN</h4>
                <div className="flex justify-center space-x-3 mb-4">
                  {pin.map((value, index) => (
                    <Input
                      key={index}
                      type="password"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      data-pin-index={index}
                      className="w-12 h-12 text-center border-2 text-xl font-bold pin-input"
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500">Saisissez votre PIN à 4 chiffres</p>
              </CardContent>
            </Card>

            <Button 
              onClick={handleConfirmTransfer}
              disabled={transferMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {transferMutation.isPending ? "Traitement..." : "Confirmer le transfert"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-gray-50">
      <div className="min-h-screen flex flex-col pb-20">
        {/* Header */}
        <div className="banking-gradient px-6 pt-16 pb-6">
          <div className="flex items-center">
            <button onClick={() => setLocation('/')} className="text-white mr-4">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-white text-xl font-bold">Envoyer de l'argent</h1>
              <p className="text-blue-100 text-sm">Transfert instantané et sécurisé</p>
            </div>
          </div>
        </div>

        {/* Transfer Type Selection */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={transferType === 'p2p' ? 'default' : 'outline'}
              onClick={() => {
                setTransferType('p2p');
                form.setValue('type', 'p2p');
              }}
              className="h-20 flex flex-col space-y-2"
            >
              <User size={20} />
              <span className="text-sm font-semibold">Vers IPCASH</span>
            </Button>
            <Button
              variant={transferType === 'mobile_money' ? 'default' : 'outline'}
              onClick={() => {
                setTransferType('mobile_money');
                form.setValue('type', 'mobile_money');
              }}
              className="h-20 flex flex-col space-y-2"
            >
              <Smartphone size={20} />
              <span className="text-sm font-semibold">Mobile Money</span>
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {transferType === 'p2p' ? (
                <>
                  <FormField
                    control={form.control}
                    name="recipientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destinataire</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Numéro ou nom"
                              className="pl-12"
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                              <Search className="text-gray-400" size={16} />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recent Contacts */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Contacts récents</h4>
                    <div className="space-y-3">
                      {mockContacts.map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => form.setValue('recipientPhone', contact.phoneNumber)}
                          className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{contact.initials}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <FormLabel>Opérateur</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Button
                        type="button"
                        variant={mobileProvider === 'orange_money' ? 'default' : 'outline'}
                        onClick={() => setMobileProvider('orange_money')}
                        className="h-20 flex flex-col space-y-2"
                      >
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">OM</span>
                        </div>
                        <span className="text-sm font-medium">Orange Money</span>
                      </Button>
                      <Button
                        type="button"
                        variant={mobileProvider === 'wave' ? 'default' : 'outline'}
                        onClick={() => setMobileProvider('wave')}
                        className="h-20 flex flex-col space-y-2"
                      >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">WV</span>
                        </div>
                        <span className="text-sm font-medium">Wave</span>
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="recipientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro du destinataire</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                              <span className="text-gray-500 text-sm">+221</span>
                            </div>
                            <Input {...field} placeholder="77 123 45 67" className="pl-12" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (FCFA)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          className="text-2xl font-bold pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                          <span className="text-gray-500 font-medium">FCFA</span>
                        </div>
                      </div>
                    </FormControl>
                    {transferType === 'mobile_money' && (
                      <p className="text-sm text-gray-500 mt-1">Frais: 150 FCFA</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Ajouter une note..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Continuer
              </Button>
            </form>
          </Form>
        </div>

        <MobileNav currentPage="transfer" />
      </div>
    </div>
  );
}
