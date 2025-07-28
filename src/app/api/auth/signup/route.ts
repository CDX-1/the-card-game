// SIGN UP

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

    const display_name = email.split("@")[0];
    const initial = display_name[0];

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: display_name,
                full_name: display_name,
                avatar_url: `https://ui-avatars.com/api/?name=${initial}&size=128`
            }
        }
    });
    
    if (error) {
        return Response.json({ success: false, message: mapSupabaseError(error.code as string) });
    }

    if (!data.user) {
        return Response.json({ success: false, message: 'An account using that email already exists.' });
    }

    return Response.json({ success: true });
}