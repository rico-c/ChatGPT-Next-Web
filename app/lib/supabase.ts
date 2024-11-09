import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://bdwzrdmviflvdvonanys.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd3pyZG12aWZsdmR2b25hbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExNjg4MzEsImV4cCI6MjA0Njc0NDgzMX0.StSXRdJmw3BuSTjYi-117FPwiJdjav_TlwrzCTKSWvw",
);
