'use client';

import { IconLogin, IconUserPlus } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function LoginButton() {
    const router = useRouter();

    return (
        <Button variant="outline" className="rounded-md" onClick={() => router.push('/login')}>
            <IconLogin />
            <span className="ml-1">Log In</span>
        </Button>
    );
}

export function SignUpButton() {
    const router = useRouter();

    return (
        <Button className="rounded-md" onClick={() => router.push('/signup')}>
            <IconUserPlus />
            <span className="ml-1">Sign Up</span>
        </Button>
    );
}