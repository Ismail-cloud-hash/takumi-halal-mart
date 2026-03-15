import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vokiiohusqnzyvggkave.supabase.co";
const supabaseKey = "sb_publishable_F9ucQyJprD3ylMA-0C0Z5w_vWy9vKI5";

export const supabase = createClient(supabaseUrl, supabaseKey);