import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, History, User, Layout, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NavbarVariant = "public" | "authenticated" | "back";

interface NavbarProps {
  variant?: NavbarVariant;
  currentPage?: "home" | "about" | "contact";
}

export const Navbar = ({ variant = "public", currentPage }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  // Public navigation (Landing, About, Contact)
  if (variant === "public") {
    return (
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary">
              AuthenX
            </Link>
            <div className="flex items-center gap-6">
              <Link 
                to="/" 
                className={currentPage === "home" ? "text-primary font-medium" : "text-foreground hover:text-primary transition-colors"}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={currentPage === "about" ? "text-primary font-medium" : "text-foreground hover:text-primary transition-colors"}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={currentPage === "contact" ? "text-primary font-medium" : "text-foreground hover:text-primary transition-colors"}
              >
                Contact
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-hero">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated navigation (Dashboard)
  if (variant === "authenticated") {
    return (
      <nav className="glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold glow-text text-primary">AuthenX</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/history")}>
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
              {userRole === 'admin' && (
                <Button variant="ghost" onClick={() => navigate("/admin")}>
                  <Layout className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Back navigation (History, Profile, Admin)
  if (variant === "back") {
    return (
      <nav className="glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold glow-text text-primary">AuthenX</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return null;
};
