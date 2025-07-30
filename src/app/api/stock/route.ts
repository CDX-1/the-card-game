import { getSeededStock } from "@/lib/stock";
import { getIncludedSetResumes } from "@/lib/tcg/sets/shared";
import { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
    const sets = await getIncludedSetResumes();
    const stock = await getSeededStock(sets);

    return Response.json({
        stock: stock,
        expiry: {
            next: getNextStockTimestamp(),
            relative: getNextStockDifference()
        }
    }
    );
}

function getNextStockTimestamp(intervalSeconds = 5 * 60): number {
    const now = Math.floor(Date.now() / 1000);
    return now + (intervalSeconds - (now % intervalSeconds));
}

function getNextStockDifference(): number {
    const now = Math.floor(Date.now() / 1000);
    return getNextStockTimestamp() - now;
}