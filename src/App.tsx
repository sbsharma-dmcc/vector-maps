
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { initAnalytics, trackSessionStarted } from "./utils/analytics";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize Amplitude analytics
    initAnalytics();
    
    // Track session start
    trackSessionStarted('Web', '1.0.0');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/routes/:id" element={<RouteDetail />} />
              <Route path="/history" element={<History />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
