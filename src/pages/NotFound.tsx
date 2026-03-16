import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { console.error("404 Error:", location.pathname); }, [location.pathname]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center bg-background px-8"
    >
      <div className="text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto mb-6">
          <span className="text-4xl font-black text-primary">404</span>
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          onClick={() => navigate("/home")}
          className="h-12 rounded-2xl px-8 font-bold gradient-primary glow-primary gap-2"
        >
          <Home className="h-4 w-4" /> Go Home
        </Button>
      </div>
    </motion.div>
  );
};

export default NotFound;
