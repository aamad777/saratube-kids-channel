import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RewardProvider } from "@/components/effects/RewardBurst";
import Index from "./pages/Index";
import WatchPage from "./pages/WatchPage";
import UploadPage from "./pages/UploadPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import ParentDashboard from "./pages/ParentDashboard";
import AITestPage from "./pages/AITestPage";
import KidsAITestPage from "./pages/KidsAITestPage";
import AuthTestPage from "./pages/AuthTestPage";
import ProfilePage from "./pages/ProfilePage";
import ChildSelectPage from "./pages/ChildSelectPage";
import KidLoginPage from "./pages/KidLoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
            <RewardProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/watch/:id" element={<WatchPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/parent" element={<ParentDashboard />} />
                <Route path="/ai-test" element={<AITestPage />} />
                <Route path="/kids-ai-test" element={<KidsAITestPage />} />
                <Route path="/auth-test" element={<AuthTestPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/kids" element={<ChildSelectPage />} />
                <Route path="/kid-login" element={<KidLoginPage />} />
                <Route path="/explore" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </RewardProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
