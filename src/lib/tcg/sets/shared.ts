import TCGdex, { Set, SetResumeModel } from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');
tcgdex.setCacheTTL(60 * 5);

let cachedResumes: SetResumeModel[] | null = null;
let cachedSets: Set[] | null = null;

export async function getSetResumes(filter?: (resume: SetResumeModel) => boolean): Promise<SetResumeModel[]> {
    if (!cachedResumes) {
        cachedResumes = await tcgdex.set.list();
    }
    if (filter) {
        return cachedResumes.filter(filter);
    }
    return cachedResumes;
}

export async function getSets(filter?: (set: Set) => boolean): Promise<Set[]> {
    if (!cachedSets) {
        const resumes = await getSetResumes();
        cachedSets = await Promise.all(resumes.map((resume) => resume.getSet()));
    }
    if (filter) {
        return cachedSets.filter(filter);
    }
    return cachedSets;
}

export async function getIncludedSetResumes() {
    return getSetResumes(
        (set) =>
            set.logo !== undefined &&
            !set.name.toLowerCase().includes('pop') &&
            !set.name.toLowerCase().includes('promo') &&
            !set.logo?.includes('tcgp')
    );
}

export async function getIncludedSets() {
    return getSets(
        (set) =>
            set.logo !== undefined &&
            !set.name.toLowerCase().includes('pop') &&
            !set.name.toLowerCase().includes('promo') &&
            !set.logo?.includes('tcgp')
    );
}

const rarityStyles: Record<string, string> = {
    'common': 'bg-neutral-400',
    'uncommon': 'bg-green-500',
    'rare': 'bg-sky-500',
    'epic': 'bg-purple-500',
    'legendary': 'bg-orange-400',
    'mythical': 'bg-rose-500',
    'divine': 'bg-teal-400'
}

export function getSetRarity(set: Set, rarities: Record<string, string> | null): { name: string; className: string } {
    if (!rarities) {
        return { name: "loading...", className: 'bg-neutral-400' };
    }

    const setId = set.id;
    const rarity = rarities[setId];
    const styles = rarityStyles[rarity];

    if (!rarity || !styles) return { name: 'common', className: rarityStyles.common };

    return { name: rarity, className: styles };
}