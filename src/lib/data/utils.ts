import { turso } from "./turso";
import { createClient } from "../supabase/server";
import { getRarity, Rarity } from "../tcg/rarity";
import { redis } from "./redis";
import { getCardDetails } from "../tcg/cards";
import { getSetRarity } from "../tcg/sets/shared";
import { loadRarities } from "../tcg/sets/server";

interface UserCard {
    cardName: string;
    rarity: Rarity;
    setRarity: string;
    quantity: number;
    updated: boolean;
}

interface StockPurchase {
    cardId: string,
    purchases: number
}

interface StockData {
    purchases: StockPurchase[],
    stockId: number
}

interface CachedUserData {
    cards: { [key: string]: UserCard },
    stockData: StockData | null
}

export class DataUser {
    userId: string;
    cards: Map<string, UserCard>;
    stockData: StockData | null;

    private constructor(userId: string, cards: Map<string, UserCard>, stockData: StockData | null) {
        this.userId = userId;
        this.cards = cards;
        this.stockData = stockData;
    }

    hasCard(cardId: string): boolean {
        return this.cards.has(cardId);
    }

    getCard(cardId: string): UserCard | null {
        return this.cards.get(cardId) || null;
    }

    getCardQuantity(cardId: string): number {
        return this.cards.get(cardId)?.quantity || 0;
    }

    async addCard(cardId: string, quantity: number = 1, flushChanges: boolean = true): Promise<boolean> {
        if (quantity <= 0) return false;
        const setRarities = await loadRarities();

        if (this.cards.has(cardId)) {
            const card = this.cards.get(cardId)!;
            card.quantity += quantity;
            card.updated = true;
        } else {
            const details = await getCardDetails(cardId);
            if (!details) return false;

            this.cards.set(cardId, {
                cardName: details.name,
                rarity: getRarity(details.rarity),
                setRarity: getSetRarity(details.set, setRarities).name,
                quantity: quantity,
                updated: true
            } as UserCard);
        }

        if (flushChanges) await this.writeThrough();
        return true;
    }

    async addCardBatch(cards: { cardId: string, quantity: number }[]): Promise<boolean> {
        await Promise.all(cards.map(c => this.addCard(c.cardId, c.quantity, false)));
        await this.writeThrough();
        return true;
    }

    async setCardQuantity(cardId: string, quantity: number, flushChanges: boolean = true): Promise<boolean> {
        if (quantity > 0) {
            if (!this.cards.has(cardId)) {
                await this.addCard(cardId, quantity);
            } else {
                const card = this.cards.get(cardId);
                if (card) {
                    card.quantity = quantity;
                    card.updated = true;
                } else {
                    return false;
                }
            }
        } else if (quantity <= 0) {
            if (this.cards.has(cardId)) {
                this.cards.delete(cardId);
            }
        }

        if (flushChanges) await this.writeThrough();
        return true;
    }

    private async writeThrough() {
        const key = `user_data:${this.userId}`;
        await redis.set(key, JSON.stringify({
            cards: Object.fromEntries(this.cards),
            stockData: this.stockData
        }), { ex: 60 * 5 /* 5 min TTL */ });

        const updated = [...this.cards].filter(([, c]) => c.updated);
        if (updated.length === 0) return;

        const groups = updated.map(() => "(?, ?, ?)").join(", ");
        const sql = `
            INSERT INTO user_cards (user_id, card_id, quantity)
            VALUES ${groups}
            ON CONFLICT(user_id, card_id)
            DO UPDATE SET quantity = excluded.quantity
        `;
        const args = updated.flatMap(([cardId, c]) => [this.userId, cardId, c.quantity]);

        await turso.execute(sql, args);
        updated.forEach(([_, c]) => c.updated = false);
    }

    toObject(): CachedUserData {
        return {
            cards: Object.fromEntries(this.cards),
            stockData: this.stockData
        }
    }

    // Trusting provided userIds as this is server-side
    static async get(userId: string | undefined = undefined, retryCount: number = 0): Promise<DataUser | null> {
        if (retryCount >= 3) return null;
        await loadRarities();

        if (!userId) {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            userId = user?.id;
        }
        if (!userId) return null;

        const key = `user_data:${userId}`;
        const raw_data = await redis.get<string>(key);

        if (raw_data) {
            let data: CachedUserData;

            try {
                data = JSON.parse(raw_data);
                if (typeof data !== "object" || typeof data.cards !== "object") {
                    throw new Error("Malformed cache");
                }
            } catch {
                await redis.del(key);
                return this.get(userId, retryCount + 1);
            }

            return new DataUser(
                userId,
                new Map(Object.entries(data.cards)),
                data.stockData
            );
        }

        const sql = `
            SELECT
                uc.card_id,
                cc.name,
                cc.rarity,
                cc.set_rarity,
                uc.quantity
            FROM user_cards uc
            JOIN cards_catalog cc ON uc.card_id = cc.card_id
            WHERE uc.user_id = ?
        `;
        const result = await turso.execute(sql, [userId]);
        const cards = result.rows.reduce((map, row) => {
            map.set(row.card_id as string, {
                cardName: row.name as string,
                rarity: getRarity(row.rarity as string),
                setRarity: row.set_rarity as string,
                quantity: Number(row.quantity),
                updated: false
            } as UserCard);
            return map;
        }, new Map<string, UserCard>());

        return new DataUser(
            userId,
            cards,
            null
        );
    }
}