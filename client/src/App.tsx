import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Transfer from "@/pages/transfer";
import Transactions from "@/pages/transactions";
import Cards from "@/pages/cards";
import Profile from "@/pages/profile";
import Analytics from "@/pages/analytics";
import Savings from "@/pages/savings";
import Credit from "@/pages/credit";
import Support from "@/pages/support";
import KYC from "@/pages/kyc";

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
          <Route path="/transactions" component={Transactions} />
          <Route path="/cards" component={Cards} />
          <Route path="/profile" component={Profile} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/savings" component={Savings} />
          <Route path="/credit" component={Credit} />
          <Route path="/support" component={Support} />
          <Route path="/kyc" component={KYC} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
