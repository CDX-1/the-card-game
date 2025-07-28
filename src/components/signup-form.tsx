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
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";

interface SignUpResponse {
    success: boolean,
    message?: string
}

export function SignUpForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [allowSignUp, setAllowSignUp] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    const router = useRouter();

    const handleSignUp = async (formData: FormData) => {
        setAllowSignUp(false);

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await res.json() as SignUpResponse;

        if (result.message) {
            setSuccess(result.success); // Avoid weird issues where we login successfully after a fail
        }
        
        if (!result.success && result.message) {
            setMessage(result.message!);
            setAllowSignUp(true);
            return;
        }

        // Signup was successful, redirect to login page with a 'check email' alert
        router.push('/login?check_email=true');
    }

    const handleOAuthSignUp = async (provider: string) => {
        setAllowSignUp(false);

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
            setSuccess(false);
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Create a new account</CardTitle>
                    <CardDescription>
                        Enter an email and password or sign up using a provider
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
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full hover:cursor-pointer" disabled={!allowSignUp} formAction={handleSignUp}>
                                    Sign Up
                                </Button>
                                <Separator />
                                <div className="flex w-full space-x-4">
                                    <Button variant="outline" className="flex-1 hover:cursor-pointer" onClick={() => handleOAuthSignUp('google')}>
                                        <IconBrandGoogleFilled />
                                        <span>Google</span>
                                    </Button>
                                    <Button variant="outline" className="flex-1 hover:cursor-pointer" onClick={() => handleOAuthSignUp('discord')}>
                                        <IconBrandDiscordFilled />
                                        <span>Discord</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <a href="/login" className="underline underline-offset-4">
                                Login
                            </a>
                        </div>
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