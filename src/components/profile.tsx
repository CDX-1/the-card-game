'use client';

import { createClient, logout } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { LoginButton, SignUpButton } from "./buttons";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    useEffect(() => {
        const client = createClient();

        client.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription }
        } = client.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <Skeleton />
        );
    }

    if (!session) {
        return (
            <>
                <LoginButton />
                <SignUpButton />
            </>
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <img
                            src={session.user.user_metadata['avatar_url']}
                            alt="User avatar"
                            className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{session.user.user_metadata['full_name']}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>History</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={showLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogTitle>Sign Out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to sign out? You will need to login again.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => logout()}>Sign Out</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}