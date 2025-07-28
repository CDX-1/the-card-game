import { Set, SetResumeModel } from "@tcgdex/sdk";
import { loadRarities } from "./tcg/sets/server";
import crypto from "crypto";

const rarityWeights: Record<string, number> = {
    common: 1000,
    uncommon: 500,
    rare: 200,
    epic: 75,
    legendary: 25,
    mythical: 10,
    divine: 3,
};

function seededRandom(seed: number): () => number {
    return () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

type StockedItems = { [key: string]: number };

function getSecretSeed(secretKey: string, intervalSeconds: number): number {
    const now = Math.floor(Date.now() / 1000);
    const roundedTime = now - (now % intervalSeconds);

    const data = `${secretKey}:${roundedTime}`;

    const hash = crypto.createHash("sha256").update(data).digest();

    const seed =
        (hash[0] << 24) |
        (hash[1] << 16) |
        (hash[2] << 8) |
        hash[3];

    return seed >>> 0;
}

export async function getSeededStock(sets: Set[] | SetResumeModel[]): Promise<StockedItems> {
    const rarities = await loadRarities();
    if (!rarities) return {};

    // Modify seed for a different stock every 5 minutes
    const secretKey = process.env.STOCK_SEED;
    if (!secretKey) {
        console.error('No stock key present');
        return {};
    }
    const modified_seed = getSecretSeed(secretKey, 5 * 60);

    const rand = seededRandom(modified_seed);
    const stocked: StockedItems = {};
    const maxWeight = rarityWeights.common;
    const maxQuantity = 50;

    sets.forEach((set) => {
        const rarity = rarities[set.id];
        const weight = rarityWeights[rarity];
        const appearanceChance = weight / maxWeight;

        if (rand() < appearanceChance) {
            let quantity = 1;

            const maxStockUpChance = 0.9;
            const minStockUpChance = 0.3;

            let stockUpChance = minStockUpChance + (weight / maxWeight) * (maxStockUpChance - minStockUpChance);

            while (quantity < maxQuantity && rand() < stockUpChance) {
                quantity++;
                stockUpChance *= 0.85;
            }

            stocked[set.id] = quantity;
        }
    });

    return stocked;
}