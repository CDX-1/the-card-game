'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconBrandDiscordFilled, IconBrandGoogleFilled } from "@tabler/icons-react"
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface LoginResponse {
    success: boolean,
    message?: string
}

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [allowLogin, setAllowLogin] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('check_email') === 'true') {
            setSuccess(true);
            setMessage("We've sent a verification email to your inbox.");

            window.history.replaceState({}, '', '/login');
        }
    }, [searchParams]);

    const handleLogin = async (formData: FormData) => {
        setAllowLogin(false);

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await res.json() as LoginResponse;

        if (result.message) {
            setSuccess(result.success); // Avoid weird issues where we login successfully after a fail
        }
        
        if (!result.success && 'message' in result) {
            setMessage(result.message!);
            return;
        }

        router.push('/');
    }

    const handleOAuthLogin = async (provider: string) => {
        setAllowLogin(false);

        try {
            const res = await fetch('api/auth/provider', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider })
            });

            const result = await res.json();

            if (result.message) {
                setSuccess(result.success); // Avoid weird issues where we login successfully after a fail
            }

            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                setMessage(result.message || `Failed to authenticate ${provider}`);
            }
        } catch {
            setMessage('An error occurred during authentication');
        }

        // TODO Post login flow using OAuth
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email and password or login using a provider
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="cdx@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="/forgot-password"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full hover:cursor-pointer" disabled={!allowLogin} formAction={handleLogin}>
                                    Login
                                </Button>
                                <Separator />
                                <div className="flex w-full space-x-4">
                                    <Button variant="outline" className="flex-1 hover:cursor-pointer" onClick={() => handleOAuthLogin('google')}>
                                        <IconBrandGoogleFilled />
                                        <span>Google</span>
                                    </Button>
                                    <Button variant="outline" className="flex-1 hover:cursor-pointer" onClick={() => handleOAuthLogin('discord')}>
                                        <IconBrandDiscordFilled />
                                        <span>Discord</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <a href="/signup" className="underline underline-offset-4">
                                Sign up
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    message !== ''
                        ? "max-h-32 opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 -translate-y-4"
                )}
            >
                <Alert variant={!success ? 'destructive' : 'default'} className="transform transition-transform duration-300">
                    <AlertCircleIcon />
                    <AlertTitle>{success ? 'Success' : 'Login failed'}</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            </div>
        </div>
    )
}