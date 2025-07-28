'use client';

import { SparklesText } from "@/components/magicui/sparkles-text";
import PackCard from "@/components/pack-card";
import { Input } from "@/components/ui/input";
import { getIncludedSets, getSetRarity } from "@/lib/tcg/sets/shared";
import { Set } from "@tcgdex/sdk";
import { useEffect, useState } from "react";
import Fuse from 'fuse.js';
import { IconSearch } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSetRarities } from "@/lib/tcg/sets/client";
import { Separator } from "@/components/ui/separator";

const rarityTypes = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical', 'divine'];

export default function PacksPage() {
    const rarities = useSetRarities();
    const [sets, setSets] = useState<Set[]>([]);
    const [stock, setStock] = useState<{ [key: string]: number }>({});
    const [nextStock, setNextStock] = useState<number | null>(null);
    const [nextStockCountdown, setNextStockCountdown] = useState<number>(0);
    const [search, setSearch] = useState<string | null>(null);
    const [onlyShowInStock, setOnlyShowInStock] = useState(false);

    // Poll the stock continously
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const showMessage = (message: string, retry: boolean = false) => {
            if (retry) fetchStock();
        }

        const fetchStock = async () => {
            const res = await fetch('/api/stock');
            if (!res || res.status !== 200) {
                showMessage("Failed to fetch stock", true);
                return
            };
            const data = await res.json();

            setStock(data['stock']);

            const nextStock: number = data['expiry']['next'];
            const now = Date.now() / 1000;
            const delay = Math.max((nextStock - now) * 1000, 0);
            setNextStock(nextStock);

            timeoutId = setTimeout(fetchStock, delay);
        }

        fetchStock();

        return () => clearTimeout(timeoutId);
    }, []);

    // Update the 'stock update in x...' timer
    useEffect(() => {
        if (nextStock === null) return;

        const intervalId = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const secondsLeft = Math.max(nextStock - now, 0);
            setNextStockCountdown(secondsLeft);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [nextStock]);

    function formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (secs === 0) {
            return `${mins} minute${mins !== 1 ? 's' : ''}`;
        }
        if (mins > 0) {
            return `${mins} minute${mins !== 1 ? 's' : ''} and ${secs} second${secs !== 1 ? 's' : ''}`;
        }
        return `${secs} second${secs !== 1 ? 's' : ''}`;
    }

    // Update results based on search query
    useEffect(() => {
        let isCancelled = false;

        const timeoutId = setTimeout(async () => {
            try {
                const sets = await getIncludedSets();

                if (isCancelled || !sets?.length) return;

                let reversed;

                if (onlyShowInStock) {
                    reversed = sets.toReversed().filter((set) => set.id in stock);
                } else {
                    reversed = sets.toReversed();
                }

                const trimmed = search?.trim();
                if (!trimmed) {
                    setSets(reversed);
                    return;
                }

                if (rarityTypes.includes(trimmed.toLowerCase())) {
                    setSets(reversed.filter((set) => getSetRarity(set, rarities).name === trimmed));
                    return;
                }

                const fuse = new Fuse(reversed, {
                    keys: ['name'],
                    threshold: 0.3,
                    includeScore: true
                });

                const searchResults = fuse.search(trimmed);

                if (!isCancelled) {
                    setSets(searchResults.map(result => result.item));
                }
            } catch (error) {
                console.error('Error loading sets:', error);
                if (!isCancelled) {
                    setSets([]);
                }
            }
        }, 300);

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [stock, search, onlyShowInStock, rarities]);

    return (
        <div className="flex flex-col my-10 space-y-8 min-h-[calc(100vh-73px)] items-center">
            <div className="text-center">
                <SparklesText>Pack Stock</SparklesText>
                <p className="text-sm text-muted-foreground">Packs reset every 5 minutes</p>
            </div>

            <div className="grid grid-cols-5 gap-10 items-stretch w-full px-20">
                <div className="col-span-5 flex flex-col items-center space-y-3">
                    <div className="relative w-1/3">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            className="pl-10"
                            placeholder="Search for packs..."
                            value={search || ""}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                            <Checkbox id="only-in-stock" checked={onlyShowInStock} onCheckedChange={(v) => setOnlyShowInStock(v as boolean)} />
                            <Label>Only show packs in stock</Label>
                        </div>
                        <Separator orientation="vertical" />
                        <p>Next stock is in {formatDuration(nextStockCountdown)}</p>
                    </div>
                </div>

                {sets?.map((set) => (
                    <PackCard key={set.id} set={set} stock={stock[set.id] || null} />
                ))}
            </div>
        </div>
    );
}
