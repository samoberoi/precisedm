import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SubscriptionGate from "@/components/SubscriptionGate";
import PageTransition from "@/components/PageTransition";
import SplashScreen from "./pages/onboarding/SplashScreen";
import WelcomeScreen from "./pages/onboarding/WelcomeScreen";
import FeaturesScreen from "./pages/onboarding/FeaturesScreen";
import GetStartedScreen from "./pages/onboarding/GetStartedScreen";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ConnectPage from "./pages/ConnectPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DisclaimerPage from "./pages/DisclaimerPage";
import VideosPage from "./pages/VideosPage";
import SteroidPage from "./pages/SteroidPage";
import MaintenancePage from "./pages/MaintenancePage";
import GestationPage from "./pages/GestationPage";
import DiaFormPage from "./pages/DiaFormPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><SplashScreen /></PageTransition>} />
        <Route path="/onboarding/welcome" element={<PageTransition><WelcomeScreen /></PageTransition>} />
        <Route path="/onboarding/features" element={<PageTransition><FeaturesScreen /></PageTransition>} />
        <Route path="/onboarding/get-started" element={<PageTransition><GetStartedScreen /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUpPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/connect" element={<PageTransition><ConnectPage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
        <Route path="/disclaimer" element={<PageTransition><DisclaimerPage /></PageTransition>} />
        <Route path="/subscription" element={<PageTransition><SubscriptionPage /></PageTransition>} />
        <Route path="/subscription/success" element={<PageTransition><SubscriptionSuccessPage /></PageTransition>} />
        <Route path="/videos" element={<SubscriptionGate><PageTransition><VideosPage /></PageTransition></SubscriptionGate>} />
        <Route path="/steroid" element={<SubscriptionGate><PageTransition><SteroidPage /></PageTransition></SubscriptionGate>} />
        <Route path="/maintenance" element={<SubscriptionGate><PageTransition><MaintenancePage /></PageTransition></SubscriptionGate>} />
        <Route path="/gestation" element={<SubscriptionGate><PageTransition><GestationPage /></PageTransition></SubscriptionGate>} />
        <Route path="/diaform" element={<SubscriptionGate><PageTransition><DiaFormPage /></PageTransition></SubscriptionGate>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
