"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data) {
        setIsLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_URL || "http://10.10.15.194:3006/api";
            const loginUrl = `${backendUrl.replace(/\/+$/, "")}/auth/login`;

            console.log("Calling backend directly:", loginUrl);
            console.log("With body:", JSON.stringify({ email: data.email, password: data.password }));

            const response = await fetch(loginUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });

            const result = await response.json();
            console.log("Backend response:", { status: response.status, result });

            if (!response.ok) {
                toast.error(result.message || "Invalid credentials");
                return;
            }

            // Robust JWT detection: Recursively look for any string starting with "eyJ"
            const findJWT = (obj) => {
                if (!obj || typeof obj !== 'object') return null;

                // Check all values in the current object
                for (const value of Object.values(obj)) {
                    if (typeof value === 'string' && value.startsWith('eyJ')) {
                        return value;
                    }
                    if (typeof value === 'object') {
                        const found = findJWT(value);
                        if (found) return found;
                    }
                }
                return null;
            };

            const token = findJWT(result) || result.token || result.access_token || result.accessToken || result.access;

            console.log("Full backend response:", result);
            console.log("Token extraction result:", token ? "JWT FOUND" : "NOT FOUND (using session-active)");

            await fetch("/api/auth/set-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: token || "session-active" }),
            });

            if (token) {
                toast.success("Login successful!");
            } else {
                toast.warning("Login successful, but no auth token found in response.");
            }

            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md space-y-8 p-8 transition-all duration-300">
            <div className="flex flex-col items-center space-y-2 text-center">
                <div className="rounded-2xl bg-primary/10 p-3 ring-1 ring-primary/20 backdrop-blur-sm">
                    <Bot className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                <p className="text-sm text-zinc-400">
                    Enter your credentials to access your dashboard
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="text-zinc-300"
                        >
                            Email address
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500 z-10" />
                            <Input
                                {...form.register("email")}
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-primary"
                                disabled={isLoading}
                            />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-xs font-medium text-red-500">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="password"
                                className="text-zinc-300"
                            >
                                Password
                            </Label>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500 z-10" />
                            <Input
                                {...form.register("password")}
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-primary"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors z-10"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-xs font-medium text-red-500">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all shadow-lg group"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2">
                            Sign In
                            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </span>
                    )}
                </Button>
            </form>
        </div>
    );
}
