import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/onboarding/welcome" element={<WelcomeScreen />} />
            <Route path="/onboarding/features" element={<FeaturesScreen />} />
            <Route path="/onboarding/get-started" element={<GetStartedScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
