        "use strict";

const SUPABASE_URL =
    "https://qkmckkuaipfhkdciqlxe.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GSafhU7x1Yf1N7EKA_RIMw_GkF-4_FC";

if (!window.supabase) {
    throw new Error(
        "A biblioteca do Supabase não foi carregada."
    );
}

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

console.log("Supabase configurado corretamente.");
