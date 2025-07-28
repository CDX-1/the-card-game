'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSetRarity } from "@/lib/tcg/sets/shared";
import { cn } from "@/lib/utils";
import { Set } from "@tcgdex/sdk"
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { PokemonCard } from "./pokemon-card";
import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { useSetRarities } from "@/lib/tcg/sets/client";

interface PackCardProps {
    set: Set,
    stock: number | null
}

const PackCard: React.FC<PackCardProps> = ({ set, stock }) => {
    const rarities = useSetRarities();
    const [showDialog, setShowDialog] = useState(false);
    const rarity = getSetRarity(set, rarities);

    return (
        <>
            <Card
                key={set.id}
                className="relative flex flex-col h-full transition-all hover:bg-accent hover:cursor-pointer"
                onClick={() => setShowDialog(true)}
            >
                {stock !== null && (
                    <Badge className="absolute top-[-10] right-[-10] bg-green-500 font-mono">
                        {stock}
                    </Badge>
                )}

                <CardHeader className="gap-0">
                    <div className="flex justify-between">
                        <CardTitle>{set.name}</CardTitle>
                        <Badge className={cn(rarity.className, "font-mono")}>{rarity.name}</Badge>
                    </div>
                    <CardDescription>{set.serie.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex space-x-6">
                    {set.logo && (
                        <div className="relative w-36 aspect-[3/1]">
                            <Image
                                src={`${set.logo}.webp`}
                                alt={set.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}

                    <div>
                        {[
                            { label: 'Reverse Holos', value: set.cardCount.reverse },
                            { label: 'Holos', value: set.cardCount.holo },
                            { label: 'Official', value: set.cardCount.official },
                            { label: 'Total', value: set.cardCount.total }
                        ].map(({ label, value }) => (
                            <div key={label} className="flex space-x-1">
                                <p className="text-gray-600">{label}:</p>
                                <p>{value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button
                        variant={stock ? 'default' : 'destructive'}
                        disabled={!stock}
                        className={cn("w-full", stock ? 'bg-green-500 hover:bg-green-500/70' : '')}
                    >
                        {stock ? 'Purchase' : 'No Stock'}
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-8xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Rank Pack</DialogTitle>
                        <DialogDescription>What rarity do you think this pack deserves?</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] w-full rounded-md border p-6">
                        <div className="grid grid-cols-4 gap-4 justify-items-center">
                            {set.cards.map((card) => (
                                <div key={card.id} className="flex-shrink-0">
                                    <PokemonCard
                                        cardId={card.id}
                                        clickable={true}
                                        width={160}
                                        height={224}
                                    />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default PackCard;