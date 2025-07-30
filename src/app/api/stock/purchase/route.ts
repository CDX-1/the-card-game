import { DataUser } from "@/lib/data/utils";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return Response.json({ message: 'No session' }, { status: 401 });
    }

    const data = await DataUser.get();

    try {
        // const body = await req.json();
        const card = 'swsh10-033';
        const success = await data!.addCard(card, 1);
        return Response.json({ success: success, inventory: data!.toObject() });
    } catch (err) {
        console.error(err);
        return Response.json({ message: 'Invalid JSON body' }, { status: 400 });
    }
}