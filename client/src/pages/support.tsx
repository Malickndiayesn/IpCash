import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/ui/mobile-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MessageCircle, 
  Plus,
  Send,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  BookOpen,
  HeadphonesIcon,
  Zap
} from "lucide-react";
import { useLocation } from "wouter";

export default function Support() {
  const [, setLocation] = useLocation();
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: supportTickets, isLoading } = useQuery({
    queryKey: ["/api/support-tickets"],
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/support-tickets", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setIsNewTicketOpen(false);
      toast({
        title: "Ticket créé",
        description: "Votre demande de support a été envoyée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le ticket de support",
        variant: "destructive",
      });
    },
  });

  // Mock data pour démonstration
  const mockTickets = [
    {
      id: "1",
      subject: "Problème de transfert Mobile Money",
      description: "Mon transfert vers Orange Money n'est pas arrivé",
      category: "technical",
      priority: "high",
      status: "in_progress",
      createdAt: "2024-12-05T10:30:00Z",
      updatedAt: "2024-12-05T14:15:00Z",
      messages: [
        {
          id: "1",
          senderId: "user",
          senderType: "user",
          message: "Bonjour, j'ai effectué un transfert de 50,000 FCFA vers Orange Money hier à 15h30 mais le destinataire n'a toujours rien reçu. Référence: TXN123456789",
          createdAt: "2024-12-05T10:30:00Z",
        },
        {
          id: "2",
          senderId: "agent1",
          senderType: "agent",
          message: "Bonjour, merci pour votre message. Je vérifie immédiatement le statut de votre transaction. Pouvez-vous confirmer le numéro du destinataire ?",
          createdAt: "2024-12-05T11:45:00Z",
        },
        {
          id: "3",
          senderId: "user",
          senderType: "user",
          message: "Le numéro est +221 77 123 45 67",
          createdAt: "2024-12-05T12:00:00Z",
        },
        {
          id: "4",
          senderId: "agent1",
          senderType: "agent",
          message: "Merci. Je vois que la transaction est en cours de traitement côté Orange Money. Le délai peut parfois prendre jusqu'à 24h. Je relance le processus pour vous.",
          createdAt: "2024-12-05T14:15:00Z",
        },
      ]
    },
    {
      id: "2",
      subject: "Question sur les frais de carte virtuelle",
      description: "Je voudrais comprendre les frais appliqués",
      category: "billing",
      priority: "medium",
      status: "resolved",
      createdAt: "2024-12-04T09:15:00Z",
      updatedAt: "2024-12-04T16:30:00Z",
      messages: []
    },
    {
      id: "3",
      subject: "Mise à jour de mes informations personnelles",
      description: "Comment changer mon adresse email ?",
      category: "general",
      priority: "low",
      status: "open",
      createdAt: "2024-12-03T14:20:00Z",
      updatedAt: "2024-12-03T14:20:00Z",
      messages: []
    },
  ];

  const quickActions = [
    {
      title: "FAQ",
      description: "Questions fréquentes",
      icon: HelpCircle,
      action: () => {},
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      title: "Guide utilisateur",
      description: "Documentation complète",
      icon: BookOpen,
      action: () => {},
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      title: "Appel urgent",
      description: "+221 33 123 45 67",
      icon: Phone,
      action: () => {},
      color: "bg-red-50 text-red-600 border-red-200",
    },
    {
      title: "Chat IA",
      description: "Assistant intelligent",
      icon: Zap,
      action: () => {},
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'in_progress': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'resolved': return 'bg-green-50 text-green-600 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-gray-50">
      <div className="min-h-screen flex flex-col pb-20">
        {/* Header */}
        <div className="banking-gradient px-6 pt-16 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => setLocation('/')} className="text-white mr-4">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-white text-xl font-bold">Support client</h1>
                <p className="text-blue-100 text-sm">Assistance • Chat • Urgences</p>
              </div>
            </div>
            <HeadphonesIcon className="text-white" size={24} />
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aide rapide</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${action.color}`}
                  >
                    <action.icon size={24} className="mb-2" />
                    <h4 className="font-semibold text-sm">{action.title}</h4>
                    <p className="text-xs opacity-75">{action.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create New Ticket */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Mes tickets</h3>
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus size={16} />
                  <span>Nouveau ticket</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="mobile-container mx-4">
                <DialogHeader>
                  <DialogTitle>Créer un ticket de support</DialogTitle>
                </DialogHeader>
                <SupportTicketForm onSubmit={(data) => createTicketMutation.mutate(data)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Support Tickets */}
          <div className="space-y-4">
            {mockTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTicket(ticket.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle size={14} />
                        <span>{ticket.messages.length} messages</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {ticket.status === 'in_progress' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>}
                      <span>#{ticket.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Information */}
          <Card className="shadow-sm bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactez-nous</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Phone className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Urgences 24/7</p>
                    <p className="text-sm text-gray-600">+221 33 123 45 67</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Chat en ligne</p>
                    <p className="text-sm text-gray-600">Lun-Ven 8h-20h, Sam 9h-17h</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@ipcash.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketDetailModal
            ticket={mockTickets.find(t => t.id === selectedTicket)!}
            onClose={() => setSelectedTicket(null)}
          />
        )}

        <MobileNav currentPage="support" />
      </div>
    </div>
  );
}

function SupportTicketForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subject">Sujet</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Décrivez brièvement votre problème"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisissez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Problème technique</SelectItem>
            <SelectItem value="billing">Facturation</SelectItem>
            <SelectItem value="account">Compte utilisateur</SelectItem>
            <SelectItem value="general">Question générale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priorité</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Faible</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description détaillée</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Décrivez votre problème en détail..."
          rows={4}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        <Send className="mr-2" size={16} />
        Envoyer le ticket
      </Button>
    </form>
  );
}

function TicketDetailModal({ ticket, onClose }: { ticket: any; onClose: () => void }) {
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    // Ici on enverrait le message
    setNewMessage("");
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="mobile-container mx-4 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Ticket #{ticket.id}</span>
            <Badge className={getStatusColor(ticket.status)}>
              {getStatusLabel(ticket.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
            <p className="text-sm text-gray-600">{ticket.description}</p>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {ticket.messages.map((message: any) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.senderType === 'user'
                    ? 'bg-blue-50 ml-4'
                    : 'bg-gray-50 mr-4'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {message.senderType === 'user' ? 'Vous' : 'Support IPCASH'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{message.message}</p>
              </div>
            ))}
          </div>

          {ticket.status !== 'closed' && (
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="sm">
                <Send size={16} />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'in_progress': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'resolved': return 'bg-green-50 text-green-600 border-green-200';
    case 'closed': return 'bg-gray-50 text-gray-600 border-gray-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'open': return 'Ouvert';
    case 'in_progress': return 'En cours';
    case 'resolved': return 'Résolu';
    case 'closed': return 'Fermé';
    default: return status;
  }
}