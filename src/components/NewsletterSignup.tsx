import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

const emailSchema = z.string().email("Please enter a valid email address");

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubscribed(true);
    toast({
      title: "Successfully subscribed!",
      description: "Thank you for joining our newsletter.",
    });
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-secondary">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="bg-gradient-hero shrink-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Subscribe"
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </form>
  );
};
