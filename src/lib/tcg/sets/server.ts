let cachedRarities: Record<string, string> | null = null;

export async function loadRarities() {
    if (!cachedRarities) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/data/set_rarities.json`);
            if (!response.ok) throw new Error('Failed to fetch rarities');
            cachedRarities = await response.json();
        } catch (error) {
            console.error('Error loading rarities JSON:', error);
            cachedRarities = {};
        }
    }
    return cachedRarities;
}