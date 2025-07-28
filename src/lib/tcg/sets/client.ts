import { useState, useEffect } from 'react';

let cachedRarities: Record<string, string> | null = null;

export function useSetRarities() {
    const [rarities, setRarities] = useState<Record<string, string> | null>(cachedRarities);

    useEffect(() => {
        if (!cachedRarities) {
            fetch('/data/set_rarities.json')
                .then((response) => {
                    if (!response.ok) throw new Error('Failed to fetch rarities');
                    return response.json();
                })
                .then((data) => {
                    cachedRarities = data;
                    setRarities(data);
                })
                .catch((error) => {
                    console.error('Error loading rarities JSON:', error);
                    setRarities({});
                });
        } else {
            setRarities(cachedRarities);
        }
    }, []);

    return rarities;
}
