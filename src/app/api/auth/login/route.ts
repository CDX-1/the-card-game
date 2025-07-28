// LOGIN

import mapSupabaseError from "@/lib/supabase/error";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    const supabase = await createClient();
    
    if (typeof email !== "string") {
        return Response.json({ success: false, message: "Email must be a string" });
    }

    if (typeof password !== "string") {
        return Response.json({ success: false, message: "Password must be a string" });
    }

    if (!isValidEmail(email)) {
        return Response.json({ success: false, message: "Invalid email" });
    }

    const data = {
        email: email,
        password: password
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return Response.json({ success: false, message: mapSupabaseError(error.code as string) });
    }

    return Response.json({ success: true });
}