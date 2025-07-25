export interface Rarity {
	id: string;
	name: string;
	weight: number;
	chance: number;
	type: "star" | "crown";
	repeat: number;
}

const rarities: Record<string, Rarity> = {
	"1_STAR": {
		id: "1_STAR",
		name: "1 Star",
		weight: 100,
		chance: 52.91,
		type: "star",
		repeat: 1,
	},
	"2_STAR": {
		id: "2_STAR",
		name: "2 Star",
		weight: 60,
		chance: 31.75,
		type: "star",
		repeat: 2,
	},
	"3_STAR": {
		id: "3_STAR",
		name: "3 Star",
		weight: 30,
		chance: 15.87,
		type: "star",
		repeat: 3,
	},
	"4_STAR": {
		id: "4_STAR",
		name: "4 Star",
		weight: 15,
		chance: 7.94,
		type: "star",
		repeat: 4,
	},
	"5_STAR": {
		id: "5_STAR",
		name: "5 Star",
		weight: 6,
		chance: 3.17,
		type: "star",
		repeat: 5,
	},
	"1_CROWN": {
		id: "1_CROWN",
		name: "1 Crown",
		weight: 3,
		chance: 1.59,
		type: "crown",
		repeat: 1,
	},
	"2_CROWN": {
		id: "2_CROWN",
		name: "2 Crown",
		weight: 1.5,
		chance: 0.79,
		type: "crown",
		repeat: 2,
	},
	"3_CROWN": {
		id: "3_CROWN",
		name: "3 Crown",
		weight: 0.5,
		chance: 0.26,
		type: "crown",
		repeat: 3,
	},
} as const;

const rarityMap: Record<string, string> = {
	"ACE SPEC Rare": "2_CROWN",
	"Amazing Rare": "1_CROWN",
	"Black White Rare": "3_STAR",
	"Classic Collection": "2_CROWN",
	Common: "1_STAR",
	Crown: "3_CROWN",
	"Double rare": "4_STAR",
	"Four Diamond": "5_STAR",
	"Full Art Trainer": "2_CROWN",
	"Holo Rare": "3_STAR",
	"Holo Rare V": "4_STAR",
	"Holo Rare VMAX": "4_STAR",
	"Holo Rare VSTAR": "4_STAR",
	"Hyper rare": "3_CROWN",
	"Illustration rare": "2_CROWN",
	LEGEND: "2_CROWN",
	"One Diamond": "2_STAR",
	"One Shiny": "1_CROWN",
	"One Star": "1_STAR",
	"Radiant Rare": "1_CROWN",
	Rare: "3_STAR",
	"Rare Holo": "3_STAR",
	"Rare Holo LV.X": "4_STAR",
	"Rare PRIME": "4_STAR",
	"Secret Rare": "3_CROWN",
	"Shiny Ultra Rare": "3_CROWN",
	"Shiny rare": "2_CROWN",
	"Shiny rare V": "2_CROWN",
	"Shiny rare VMAX": "3_CROWN",
	"Special illustration rare": "3_CROWN",
	"Three Diamond": "4_STAR",
	"Three Star": "3_STAR",
	"Two Diamond": "3_STAR",
	"Two Shiny": "2_CROWN",
	"Two Star": "2_STAR",
	"Ultra Rare": "1_CROWN",
	Uncommon: "2_STAR",
};

export function getRarity(rawRarity: string): Rarity | null {
	const rarity = rarityMap[rawRarity];

	if (rarity) {
		return rarities[rarity];
	} else {
		return null;
	}
}
