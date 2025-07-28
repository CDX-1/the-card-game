"use client";

import { useEffect, useRef } from "react";
import { WordRotate } from "./magicui/word-rotate";
import { PokemonCard } from "./pokemon-card";
import { Button } from "./ui/button";
import { IconPokeball } from "@tabler/icons-react";

export default function Hero() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const cards = [];

    // TODO Randomize
    for (let i = 1; i < 40; i++) {
        cards.push(`swsh4-${i}`);
    }

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let animationFrameId: number;
        let direction = 1;
        const speed = 1;

        const scroll = () => {
            if (!container) return;

            const maxScrollLeft = container.scrollWidth - container.clientWidth;

            container.scrollLeft += direction * speed;

            if (direction === 1 && container.scrollLeft >= maxScrollLeft - 1) {
                direction = -1;
            } else if (direction === -1 && container.scrollLeft <= 1) {
                direction = 1;
            }

            animationFrameId = requestAnimationFrame(scroll);
        };

        setTimeout(() => {
            animationFrameId = requestAnimationFrame(scroll);
        }, 100);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="w-full min-h-[calc(100vh-73px)] flex flex-col justify-center">
            {/* Hero Content Section */}
            <div className="flex justify-center px-4 sm:px-6 md:px-8 lg:px-20 mb-6 md:mb-8 lg:mb-12">
                <div className="flex flex-col space-y-6 md:space-y-8 w-full max-w-4xl">
                    <div className="flex flex-col items-center space-y-2 md:space-y-4 text-center">
                        {/* Main Heading */}
                        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-8xl font-bold flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center">
                            <WordRotate words={["Collect", "Trade", "Flex"]} />
                            <p>Cards</p>
                        </div>

                        {/* Subtitle */}
                        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl px-2">
                            Collect rare Pokémon cards, trade with others, and climb the leaderboard to become the best.
                        </p>
                    </div>

                    {/* Sign Up Redirect Button */}
                    <Button className="rounded-xl w-auto h-10 sm:h-11 mx-auto hover:cursor-pointer">
                        <IconPokeball className="size-6" />
                        <span className="ml-2 text-sm sm:text-base">Start Collecting</span>
                    </Button>
                </div>
            </div>

            {/* Cards Carousel Section */}
            <div className="relative border drop-shadow-xs mt-20 mx-2 sm:mx-4 md:mx-6 lg:mx-8 rounded-lg overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto hide-scrollbar py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8"
                    style={{ scrollBehavior: 'auto' }}
                >
                    {cards.map((card) => (
                        <div key={card} className="flex-shrink-0">
                            <PokemonCard
                                cardId={card}
                                clickable={true}
                                glow={false}
                            />
                        </div>
                    ))}
                </div>

                {/* Gradient Overlays */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 md:w-24 lg:w-32 bg-gradient-to-r from-background" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 md:w-24 lg:w-32 bg-gradient-to-l from-background" />
            </div>
        </div>
    );
}