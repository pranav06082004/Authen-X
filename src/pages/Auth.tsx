import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Eye, EyeOff, CheckCircle2, XCircle, Lock, Mail, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Progress } from "@/components/ui/progress";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const [view, setView] = useState<"auth" | "forgot" | "reset">("auth");
  const [resetEmail, setResetEmail] = useState("");

  // Check if user came from password reset link
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "recovery") {
      setView("reset");
    }
  }, [searchParams]);

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 25;
    if (pwd.length >= 10) strength += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = passwordStrength < 40 ? "bg-destructive" : passwordStrength < 70 ? "bg-warning" : "bg-success";
  const strengthText = passwordStrength < 40 ? "Weak" : passwordStrength < 70 ? "Medium" : "Strong";

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setOauthLoading(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const fullName = formData.get("full-name") as string;

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Check your email for verification.");
      navigate("/dashboard");
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(resetEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent! Check your email.");
      setView("auth");
      setResetEmail("");
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      passwordSchema.parse(newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        setIsLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setView("auth");
      setPassword("");
      navigate("/dashboard");
    }
  };

  const OAuthButtons = () => (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 bg-[#1a1a1a] border-[#333] hover:bg-[#2a2a2a] hover:border-[#444] text-white rounded-lg transition-all"
        onClick={() => handleOAuthSignIn('google')}
        disabled={oauthLoading !== null}
      >
        {oauthLoading === 'google' ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
        ) : (
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Continue with Google
      </Button>
    </div>
  );

  const Divider = ({ text }: { text: string }) => (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#333]" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-[#0a0a0a] px-3 text-gray-400">{text}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,124,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] flex items-center justify-center shadow-lg shadow-[#8b7cf6]/30">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">AuthenX</h1>
          <p className="text-xl text-gray-400 text-center max-w-md mb-8">
            AI-Powered Authenticity Detection Platform
          </p>
          
          <div className="grid gap-6 max-w-md">
            <div className="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#8b7cf6]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-[#8b7cf6]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-400">
                  Advanced algorithms detect fake news with high accuracy
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#8b7cf6]/20 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-[#8b7cf6]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">Secure & Private</h3>
                <p className="text-sm text-gray-400">
                  Your data is encrypted and protected at all times
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#8b7cf6]/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-[#8b7cf6]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-white">Trusted by Thousands</h3>
                <p className="text-sm text-gray-400">
                  Join our community fighting misinformation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-10 w-10 text-[#8b7cf6]" />
              <span className="text-3xl font-bold text-white">AuthenX</span>
            </div>
            <p className="text-gray-400">AI-Powered Authenticity Detection</p>
          </div>

          <Card className="bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl">
            {view === "forgot" ? (
              <>
                <CardHeader>
                  <button
                    onClick={() => setView("auth")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </button>
                  <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter your email and we'll send you a reset link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="flex items-center gap-2 text-gray-300">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="h-11 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500 focus:border-[#8b7cf6] rounded-lg"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] hover:from-[#9d8ff8] hover:to-[#7577f3] text-white text-lg font-semibold rounded-lg transition-all shadow-lg shadow-[#8b7cf6]/25" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : view === "reset" ? (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Set New Password</CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter your new password below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="flex items-center gap-2 text-gray-300">
                        <Lock className="h-4 w-4" />
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          name="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 6 characters"
                          required
                          className="h-11 pr-10 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500 focus:border-[#8b7cf6] rounded-lg"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Password Strength</span>
                            <span className={`font-semibold ${
                              passwordStrength < 40 ? "text-red-400" : 
                              passwordStrength < 70 ? "text-yellow-400" : 
                              "text-green-400"
                            }`}>
                              {strengthText}
                            </span>
                          </div>
                          <Progress value={passwordStrength} className="h-2 bg-[#333]">
                            <div className={`h-full ${strengthColor} transition-all rounded-full`} />
                          </Progress>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="flex items-center gap-2 text-gray-300">
                        <Lock className="h-4 w-4" />
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password"
                        name="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        required
                        className="h-11 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500 focus:border-[#8b7cf6] rounded-lg"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] hover:from-[#9d8ff8] hover:to-[#7577f3] text-white text-lg font-semibold rounded-lg transition-all shadow-lg shadow-[#8b7cf6]/25" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Secure Access Made Simple</CardTitle>
                  <CardDescription className="text-gray-400">Sign in to your account or create a new one</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1a1a1a] border border-[#333] rounded-lg">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8b7cf6] data-[state=active]:to-[#6366f1] data-[state=active]:text-white rounded-md text-gray-400">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8b7cf6] data-[state=active]:to-[#6366f1] data-[state=active]:text-white rounded-md text-gray-400">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <OAuthButtons />
                  <Divider text="OR Login with email" />
                  
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="flex items-center gap-2 text-gray-300">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        name="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="h-11 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500 focus:border-[#8b7cf6] rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="flex items-center gap-2 text-gray-300">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          name="signin-password"
                          type={showPassword ? "text" : "password"}
                          required
                          className="h-11 pr-10 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500 focus:border-[#8b7cf6] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded bg-[#1a1a1a] border-[#333]" />
                        <span className="text-gray-400">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-[#8b7cf6] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] hover:from-[#9d8ff8] hover:to-[#7577f3] text-white text-lg font-semibold rounded-lg transition-all shadow-lg shadow-[#8b7cf6]/25" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  <div className="text-center text-sm text-gray-400">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setActiveTab("signup")}
                      className="text-[#8b7cf6] hover:underline font-semibold"
                    >
                      Sign up
                    </button>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <OAuthButtons />
                  <Divider text="OR Register with email" />
                  
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name" className="flex items-center gap-2 text-gray-300">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      <Input
                        id="full-name"
                        name="full-name"
                        type="text"
                        placeholder="John Doe"
                        required
                        className="h-11 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500 focus:border-[#8b7cf6] rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="flex items-center gap-2 text-gray-300">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        name="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="h-11 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500 focus:border-[#8b7cf6] rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="flex items-center gap-2 text-gray-300">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 6 characters"
                          required
                          className="h-11 pr-10 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500 focus:border-[#8b7cf6] rounded-lg"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Password Strength</span>
                            <span className={`font-semibold ${
                              passwordStrength < 40 ? "text-red-400" : 
                              passwordStrength < 70 ? "text-yellow-400" : 
                              "text-green-400"
                            }`}>
                              {strengthText}
                            </span>
                          </div>
                          <Progress value={passwordStrength} className="h-2 bg-[#333]">
                            <div className={`h-full ${strengthColor} transition-all rounded-full`} />
                          </Progress>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      By signing up, you agree to our{" "}
                      <a href="#" className="text-[#8b7cf6] hover:underline">Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="text-[#8b7cf6] hover:underline">Privacy Policy</a>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-[#8b7cf6] to-[#6366f1] hover:from-[#9d8ff8] hover:to-[#7577f3] text-white text-lg font-semibold rounded-lg transition-all shadow-lg shadow-[#8b7cf6]/25" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>

                  <div className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <button
                      onClick={() => setActiveTab("signin")}
                      className="text-[#8b7cf6] hover:underline font-semibold"
                    >
                      Sign in
                    </button>
                  </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
