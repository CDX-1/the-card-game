import { createClient } from "@/lib/supabase/server";
import { Provider } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const { provider } = await request.json();

    const supabase = await createClient();

    if (!provider || typeof provider !== 'string') {
        return Response.json({ success: false, message: "Provider must be specified" });
    }

    const validProviders = ['google', 'discord'];
    if (!validProviders.includes(provider)) {
        return Response.json({ success: false, message: "Invalid provider" });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
    });

    if (error) {
        return Response.json({
            success: false,
            message: `Failed to authenticate with ${provider}`
        });
    }

    return Response.json({
        success: true,
        url: data.url
    });
}