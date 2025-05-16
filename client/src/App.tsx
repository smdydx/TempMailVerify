import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { Helmet } from "react-helmet-async";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <title>TempMail - Temporary Gmail OTP Receiver</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
      </Helmet>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
