import TCGdex, { Card, Query } from "@tcgdex/sdk";

const tcgdex = new TCGdex('en');
tcgdex.setCacheTTL(60 * 5);

const cardDetailsCache = new Map<string, Card | null>();

export async function getCardsBySpecies(species: string): Promise<Card[]> {
    const cards = await tcgdex.card.list(
        Query.create()
            .like('name', species)
            .sort('localId', 'ASC')
    );

    const cardsWithImages = cards.filter((card) => 'image' in card);
    
    const cardDetailsPromises = cardsWithImages.map(async (card) => {
        return await getCardDetails(card.id);
    });
    
    const cardDetails = await Promise.all(cardDetailsPromises);
    
    return cardDetails.filter((card): card is Card => 
        card !== null && card.rarity !== "None" && !card.image?.includes("tcgp")
    );
}

export async function getCardDetails(cardId: string): Promise<Card | null> {
    if (cardDetailsCache.has(cardId)) {
        return cardDetailsCache.get(cardId)!;
    }

    try {
        const card = await tcgdex.card.get(cardId);
        cardDetailsCache.set(cardId, card);
        return card;
    } catch (error) {
        console.error(`Failed to fetch card details for ${cardId}:`, error);
        cardDetailsCache.set(cardId, null);
        return null;
    }
}
