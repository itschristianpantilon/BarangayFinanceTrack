import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  User,
  Lock,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../components/ui/form";
import { useToast } from "../hooks/use-toast";
import { api, apiCall } from "../utils/api";

import logoPath from "../assets/san_agustin.jpg";

/* -------------------- */
/* Validation Schema */
/* -------------------- */
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* -------------------- */
  /* React Hook Form */
  /* -------------------- */
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  /* -------------------- */
  /* Role Routes */
  /* -------------------- */
  const roleRoutes: Record<string, string> = {
    superadmin: "/admin/users",
    admin: "/admin/users",
    encoder: "/encoder/dashboard",
    checker: "/checker/dashboard",
    reviewer: "/reviewer/dashboard",
    approver: "/approver/dashboard",
    viewer: "/viewer/dashboard",
  };

  /* -------------------- */
  /* Submit Handler */
  /* -------------------- */
  const onSubmit = async (values: LoginForm) => {
    setIsLoading(true);

    try {
      const { data, error } = await apiCall<LoginResponse>(api.auth.login, {
        method: "POST",
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error || "Invalid credentials.",
        });
        return;
      }

      // Login successful
      const { user } = data;

      // Store authentication data
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userId", user.id.toString());
      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role);

      // Get redirect path based on role
      const redirectPath = roleRoutes[user.role.toLowerCase()] || "/admin/users";

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.username}.`,
      });

      // Redirect to appropriate dashboard
      setLocation(redirectPath);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-100 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950">
      <Card className="w-full max-w-[380px] border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl ring-1 ring-white/50 dark:ring-slate-800 rounded-3xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

        <CardHeader className="space-y-4 text-center pt-8 pb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>

              <div className="relative bg-white dark:bg-slate-950 p-1 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                <img
                  src={logoPath}
                  alt="Logo"
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-[2px] rounded-full ring-2 ring-white dark:ring-slate-900">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <CardTitle className="text-xl font-bold font-poppins tracking-tight text-slate-800 dark:text-slate-100">
                Barangay San Agustin
              </CardTitle>
              <CardDescription className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] uppercase tracking-widest">
                Financial Monitoring System
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* USERNAME */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group transition-all duration-300">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 group-focus-within:scale-110 transition-all duration-300">
                          <User className="h-4 w-4" />
                        </div>
                        <Input
                          placeholder="Username"
                          {...field}
                          disabled={isLoading}
                          className="pl-11 h-12 bg-slate-50/80 dark:bg-slate-900/50 border-0 ring-1 ring-slate-200/50 dark:ring-slate-800 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-2 focus-visible:ring-emerald-500/30 transition-all duration-300 rounded-2xl text-sm font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 ml-1" />
                  </FormItem>
                )}
              />

              {/* PASSWORD */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group transition-all duration-300">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 group-focus-within:scale-110 transition-all duration-300">
                          <Lock className="h-4 w-4" />
                        </div>

                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          {...field}
                          disabled={isLoading}
                          className="pl-11 pr-12 h-12 bg-slate-50/80 dark:bg-slate-900/50 border-0 ring-1 ring-slate-200/50 dark:ring-slate-800 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-2 focus-visible:ring-emerald-500/30 transition-all duration-300 rounded-2xl text-sm font-medium placeholder:text-slate-400"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 focus:text-emerald-600 transition-colors outline-none"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 ml-1" />
                  </FormItem>
                )}
              />

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                className="w-full h-12 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="text-sm">Accessing...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2 text-sm">
                    Sign In <ChevronRight className="h-4 w-4 opacity-70" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          {/* FOOTER */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link href="/" className="w-full">
              <Button
                variant="ghost"
                className="w-full h-10 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 rounded-xl text-xs font-medium"
              >
                <ArrowLeft className="h-3 w-3 mr-2" />
                Back to Homepage
              </Button>
            </Link>

            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              SECURE CONNECTION
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}