'use client';

import { useState } from "react";
import {
    IconBrandDiscord,
    IconMoon,
    IconSun,
    IconMenu2,
    IconX
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Profile from "./profile";

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const discordLink = "https://discord.gg/W8ssCC5QBC";

    const components = [
        { title: "Home", href: "/" },
        { title: "Packs", href: "/packs" },
        { title: "Collection", href: "/collection" },
        { title: "Market", href: "/market" },
        { title: "Catalog", href: "/catalog" },
        { title: "Leaderboard", href: "/leaderboard" },
    ];

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <nav className="w-full border-b shadow-sm px-4 md:px-20 py-4 bg-background">
            <div className="flex items-center justify-between">
                {/* Left Side */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex space-x-2">
                        {components.map((component) => (
                            <Button
                                key={component.title}
                                variant="ghost"
                                onClick={() => router.push(component.href)}
                            >
                                {component.title}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Right Side */}
                <div className="hidden md:flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => window.open(discordLink, "_blank")}>
                        <IconBrandDiscord />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {theme === "light" ? <IconMoon /> : <IconSun />}
                    </Button>
                    <Profile />
                </div>

                {/* Hamburger Menu */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <IconX /> : <IconMenu2 />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden mt-4 space-y-2">
                    {components.map((component) => (
                        <Button
                            key={component.title}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                router.push(component.href);
                            }}
                        >
                            {component.title}
                        </Button>
                    ))}
                    <div className="flex justify-between pt-2 border-t">
                        <Button variant="ghost" size="icon" onClick={() => window.open(discordLink, "_blank")}>
                            <IconBrandDiscord />
                        </Button>
                        <Button className="hover:cursor-pointer" variant="ghost" size="icon" onClick={toggleTheme}>
                            {theme === "light" ? <IconMoon /> : <IconSun />}
                        </Button>
                    </div>
                    <div className="pt-2 flex space-x-2">
                        <Profile />
                    </div>
                </div>
            )}
        </nav>
    );
}
