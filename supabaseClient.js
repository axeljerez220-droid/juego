import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const NEXT_PUBLIC_SUPABASE_URL = "https://ielmdropnvskjducqcyk.supabase.co";
const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EzX7ODemQDZxoeiRElHELg_q-85JcB8";

export const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);