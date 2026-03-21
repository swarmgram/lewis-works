import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://ejxyyspduqlvhbtsczfc.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqeHl5c3BkdXFsdmhidHNjemZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjA4NTgsImV4cCI6MjA4ODczNjg1OH0.jlJkTcAsPjarO-DJ4Dn0Pv381icQRfS2udulK2yLFgU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
