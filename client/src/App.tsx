import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Transfer from "@/pages/transfer";
import InstantTransfer from "@/pages/instant-transfer";
import Transactions from "@/pages/transactions";
import Cards from "@/pages/cards";
import Profile from "@/pages/profile";
import Analytics from "@/pages/analytics";
import Savings from "@/pages/savings";
import Credit from "@/pages/credit";
import Support from "@/pages/support";
import KYC from "@/pages/kyc";
import InternationalTransfer from "@/pages/international-transfer";
import CurrencyExchange from "@/pages/currency-exchange";
import MultiCurrency from "@/pages/multi-currency";
import Recharge from "@/pages/recharge";
import Notifications from "@/pages/notifications";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/transfer" component={Transfer} />
          <Route path="/instant-transfer" component={InstantTransfer} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/cards" component={Cards} />
          <Route path="/profile" component={Profile} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/savings" component={Savings} />
          <Route path="/credit" component={Credit} />
          <Route path="/support" component={Support} />
          <Route path="/kyc" component={KYC} />
          <Route path="/international-transfer" component={InternationalTransfer} />
          <Route path="/currency-exchange" component={CurrencyExchange} />
          <Route path="/multi-currency" component={MultiCurrency} />
          <Route path="/recharge" component={Recharge} />
          <Route path="/notifications" component={Notifications} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
