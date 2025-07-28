'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card } from '@tcgdex/sdk';
import { getCardDetails } from '@/lib/tcg/cards';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { IconStarFilled, IconCrown } from '@tabler/icons-react';
import { getRarity, Rarity } from '@/lib/tcg/rarity';
import { cn } from '@/lib/utils';

interface PokemonCardProps {
    cardId: string;
    width?: number;
    height?: number;
    clickable?: boolean;
    glow?: boolean;
    className?: string;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
    cardId,
    width = 245,
    height = 342,
    clickable = false,
    glow = true,
    className = ""
}) => {
    // Responsive card dimensions
    const getCardDimensions = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) { // sm
                return { width: 180, height: 252 };
            } else if (window.innerWidth < 768) { // md
                return { width: 200, height: 280 };
            } else if (window.innerWidth < 1024) { // lg
                return { width: 220, height: 308 };
            }
        }
        return { width, height };
    };

    const cardDimensions = getCardDimensions();
    const [rotateX, setRotateX] = useState<number>(0);
    const [rotateY, setRotateY] = useState<number>(0);
    const [details, setDetails] = useState<Card | null>(null);
    const [rarity, setRarity] = useState<Rarity | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const fetchedDetails = await getCardDetails(cardId);
                if (fetchedDetails) setDetails(fetchedDetails);

                const rawRarity = fetchedDetails?.rarity;
                if (rawRarity === undefined) return;

                const fetchedRarity = getRarity(rawRarity);
                setRarity(fetchedRarity);
            } catch (error) {
                console.error('Failed to fetch card details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [cardId]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const mouseX = e.clientX - cardCenterX;
        const mouseY = e.clientY - cardCenterY;

        const rotateXValue = (mouseY / (rect.height / 2)) * -15;
        const rotateYValue = (mouseX / (rect.width / 2)) * 15;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    const renderCard = () => (
        <div className={cn("relative perspective-1000", className)}>
            <div
                ref={cardRef}
                className={`relative transition-all duration-500 ease-out hover:scale-105 ${clickable ? 'hover:cursor-pointer' : ''}`}
                style={{
                    width: `${cardDimensions.width}px`,
                    height: `${cardDimensions.height}px`,
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Card front */}
                <div className={cn("absolute inset-0 rounded-xl overflow-hidden", glow ? "shadow-2xl" : "")}>
                    <Image
                        src={`${details?.image}/high.webp`}
                        alt={`${details?.name || 'Pokemon card'} front`}
                        className="w-full h-full object-cover rounded-xl no-select"
                        draggable={false}
                        fill
                    />
                    {/* Holographic overlay effect */}
                    <div
                        className="absolute inset-0 opacity-20 rounded-xl"
                        style={{
                            background: `linear-gradient(${(rotateX + rotateY) * 2}deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`
                        }}
                    />
                </div>

                {/* Glow effect */}
                {glow && (
                    <div
                        className="absolute -inset-2 rounded-xl opacity-25 blur-lg"
                        style={{
                            background: `conic-gradient(from ${(rotateX + rotateY) * 4}deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffd93d, #ff6b6b )`
                        }}
                    />
                )}
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );

    // Show loading state
    if (isLoading) {
        return (
            <Skeleton className="rounded-xl" style={{
                width: `${cardDimensions.width}px`,
                height: `${cardDimensions.height}px`
            }} />
        );
    }

    // If not clickable or no details, just show the card
    if (!clickable || !details) {
        return renderCard();
    }

    // If clickable and has details, wrap in dialog
    return (
        <Dialog>
            <DialogTrigger asChild>
                {renderCard()}
            </DialogTrigger>

            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        {details.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex space-x-10 mt-2">
                    <PokemonCard
                        cardId={cardId}
                    />

                    <div className="flex-1">
                        {/* Add additional card details here */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">Card Details</h3>
                                <p className="text-gray-600">ID: {cardId}</p>
                                {details.set && <p className="text-gray-600">Set: {details.set.name}</p>}
                                {rarity && (
                                    <div className="flex space-x-2 items-center">
                                        <p className="text-gray-600">
                                            Rarity:{" "}

                                        </p>
                                        <div className="flex space-x-1 items-center">
                                            {Array.from({ length: rarity.repeat }).map((_, i) =>
                                                rarity.type === "star" ? <IconStarFilled key={i} className="size-4" /> : <IconCrown key={i} className="size-4" />
                                            )}
                                        </div>
                                        <p className="text-xs">
                                            (~{rarity.chance}%)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};