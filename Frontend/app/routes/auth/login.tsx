import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { toast } from "sonner";
import { Loader2, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { cn } from "~/lib/utils";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            await login(data);
            toast.success("Login successful!", {
                description: "Welcome back to your dashboard.",
            });
            navigate("/wholesaler"); // Redirect to dashboard
        } catch (error: any) {
            toast.error("Login failed", {
                description: error.message || "Please check your credentials.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding & Visuals */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-slate-900/40 z-0" />

                {/* Decorative Circles */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                            <Store className="h-6 w-6 text-blue-400" />
                        </div>
                        Retail Management
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Manage your wholesale business with <span className="text-blue-400">precision</span> and <span className="text-blue-400">ease</span>.
                    </h2>
                    <ul className="space-y-4 mb-10">
                        {[
                            "Real-time inventory tracking",
                            "Seamless order processing",
                            "Comprehensive financial reports",
                            "Supplier & retailer management"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300">
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 text-sm text-slate-400">
                    &copy; 2024 Retail Management System. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-6 sm:p-10 bg-slate-50">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                                <Store className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
                        <p className="text-sm text-slate-500 mt-2">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com"
                                                    {...field}
                                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Password</FormLabel>
                                                <Link
                                                    to="/auth/forgot-password"
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    {...field}
                                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:scale-[1.02]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    <p className="text-center text-sm text-slate-600">
                        Don't have an account?{" "}
                        <Link
                            to="/auth/register"
                            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                        >
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
