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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

const phoneRegex = new RegExp(
    /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const registerSchema = z.object({
    username: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().regex(phoneRegex, "Invalid phone number"),
    role: z.string(),
    // Wholesaler specifics
    businessName: z.string().optional(),
    gstNumber: z.string().optional(),
    // Local Seller specifics
    shopName: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    // Common
    address: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState("WHOLESALER");

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            phone: "",
            role: "WHOLESALER",
            businessName: "",
            gstNumber: "",
            shopName: "",
            address: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            // Ensure role is set correctly based on the tab
            const submissionData = { ...data, role };
            await register(submissionData);
            toast.success("Registration successful!", {
                description: "You can now login with your credentials.",
            });
            navigate("/auth/login");
        } catch (error: any) {
            toast.error("Registration failed", {
                description: error.message || "Please check your details.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding & Visuals */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-tr from-blue-900/40 to-slate-900/40 z-0" />

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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
                        Join thousands of <span className="text-blue-400">businesses</span> scaling with our platform.
                    </h2>
                    <ul className="space-y-4 mb-10">
                        {[
                            "Direct access to top manufacturers",
                            "Integrated payment solutions",
                            "Advanced analytics dashboard",
                            "24/7 Priority support"
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

            {/* Right Side - Register Form */}
            <div className="flex items-center justify-center p-6 sm:p-10 bg-slate-50 overflow-y-auto">
                <div className="w-full max-w-md space-y-6 my-auto">
                    <div className="text-center">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                                <Store className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
                        <p className="text-sm text-slate-500 mt-2">
                            Get started with your free account today
                        </p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <Tabs defaultValue="WHOLESALER" onValueChange={(v) => setRole(v)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="WHOLESALER">Wholesaler</TabsTrigger>
                                <TabsTrigger value="LOCAL_SELLER">Local Seller</TabsTrigger>
                            </TabsList>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl><Input placeholder="name@example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <TabsContent value="WHOLESALER" className="space-y-4 mt-0">
                                        <FormField
                                            control={form.control}
                                            name="businessName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business Name</FormLabel>
                                                    <FormControl><Input placeholder="ABC Traders Pvt Ltd" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gstNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GST Number</FormLabel>
                                                    <FormControl><Input placeholder="GST123456" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="LOCAL_SELLER" className="space-y-4 mt-0">
                                        <FormField
                                            control={form.control}
                                            name="shopName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Shop Name</FormLabel>
                                                    <FormControl><Input placeholder="XYZ Kirana Store" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl><Input placeholder="City, State" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:scale-[1.02] mt-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </Tabs>
                    </div>

                    <p className="text-center text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link
                            to="/auth/login"
                            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
